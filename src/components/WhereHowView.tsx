import React from 'react';
import { MapPin, CreditCard, Store, Smartphone } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';

export const WhereHowView: React.FC = () => {
  const { whereSpending, howSpending } = useExpense();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* 1. Where You Spent (Places/Shops) */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Where You Spent</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Breakdown by Shop / Place</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
            {whereSpending.length} Places
          </span>
        </div>

        {whereSpending.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No location data recorded yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {whereSpending.map((item, idx) => (
              <div
                key={item.name}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <div className="flex items-center space-x-2 truncate mr-2 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-4 shrink-0">#{idx + 1}</span>
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500">
                      {item.count} {item.count === 1 ? 'record' : 'records'} • {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. How You Spent (Cash, UPI Kotak, UPI Union) */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">How You Spent</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Cash vs UPI (Kotak / Union)</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
            {howSpending.length} Methods
          </span>
        </div>

        {howSpending.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No payment data recorded yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {howSpending.map((item, idx) => (
              <div
                key={item.name}
                className="p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <div className="flex items-center space-x-2 truncate mr-2 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-4 shrink-0">#{idx + 1}</span>
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500">
                      {item.count} {item.count === 1 ? 'use' : 'uses'} • {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
