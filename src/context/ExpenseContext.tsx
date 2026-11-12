import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Expense,
  ExpenseFilters,
  DailySpending,
  CategorySpending,
  WhereHowSpending,
  SummaryStats,
  AccountBalances,
  LendingRecord,
  PaymentMethod,
} from '../types/expense';
import {
  filterExpenses,
  sortExpenses,
  computeDailySpending,
  computeCategorySpending,
  computeWhereSpending,
  computeHowSpending,
  computeSummaryStats,
} from '../utils/analytics';
import { isFirebaseConfigured } from '../config/firebase';
import {
  subscribeExpenses,
  subscribeBalances,
  subscribeLending,
  addExpenseToFirestore,
  updateExpenseInFirestore,
  deleteExpenseFromFirestore,
  setBalancesInFirestore,
  addLendingToFirestore,
  updateLendingInFirestore,
  toggleLendingStatusInFirestore,
  deleteLendingFromFirestore,
  clearAllFirestoreData,
} from '../services/firestoreService';

export type ActiveTab =
  | 'overview'
  | 'day-by-day'
  | 'category-wise'
  | 'where-how'
  | 'lending'
  | 'transactions';

interface ExpenseContextType {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filters: ExpenseFilters;
  activeTab: ActiveTab;
  isFormOpen: boolean;
  editingExpense: Expense | null;

  // Account Balances (Cash, UPI Kotak, UPI Union)
  accountBalances: AccountBalances;
  totalMoney: number;
  isBudgetModalOpen: boolean;
  budgetModalMode: 'add' | 'set';
  budgetModalAccount: PaymentMethod | 'all';

  // Money Lending
  lendingRecords: LendingRecord[];
  isLendingModalOpen: boolean;
  editingLending: LendingRecord | null;

  // Cloud Sync
  isCloudConnected: boolean;
  isCloudModalOpen: boolean;

  // Aggregated Analytics
  dailySpendingDesc: DailySpending[];
  dailySpendingAsc: DailySpending[];
  categorySpending: CategorySpending[];
  whereSpending: WhereHowSpending[];
  howSpending: WhereHowSpending[];
  summaryStats: SummaryStats;

