import React from 'react';
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { PaymentIcon } from './PaymentIcon';
import { formatCurrency, formatExpenseDate } from '../utils/formatters';

export const TransactionList: React.FC = () => {
  const {
    filteredExpenses,
    openEditModal,
    deleteExpense,
    openAddModal,
  } = useExpense();

  if (filteredExpenses.length === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Inbox className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">No matching expenses found</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Try clearing your search query or adjusting the filters.
        </p>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Add Expense
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Info */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          All Expenses ({filteredExpenses.length})
        </h3>
        <span className="text-xs text-slate-500">
          Total:{' '}
          <strong className="text-slate-900 font-bold">
            {formatCurrency(
              filteredExpenses.reduce((s, e) => s + e.amount, 0)
            )}
          </strong>
        </span>
      </div>

      {/* 1. Mobile Cards View (< md screens) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {filteredExpenses.map((exp) => {
          const cat = CATEGORIES[exp.category] || CATEGORIES.other;
          const pm = PAYMENT_METHODS[exp.paymentMethod] || PAYMENT_METHODS.cash;

          return (
            <div
              key={exp.id}
              className="p-3.5 hover:bg-slate-50/60 transition-colors space-y-2"
            >
              {/* Top Row: Icon + Reason + Amount */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}30`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon category={exp.category} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                      {exp.reason}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{formatExpenseDate(exp.date)}</span>
                      {exp.time && <span>• {exp.time}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-slate-900 block">
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Badges & Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full border font-semibold ${cat.badgeBg}`}>
                    {cat.name}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${pm.badgeBg}`}>
                    <PaymentIcon method={exp.paymentMethod} className="w-3 h-3" />
                    <span>{pm.name}</span>
                  </span>

                  {exp.merchant && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <span className="truncate max-w-[100px]">{exp.merchant}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 active:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${exp.reason}"?`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Table View (>= md screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-semibold bg-slate-50/30">
              <th className="py-3 px-6">Date & Time</th>
              <th className="py-3 px-4">Why Spent (Reason / Notes)</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Where & How</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredExpenses.map((exp) => {
              const cat = CATEGORIES[exp.category] || CATEGORIES.other;
              const pm = PAYMENT_METHODS[exp.paymentMethod] || PAYMENT_METHODS.cash;

              return (
                <tr
                  key={exp.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatExpenseDate(exp.date)}</span>
                    </div>
                    {exp.time && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{exp.time}</span>
                      </div>
                    )}
                  </td>

                  {/* Why Spent */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-slate-900 block">
                      {exp.reason}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon category={exp.category} className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  {/* Where & How */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {exp.merchant && (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{exp.merchant}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <PaymentIcon method={exp.paymentMethod} className="w-3 h-3 text-slate-400" />
                        <span className={`px-1.5 py-0.2 rounded border text-[10px] font-medium ${pm.badgeBg}`}>
                          {pm.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="font-extrabold text-slate-900 text-base">
                      {formatCurrency(exp.amount)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${exp.reason}"?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
