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
  date: string;            // ISO Date: YYYY-MM-DD
  time?: string;           // HH:mm
  createdAt: number;       // Unix timestamp for sorting
}

// ----------------------------------------------------
// Account & Wallet Balances (Cash, UPI Kotak, UPI Union)
// ----------------------------------------------------
export interface AccountBalances {
  cash: number;
  upi_kotak: number;
  upi_union: number;
}

export interface AccountDetail {
  id: PaymentMethod;
  name: string;
  totalMoney: number;   // Total funds deposited into this account
  spent: number;        // Total spent on expenses from this account
  lent: number;         // Total currently lent (pending) from this account
  balance: number;      // totalMoney - spent - lent
}

export interface AccountSummary {
  cash: AccountDetail;
  upi_kotak: AccountDetail;
  upi_union: AccountDetail;
}

// ----------------------------------------------------
// Money Lending to Friends Tracker
// ----------------------------------------------------
export type LoanStatus = 'pending' | 'settled';

export interface LendingRecord {
  id: string;
  friendName: string;            // Name of friend / borrower
  amount: number;                // Amount lent in ₹
  account: PaymentMethod;        // Account from which money was lent (cash | upi_kotak | upi_union)
  date: string;                  // YYYY-MM-DD
  notes?: string;                // Reason or notes
  status: LoanStatus;            // 'pending' (yet to receive) | 'settled' (received back)
  settledDate?: string;          // YYYY-MM-DD when repaid
  createdAt: number;             // Timestamp
}

export interface LendingSummary {
  totalLentPending: number;      // Total money currently pending from friends
  totalSettled: number;          // Total money recovered/settled
  activeLoansCount: number;      // Number of friends with active pending loans
  settledLoansCount: number;     // Number of settled loans
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
  totalMoney: number;            // Grand total across all 3 accounts
  remainingBalance: number;      // Grand total remaining across all 3 accounts
  spentPercentage: number;
  accountBalances: AccountBalances;
  accounts: AccountSummary;
  lendingSummary: LendingSummary;
}
