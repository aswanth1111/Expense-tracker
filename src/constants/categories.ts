import type { CategoryId, CategoryInfo, PaymentMethod } from '../types/expense';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-700',
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10b981',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
  },
  transport: {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-700',
  },
  housing: {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#6366f1',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    icon: 'Zap',
    color: '#eab308',
    badgeBg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    badgeText: 'text-yellow-700',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#a855f7',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-700',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
    badgeText: 'text-pink-700',
  },
  health: {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#ef4444',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: 'text-red-700',
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#14b8a6',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'text-teal-700',
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: 'Plane',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeText: 'text-cyan-700',
  },
  bills: {
    id: 'bills',
    name: 'Bills & Subscriptions',
    icon: 'Receipt',
    color: '#8b5cf6',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    badgeText: 'text-violet-700',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#64748b',
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  cash: {
    id: 'cash',
    name: 'Cash',
    icon: 'Banknote',
    color: '#16a34a', // green-600
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  upi_kotak: {
    id: 'upi_kotak',
    name: 'UPI (Kotak)',
    icon: 'Smartphone',
    color: '#dc2626', // red-600 (Kotak)
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
  },
  upi_union: {
    id: 'upi_union',
    name: 'UPI (Union)',
    icon: 'Smartphone',
    color: '#2563eb', // blue-600 (Union)
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);
