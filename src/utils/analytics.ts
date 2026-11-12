import type {
  Expense,
  ExpenseFilters,
  DailySpending,
  CategorySpending,
  WhereHowSpending,
  CategoryId,
  PaymentMethod,
  SummaryStats,
  AccountBalances,
  LendingRecord,
} from '../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import {
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  subDays,
  isAfter,
  compareDesc,
  compareAsc,
} from 'date-fns';
import { formatExpenseDate, formatShortDate } from './formatters';

export const filterExpenses = (
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] => {
  return expenses.filter((exp) => {
    // 1. Search Query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const catName = CATEGORIES[exp.category]?.name.toLowerCase() || '';
      const reasonMatch = exp.reason.toLowerCase().includes(q);
      const titleMatch = exp.title ? exp.title.toLowerCase().includes(q) : false;
      const merchantMatch = exp.merchant?.toLowerCase().includes(q) ?? false;
      const catMatch = catName.includes(q);

      if (!reasonMatch && !titleMatch && !merchantMatch && !catMatch) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.category !== 'all' && exp.category !== filters.category) {
      return false;
    }

    // 3. Payment Method Filter
    if (filters.paymentMethod !== 'all' && exp.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    // 4. Date Range Filter
    if (filters.dateFilter !== 'all') {
      try {
        const expDate = parseISO(exp.date);
        const now = new Date();

        switch (filters.dateFilter) {
          case 'today':
            if (!isToday(expDate)) return false;
            break;
          case 'week':
            if (!isThisWeek(expDate, { weekStartsOn: 1 })) return false;
            break;
          case 'month':
            if (!isThisMonth(expDate)) return false;
            break;
          case 'last30':
            if (!isAfter(expDate, subDays(now, 30))) return false;
            break;
          case 'custom':
            if (filters.startDate && exp.date < filters.startDate) return false;
            if (filters.endDate && exp.date > filters.endDate) return false;
            break;
        }
      } catch {
        // keep if invalid
      }
    }

    return true;
  });
};

export const sortExpenses = (
  expenses: Expense[],
  sortBy: ExpenseFilters['sortBy']
): Expense[] => {
  const sorted = [...expenses];
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => {
        const dComp = compareDesc(parseISO(a.date), parseISO(b.date));
        return dComp !== 0 ? dComp : b.createdAt - a.createdAt;
      });
    case 'date-asc':
      return sorted.sort((a, b) => {
        const dComp = compareAsc(parseISO(a.date), parseISO(b.date));
        return dComp !== 0 ? dComp : a.createdAt - b.createdAt;
      });
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    default:
      return sorted;
  }
};

export const computeDailySpending = (
  expenses: Expense[],
  order: 'asc' | 'desc' = 'desc'
): DailySpending[] => {
  const groups: Record<string, Expense[]> = {};

  expenses.forEach((exp) => {
    if (!groups[exp.date]) {
      groups[exp.date] = [];
    }
    groups[exp.date].push(exp);
  });

  const dates = Object.keys(groups);
  dates.sort((a, b) => {
    return order === 'desc'
      ? compareDesc(parseISO(a), parseISO(b))
      : compareAsc(parseISO(a), parseISO(b));
  });

  return dates.map((dateStr) => {
    const dayExpenses = groups[dateStr];
    const total = dayExpenses.reduce((sum, item) => sum + item.amount, 0);

    return {
      date: dateStr,
      displayDate: formatExpenseDate(dateStr),
      total,
      count: dayExpenses.length,
      expenses: dayExpenses.sort((a, b) => b.createdAt - a.createdAt),
    };
  });
};

export const computeCategorySpending = (expenses: Expense[]): CategorySpending[] => {
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const map: Partial<Record<CategoryId, { total: number; count: number }>> = {};

  expenses.forEach((e) => {
    if (!map[e.category]) {
      map[e.category] = { total: 0, count: 0 };
    }
    map[e.category]!.total += e.amount;
    map[e.category]!.count += 1;
  });

  const list: CategorySpending[] = Object.entries(map).map(([catId, data]) => {
    const id = catId as CategoryId;
    const cat = CATEGORIES[id];
    const percentage = totalSpend > 0 ? (data!.total / totalSpend) * 100 : 0;
    const avg = data!.count > 0 ? data!.total / data!.count : 0;

    return {
      category: id,
      name: cat ? cat.name : id,
      color: cat ? cat.color : '#64748b',
      total: data!.total,
      percentage: Number(percentage.toFixed(1)),
      count: data!.count,
      avgPerTransaction: Math.round(avg),
    };
  });

  return list.sort((a, b) => b.total - a.total);
};

