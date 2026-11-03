import { parseISO, format, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  try {
    const formattedNum = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(absAmount);
    
    return isNegative ? `-₹${formattedNum}` : `₹${formattedNum}`;
  } catch {
    return isNegative ? `-₹${absAmount.toFixed(2)}` : `₹${absAmount.toFixed(2)}`;
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
