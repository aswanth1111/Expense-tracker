import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { PaymentIcon } from './PaymentIcon';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const DayByDayView: React.FC = () => {
  const {
    dailySpendingDesc,
    dailySpendingAsc,
    openEditModal,
    deleteExpense,
    toggleExpenseReturned,
    openAddModal,
  } = useExpense();

  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  const toggleDay = (date: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const chartData = dailySpendingAsc.map((day) => ({
    date: formatShortDate(day.date),
    fullDate: day.date,
    total: day.total,
    count: day.count,
  }));

  if (dailySpendingDesc.length === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-powder-blue/30 text-slate-900 border border-[#8ebdbb]/50 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xs">
          <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">No expenses recorded yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Start recording what you spent, why, where and how to see your day-by-day timeline.
        </p>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-4 py-2 bg-powder-blue hover:bg-powder-blue-hover active:bg-[#8ebdbb] text-slate-950 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border border-[#8ebdbb] shadow-xs shadow-powder-glow transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Add First Expense
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Daily Spending Trend Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <CalendarDays className="w-4 h-4 text-slate-800" />
              Daily Spending Trend (₹)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Day-by-day expenditure comparison</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-xs text-slate-400">Tracked</span>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{chartData.length} days</p>
          </div>
        </div>

        <div className="h-48 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                formatter={(val) => [formatCurrency(Number(val ?? 0)), 'Spent']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="total" fill="#A8C9C8" stroke="#8ebdbb" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Chronological Day-by-Day Timeline */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Day by Day Breakdown ({dailySpendingDesc.length} Days)
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-400">Newest to oldest</span>
        </div>

        {dailySpendingDesc.map((dayGroup) => {
          const isCollapsed = !!collapsedDays[dayGroup.date];

          return (
            <div
              key={dayGroup.date}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Day Header */}
              <div
                onClick={() => toggleDay(dayGroup.date)}
                className="flex items-center justify-between p-3 sm:px-6 sm:py-4 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer border-b border-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-2xs shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 uppercase">
                      {dayGroup.displayDate.split(' ')[0]}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 leading-none">
                      {dayGroup.date.split('-')[2]}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-base font-bold text-slate-900">
                      {dayGroup.displayDate}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      {dayGroup.count} {dayGroup.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Total</span>
                    <span className="text-sm sm:text-lg font-extrabold text-slate-900">
                      {formatCurrency(dayGroup.total)}
                    </span>
                  </div>
                  <div className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Day Expenses List */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                  {dayGroup.expenses.map((expense) => {
                    const cat = CATEGORIES[expense.category] || CATEGORIES.other;
                    const pm = PAYMENT_METHODS[expense.paymentMethod] || PAYMENT_METHODS.cash;

                    return (
                      <div
                        key={expense.id}
                        className="p-3 sm:px-6 sm:py-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 group"
                      >
                        {/* Top / Main Details */}
                        <div className="flex items-start space-x-2.5 sm:space-x-3.5 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              borderColor: `${cat.color}30`,
                              color: cat.color,
                            }}
                            title={cat.name}
                          >
                            <CategoryIcon category={expense.category} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-start sm:items-center justify-between sm:justify-start gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 break-words flex-1">
                                {expense.reason}
                              </h5>
                              {/* Amount shown here on mobile screens */}
                              <span className="text-sm font-extrabold text-slate-900 sm:hidden shrink-0 ml-1">
                                {formatCurrency(expense.amount)}
                              </span>
                            </div>

                            {/* Where & How Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] sm:text-xs text-slate-500">
                              <span
                                className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] ${cat.badgeBg}`}
                              >
                                {cat.name}
                              </span>

                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium border text-[10px] ${pm.badgeBg}`}>
                                <PaymentIcon method={expense.paymentMethod} className="w-3 h-3" />
                                <span>{pm.name}</span>
                              </span>

                              {expense.paymentMethod === 'upi_kotak' && (
                                <span
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border font-bold text-[10px] ${
                                    expense.paidBy === 'friend'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-powder-blue-light text-slate-800 border-powder-blue/60'
                                  }`}
                                >
                                  {expense.paidBy === 'friend' ? '👥 Friend' : '👤 Mine'}
                                </span>
                              )}

                              {expense.merchant && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                                  <span className="truncate max-w-[120px]">{expense.merchant}</span>
                                </span>
                              )}

                              {expense.time && (
                                <span className="inline-flex items-center gap-0.5 text-slate-400">
                                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>{expense.time}</span>
                                </span>
                              )}

                              {expense.spentForOther && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpenseReturned(expense.id);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
                                    expense.isReturned
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs active:scale-95'
                                  }`}
                                  title={expense.isReturned ? 'Click to mark as not returned' : 'Click when repaid to add back to total amount'}
                                >
                                  {expense.isReturned ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Returned</span>
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw className="w-3 h-3 text-amber-600" />
                                      <span>Spent for other (Tap if returned)</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions (Desktop inline, mobile compact bottom action bar) */}
                        <div className="flex items-center justify-end space-x-2 sm:space-x-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                          {/* Amount shown on desktop */}
                          <div className="hidden sm:block text-right">
                            <span className="text-base sm:text-lg font-bold text-slate-900 block">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-auto sm:ml-0">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 active:bg-powder-blue/30 rounded-lg transition-colors cursor-pointer"
                              title="Edit expense"
                            >
                              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${expense.reason}"?`)) {
                                  deleteExpense(expense.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
