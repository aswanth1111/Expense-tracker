import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Expense,
  ExpenseFilters,
  DailySpending,
  CategorySpending,
  WhereHowSpending,
  SummaryStats,
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

export type ActiveTab = 'overview' | 'day-by-day' | 'category-wise' | 'where-how' | 'transactions';

interface ExpenseContextType {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filters: ExpenseFilters;
  activeTab: ActiveTab;
  isFormOpen: boolean;
  editingExpense: Expense | null;
  dailySpendingDesc: DailySpending[];
  dailySpendingAsc: DailySpending[];
  categorySpending: CategorySpending[];
  whereSpending: WhereHowSpending[];
  howSpending: WhereHowSpending[];
  summaryStats: SummaryStats;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
  resetFilters: () => void;
  openAddModal: () => void;
  openEditModal: (exp: Expense) => void;
  closeFormModal: () => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
}

const STORAGE_KEY = 'user_fresh_expenses_v3';

const initialFilters: ExpenseFilters = {
  search: '',
  category: 'all',
  paymentMethod: 'all',
  dateFilter: 'all',
  sortBy: 'date-desc',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      // Aggressively purge all old sample data keys
      localStorage.removeItem('antigravity_expenses_v1');
      localStorage.removeItem('antigravity_expenses_v2');
      localStorage.removeItem('antigravity_currency_v1');
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure only real user expenses remain
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Failed to load expenses from localStorage', e);
    }
    return [];
  });

  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage', e);
    }
  }, [expenses]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

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
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('antigravity_expenses_v1');
      localStorage.removeItem('antigravity_expenses_v2');
    } catch {
      // ignore
    }
  };

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
    return computeSummaryStats(filteredExpenses);
  }, [filteredExpenses]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        filters,
        activeTab,
        isFormOpen,
        editingExpense,
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
        clearAllExpenses,
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
