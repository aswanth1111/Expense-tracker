import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirestoreDb } from '../config/firebase';
import type { Expense, AccountBalances, LendingRecord, PaymentMethod } from '../types/expense';

const EXPENSES_COLLECTION = 'expenses';
const LENDING_COLLECTION = 'lending';
const SETTINGS_COLLECTION = 'settings';
const BUDGET_DOC_ID = 'budget';

// ----------------------------------------------------
// Expenses Subscription & CRUD
// ----------------------------------------------------
export const subscribeExpenses = (
  onData: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  const q = query(collection(db, EXPENSES_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        expenses.push({
          id: docSnap.id,
          reason: data.reason || '',
          amount: Number(data.amount) || 0,
          category: data.category || 'other',
          merchant: data.merchant || '',
          paymentMethod: (data.paymentMethod as PaymentMethod) || 'cash',
          paidBy: data.paidBy === 'friend' ? 'friend' : 'mine',
          spentForOther: data.spentForOther === true,
          isReturned: data.isReturned === true,
          returnedAt: Number(data.returnedAt) || undefined,
          date: data.date || new Date().toISOString().split('T')[0],
          time: data.time || undefined,
          createdAt: Number(data.createdAt) || Date.now(),
        });
      });
      onData(expenses);
    },
    (err) => {
      console.error('Firestore expenses onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

export const addExpenseToFirestore = async (
  data: Omit<Expense, 'id' | 'createdAt'>
): Promise<string> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const newExpense: Record<string, unknown> = {
    id,
    amount: Number(data.amount) || 0,
    reason: data.reason,
    category: data.category,
    paymentMethod: data.paymentMethod,
    merchant: data.merchant || '',
    date: data.date,
    createdAt: Date.now(),
  };

  if (data.paidBy) {
    newExpense.paidBy = data.paidBy;
  }
  if (data.time) {
    newExpense.time = data.time;
  }
  if (data.spentForOther !== undefined) {
    newExpense.spentForOther = Boolean(data.spentForOther);
  }
  if (data.isReturned !== undefined) {
    newExpense.isReturned = Boolean(data.isReturned);
  }
  if (data.returnedAt) {
    newExpense.returnedAt = Number(data.returnedAt);
  }

  await setDoc(doc(db, EXPENSES_COLLECTION, id), newExpense);
  return id;
};

export const updateExpenseInFirestore = async (
  id: string,
  data: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const cleanData: Record<string, unknown> = {};
  if (data.amount !== undefined) cleanData.amount = Number(data.amount) || 0;
  if (data.reason !== undefined) cleanData.reason = data.reason;
  if (data.category !== undefined) cleanData.category = data.category;
  if (data.paymentMethod !== undefined) cleanData.paymentMethod = data.paymentMethod;
  if (data.merchant !== undefined) cleanData.merchant = data.merchant || '';
  if (data.paidBy !== undefined) cleanData.paidBy = data.paidBy;
  if (data.spentForOther !== undefined) cleanData.spentForOther = Boolean(data.spentForOther);
  if (data.isReturned !== undefined) cleanData.isReturned = Boolean(data.isReturned);
  if (data.returnedAt !== undefined) cleanData.returnedAt = data.returnedAt ? Number(data.returnedAt) : null;
  if (data.date !== undefined) cleanData.date = data.date;
  if (data.time !== undefined) cleanData.time = data.time || null;

  const expenseRef = doc(db, EXPENSES_COLLECTION, id);
  await updateDoc(expenseRef, cleanData);
};

export const deleteExpenseFromFirestore = async (id: string): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
};