  // Navigation & Filter Actions
  setActiveTab: (tab: ActiveTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
  resetFilters: () => void;

  // Expense Actions
  openAddModal: () => void;
  openEditModal: (exp: Expense) => void;
  closeFormModal: () => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  toggleExpenseReturned: (id: string) => void;
  clearAllExpenses: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Budget / Balance Actions
  openBudgetModal: (mode?: 'add' | 'set', account?: PaymentMethod) => void;
  closeBudgetModal: () => void;
  setAccountBalances: (balances: AccountBalances) => void;
  addMoneyToAccount: (account: PaymentMethod, amount: number, share?: 'mine' | 'friend') => void;
  setTotalMoney: (amount: number) => void; // Legacy convenience (assigns to Kotak or proportional)
  addMoney: (amount: number) => void;

  // Lending Actions
  openAddLendingModal: () => void;
  openEditLendingModal: (record: LendingRecord) => void;
  closeLendingModal: () => void;
  addLendingRecord: (data: Omit<LendingRecord, 'id' | 'createdAt'>) => void;
  updateLendingRecord: (id: string, data: Partial<Omit<LendingRecord, 'id' | 'createdAt'>>) => void;
  toggleLendingStatus: (id: string) => void;
  deleteLendingRecord: (id: string) => void;

  // Cloud Modal Actions
  openCloudModal: () => void;
  closeCloudModal: () => void;
}

const STORAGE_EXPENSES_KEY = 'user_clean_expenses_v4';
const STORAGE_BALANCES_KEY = 'user_clean_balances_v3';
const STORAGE_LENDING_KEY = 'user_clean_lending_v2';
const LEGACY_TOTAL_KEY = 'user_total_money_v1';

// Purge any older cached demo/mock data so the website starts completely empty
try {
  [
    'user_fresh_expenses_v3',
    'user_account_balances_v2',
    'user_lending_records_v1',
    'user_total_money_v1',
    'antigravity_expenses_v1',
    'antigravity_expenses_v2',
    'antigravity_currency_v1',
  ].forEach((k) => localStorage.removeItem(k));
} catch {
  // ignore
}

const initialFilters: ExpenseFilters = {
  search: '',
  category: 'all',
  paymentMethod: 'all',
  dateFilter: 'all',
  sortBy: 'date-desc',
};

const defaultBalances: AccountBalances = {
  cash: 0,
  upi_kotak: 0,
  upi_union: 0,
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCloudConnected = isFirebaseConfigured();

  // 1. Expenses State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      localStorage.removeItem('antigravity_expenses_v1');
      localStorage.removeItem('antigravity_expenses_v2');
      localStorage.removeItem('antigravity_currency_v1');

      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Failed to load expenses from localStorage', e);
    }
    return [];
  });

  // 2. Account Balances State (Cash, UPI Kotak, UPI Union)
  const [accountBalances, setAccountBalancesState] = useState<AccountBalances>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BALANCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const rawKotak = Number(parsed.upi_kotak) || 0;
        let kotakSplit = parsed.kotakSplit;
        if (!kotakSplit && rawKotak > 0) {
          kotakSplit = { mine: rawKotak, friend: 0 };
        }
        return {
          cash: Number(parsed.cash) || 0,
          upi_kotak: kotakSplit ? (Number(kotakSplit.mine) || 0) + (Number(kotakSplit.friend) || 0) : rawKotak,
          upi_union: Number(parsed.upi_union) || 0,
          kotakSplit: kotakSplit
            ? {
                mine: Number(kotakSplit.mine) || 0,
                friend: Number(kotakSplit.friend) || 0,
              }
            : undefined,
        };
      }
      // Check legacy single total money
      const legacy = localStorage.getItem(LEGACY_TOTAL_KEY);
      if (legacy) {
        const legacyVal = parseFloat(legacy);
        if (!isNaN(legacyVal) && legacyVal > 0) {
          return {
            cash: 0,
            upi_kotak: legacyVal,
            upi_union: 0,
            kotakSplit: { mine: legacyVal, friend: 0 },
          };
        }
      }
    } catch (e) {
      console.error('Failed to load account balances', e);
    }
    return defaultBalances;
  });

  // 3. Lending Records State
  const [lendingRecords, setLendingRecords] = useState<LendingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LENDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Failed to load lending records', e);
    }
    return [];
  });

  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [budgetModalMode, setBudgetModalMode] = useState<'add' | 'set'>('add');
  const [budgetModalAccount, setBudgetModalAccount] = useState<PaymentMethod | 'all'>('all');

  // Lending Modal State
  const [isLendingModalOpen, setIsLendingModalOpen] = useState<boolean>(false);
  const [editingLending, setEditingLending] = useState<LendingRecord | null>(null);

  // Cloud Modal State
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);

  // Firestore Real-Time Subscriptions when Cloud is connected
  useEffect(() => {
    if (isCloudConnected) {
      const unsubExpenses = subscribeExpenses((cloudExpenses) => {
        setExpenses(cloudExpenses || []);
      });

      const unsubBalances = subscribeBalances((cloudBalances) => {
        setAccountBalancesState(cloudBalances);
      });

      const unsubLending = subscribeLending((cloudLending) => {
        setLendingRecords(cloudLending || []);
      });

      return () => {
        unsubExpenses();
        unsubBalances();
        unsubLending();
      };
    }
  }, [isCloudConnected]);

  // Mirror to Local Storage as offline cache / safeguard
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BALANCES_KEY, JSON.stringify(accountBalances));
    } catch (e) {
      console.error('Failed to save balances to localStorage', e);
    }
  }, [accountBalances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LENDING_KEY, JSON.stringify(lendingRecords));
    } catch (e) {
      console.error('Failed to save lending records to localStorage', e);
    }
  }, [lendingRecords]);

  // ----------------------------------------------------
  // Budget & Balances Actions
  // ----------------------------------------------------
  const setAccountBalances = (newBalances: AccountBalances) => {
    const rawKotak = Math.max(0, newBalances.upi_kotak);
    const mine =
      newBalances.kotakSplit !== undefined
        ? Math.max(0, newBalances.kotakSplit.mine)
        : rawKotak;
    const friend =
      newBalances.kotakSplit !== undefined
        ? Math.max(0, newBalances.kotakSplit.friend)
        : 0;

    const clean: AccountBalances = {
      cash: Math.max(0, newBalances.cash),
      upi_kotak: mine + friend,
      upi_union: Math.max(0, newBalances.upi_union),
      kotakSplit: { mine, friend },
    };

    setAccountBalancesState(clean);

    if (isCloudConnected) {
      setBalancesInFirestore(clean).catch((err) => {
        console.error('Failed to set balances in Firestore:', err);
      });
    }
  };

  const addMoneyToAccount = (
    account: PaymentMethod,
    amount: number,
    share: 'mine' | 'friend' = 'mine'
  ) => {
    if (amount <= 0) return;

    if (account === 'upi_kotak') {
      const currentMine = accountBalances.kotakSplit?.mine ?? accountBalances.upi_kotak;
      const currentFriend = accountBalances.kotakSplit?.friend ?? 0;
      const updatedMine = share === 'friend' ? currentMine : currentMine + amount;
      const updatedFriend = share === 'friend' ? currentFriend + amount : currentFriend;

      const updated: AccountBalances = {
        ...accountBalances,
        upi_kotak: updatedMine + updatedFriend,
        kotakSplit: {
          mine: updatedMine,
          friend: updatedFriend,
        },
      };
      setAccountBalances(updated);
    } else {
      const updated: AccountBalances = {
        ...accountBalances,
        [account]: (accountBalances[account] || 0) + amount,
      };
      setAccountBalances(updated);
    }
  };

  // Legacy convenience for single total money
  const setTotalMoney = (amount: number) => {
    setAccountBalances({
      cash: accountBalances.cash,
      upi_kotak: Math.max(0, amount),
      upi_union: accountBalances.upi_union,
    });
  };

  const addMoney = (amount: number) => {
    addMoneyToAccount('upi_kotak', amount);
  };

  const openBudgetModal = (mode?: 'add' | 'set', account?: PaymentMethod) => {
    if (mode) setBudgetModalMode(mode);
    setBudgetModalAccount(account || 'all');
    setIsBudgetModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
  };

  // ----------------------------------------------------
  // Money Lending Actions
  // ----------------------------------------------------
  const openAddLendingModal = () => {
    setEditingLending(null);
    setIsLendingModalOpen(true);
  };

  const openEditLendingModal = (record: LendingRecord) => {
    setEditingLending(record);
    setIsLendingModalOpen(true);
  };

  const closeLendingModal = () => {
    setEditingLending(null);
    setIsLendingModalOpen(false);
  };

  const addLendingRecord = (data: Omit<LendingRecord, 'id' | 'createdAt'>) => {
    const id = `lend-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRecord: LendingRecord = {
      ...data,
      id,
      friendName: data.friendName.trim(),
      lentBy: data.lentBy || 'mine',
      notes: data.notes || '',
      status: data.status || 'pending',
      createdAt: Date.now(),
    };

    // 1. Immediately update local state so user sees it right away!
    setLendingRecords((prev) => [newRecord, ...prev]);

    // 2. Persist to Firestore
    if (isCloudConnected) {
      addLendingToFirestore(newRecord).catch((err) => {
        console.error('Failed to add loan to Firestore:', err);
      });
    }
  };

  const updateLendingRecord = (
    id: string,
    data: Partial<Omit<LendingRecord, 'id' | 'createdAt'>>
  ) => {
    // 1. Immediately update local state!
    setLendingRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );

    // 2. Sync to Firestore
    if (isCloudConnected) {
      updateLendingInFirestore(id, data).catch((err) => {
        console.error('Failed to update loan in Firestore:', err);
      });
    }
  };

  const toggleLendingStatus = (id: string) => {
    const existing = lendingRecords.find((l) => l.id === id);
    if (!existing) return;

    const nextStatus = existing.status === 'pending' ? 'settled' : 'pending';
    const today = new Date().toISOString().split('T')[0];

    // 1. Immediately update local state!
    setLendingRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              settledDate: nextStatus === 'settled' ? today : undefined,
            }
          : item
      )
    );

    // 2. Sync to Firestore
    if (isCloudConnected) {
      toggleLendingStatusInFirestore(id, existing.status).catch((err) => {
        console.error('Failed to toggle loan status in Firestore:', err);
      });
    }
  };

  const deleteLendingRecord = (id: string) => {
    // 1. Immediately remove from local state!
    setLendingRecords((prev) => prev.filter((item) => item.id !== id));

    // 2. Sync to Firestore
    if (isCloudConnected) {
      deleteLendingFromFirestore(id).catch((err) => {
        console.error('Failed to delete loan from Firestore:', err);
      });
    }
  };

  // ----------------------------------------------------
  // Expense Actions
  // ----------------------------------------------------
  const openAddModal = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingExpense(null);
    setIsFormOpen(false);
  };

  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newExpense: Expense = {
      ...data,
      id,
      paidBy: data.paidBy || 'mine',
      spentForOther: Boolean(data.spentForOther),
      isReturned: Boolean(data.isReturned),
      returnedAt: data.returnedAt || undefined,
      merchant: data.merchant || '',
      createdAt: Date.now(),
    };

    // 1. Immediately update local state!
    setExpenses((prev) => [newExpense, ...prev]);

    // 2. Persist to Firestore
    if (isCloudConnected) {
      addExpenseToFirestore(newExpense).catch((err) => {
        console.error('Failed to add expense to Firestore:', err);
      });
    }
  };

  const updateExpense = (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );

    if (isCloudConnected) {
      updateExpenseInFirestore(id, data).catch((err) => {
        console.error('Failed to update expense in Firestore:', err);
      });
    }
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((item) => item.id === id);

    // If an expense is deleted, that money was spent in real life and is gone forever!
    // To ensure deleting the record does NOT add the money back to the total / available balance:
    if (target && !(target.spentForOther && target.isReturned)) {
      setAccountBalancesState((prev) => {
        let updatedCash = prev.cash;
        let updatedUnion = prev.upi_union;
        let updatedMine = prev.kotakSplit?.mine ?? prev.upi_kotak;
        let updatedFriend = prev.kotakSplit?.friend ?? 0;

        if (target.paymentMethod === 'cash') {
          updatedCash = Math.max(0, updatedCash - target.amount);
        } else if (target.paymentMethod === 'upi_union') {
          updatedUnion = Math.max(0, updatedUnion - target.amount);
        } else if (target.paymentMethod === 'upi_kotak') {
          if (target.paidBy === 'friend') {
            updatedFriend = Math.max(0, updatedFriend - target.amount);
          } else {
            updatedMine = Math.max(0, updatedMine - target.amount);
          }
        }

        const newBalances: AccountBalances = {
          cash: updatedCash,
          upi_kotak: updatedMine + updatedFriend,
          upi_union: updatedUnion,
          kotakSplit: {
            mine: updatedMine,
            friend: updatedFriend,
          },
        };

        try {
          localStorage.setItem(STORAGE_BALANCES_KEY, JSON.stringify(newBalances));
        } catch (err) {
          console.error('Failed to save balances to localStorage on delete:', err);
        }

        if (isCloudConnected) {
          setBalancesInFirestore(newBalances).catch((err) => {
            console.error('Failed to sync adjusted balances on delete:', err);
          });
        }

        return newBalances;
      });
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id));

    if (isCloudConnected) {
      deleteExpenseFromFirestore(id).catch((err) => {
        console.error('Failed to delete expense in Firestore:', err);
      });
    }
  };

  const toggleExpenseReturned = (id: string) => {
    const target = expenses.find((item) => item.id === id);
    if (!target) return;

    const nextReturned = !target.isReturned;
    const now = Date.now();

    // 1. Update local state immediately so user sees the change right away!
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isReturned: nextReturned,
              returnedAt: nextReturned ? now : undefined,
            }
          : item
      )
    );

    // 2. Sync to Firestore
    if (isCloudConnected) {
      updateExpenseInFirestore(id, {
        isReturned: nextReturned,
        returnedAt: nextReturned ? now : undefined,
      }).catch((err) => {
        console.error('Failed to toggle expense return status in Firestore:', err);
      });
    }
  };

  const clearAllData = async (): Promise<void> => {
    // 1. Immediately wipe all local in-memory state
    setExpenses([]);
    setLendingRecords([]);
    const zeroBalances: AccountBalances = {
      cash: 0,
      upi_kotak: 0,
      upi_union: 0,
      kotakSplit: { mine: 0, friend: 0 },
    };
    setAccountBalancesState(zeroBalances);

    // 2. Wipe all local storage keys
    try {
      localStorage.removeItem(STORAGE_EXPENSES_KEY);
      localStorage.removeItem(STORAGE_BALANCES_KEY);
      localStorage.removeItem(STORAGE_LENDING_KEY);
      localStorage.removeItem(LEGACY_TOTAL_KEY);
      localStorage.removeItem('user_clean_expenses_v4');
      localStorage.removeItem('user_clean_balances_v3');
      localStorage.removeItem('user_clean_lending_v2');
      localStorage.removeItem('user_fresh_expenses_v3');
      localStorage.removeItem('user_account_balances_v2');
      localStorage.removeItem('user_lending_records_v1');
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }

    // 3. Delete all data from Cloud Firestore if connected
    if (isCloudConnected) {
      try {
        await clearAllFirestoreData();
      } catch (err) {
        console.error('Failed to clear Firestore cloud data:', err);
      }
    }
  };

  const clearAllExpenses = clearAllData;

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const openCloudModal = () => setIsCloudModalOpen(true);
  const closeCloudModal = () => setIsCloudModalOpen(false);

  // ----------------------------------------------------
  // Filtered & Aggregated Metrics
  // ----------------------------------------------------
  const filteredExpenses = useMemo(() => {
    const filtered = filterExpenses(expenses, filters);
    return sortExpenses(filtered, filters.sortBy);
  }, [expenses, filters]);

  const dailySpendingDesc = useMemo(() => {
    return computeDailySpending(filteredExpenses, 'desc');
  }, [filteredExpenses]);

  const dailySpendingAsc = useMemo(() => {
    return computeDailySpending(filteredExpenses, 'asc');
  }, [filteredExpenses]);

  const categorySpending = useMemo(() => {
    return computeCategorySpending(filteredExpenses);
  }, [filteredExpenses]);

  const whereSpending = useMemo(() => {
    return computeWhereSpending(filteredExpenses);
  }, [filteredExpenses]);

  const howSpending = useMemo(() => {
    return computeHowSpending(filteredExpenses);
  }, [filteredExpenses]);

  const summaryStats = useMemo(() => {
    return computeSummaryStats(filteredExpenses, accountBalances, lendingRecords);
  }, [filteredExpenses, accountBalances, lendingRecords]);

  const totalMoney = summaryStats.totalMoney;

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        filters,
        activeTab,
        isFormOpen,
        editingExpense,
        accountBalances,
        totalMoney,
        isBudgetModalOpen,
        budgetModalMode,
        budgetModalAccount,
        lendingRecords,
        isLendingModalOpen,
        editingLending,
        isCloudConnected,
        isCloudModalOpen,
        dailySpendingDesc,
        dailySpendingAsc,
        categorySpending,
        whereSpending,
        howSpending,
        summaryStats,
        setActiveTab,
        setFilters,
        resetFilters,
        openAddModal,
        openEditModal,
        closeFormModal,
        addExpense,
        updateExpense,
        deleteExpense,
        toggleExpenseReturned,
        clearAllExpenses,
        clearAllData,
        openBudgetModal,
        closeBudgetModal,
        setAccountBalances,
        addMoneyToAccount,
        setTotalMoney,
        addMoney,
        openAddLendingModal,
        openEditLendingModal,
        closeLendingModal,
        addLendingRecord,
        updateLendingRecord,
        toggleLendingStatus,
        deleteLendingRecord,
        openCloudModal,
        closeCloudModal,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
