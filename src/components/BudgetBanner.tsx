import React from 'react';
import {
  Wallet,
  Pencil,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

export const BudgetBanner: React.FC = () => {
  const { summaryStats, openBudgetModal } = useExpense();
  const { totalMoney, totalSpent, remainingBalance, spentPercentage } = summaryStats;

  // 1. If total money is not set yet
  if (totalMoney === 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 rounded-2xl border border-indigo-100 p-4 sm:p-5 mb-4 sm:mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Set Your Total Money</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                New
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Add your total money/salary to see how much amount you have left after each expense.
            </p>
          </div>
        </div>

        <button
          onClick={openBudgetModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Set Total Money</span>
        </button>
      </div>
    );
  }

  // 2. If total money is set
  const isOverspent = remainingBalance < 0;
  const isLow = !isOverspent && spentPercentage >= 80;

  // Determine progress bar color
  const progressColor = isOverspent
    ? 'bg-rose-500'
    : isLow
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const remainingPercent = Math.max(0, 100 - spentPercentage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-4 sm:mb-6 shadow-xs space-y-3.5 sm:space-y-4">
      {/* Top Row: Amount Left & Edit Action */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Available Balance (Amount Left)
          </span>
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <h2
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
                isOverspent ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatCurrency(remainingBalance)}
            </h2>

            {/* Status Pill */}
            {isOverspent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Overspent by {formatCurrency(Math.abs(remainingBalance))}
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <TrendingDown className="w-3.5 h-3.5" />
                {remainingPercent.toFixed(1)}% Left (Low Balance)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {remainingPercent.toFixed(1)}% Left
              </span>
            )}
          </div>
        </div>

        <button
          onClick={openBudgetModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer shrink-0"
          title="Change Total Money"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Total</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      {/* Middle Row: Total Money & Total Spent Breakdown */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 border-t border-slate-100">
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
            Total Money
          </span>
          <span className="text-sm sm:text-lg font-bold text-slate-800">
            {formatCurrency(totalMoney)}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
            Total Spent
          </span>
          <span className="text-sm sm:text-lg font-bold text-slate-800">
            {formatCurrency(totalSpent)}
          </span>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Budget Spent: {spentPercentage}%</span>
          <span>{formatCurrency(totalSpent)} of {formatCurrency(totalMoney)}</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, spentPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
