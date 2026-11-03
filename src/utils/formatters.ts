import { parseISO, format, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  try {
    const formattedNum = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return `₹${formattedNum}`;
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

export const formatExpenseDate = (dateStr: string): string => {
  try {
    const parsed = parseISO(dateStr);
    if (isToday(parsed)) {
      return `Today (${format(parsed, 'MMM d')})`;
    }
    if (isYesterday(parsed)) {
      return `Yesterday (${format(parsed, 'MMM d')})`;
    }
    return format(parsed, 'EEE, MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  try {
    const parsed = parseISO(dateStr);
    return format(parsed, 'MMM d');
  } catch {
    return dateStr;
  }
};
