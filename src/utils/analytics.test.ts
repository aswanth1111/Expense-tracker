import { describe, it, expect } from 'vitest';
import {
  filterExpenses,
  computeDailySpending,
  computeCategorySpending,
  computeSummaryStats,
} from './analytics';
import { formatCurrency } from './formatters';
import type { Expense, ExpenseFilters } from '../types/expense';

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
