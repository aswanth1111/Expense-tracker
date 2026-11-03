export type CategoryId =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'travel'
  | 'bills'
  | 'other';

export type PaymentMethod = 'cash' | 'upi_kotak' | 'upi_union';

export interface Expense {
  id: string;
  reason: string;          // Why it was spent / Purpose (main description)
  title?: string;          // Optional legacy title if any
  amount: number;          // Numeric amount (in ₹)
  category: CategoryId;    // Category
  merchant?: string;       // Where it was spent (e.g. Store/Place)
  paymentMethod: PaymentMethod; // Cash | UPI (Kotak) | UPI (Union)
  date: string;            // ISO Date: YYYY-MM-DD (automatically set to today's date)
  time?: string;           // HH:mm
  createdAt: number;       // Unix timestamp for sorting
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export type CurrencyCode = 'INR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'last30' | 'custom';

export interface ExpenseFilters {
  search: string;
  category: string;
  paymentMethod: string;
  dateFilter: DateFilterType;
  startDate?: string;
  endDate?: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface DailySpending {
  date: string;
  displayDate: string;
  total: number;
  count: number;
  expenses: Expense[];
}

export interface CategorySpending {
  category: CategoryId;
  name: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
  avgPerTransaction: number;
}

export interface WhereHowSpending {
  name: string;
  total: number;
  percentage: number;
  count: number;
}

export interface SummaryStats {
  totalSpent: number;
  transactionCount: number;
  distinctDays: number;
  dailyAverage: number;
  highestSpendingDay: { date: string; displayDate: string; amount: number } | null;
  topCategory: CategorySpending | null;
  topMerchant: WhereHowSpending | null;
}
