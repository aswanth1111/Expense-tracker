import React from 'react';
import { Search, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORY_LIST, PAYMENT_METHOD_LIST } from '../constants/categories';
import type { DateFilterType, ExpenseFilters } from '../types/expense';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useExpense();

  const dateFilterOptions: { id: DateFilterType; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleDateFilterChange = (id: DateFilterType) => {
    setFilters((prev) => ({
      ...prev,
      dateFilter: id,
    }));
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.dateFilter !== 'all';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
      {/* Search Input & Date Pills */}
      <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search why you spent, shop, or category..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
          {dateFilterOptions.map((opt) => {
            const isSelected = filters.dateFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleDateFilterChange(opt.id)}
                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {filters.dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-indigo-50/60 rounded-lg sm:rounded-xl border border-indigo-100 text-xs text-indigo-900">
          <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
            <span className="font-semibold text-[11px]">From:</span>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-[130px]">
            <span className="font-semibold text-[11px]">To:</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-xs outline-none"
            />
          </div>
        </div>
      )}

      {/* Secondary Filter Row: Category, Payment, Sort */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Category & Payment dropdowns: 2-column grid on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-1">
          <div className="flex items-center gap-1 text-slate-500 font-medium sm:mr-1 col-span-2 sm:col-span-1 hidden sm:flex">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium outline-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors truncate"
          >
            <option value="all">All Categories</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium outline-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors truncate"
          >
            <option value="all">All Methods</option>
            {PAYMENT_METHOD_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as ExpenseFilters['sortBy'],
                }))
              }
              className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium outline-none cursor-pointer hover:border-slate-300 focus:border-indigo-500 transition-colors"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-xs cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
