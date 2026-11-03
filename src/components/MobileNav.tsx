import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  MapPin,
  ListOrdered,
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { ActiveTab } from '../context/ExpenseContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useExpense();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'day-by-day', label: 'Daily', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'category-wise', label: 'Category', icon: <PieChart className="w-5 h-5" /> },
    { id: 'where-how', label: 'Where/How', icon: <MapPin className="w-5 h-5" /> },
    { id: 'transactions', label: 'Expenses', icon: <ListOrdered className="w-5 h-5" /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive
                  ? 'text-indigo-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}
              >
                {item.icon}
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