export const computeWhereSpending = (expenses: Expense[]): WhereHowSpending[] => {
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const map: Record<string, { total: number; count: number }> = {};

  expenses.forEach((e) => {
    const merchant = e.merchant?.trim() || 'Unspecified Merchant';
    if (!map[merchant]) {
      map[merchant] = { total: 0, count: 0 };
    }
    map[merchant].total += e.amount;
    map[merchant].count += 1;
  });

  const list = Object.entries(map).map(([name, data]) => ({
    name,
    total: data.total,
    percentage: totalSpend > 0 ? Number(((data.total / totalSpend) * 100).toFixed(1)) : 0,
    count: data.count,
  }));

  return list.sort((a, b) => b.total - a.total);
};

export const computeHowSpending = (expenses: Expense[]): WhereHowSpending[] => {
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const map: Partial<Record<PaymentMethod, { total: number; count: number }>> = {};

  expenses.forEach((e) => {
    if (!map[e.paymentMethod]) {
      map[e.paymentMethod] = { total: 0, count: 0 };
    }
    map[e.paymentMethod]!.total += e.amount;
    map[e.paymentMethod]!.count += 1;
  });

  const list = Object.entries(map).map(([method, data]) => {
    const pm = PAYMENT_METHODS[method as PaymentMethod];
    return {
      name: pm ? pm.name : method,
      total: data!.total,
      percentage: totalSpend > 0 ? Number(((data!.total / totalSpend) * 100).toFixed(1)) : 0,
      count: data!.count,
    };
  });

  return list.sort((a, b) => b.total - a.total);
};