// ----------------------------------------------------
// Account Balances (Cash, UPI Kotak, UPI Union)
// ----------------------------------------------------
export const subscribeBalances = (
  onData: (balances: AccountBalances) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  const budgetRef = doc(db, SETTINGS_COLLECTION, BUDGET_DOC_ID);

  return onSnapshot(
    budgetRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let kotakSplit: { mine: number; friend: number } | undefined = undefined;
        if (data.kotakSplit && typeof data.kotakSplit === 'object') {
          kotakSplit = {
            mine: Math.max(0, Number(data.kotakSplit.mine) || 0),
            friend: Math.max(0, Number(data.kotakSplit.friend) || 0),
          };
        } else if (data.balances?.kotakSplit && typeof data.balances.kotakSplit === 'object') {
          kotakSplit = {
            mine: Math.max(0, Number(data.balances.kotakSplit.mine) || 0),
            friend: Math.max(0, Number(data.balances.kotakSplit.friend) || 0),
          };
        }

        if (data.balances) {
          const rawKotak = Number(data.balances.upi_kotak) || 0;
          onData({
            cash: Number(data.balances.cash) || 0,
            upi_kotak: kotakSplit ? kotakSplit.mine + kotakSplit.friend : rawKotak,
            upi_union: Number(data.balances.upi_union) || 0,
            kotakSplit: kotakSplit || (rawKotak > 0 ? { mine: rawKotak, friend: 0 } : undefined),
          });
        } else if (typeof data.totalMoney === 'number') {
          // Legacy backwards compatibility: assign flat total to Kotak
          const rawKotak = Number(data.totalMoney) || 0;
          onData({
            cash: 0,
            upi_kotak: rawKotak,
            upi_union: 0,
            kotakSplit: { mine: rawKotak, friend: 0 },
          });
        } else {
          onData({ cash: 0, upi_kotak: 0, upi_union: 0, kotakSplit: { mine: 0, friend: 0 } });
        }
      } else {
        onData({ cash: 0, upi_kotak: 0, upi_union: 0, kotakSplit: { mine: 0, friend: 0 } });
      }
    },
    (err) => {
      console.error('Firestore budget onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

export const setBalancesInFirestore = async (balances: AccountBalances): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const kotakMine = balances.kotakSplit !== undefined
    ? Math.max(0, Number(balances.kotakSplit.mine) || 0)
    : Math.max(0, Number(balances.upi_kotak) || 0);
  const kotakFriend = balances.kotakSplit !== undefined
    ? Math.max(0, Number(balances.kotakSplit.friend) || 0)
    : 0;
  const effectiveKotak = kotakMine + kotakFriend;

  const cleanBalances = {
    cash: Math.max(0, Number(balances.cash) || 0),
    upi_kotak: effectiveKotak,
    upi_union: Math.max(0, Number(balances.upi_union) || 0),
  };

  const total = cleanBalances.cash + cleanBalances.upi_kotak + cleanBalances.upi_union;
  const budgetRef = doc(db, SETTINGS_COLLECTION, BUDGET_DOC_ID);

  const budgetDocData: Record<string, unknown> = {
    balances: cleanBalances,
    totalMoney: total,
    updatedAt: Date.now(),
    kotakSplit: {
      mine: kotakMine,
      friend: kotakFriend,
    },
  };

  await setDoc(budgetRef, budgetDocData, { merge: true });
};

// ----------------------------------------------------
// Money Lending to Friends Subscription & CRUD
// ----------------------------------------------------
export const subscribeLending = (
  onData: (records: LendingRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  const q = query(collection(db, LENDING_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: LendingRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          friendName: d.friendName || 'Friend',
          amount: Number(d.amount) || 0,
          account: (d.account as PaymentMethod) || 'cash',
          lentBy: d.lentBy === 'friend' ? 'friend' : 'mine',
          date: d.date || new Date().toISOString().split('T')[0],
          notes: d.notes || '',
          status: d.status === 'settled' ? 'settled' : 'pending',
          settledDate: d.settledDate || undefined,
          createdAt: Number(d.createdAt) || Date.now(),
        });
      });
      onData(list);
    },
    (err) => {
      console.error('Firestore lending onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

export const addLendingToFirestore = async (
  data: Omit<LendingRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): Promise<string> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const id = data.id || `lend-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const cleanRecord: Record<string, unknown> = {
    id,
    friendName: data.friendName || 'Friend',
    amount: Number(data.amount) || 0,
    account: data.account || 'cash',
    lentBy: data.lentBy || 'mine',
    date: data.date || new Date().toISOString().split('T')[0],
    notes: data.notes || '',
    status: data.status === 'settled' ? 'settled' : 'pending',
    createdAt: data.createdAt || Date.now(),
  };

  if (data.status === 'settled' && data.settledDate) {
    cleanRecord.settledDate = data.settledDate;
  }

  await setDoc(doc(db, LENDING_COLLECTION, id), cleanRecord);
  return id;
};

export const updateLendingInFirestore = async (
  id: string,
  data: Partial<Omit<LendingRecord, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const cleanData: Record<string, unknown> = {};
  if (data.friendName !== undefined) cleanData.friendName = data.friendName;
  if (data.amount !== undefined) cleanData.amount = Number(data.amount) || 0;
  if (data.account !== undefined) cleanData.account = data.account;
  if (data.lentBy !== undefined) cleanData.lentBy = data.lentBy;
  if (data.date !== undefined) cleanData.date = data.date;
  if (data.notes !== undefined) cleanData.notes = data.notes || '';
  if (data.status !== undefined) {
    cleanData.status = data.status;
    if (data.status === 'pending') {
      cleanData.settledDate = null;
    }
  }
  if (data.settledDate !== undefined) {
    cleanData.settledDate = data.settledDate || null;
  }

  const loanRef = doc(db, LENDING_COLLECTION, id);
  await updateDoc(loanRef, cleanData);
};

export const toggleLendingStatusInFirestore = async (
  id: string,
  currentStatus: 'pending' | 'settled'
): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  const nextStatus = currentStatus === 'pending' ? 'settled' : 'pending';
  const today = new Date().toISOString().split('T')[0];

  await updateDoc(doc(db, LENDING_COLLECTION, id), {
    status: nextStatus,
    settledDate: nextStatus === 'settled' ? today : null,
  });
};

export const deleteLendingFromFirestore = async (id: string): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  await deleteDoc(doc(db, LENDING_COLLECTION, id));
};

// ----------------------------------------------------
// Data Migration to Cloud
// ----------------------------------------------------
export const migrateLocalDataToFirestore = async (
  localExpenses: Expense[],
  localBalances: AccountBalances,
  localLending: LendingRecord[] = []
): Promise<number> => {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  await setBalancesInFirestore(localBalances);

  let uploadedCount = 0;
  const chunkSize = 400;

  // Upload expenses
  for (let i = 0; i < localExpenses.length; i += chunkSize) {
    const chunk = localExpenses.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const exp of chunk) {
      const expRef = doc(db, EXPENSES_COLLECTION, exp.id);
      batch.set(expRef, exp, { merge: true });
    }

    await batch.commit();
    uploadedCount += chunk.length;
  }

  // Upload lending records
  if (localLending.length > 0) {
    for (let i = 0; i < localLending.length; i += chunkSize) {
      const chunk = localLending.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const lend of chunk) {
        const lendRef = doc(db, LENDING_COLLECTION, lend.id);
        const cleanLend: Record<string, unknown> = {
          id: lend.id,
          friendName: lend.friendName || 'Friend',
          amount: Number(lend.amount) || 0,
          account: lend.account || 'cash',
          date: lend.date || new Date().toISOString().split('T')[0],
          notes: lend.notes || '',
          status: lend.status === 'settled' ? 'settled' : 'pending',
          createdAt: Number(lend.createdAt) || Date.now(),
        };
        if (lend.status === 'settled' && lend.settledDate) {
          cleanLend.settledDate = lend.settledDate;
        }
        batch.set(lendRef, cleanLend, { merge: true });
      }

      await batch.commit();
      uploadedCount += chunk.length;
    }
  }

  return uploadedCount;
};

// ----------------------------------------------------
// Wipe All Cloud Data (Expenses, Lending, Balances)
// ----------------------------------------------------
export const clearAllFirestoreData = async (): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) {
    return;
  }

  // 1. Delete all expenses in chunks
  try {
    const expensesSnap = await getDocs(collection(db, EXPENSES_COLLECTION));
    const docs = expensesSnap.docs;
    const chunkSize = 400;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to clear expenses collection in Firestore:', err);
  }

  // 2. Delete all lending records in chunks
  try {
    const lendingSnap = await getDocs(collection(db, LENDING_COLLECTION));
    const docs = lendingSnap.docs;
    const chunkSize = 400;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to clear lending collection in Firestore:', err);
  }

  // 3. Reset budget balances in Firestore to 0
  try {
    await setBalancesInFirestore({
      cash: 0,
      upi_kotak: 0,
      upi_union: 0,
      kotakSplit: { mine: 0, friend: 0 },
    });
  } catch (err) {
    console.error('Failed to reset budget in Firestore:', err);
  }
};
