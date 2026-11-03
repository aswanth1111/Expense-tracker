import React, { useState, useEffect } from 'react';
import { X, Wallet, Check, Trash2 } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const BudgetModal: React.FC = () => {
  const {
    isBudgetModalOpen,
    closeBudgetModal,
    totalMoney,
    setTotalMoney,
  } = useExpense();

  const [inputVal, setInputVal] = useState<string>('');

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    if (isBudgetModalOpen) {
      setInputVal(totalMoney > 0 ? String(totalMoney) : '');
    }
  }, [isBudgetModalOpen, totalMoney]);

  if (!isBudgetModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setTotalMoney(parsed);
    closeBudgetModal();
  };

  const handleClear = () => {
    if (confirm('Clear your Total Money budget?')) {
      setTotalMoney(0);
      setInputVal('');
      closeBudgetModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Set Total Money
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Your total available balance or monthly salary
              </p>
            </div>
          </div>
          <button
            onClick={closeBudgetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Total Available Money (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                required
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full text-2xl font-bold pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-300"
                autoFocus
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInputVal(String(q))}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  ₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            💡 As you enter each expense, we will automatically deduct it and show your <strong>exact amount left</strong>.
          </p>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {totalMoney > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={closeBudgetModal}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save Total Money
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
