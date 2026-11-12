import React from 'react';
import {
  WalletCards,
  Plus,
  LayoutDashboard,
  CalendarDays,
  PieChart,
  MapPin,
  ListOrdered,
  IndianRupee,
  Wallet,
  HandCoins,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { ActiveTab } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { CloudSyncIndicator } from './CloudSyncIndicator';

export const Navbar: React.FC = () => {
  const {
    openAddModal,
    openBudgetModal,
    totalMoney,
    summaryStats,
    activeTab,
    setActiveTab,
  } = useExpense();

  const navTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'day-by-day', label: 'Day by Day', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'category-wise', label: 'Category Wise', icon: <PieChart className="w-4 h-4" /> },
    { id: 'where-how', label: 'Where & How', icon: <MapPin className="w-4 h-4" /> },
    {
      id: 'lending',
      label: 'Lending (Friends)',
      icon: <HandCoins className="w-4 h-4" />,
      badge:
        summaryStats.lendingSummary.activeLoansCount > 0
          ? summaryStats.lendingSummary.activeLoansCount
          : undefined,
    },
    { id: 'transactions', label: 'All Expenses', icon: <ListOrdered className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#7eaead] to-[#A8C9C8] flex items-center justify-center text-slate-900 shadow-md shadow-powder-glow border border-[#8ebdbb] shrink-0">
              <WalletCards className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  ExpenseTracker
                </h1>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5 shrink-0">
                  <IndianRupee className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> INR
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Daily and category-wise spending tracker
              </p>
            </div>
          </div>

          {/* Right Actions: Cloud Sync + Total Money pill + Add Expense button */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Cloud Sync Status Indicator */}
            <CloudSyncIndicator />

            {/* Total Money button */}
            <button
              onClick={() => openBudgetModal('add')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-200 hover:border-powder-blue bg-slate-50 hover:bg-powder-blue-light text-slate-700 transition-colors cursor-pointer"
              title="Add money or edit your account balances"
            >
              <Wallet className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {totalMoney > 0 ? (
                <span className="truncate">
                  Left:{' '}
                  <strong className={summaryStats.remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {formatCurrency(summaryStats.remainingBalance)}
                  </strong>
                </span>
              ) : (
                <span>Set Balances</span>
              )}
            </button>

            {/* Primary Add Expense Button (Powder Blue) */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover active:bg-[#8ebdbb] border border-[#8ebdbb] rounded-lg shadow-xs shadow-powder-glow transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add Expense</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isLending = tab.id === 'lending';

            let tabClass = 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70';
            if (isActive) {
              if (isLending) {
                tabClass = 'bg-vibrant-orange text-white font-bold shadow-xs';
              } else {
                tabClass = 'bg-powder-blue text-slate-950 font-bold border border-[#8ebdbb] shadow-xs';
              }
            } else if (isLending) {
              tabClass = 'text-vibrant-orange hover:bg-vibrant-orange-light font-semibold';
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg whitespace-nowrap transition-all cursor-pointer ${tabClass}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive && isLending
                        ? 'bg-white text-vibrant-orange'
                        : 'bg-vibrant-orange text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
