import { describe, it, expect } from 'vitest';
import {
  filterExpenses,
  computeDailySpending,
  computeCategorySpending,
  computeSummaryStats,
} from './analytics';
import { formatCurrency } from './formatters';
import type { Expense, ExpenseFilters, AccountBalances, LendingRecord } from '../types/expense';

const mockExpenses: Expense[] = [
  {
    id: '1',
    reason: 'Morning Latte',
    amount: 150,
    category: 'food',
    merchant: 'Starbucks',
    paymentMethod: 'upi_kotak',
    date: '2026-10-01',
    createdAt: 1000,
  },
  {
    id: '2',
    reason: 'Evening Pizza dinner with roommate',
    amount: 450,
    category: 'food',
    merchant: 'Dominoes',
    paymentMethod: 'cash',
    date: '2026-10-01',
    createdAt: 2000,
  },
  {
    id: '3',
    reason: 'Metro Transit Card Pass',
    amount: 500,
    category: 'transport',
    merchant: 'Metro Station',
    paymentMethod: 'upi_union',
    date: '2026-10-02',
    createdAt: 3000,
  },
];

describe('Analytics Utility Functions', () => {
  it('correctly aggregates daily spending', () => {
    const daily = computeDailySpending(mockExpenses, 'asc');
    expect(daily.length).toBe(2);

    // Day 1: 2026-10-01
    expect(daily[0].date).toBe('2026-10-01');
    expect(daily[0].total).toBe(600); // 150 + 450
    expect(daily[0].count).toBe(2);

    // Day 2: 2026-10-02
    expect(daily[1].date).toBe('2026-10-02');
    expect(daily[1].total).toBe(500);
    expect(daily[1].count).toBe(1);
  });

  it('correctly computes category spending shares', () => {
    const catSpending = computeCategorySpending(mockExpenses);
    expect(catSpending.length).toBe(2);

    const food = catSpending.find((c) => c.category === 'food');
    expect(food).toBeDefined();
    expect(food?.total).toBe(600);
    expect(food?.count).toBe(2);
    expect(food?.percentage).toBe(54.5);

    const transport = catSpending.find((c) => c.category === 'transport');
    expect(transport).toBeDefined();
    expect(transport?.total).toBe(500);
    expect(transport?.count).toBe(1);
    expect(transport?.percentage).toBe(45.5);
  });

  it('calculates summary statistics including Total Money & Remaining Balance', () => {
    const stats = computeSummaryStats(mockExpenses, 5000);
    expect(stats.totalSpent).toBe(1100);
    expect(stats.transactionCount).toBe(3);
    expect(stats.distinctDays).toBe(2);
    expect(stats.dailyAverage).toBe(550); // 1100 / 2
    expect(stats.totalMoney).toBe(5000);
    expect(stats.remainingBalance).toBe(3900); // 5000 - 1100
    expect(stats.spentPercentage).toBe(22); // (1100 / 5000) * 100
    expect(stats.highestSpendingDay).not.toBeNull();
    if (stats.highestSpendingDay) {
      expect(stats.highestSpendingDay.date).toBe('2026-10-01');
      expect(stats.highestSpendingDay.amount).toBe(600);
    }
    expect(stats.topCategory?.category).toBe('food');
  });

  it('tracks balances per account (Cash, UPI Kotak, UPI Union) and deducts spent money', () => {
    const balances: AccountBalances = {
      cash: 1000,
      upi_kotak: 3000,
      upi_union: 2000,
    };

    const stats = computeSummaryStats(mockExpenses, balances);
    expect(stats.totalMoney).toBe(6000); // 1000 + 3000 + 2000
    expect(stats.totalSpent).toBe(1100); // 450 (cash) + 150 (kotak) + 500 (union)
    expect(stats.remainingBalance).toBe(4900); // 6000 - 1100

    // Cash: 1000 deposited - 450 spent = 550
    expect(stats.accounts.cash.totalMoney).toBe(1000);
    expect(stats.accounts.cash.spent).toBe(450);
    expect(stats.accounts.cash.balance).toBe(550);

    // UPI Kotak: 3000 deposited - 150 spent = 2850
    expect(stats.accounts.upi_kotak.totalMoney).toBe(3000);
    expect(stats.accounts.upi_kotak.spent).toBe(150);
    expect(stats.accounts.upi_kotak.balance).toBe(2850);

    // UPI Union: 2000 deposited - 500 spent = 1500
    expect(stats.accounts.upi_union.totalMoney).toBe(2000);
    expect(stats.accounts.upi_union.spent).toBe(500);
    expect(stats.accounts.upi_union.balance).toBe(1500);
  });

  it('deducts lent money from the specific account until settled', () => {
    const balances: AccountBalances = {
      cash: 2000,
      upi_kotak: 5000,
      upi_union: 3000,
    };

    const loans: LendingRecord[] = [
      {
        id: 'loan-1',
        friendName: 'Rahul',
        amount: 1000,
        account: 'upi_kotak',
        date: '2026-10-02',
        status: 'pending',
        createdAt: 4000,
      },
      {
        id: 'loan-2',
        friendName: 'Amit',
        amount: 500,
        account: 'cash',
        date: '2026-10-03',
        status: 'settled', // Repaid
        createdAt: 5000,
      },
    ];

    const stats = computeSummaryStats(mockExpenses, balances, loans);

    // Lending Summary
    expect(stats.lendingSummary.totalLentPending).toBe(1000);
    expect(stats.lendingSummary.activeLoansCount).toBe(1);
    expect(stats.lendingSummary.totalSettled).toBe(500);
    expect(stats.lendingSummary.settledLoansCount).toBe(1);

    // Kotak had 5000 - 150 spent - 1000 pending loan = 3850
    expect(stats.accounts.upi_kotak.lent).toBe(1000);
    expect(stats.accounts.upi_kotak.balance).toBe(3850);

    // Cash: 2000 - 450 spent - 0 pending (since Amit's 500 loan is settled) = 1550
    expect(stats.accounts.cash.lent).toBe(0);
    expect(stats.accounts.cash.balance).toBe(1550);

    // Union: 3000 - 500 spent = 2500
    expect(stats.accounts.upi_union.balance).toBe(2500);

    // Total Remaining = 1550 + 3850 + 2500 = 7900 (10000 total - 1100 spent - 1000 lent)
    expect(stats.remainingBalance).toBe(7900);
  });

  it('accurately updates balances when pending loans are settled or toggled', () => {
    const balances: AccountBalances = {
      cash: 1000,
      upi_kotak: 2000,
      upi_union: 1500,
    };

    const initialLoans: LendingRecord[] = [
      {
        id: 'loan-union-1',
        friendName: 'Priya',
        amount: 500,
        account: 'upi_union',
        date: '2026-10-05',
        status: 'pending',
        createdAt: 6000,
      },
    ];

    // While pending: 1500 - 500 (spent in mockExpenses) - 500 (lent) = 500
    const pendingStats = computeSummaryStats(mockExpenses, balances, initialLoans);
    expect(pendingStats.accounts.upi_union.lent).toBe(500);
    expect(pendingStats.accounts.upi_union.balance).toBe(500);
    expect(pendingStats.lendingSummary.totalLentPending).toBe(500);

    // Once settled: lent becomes 0, available balance restored to 1000
    const settledLoans: LendingRecord[] = [
      {
        ...initialLoans[0],
        status: 'settled',
        settledDate: '2026-10-06',
      },
    ];

    const settledStats = computeSummaryStats(mockExpenses, balances, settledLoans);
    expect(settledStats.accounts.upi_union.lent).toBe(0);
    expect(settledStats.accounts.upi_union.balance).toBe(1000);
    expect(settledStats.lendingSummary.totalLentPending).toBe(0);
    expect(settledStats.lendingSummary.totalSettled).toBe(500);
  });

  it('filters by search term in reason and merchant', () => {
    const defaultFilters: ExpenseFilters = {
      search: '',
      category: 'all',
      paymentMethod: 'all',
      dateFilter: 'all',
      sortBy: 'date-desc',
    };

    // Search by reason "Latte"
    const resTitle = filterExpenses(mockExpenses, { ...defaultFilters, search: 'latte' });
    expect(resTitle.length).toBe(1);
    expect(resTitle[0].id).toBe('1');

    // Search by reason "roommate"
    const resReason = filterExpenses(mockExpenses, { ...defaultFilters, search: 'roommate' });
    expect(resReason.length).toBe(1);
    expect(resReason[0].id).toBe('2');

    // Search by merchant "Metro"
    const resMerchant = filterExpenses(mockExpenses, { ...defaultFilters, search: 'metro' });
    expect(resMerchant.length).toBe(1);
    expect(resMerchant[0].id).toBe('3');
  });

  it('formats currency in Rupees (₹) with negative support', () => {
    expect(formatCurrency(1500)).toBe('₹1,500');
    expect(formatCurrency(-500)).toBe('-₹500');
  });
});
