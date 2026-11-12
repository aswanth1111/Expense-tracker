import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  ShoppingBag,
  Filter,
  X,
  MapPin,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import type { CategoryId } from '../types/expense';
import { CategoryIcon } from './CategoryIcon';
import { PaymentIcon } from './PaymentIcon';
import { formatCurrency, formatExpenseDate } from '../utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CategoryWiseView: React.FC = () => {
  const {
    categorySpending,
    filteredExpenses,
    setFilters,
    setActiveTab,
  } = useExpense();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const totalSpent = categorySpending.reduce((sum, c) => sum + c.total, 0);

  const chartData = categorySpending.map((cat) => ({
    name: cat.name,
    category: cat.category,
    value: cat.total,
    percentage: cat.percentage,
    color: cat.color,
  }));

  const selectedCategoryExpenses = selectedCategory
    ? filteredExpenses.filter((e) => e.category === selectedCategory)
    : [];

  const selectedCategoryInfo = selectedCategory ? CATEGORIES[selectedCategory] : null;

  if (categorySpending.length === 0) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <PieChartIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">No category data available</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Add expenses across categories to see distribution charts and breakdown metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Category Distribution Charts & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Interactive Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-600" />
                Category Distribution
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {categorySpending.length} Categories
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4">
              Spending share by category
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(_e, index) => {
                    const item = chartData[index];
                    if (item) setSelectedCategory(item.category);
                  }}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={entry.color} />
                  ))}
                </Pie>
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={7}
                  formatter={(value) => <span className="text-[10px] sm:text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 mt-2">
            <span className="text-[10px] sm:text-xs text-slate-400">Total in view</span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        {/* Right: Category Breakdown Cards */}
        <div className="lg:col-span-7 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-800" />
              Category Ranking & Share
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400">Tap to inspect</span>
          </div>

          <div className="space-y-2 sm:space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {categorySpending.map((cat, idx) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <div
                  key={cat.category}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.category)}
                  className={`p-2.5 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-powder-blue bg-powder-blue/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
                      <span className="text-xs font-bold text-slate-400 w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon category={cat.category} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{cat.name}</h4>
                        <span className="text-[10px] sm:text-xs text-slate-500 truncate block">
                          {cat.count} {cat.count === 1 ? 'record' : 'records'} • Avg {formatCurrency(cat.avgPerTransaction)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                        {formatCurrency(cat.total)}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-700">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Category Drill-down Transactions */}
      {selectedCategory && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-powder-blue/60 p-4 sm:p-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-3 sm:mb-4">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${selectedCategoryInfo?.color}20`,
                  color: selectedCategoryInfo?.color,
                }}
              >
                <CategoryIcon category={selectedCategory} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedCategoryInfo?.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  {selectedCategoryExpenses.length} items
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, category: selectedCategory }));
                  setActiveTab('transactions');
                }}
                className="text-[11px] sm:text-xs font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover border border-[#8ebdbb] px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {selectedCategoryExpenses.map((exp) => {
              const pm = PAYMENT_METHODS[exp.paymentMethod] || PAYMENT_METHODS.cash;
              return (
                <div
                  key={exp.id}
                  className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">{exp.reason}</h5>
                      <span className="text-[10px] sm:text-xs text-slate-400">
                        {formatExpenseDate(exp.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500">
                      {exp.merchant && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {exp.merchant}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${pm.badgeBg}`}>
                        <PaymentIcon method={exp.paymentMethod} className="w-3 h-3" />
                        {pm.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {formatCurrency(exp.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
