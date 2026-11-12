import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  HandCoins,
  ListOrdered,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { ActiveTab } from '../context/ExpenseContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, summaryStats } = useExpense();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'day-by-day', label: 'Daily', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'category-wise', label: 'Category', icon: <PieChart className="w-5 h-5" /> },
    {
      id: 'lending',
      label: 'Lending',
      icon: <HandCoins className="w-5 h-5" />,
      badge:
        summaryStats.lendingSummary.activeLoansCount > 0
          ? summaryStats.lendingSummary.activeLoansCount
          : undefined,
    },
    { id: 'transactions', label: 'Expenses', icon: <ListOrdered className="w-5 h-5" /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isLending = item.id === 'lending';

          let activeTextColor = 'text-slate-900 font-bold scale-105';
          let iconBg = 'text-slate-400';

          if (isActive) {
            if (isLending) {
              activeTextColor = 'text-vibrant-orange font-bold scale-105';
              iconBg = 'bg-vibrant-orange-light text-vibrant-orange';
            } else {
              activeTextColor = 'text-slate-900 font-bold scale-105';
              iconBg = 'bg-powder-blue text-slate-950';
            }
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-[52px] relative ${
                isActive
                  ? activeTextColor
                  : isLending
                  ? 'text-vibrant-orange/70 hover:text-vibrant-orange font-medium'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors relative ${iconBg}`}
              >
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-vibrant-orange text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
