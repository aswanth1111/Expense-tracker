import React from 'react';
import {
  PieChart as PieChartIcon,
  ArrowRight,
  TrendingUp,
  Store,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { StatsOverview } from './StatsOverview';
import { BudgetBanner } from './BudgetBanner';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatCurrency, formatShortDate, formatExpenseDate } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const OverviewView: React.FC = () => {
  const {
    expenses,
    filteredExpenses,
    dailySpendingAsc,
    categorySpending,
    whereSpending,
    howSpending,
    setActiveTab,
    openEditModal,
    openAddModal,
  } = useExpense();

  if (expenses.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Total Money / Budget Banner */}
        <BudgetBanner />

        {/* Stats */}
        <StatsOverview />

        {/* Empty State Prompt */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-6 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xs">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Start Adding Your Expenses!</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2 max-w-md mx-auto">
            Ready to track your daily spending in Rupees (₹). Enter the amount, reason, select Cash or UPI (Kotak/Union), and see your daily analytics and remaining balance.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add First Expense
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartDataDaily = dailySpendingAsc.slice(-7).map((day) => ({
    date: formatShortDate(day.date),
    total: day.total,
  }));

  const pieData = categorySpending.slice(0, 5).map((cat) => ({
    name: cat.name,
    value: cat.total,
    color: cat.color,
  }));

  const recentExpenses = filteredExpenses.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Total Money / Budget Banner */}
      <BudgetBanner />

      {/* 2. KPI Stats Cards */}
      <StatsOverview />

      {/* 3. Side-by-Side Visual Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: 7-Day Spending Trend */}
        <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Recent Daily Spending
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Spending trend across active days</p>
            </div>
            <button
              onClick={() => setActiveTab('day-by-day')}
              className="text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Daily View</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataDaily} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
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
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Categories Donut Preview */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-600" />
                Top Categories
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Highest category distribution</p>
            </div>
            <button
              onClick={() => setActiveTab('category-wise')}
              className="text-[11px] sm:text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Category View</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="h-40 sm:h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatCurrency(Number(val ?? 0)), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
            {categorySpending.slice(0, 4).map((cat) => (
              <div key={cat.category} className="flex items-center space-x-1.5 text-[11px] sm:text-xs truncate">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                <span className="text-slate-400 font-bold ml-auto">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Where & How Mini Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {/* Top Place */}
        <div
          onClick={() => setActiveTab('where-how')}
          className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 flex items-center justify-between hover:border-rose-200 cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Top Spending Place
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                {whereSpending[0]?.name || 'None'}
              </h4>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {whereSpending[0] ? formatCurrency(whereSpending[0].total) : '—'}
            </span>
            <span className="text-[10px] sm:text-xs text-rose-600 font-medium flex items-center justify-end">
              Details <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Top Payment Method */}
        <div
          onClick={() => setActiveTab('where-how')}
          className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 flex items-center justify-between hover:border-emerald-200 cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Primary Payment
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                {howSpending[0]?.name || 'None'}
              </h4>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {howSpending[0] ? formatCurrency(howSpending[0].total) : '—'}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium flex items-center justify-end">
              Details <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Expenditures</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">Your latest logged purchases</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-[11px] sm:text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>View All ({filteredExpenses.length})</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentExpenses.map((exp) => {
            const cat = CATEGORIES[exp.category] || CATEGORIES.other;
            const pm = PAYMENT_METHODS[exp.paymentMethod] || PAYMENT_METHODS.cash;

            return (
              <div
                key={exp.id}
                onClick={() => openEditModal(exp)}
                className="p-3 sm:px-6 sm:py-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between cursor-pointer gap-2"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}30`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon category={exp.category} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {exp.reason}
                      </h4>
                      <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-full border shrink-0 ${cat.badgeBg}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5 truncate">
                      {formatExpenseDate(exp.date)} • {exp.merchant ? `${exp.merchant} • ` : ''}
                      <span className="font-medium text-slate-600">{pm.name}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-bold text-slate-900 block">
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
