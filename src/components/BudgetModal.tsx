import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Check,
  PlusCircle,
  Pencil,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { PAYMENT_METHOD_LIST } from '../constants/categories';
import type { PaymentMethod, AccountBalances } from '../types/expense';
import { PaymentIcon } from './PaymentIcon';
import { formatCurrency } from '../utils/formatters';

export const BudgetModal: React.FC = () => {
  const {
    isBudgetModalOpen,
    closeBudgetModal,
    accountBalances,
    setAccountBalances,
    addMoneyToAccount,
    budgetModalMode,
    budgetModalAccount,
    summaryStats,
  } = useExpense();

  const [activeTab, setActiveTab] = useState<'add' | 'set'>('add');

  // Add Money state
  const [selectedAccount, setSelectedAccount] = useState<PaymentMethod>('upi_kotak');
  const [selectedShare, setSelectedShare] = useState<'mine' | 'friend'>('mine');
  const [addAmount, setAddAmount] = useState<string>('');

  // Set Balances state
  const [cashVal, setCashVal] = useState<string>('');
  const [kotakMineVal, setKotakMineVal] = useState<string>('');
  const [kotakFriendVal, setKotakFriendVal] = useState<string>('');
  const [unionVal, setUnionVal] = useState<string>('');

  const quickAddChips = [500, 1000, 2000, 5000, 10000, 25000, 50000];

  useEffect(() => {
    if (isBudgetModalOpen) {
      setActiveTab(budgetModalMode);
      if (budgetModalAccount !== 'all') {
        setSelectedAccount(budgetModalAccount);
      }

      setAddAmount('');
      setSelectedShare('mine');
      setCashVal(accountBalances.cash > 0 ? String(accountBalances.cash) : '');

      const mineAmount = accountBalances.kotakSplit?.mine ?? accountBalances.upi_kotak;
      const friendAmount = accountBalances.kotakSplit?.friend ?? 0;
      setKotakMineVal(mineAmount > 0 ? String(mineAmount) : '');
      setKotakFriendVal(friendAmount > 0 ? String(friendAmount) : '');

      setUnionVal(accountBalances.upi_union > 0 ? String(accountBalances.upi_union) : '');
    }
  }, [isBudgetModalOpen, budgetModalMode, budgetModalAccount, accountBalances]);

  if (!isBudgetModalOpen) return null;

  const parsedAdd = parseFloat(addAmount) || 0;
  const currentAccBalance = summaryStats.accounts[selectedAccount]?.balance || 0;
  const newAccBalance = currentAccBalance + parsedAdd;
  const newGrandTotal = summaryStats.remainingBalance + parsedAdd;

  const parsedKotakMine = parseFloat(kotakMineVal) || 0;
  const parsedKotakFriend = parseFloat(kotakFriendVal) || 0;
  const totalCalculated =
    (parseFloat(cashVal) || 0) + parsedKotakMine + parsedKotakFriend + (parseFloat(unionVal) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'add') {
      if (parsedAdd <= 0) {
        alert('Please enter an amount greater than 0 to add.');
        return;
      }
      addMoneyToAccount(
        selectedAccount,
        parsedAdd,
        selectedAccount === 'upi_kotak' ? selectedShare : 'mine'
      );
      closeBudgetModal();
    } else {
      const newBalances: AccountBalances = {
        cash: Math.max(0, parseFloat(cashVal) || 0),
        upi_kotak: parsedKotakMine + parsedKotakFriend,
        upi_union: Math.max(0, parseFloat(unionVal) || 0),
        kotakSplit: {
          mine: Math.max(0, parsedKotakMine),
          friend: Math.max(0, parsedKotakFriend),
        },
      };
      setAccountBalances(newBalances);
      closeBudgetModal();
    }
  };

  const handleAddChipClick = (amount: number) => {
    const cur = parseFloat(addAmount) || 0;
    setAddAmount(String(cur + amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${activeTab === 'add' ? 'bg-emerald-50 text-emerald-600' : 'bg-powder-blue/30 text-slate-900 border border-[#8ebdbb]/50'}`}>
              {activeTab === 'add' ? (
                <PlusCircle className="w-5 h-5" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeTab === 'add' ? 'Add Money to Account' : 'Set Account Balances'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Manage your Cash, UPI (Kotak), and UPI (Union) funds
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

        {/* Mode Selector Tabs */}
        <div className="p-4 sm:p-5 pb-0 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('set')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'set'
                  ? 'bg-powder-blue text-slate-950 border border-[#8ebdbb] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>Set Balances</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* TAB 1: ADD MONEY TO AN ACCOUNT */}
          {activeTab === 'add' ? (
            <div className="space-y-4">
              {/* Account Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Account to Add Money Into *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHOD_LIST.map((method) => {
                    const isSelected = selectedAccount === method.id;
                    const acc = summaryStats.accounts[method.id];
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedAccount(method.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <PaymentIcon method={method.id} className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold truncate w-full">{method.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Left: {formatCurrency(acc?.balance || 0)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kotak User & Best Friend Share Picker */}
              {selectedAccount === 'upi_kotak' && (
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-red-900 uppercase tracking-wider">
                      Add to Whose Share?
                    </label>
                    <span className="text-[10px] font-bold text-red-600 bg-red-100/60 px-1.5 py-0.2 rounded">
                      UPI (Kotak) Joint Account
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedShare('mine')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedShare === 'mine'
                          ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                          : 'border-red-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-sm">👤 Mine</span>
                      <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Current: {formatCurrency(summaryStats.accounts.upi_kotak.split?.mine.balance || 0)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedShare('friend')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedShare === 'friend'
                          ? 'border-red-500 bg-white text-red-900 ring-2 ring-red-500/20 shadow-xs'
                          : 'border-red-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-sm">👥 Best Friend</span>
                      <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Current: {formatCurrency(summaryStats.accounts.upi_kotak.split?.friend.balance || 0)}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Amount to Add */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount to Add (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600">
                    +₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="1"
                    required
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full text-2xl font-bold pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-300"
                    autoFocus
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 font-medium block mb-1">
                    Tap to add amount:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickAddChips.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleAddChipClick(q)}
                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/50 transition-colors cursor-pointer"
                      >
                        +₹{q.toLocaleString('en-IN')}
                      </button>
                    ))}
                    {addAmount && (
                      <button
                        type="button"
                        onClick={() => setAddAmount('')}
                        className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {parsedAdd > 0 && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-200/70 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>
                      {selectedAccount === 'cash'
                        ? 'Cash Balance:'
                        : selectedAccount === 'upi_kotak'
                        ? `UPI Kotak (${selectedShare === 'friend' ? "Best Friend's Share" : "My Share"}):`
                        : 'UPI Union Balance:'}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      {formatCurrency(currentAccBalance)}
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 text-sm font-black">{formatCurrency(newAccBalance)}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 border-t border-emerald-200/50">
                    <span>New Total Available Across All Accounts:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {formatCurrency(newGrandTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: SET BASELINE BALANCES FOR EACH ACCOUNT */
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                💡 Enter the money available in Cash, Union, and split between you and your best friend in UPI Kotak.
              </p>

              {/* 1. Cash */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <PaymentIcon method="cash" className="w-4 h-4" />
                    <span>1. Cash in Hand (₹)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Spent: {formatCurrency(summaryStats.accounts.cash.spent)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={cashVal}
                    onChange={(e) => setCashVal(e.target.value)}
                    placeholder="0"
                    className="w-full text-base font-bold pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              {/* 2. UPI (Kotak) - Mine & Best Friend */}
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <PaymentIcon method="upi_kotak" className="w-4 h-4 text-red-600" />
                    <span>2. UPI - Kotak Bank (You &amp; Best Friend)</span>
                  </label>
                  <span className="text-[11px] font-bold text-red-700 bg-red-100/60 px-1.5 py-0.5 rounded">
                    Total: {formatCurrency(parsedKotakMine + parsedKotakFriend)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Set separate balances for yourself and your best friend. Their combined sum forms the Kotak available pool.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Mine */}
                  <div className="bg-white p-2.5 rounded-lg border border-red-200/70 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      👤 My Money (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={kotakMineVal}
                        onChange={(e) => setKotakMineVal(e.target.value)}
                        placeholder="0"
                        className="w-full text-sm font-bold pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-red-500 text-slate-800"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 block">
                      Spent: {formatCurrency(summaryStats.accounts.upi_kotak.split?.mine.spent || 0)}
                    </span>
                  </div>

                  {/* Best Friend */}
                  <div className="bg-white p-2.5 rounded-lg border border-red-200/70 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      👥 Best Friend's Money (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={kotakFriendVal}
                        onChange={(e) => setKotakFriendVal(e.target.value)}
                        placeholder="0"
                        className="w-full text-sm font-bold pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-red-500 text-slate-800"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 block">
                      Spent: {formatCurrency(summaryStats.accounts.upi_kotak.split?.friend.spent || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. UPI (Union) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <PaymentIcon method="upi_union" className="w-4 h-4" />
                    <span>3. UPI - Union Bank (₹)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Spent: {formatCurrency(summaryStats.accounts.upi_union.spent)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={unionVal}
                    onChange={(e) => setUnionVal(e.target.value)}
                    placeholder="0"
                    className="w-full text-base font-bold pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Combined Total Preview */}
              <div className="p-3 bg-powder-blue/20 rounded-xl border border-powder-blue/40 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Total Across All Accounts:</span>
                <span className="text-base font-black text-slate-900">{formatCurrency(totalCalculated)}</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={closeBudgetModal}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-powder-blue hover:bg-powder-blue-hover text-slate-950 border border-[#8ebdbb] shadow-powder-glow'
              }`}
            >
              {activeTab === 'add' ? (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {parsedAdd > 0
                      ? `Add ${formatCurrency(parsedAdd)}`
                      : 'Add Money'}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Balances</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