export const computeSummaryStats = (
  expenses: Expense[],
  accountBalancesInput: AccountBalances | number = { cash: 0, upi_kotak: 0, upi_union: 0 },
  lendingRecords: LendingRecord[] = []
): SummaryStats => {
  // Normalize input if legacy number passed
  const accountBalances: AccountBalances =
    typeof accountBalancesInput === 'number'
      ? { cash: 0, upi_kotak: accountBalancesInput, upi_union: 0 }
      : accountBalancesInput || { cash: 0, upi_kotak: 0, upi_union: 0 };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = expenses.length;

  const dailyGroups = computeDailySpending(expenses, 'asc');
  const distinctDays = dailyGroups.length;
  const dailyAverage = distinctDays > 0 ? Math.round(totalSpent / distinctDays) : 0;

  let highestSpendingDay: { date: string; displayDate: string; amount: number } | null = null;
  dailyGroups.forEach((day) => {
    if (!highestSpendingDay || day.total > (highestSpendingDay as { amount: number }).amount) {
      highestSpendingDay = {
        date: day.date,
        displayDate: formatShortDate(day.date),
        amount: day.total,
      };
    }
  });

  const categoryGroups = computeCategorySpending(expenses);
  const topCategory = categoryGroups.length > 0 ? categoryGroups[0] : null;

  const whereGroups = computeWhereSpending(expenses);
  const topMerchant =
    whereGroups.length > 0 && whereGroups[0].name !== 'Unspecified Merchant'
      ? whereGroups[0]
      : whereGroups.length > 1
      ? whereGroups[1]
      : null;

  // Account spending calculation with Kotak user & best friend split
  const spentByAccount: Record<PaymentMethod, number> = {
    cash: 0,
    upi_kotak: 0,
    upi_union: 0,
  };
  let kotakMineSpent = 0;
  let kotakFriendSpent = 0;

  // Returned amounts from expenses marked spentForOther and isReturned
  const returnedByAccount: Record<PaymentMethod, number> = {
    cash: 0,
    upi_kotak: 0,
    upi_union: 0,
  };
  let kotakMineReturned = 0;
  let kotakFriendReturned = 0;
  let totalReturned = 0;

  expenses.forEach((e) => {
    if (spentByAccount[e.paymentMethod] !== undefined) {
      spentByAccount[e.paymentMethod] += e.amount;
    }
    if (e.paymentMethod === 'upi_kotak') {
      if (e.paidBy === 'friend') {
        kotakFriendSpent += e.amount;
      } else {
        kotakMineSpent += e.amount;
      }
    }

    // If spent for someone else and they returned the money:
    if (e.spentForOther && e.isReturned) {
      totalReturned += e.amount;
      if (returnedByAccount[e.paymentMethod] !== undefined) {
        returnedByAccount[e.paymentMethod] += e.amount;
      }
      if (e.paymentMethod === 'upi_kotak') {
        if (e.paidBy === 'friend') {
          kotakFriendReturned += e.amount;
        } else {
          kotakMineReturned += e.amount;
        }
      }
    }
  });

  // Lending calculations per account and total
  const lentPendingByAccount: Record<PaymentMethod, number> = {
    cash: 0,
    upi_kotak: 0,
    upi_union: 0,
  };
  let kotakMineLent = 0;
  let kotakFriendLent = 0;
  let totalLentPending = 0;
  let totalSettled = 0;
  let activeLoansCount = 0;
  let settledLoansCount = 0;

  lendingRecords.forEach((loan) => {
    if (loan.status === 'pending') {
      totalLentPending += loan.amount;
      activeLoansCount += 1;
      if (lentPendingByAccount[loan.account] !== undefined) {
        lentPendingByAccount[loan.account] += loan.amount;
      }
      if (loan.account === 'upi_kotak') {
        if (loan.lentBy === 'friend') {
          kotakFriendLent += loan.amount;
        } else {
          kotakMineLent += loan.amount;
        }
      }
    } else if (loan.status === 'settled') {
      totalSettled += loan.amount;
      settledLoansCount += 1;
    }
  });

  // Kotak initial split calculation
  const kotakMineTotal =
    accountBalances.kotakSplit !== undefined
      ? Math.max(0, accountBalances.kotakSplit.mine)
      : Math.max(0, accountBalances.upi_kotak);
  const kotakFriendTotal =
    accountBalances.kotakSplit !== undefined
      ? Math.max(0, accountBalances.kotakSplit.friend)
      : 0;
  const effectiveKotakTotalMoney =
    accountBalances.kotakSplit !== undefined
      ? kotakMineTotal + kotakFriendTotal
      : accountBalances.upi_kotak;

  const kotakMineBalance = kotakMineTotal - kotakMineSpent - kotakMineLent + kotakMineReturned;
  const kotakFriendBalance = kotakFriendTotal - kotakFriendSpent - kotakFriendLent + kotakFriendReturned;
  const kotakTotalBalance = kotakMineBalance + kotakFriendBalance;

  const cashDetail = {
    id: 'cash' as PaymentMethod,
    name: 'Cash',
    totalMoney: accountBalances.cash,
    spent: spentByAccount.cash,
    lent: lentPendingByAccount.cash,
    returned: returnedByAccount.cash,
    balance: accountBalances.cash - spentByAccount.cash - lentPendingByAccount.cash + returnedByAccount.cash,
  };

  const kotakDetail = {
    id: 'upi_kotak' as PaymentMethod,
    name: 'UPI (Kotak)',
    totalMoney: effectiveKotakTotalMoney,
    spent: spentByAccount.upi_kotak,
    lent: lentPendingByAccount.upi_kotak,
    returned: returnedByAccount.upi_kotak,
    balance: kotakTotalBalance,
    split: {
      mine: {
        totalMoney: kotakMineTotal,
        spent: kotakMineSpent,
        lent: kotakMineLent,
        returned: kotakMineReturned,
        balance: kotakMineBalance,
      },
      friend: {
        totalMoney: kotakFriendTotal,
        spent: kotakFriendSpent,
        lent: kotakFriendLent,
        returned: kotakFriendReturned,
        balance: kotakFriendBalance,
      },
    },
  };

  const unionDetail = {
    id: 'upi_union' as PaymentMethod,
    name: 'UPI (Union)',
    totalMoney: accountBalances.upi_union,
    spent: spentByAccount.upi_union,
    lent: lentPendingByAccount.upi_union,
    returned: returnedByAccount.upi_union,
    balance: accountBalances.upi_union - spentByAccount.upi_union - lentPendingByAccount.upi_union + returnedByAccount.upi_union,
  };

  const grandTotalMoney = accountBalances.cash + effectiveKotakTotalMoney + accountBalances.upi_union;
  const remainingBalance = cashDetail.balance + kotakDetail.balance + unionDetail.balance;
  const spentPercentage = grandTotalMoney > 0 ? Number(((totalSpent / grandTotalMoney) * 100).toFixed(1)) : 0;

  return {
    totalSpent,
    totalReturned,
    transactionCount,
    distinctDays,
    dailyAverage,
    highestSpendingDay,
    topCategory,
    topMerchant,
    totalMoney: grandTotalMoney,
    remainingBalance,
    spentPercentage,
    accountBalances,
    accounts: {
      cash: cashDetail,
      upi_kotak: kotakDetail,
      upi_union: unionDetail,
    },
    lendingSummary: {
      totalLentPending,
      totalSettled,
      activeLoansCount,
      settledLoansCount,
    },
  };
};
