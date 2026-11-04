import React from 'react';
import {
  Wallet,
  Pencil,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  HandCoins,
  ArrowRight,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { PaymentIcon } from './PaymentIcon';

export const BudgetBanner: React.FC = () => {
  const { summaryStats, openBudgetModal, setActiveTab } = useExpense();
  const { totalMoney, totalSpent, remainingBalance, spentPercentage, accounts, lendingSummary } =
    summaryStats;

  // 1. If total money across all accounts is 0
  if (totalMoney === 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 rounded-2xl border border-indigo-100 p-4 sm:p-5 mb-4 sm:mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Set Your Account Balances</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Cash • Kotak • Union
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Add how much money you have in Cash, UPI (Kotak), and UPI (Union) to track exact balance left as you spend.
            </p>
          </div>
        </div>

        <button
          onClick={() => openBudgetModal('set')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Set Balances</span>
        </button>
      </div>
    );
  }

  // 2. If total money is set
  const isOverspent = remainingBalance < 0;
  const isLow = !isOverspent && spentPercentage >= 80;

  const progressColor = isOverspent
    ? 'bg-rose-500'
    : isLow
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const remainingPercent = Math.max(0, 100 - spentPercentage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-4 sm:mb-6 shadow-xs space-y-4">
      {/* Top Row: Overall Available Balance & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Available Balance (All Accounts)
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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => openBudgetModal('add')}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs shadow-emerald-200 transition-all cursor-pointer"
            title="Add money to an account"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Money</span>
          </button>

          <button
            onClick={() => openBudgetModal('set')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Set starting balances for all accounts"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Balances</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>

      {/* 3 Dedicated Account Cards Grid: Cash, UPI (Kotak), UPI (Union) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        
        {/* 1. Cash Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 via-emerald-50/30 to-white border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PaymentIcon method="cash" className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950">Cash</span>
            </div>
            <button
              onClick={() => openBudgetModal('add', 'cash')}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" /> Add
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700/70 block">
              Available Left
            </span>
            <span
              className={`text-lg sm:text-xl font-black ${
                accounts.cash.balance < 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatCurrency(accounts.cash.balance)}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-100/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total: {formatCurrency(accounts.cash.totalMoney)}</span>
            <span>Spent: {formatCurrency(accounts.cash.spent)}</span>
            {accounts.cash.lent > 0 && (
              <span className="text-amber-600 font-semibold">Lent: {formatCurrency(accounts.cash.lent)}</span>
            )}
          </div>
        </div>

        {/* 2. UPI (Kotak) Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-50/70 via-red-50/30 to-white border border-red-200/80 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PaymentIcon method="upi_kotak" className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-950">UPI (Kotak)</span>
            </div>
            <button
              onClick={() => openBudgetModal('add', 'upi_kotak')}
              className="text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-100/70 hover:bg-red-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" /> Add
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-red-700/70 block">
              Available Left
            </span>
            <span
              className={`text-lg sm:text-xl font-black ${
                accounts.upi_kotak.balance < 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatCurrency(accounts.upi_kotak.balance)}
            </span>
          </div>

          <div className="pt-2 border-t border-red-100/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total: {formatCurrency(accounts.upi_kotak.totalMoney)}</span>
            <span>Spent: {formatCurrency(accounts.upi_kotak.spent)}</span>
            {accounts.upi_kotak.lent > 0 && (
              <span className="text-amber-600 font-semibold">Lent: {formatCurrency(accounts.upi_kotak.lent)}</span>
            )}
          </div>
        </div>

        {/* 3. UPI (Union) Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/70 via-blue-50/30 to-white border border-blue-200/80 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PaymentIcon method="upi_union" className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-950">UPI (Union)</span>
            </div>
            <button
              onClick={() => openBudgetModal('add', 'upi_union')}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-100/70 hover:bg-blue-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" /> Add
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-blue-700/70 block">
              Available Left
            </span>
            <span
              className={`text-lg sm:text-xl font-black ${
                accounts.upi_union.balance < 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatCurrency(accounts.upi_union.balance)}
            </span>
          </div>

          <div className="pt-2 border-t border-blue-100/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total: {formatCurrency(accounts.upi_union.totalMoney)}</span>
            <span>Spent: {formatCurrency(accounts.upi_union.spent)}</span>
            {accounts.upi_union.lent > 0 && (
              <span className="text-amber-600 font-semibold">Lent: {formatCurrency(accounts.upi_union.lent)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Lending Notice Pill if money is currently lent to friends */}
      {lendingSummary.totalLentPending > 0 && (
        <div
          onClick={() => setActiveTab('lending')}
          className="p-3 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center space-x-2 text-amber-900 font-medium">
            <HandCoins className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{formatCurrency(lendingSummary.totalLentPending)}</strong> currently lent across{' '}
              {lendingSummary.activeLoansCount} friend(s).
            </span>
          </div>
          <span className="text-amber-700 font-bold flex items-center gap-1 hover:underline shrink-0">
            <span>View Friends</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* Bottom Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Overall Spent: {spentPercentage}%</span>
          <span>{formatCurrency(totalSpent)} spent of {formatCurrency(totalMoney)}</span>
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
