import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  Calendar,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatExpenseDate } from '../utils/formatters';
import { PaymentIcon } from './PaymentIcon';
import type { PaymentMethod } from '../types/expense';

export const LendingView: React.FC = () => {
  const {
    lendingRecords,
    openAddLendingModal,
    openEditLendingModal,
    toggleLendingStatus,
    deleteLendingRecord,
    summaryStats,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [accountFilter, setAccountFilter] = useState<'all' | PaymentMethod>('all');

  // Filtered loans list
  const filteredRecords = useMemo(() => {
    return lendingRecords.filter((record) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        record.friendName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter;

      // Account filter
      const matchesAccount =
        accountFilter === 'all' || record.account === accountFilter;

      return matchesSearch && matchesStatus && matchesAccount;
    });
  }, [lendingRecords, searchTerm, statusFilter, accountFilter]);

  // Breakdown of pending money per account
  const pendingByAccount = useMemo(() => {
    const map: Record<PaymentMethod, number> = {
      cash: 0,
      upi_kotak: 0,
      upi_union: 0,
    };
    lendingRecords.forEach((l) => {
      if (l.status === 'pending') {
        map[l.account] = (map[l.account] || 0) + l.amount;
      }
    });
    return map;
  }, [lendingRecords]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete loan record for ${name}?`)) {
      deleteLendingRecord(id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <HandCoins className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span>Money Lent to Friends</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of who you sent money to, how much, and from which account.
          </p>
        </div>

        <button
          onClick={openAddLendingModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-amber-200 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Lend Money</span>
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Currently Pending */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
              Pending from Friends
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(summaryStats.lendingSummary.totalLentPending)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {summaryStats.lendingSummary.activeLoansCount} active friend loan(s)
          </span>
        </div>

        {/* Card 2: Total Recovered */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Settled / Recovered
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
            {formatCurrency(summaryStats.lendingSummary.totalSettled)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {summaryStats.lendingSummary.settledLoansCount} loan(s) repaid
          </span>
        </div>

        {/* Card 3: Pending in Kotak & Union */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending in UPI Accounts
          </span>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">UPI (Kotak):</span>
              <span className="font-bold text-slate-900">{formatCurrency(pendingByAccount.upi_kotak)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">UPI (Union):</span>
              <span className="font-bold text-slate-900">{formatCurrency(pendingByAccount.upi_union)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending in Cash */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending in Cash
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(pendingByAccount.cash)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Direct physical cash lent
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by friend's name or note..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({lendingRecords.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({summaryStats.lendingSummary.activeLoansCount})
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'settled'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settled ({summaryStats.lendingSummary.settledLoansCount})
            </button>
          </div>
        </div>

        {/* Account Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium shrink-0 mr-1">Account:</span>
          <button
            onClick={() => setAccountFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              accountFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setAccountFilter('cash')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              accountFilter === 'cash'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => setAccountFilter('upi_kotak')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              accountFilter === 'upi_kotak'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-700'
            }`}
          >
            UPI (Kotak)
          </button>
          <button
            onClick={() => setAccountFilter('upi_union')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              accountFilter === 'upi_union'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            UPI (Union)
          </button>
        </div>
      </div>

      {/* Lending Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <HandCoins className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {lendingRecords.length === 0
              ? 'No friends loans recorded yet'
              : 'No matching loan records'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {lendingRecords.length === 0
              ? 'Whenever you lend money to friends, record it here so you never forget who owes you and from which account it was paid.'
              : 'Try adjusting your search keywords or filter options.'}
          </p>
          {lendingRecords.length === 0 && (
            <button
              onClick={openAddLendingModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record First Loan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredRecords.map((record) => {
            const isPending = record.status === 'pending';

            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isPending
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : 'border-slate-200/80 bg-slate-50/40 opacity-90'
                }`}
              >
                {/* Top Row: Friend Name & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {/* Initials Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {record.friendName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {record.friendName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lent on {formatExpenseDate(record.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      isPending
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </>
                    )}
                  </span>
                </div>

                {/* Amount & Account Banner */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Amount Lent
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {formatCurrency(record.amount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Account
                    </span>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                      <PaymentIcon method={record.account} className="w-3.5 h-3.5" />
                      <span>
                        {record.account === 'cash'
                          ? 'Cash'
                          : record.account === 'upi_kotak'
                          ? 'UPI Kotak'
                          : 'UPI Union'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes if any */}
                {record.notes && (
                  <p className="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60 italic">
                    "{record.notes}"
                  </p>
                )}

                {/* Settled date notice */}
                {!isPending && record.settledDate && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Repaid & settled on {formatExpenseDate(record.settledDate)}
                  </span>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {/* Mark as Settled or Pending */}
                  <button
                    onClick={() => toggleLendingStatus(record.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      isPending
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPending ? 'Mark Settled (Received)' : 'Re-open as Pending'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditLendingModal(record)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit loan"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id, record.friendName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete loan record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
};
