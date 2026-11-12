import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Check,
  Plus,
  Users,
  HandCoins,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { PAYMENT_METHOD_LIST } from '../constants/categories';
import type { PaymentMethod, LoanStatus } from '../types/expense';
import { PaymentIcon } from './PaymentIcon';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

export const LendingModal: React.FC = () => {
  const {
    isLendingModalOpen,
    editingLending,
    closeLendingModal,
    addLendingRecord,
    updateLendingRecord,
    summaryStats,
  } = useExpense();

  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState<PaymentMethod>('upi_kotak');
  const [lentBy, setLentBy] = useState<'mine' | 'friend'>('mine');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LoanStatus>('pending');

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (editingLending) {
      setFriendName(editingLending.friendName);
      setAmount(String(editingLending.amount));
      setAccount(editingLending.account);
      setLentBy(editingLending.lentBy || 'mine');
      setDate(editingLending.date);
      setNotes(editingLending.notes || '');
      setStatus(editingLending.status);
    } else {
      setFriendName('');
      setAmount('');
      setAccount('upi_kotak');
      setLentBy('mine');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
      setStatus('pending');
    }
  }, [editingLending, isLendingModalOpen]);

  if (!isLendingModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount in ₹ greater than 0.');
      return;
    }

    if (!friendName.trim()) {
      alert("Please enter your friend's name.");
      return;
    }

    const payload = {
      friendName: friendName.trim(),
      amount: parsedAmount,
      account,
      lentBy: account === 'upi_kotak' ? lentBy : 'mine',
      date: date || format(new Date(), 'yyyy-MM-dd'),
      notes: notes.trim(),
      status,
      settledDate: status === 'settled' ? (editingLending?.settledDate || format(new Date(), 'yyyy-MM-dd')) : undefined,
    };

    if (editingLending) {
      updateLendingRecord(editingLending.id, payload);
    } else {
      addLendingRecord(payload);
    }

    closeLendingModal();
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-vibrant-orange-light text-vibrant-orange border border-vibrant-orange/20">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingLending ? 'Edit Loan Record' : 'Lend Money to Friend'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Track who you sent money to and from which account
              </p>
            </div>
          </div>
          <button
            onClick={closeLendingModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Friend's Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Friend / Person's Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Rahul Sharma, Amit, Priya..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vibrant-orange/20 focus:border-vibrant-orange transition-all text-slate-900 text-sm font-medium placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount Lent (₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                <IndianRupee className="w-5 h-5" />
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-bold pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vibrant-orange/20 focus:border-vibrant-orange transition-all text-slate-900 placeholder:text-slate-300"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="text-xs px-2.5 py-1 rounded-md bg-vibrant-orange-light hover:bg-[#ffe6d6] text-vibrant-orange font-bold border border-vibrant-orange/30 transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-vibrant-orange" />₹{val.toLocaleString('en-IN')}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Account Lent From (Cash, UPI Kotak, UPI Union) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Lent From Which Account? *
              </label>
              <span className="text-[11px] text-slate-500">
                Available: {formatCurrency(summaryStats.accounts[account]?.balance || 0)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHOD_LIST.map((method) => {
                const isSelected = account === method.id;
                const accBalance = summaryStats.accounts[method.id]?.balance || 0;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setAccount(method.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-vibrant-orange bg-vibrant-orange-light text-slate-950 ring-2 ring-vibrant-orange/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <PaymentIcon method={method.id} className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold leading-tight truncate w-full">
                      {method.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Left: {formatCurrency(accBalance)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              💡 This amount will be deducted from your selected account's available balance until settled.
            </p>
          </div>

          {/* Kotak Lender Share Picker */}
          {account === 'upi_kotak' && (
            <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-red-950 uppercase tracking-wider">
                  Lent From Whose Share? (Kotak) *
                </label>
                <span className="text-[10px] text-red-700 bg-red-100 font-semibold px-2 py-0.5 rounded">
                  Deducts from this person's share
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLentBy('mine')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lentBy === 'mine'
                      ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">👤 Mine</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Available: {formatCurrency(summaryStats.accounts.upi_kotak.split?.mine.balance || 0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setLentBy('friend')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lentBy === 'friend'
                      ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">👥 Best Friend</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Available: {formatCurrency(summaryStats.accounts.upi_kotak.split?.friend.balance || 0)}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Date & Loan Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Lent *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-vibrant-orange text-xs font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Status (Pending / Settled) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Status
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    status === 'pending'
                      ? 'bg-vibrant-orange text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⏳ Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('settled')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    status === 'settled'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ Settled
                </button>
              </div>
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Swiggy food split, emergency travel ticket, promised to return on Friday..."
                rows={2}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vibrant-orange/20 focus:border-vibrant-orange transition-all text-xs text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={closeLendingModal}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-vibrant-orange hover:bg-vibrant-orange-hover active:bg-[#c44403] rounded-xl shadow-xs shadow-orange-glow transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingLending ? 'Save Changes' : 'Record Loan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
