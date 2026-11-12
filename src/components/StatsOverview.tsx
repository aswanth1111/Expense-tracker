import React from 'react';
import {
  TrendingUp,
  Receipt,
  CalendarCheck,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

export const StatsOverview: React.FC = () => {
  const { summaryStats, setActiveTab } = useExpense();
  const {
    totalSpent,
    transactionCount,
    distinctDays,
    dailyAverage,
    highestSpendingDay,
    topCategory,
  } = summaryStats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* 1. Total Spend Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs hover:border-powder-blue/50 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Spent
          </span>
          <div className="p-1.5 sm:p-2 bg-powder-blue/30 text-slate-900 border border-[#8ebdbb]/50 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
          {formatCurrency(totalSpent)}
        </div>
        <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-slate-500 truncate">
          <Receipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 shrink-0" />
          <span>{transactionCount} records</span>
        </div>
      </div>

      {/* 2. Daily Average */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daily Average
          </span>
          <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
          {formatCurrency(dailyAverage)}
        </div>
        <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-slate-500 truncate">
          <span>Across {distinctDays} {distinctDays === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      {/* 3. Top Category */}
      <div
        onClick={() => setActiveTab('category-wise')}
        className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs hover:border-purple-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Top Category
          </span>
          <div className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
          {topCategory ? topCategory.name : '—'}
        </div>
        <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          {topCategory ? (
            <>
              <span className="truncate">{formatCurrency(topCategory.total)}</span>
              <span className="text-slate-800 font-medium flex items-center shrink-0 ml-1">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </>
          ) : (
            <span>No data</span>
          )}
        </div>
      </div>

      {/* 4. Peak Day */}
      <div
        onClick={() => setActiveTab('day-by-day')}
        className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs hover:border-amber-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Peak Day
          </span>
          <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
          {highestSpendingDay ? formatCurrency(highestSpendingDay.amount) : '—'}
        </div>
        <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          {highestSpendingDay ? (
            <>
              <span className="truncate">{highestSpendingDay.displayDate}</span>
              <span className="text-slate-800 font-medium flex items-center shrink-0 ml-1">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </>
          ) : (
            <span>No data</span>
          )}
        </div>
      </div>
    </div>
  );
};
