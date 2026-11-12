import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Check, Plus, IndianRupee, Users } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORY_LIST, PAYMENT_METHOD_LIST } from '../constants/categories';
import type { CategoryId, PaymentMethod, SpendShare } from '../types/expense';
import { CategoryIcon } from './CategoryIcon';
import { PaymentIcon } from './PaymentIcon';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

export const ExpenseModal: React.FC = () => {
  const {
    isFormOpen,
    editingExpense,
    closeFormModal,
    addExpense,
    updateExpense,
    summaryStats,
  } = useExpense();

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi_kotak');
  const [paidBy, setPaidBy] = useState<SpendShare>('mine');
  const [spentForOther, setSpentForOther] = useState(false);
  const [isReturned, setIsReturned] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (editingExpense) {
      setReason(editingExpense.reason || editingExpense.title || '');
      setAmount(String(editingExpense.amount));
      setCategory(editingExpense.category);
      setMerchant(editingExpense.merchant || '');
      setPaymentMethod(
        editingExpense.paymentMethod === 'cash' ||
        editingExpense.paymentMethod === 'upi_kotak' ||
        editingExpense.paymentMethod === 'upi_union'
          ? editingExpense.paymentMethod
          : 'upi_kotak'
      );
      setPaidBy(editingExpense.paidBy || 'mine');
      setSpentForOther(editingExpense.spentForOther ?? false);
      setIsReturned(editingExpense.isReturned ?? false);
      setDate(editingExpense.date);
      setTime(editingExpense.time || format(new Date(), 'HH:mm'));
    } else {
      const now = new Date();
      setReason('');
      setAmount('');
      setCategory('food');
      setMerchant('');
      setPaymentMethod('upi_kotak');
      setPaidBy('mine');
      setSpentForOther(false);
      setIsReturned(false);
      setDate(format(now, 'yyyy-MM-dd'));
      setTime(format(now, 'HH:mm'));
    }
  }, [editingExpense, isFormOpen]);

  if (!isFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount in ₹ greater than 0.');
      return;
    }

    if (!reason.trim()) {
      alert('Please enter why you spent it (Reason / Description).');
      return;
    }

    const payload = {
      reason: reason.trim(),
      amount: parsedAmount,
      category,
      merchant: merchant.trim() || undefined,
      paymentMethod,
      paidBy: paymentMethod === 'upi_kotak' ? paidBy : 'mine',
      spentForOther,
      isReturned: spentForOther ? isReturned : false,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      time: time || format(new Date(), 'HH:mm'),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }

    closeFormModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Record amount, reason, place and payment
            </p>
          </div>
          <button
            onClick={closeFormModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable on small mobile screens) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Amount Field (in ₹) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Amount in Rupees (₹)</span> <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full text-2xl font-bold pl-8 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ebdbb]/30 focus:border-powder-blue transition-all text-slate-900 placeholder:text-slate-300"
                autoFocus
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String((parseFloat(amount) || 0) + q))}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  +₹{q}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="text-xs px-2 py-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Why Spent (Reason / Description) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Why did you spend it? (Reason / Notes) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Vegetables & fruits, Petrol, Lunch with team, Electricity bill"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ebdbb]/30 focus:border-powder-blue transition-all resize-none"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 max-h-40 sm:max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {CATEGORY_LIST.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-powder-blue text-slate-950 font-bold border border-[#8ebdbb] shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <CategoryIcon
                      category={cat.id}
                      className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`}
                    />
                    <span className="truncate text-[11px] sm:text-xs">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Where & Payment Method */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            {/* Where (Merchant / Store / Location) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Where? (Shop / Place - Optional)</span>
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g., Local Mart, D-Mart, Petrol Bunk"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ebdbb]/30 focus:border-powder-blue transition-all"
              />
            </div>

            {/* How (Payment Method: Cash, UPI Kotak, UPI Union) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_METHOD_LIST.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? pm.id === 'upi_kotak'
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-2xs ring-1 ring-red-400'
                            : 'border-powder-blue bg-powder-blue-light text-slate-900 shadow-2xs ring-1 ring-powder-blue'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PaymentIcon method={pm.id} className="w-4 h-4 mb-0.5 sm:mb-1" />
                      <span className="text-[10px] sm:text-[11px] text-center leading-tight truncate w-full">
                        {pm.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Whose Money Was Spent (Shown for Kotak Joint Account) */}
          {paymentMethod === 'upi_kotak' && (
            <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-red-950 uppercase tracking-wider">
                  Whose Money was Spent? (UPI Kotak) *
                </label>
                <span className="text-[10px] text-red-700 bg-red-100 font-semibold px-2 py-0.5 rounded">
                  Deducts from this person's share
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaidBy('mine')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    paidBy === 'mine'
                      ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="text-sm">👤 Mine</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Available Left: {formatCurrency(summaryStats.accounts.upi_kotak.split?.mine.balance || 0)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaidBy('friend')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    paidBy === 'friend'
                      ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="text-sm">👥 Best Friend</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Available Left: {formatCurrency(summaryStats.accounts.upi_kotak.split?.friend.balance || 0)}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Spent for Other Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-lg transition-colors ${spentForOther ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/70 text-slate-500'}`}>
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Spent for other
                  {spentForOther && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Track return
                    </span>
                  )}
                </span>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  {spentForOther
                    ? 'Turned ON: Track when they return it in All Expenses. When marked returned, it adds back to your total amount.'
                    : 'Turn ON if you paid for someone else and expect them to return your money.'}
                </p>
              </div>
            </div>

            {/* Toggle Switch Button */}
            <button
              type="button"
              role="switch"
              aria-checked={spentForOther}
              onClick={() => setSpentForOther(!spentForOther)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                spentForOther ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  spentForOther ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Date & Time (Date is automatically taken today) */}
          <div className="grid grid-cols-2 gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-powder-blue text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-powder-blue text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Footer Actions (Sticky on mobile) */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover active:bg-[#8ebdbb] border border-[#8ebdbb] rounded-lg sm:rounded-xl shadow-xs shadow-powder-glow transition-colors cursor-pointer"
            >
              {editingExpense ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Expense</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
