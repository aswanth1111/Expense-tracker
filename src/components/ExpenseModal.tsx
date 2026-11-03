import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Check, Plus, IndianRupee } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { CATEGORY_LIST, PAYMENT_METHOD_LIST } from '../constants/categories';
import type { CategoryId, PaymentMethod } from '../types/expense';
import { CategoryIcon } from './CategoryIcon';
import { PaymentIcon } from './PaymentIcon';
import { format } from 'date-fns';

export const ExpenseModal: React.FC = () => {
  const {
    isFormOpen,
    editingExpense,
    closeFormModal,
    addExpense,
    updateExpense,
  } = useExpense();

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi_kotak');
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
      setDate(editingExpense.date);
      setTime(editingExpense.time || format(new Date(), 'HH:mm'));
    } else {
      const now = new Date();
      setReason('');
      setAmount('');
      setCategory('food');
      setMerchant('');
      setPaymentMethod('upi_kotak');
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
                className="w-full text-2xl font-bold pl-8 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-300"
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
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
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
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <CategoryIcon
                      category={cat.id}
                      className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`}
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
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
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

          {/* Date & Time (Date is automatically taken today) */}
          <div className="grid grid-cols-2 gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg sm:rounded-xl shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
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
