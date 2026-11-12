import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { FilterBar } from './components/FilterBar';
import { OverviewView } from './components/OverviewView';
import { DayByDayView } from './components/DayByDayView';
import { CategoryWiseView } from './components/CategoryWiseView';
import { WhereHowView } from './components/WhereHowView';
import { LendingView } from './components/LendingView';
import { TransactionList } from './components/TransactionList';
import { ExpenseModal } from './components/ExpenseModal';
import { BudgetModal } from './components/BudgetModal';
import { LendingModal } from './components/LendingModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { Trash2, Plus } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    clearAllExpenses,
    expenses,
    openAddModal,
    isCloudModalOpen,
    closeCloudModal,
  } = useExpense();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'day-by-day':
        return <DayByDayView />;
      case 'category-wise':
        return <CategoryWiseView />;
      case 'where-how':
        return <WhereHowView />;
      case 'lending':
        return <LendingView />;
      case 'transactions':
        return <TransactionList />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#A8C9C8] selection:text-[#0e2928] pb-20 sm:pb-8">
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Universal Filter and Search Bar (shown on expense views) */}
        {activeTab !== 'lending' && <FilterBar />}

        {/* Tab Content */}
        {renderActiveView()}
      </main>

      {/* Floating Action Button for Mobile (Instant Add Expense on Phone) */}
      <button
        onClick={openAddModal}
        className="sm:hidden fixed right-4 bottom-18 z-40 bg-powder-blue text-slate-900 font-bold rounded-full p-3.5 shadow-xl shadow-powder-glow flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-[#8ebdbb]"
        aria-label="Add Expense"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Add/Edit Expense Modal */}
      <ExpenseModal />

      {/* Set Total Money / Budget Modal */}
      <BudgetModal />

      {/* Money Lending to Friends Modal */}
      <LendingModal />

      {/* Firebase Cloud Sync Configuration Modal */}
      <FirebaseConfigModal isOpen={isCloudModalOpen} onClose={closeCloudModal} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-1.5 text-center sm:text-left text-[11px] sm:text-xs">
            <span>ExpenseTracker • Rupee (₹) multi-account budgeting &amp; friends lending tracker</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] sm:text-xs">
            <span>{expenses.length} expenses</span>
            <button
              onClick={async () => {
                if (
                  confirm(
                    '⚠️ Are you sure you want to delete ALL records? This will permanently delete all expenses, friends lending records, and reset balances to 0 (both locally and from Cloud Firestore). This cannot be undone.'
                  )
                ) {
                  await clearAllExpenses();
                }
              }}
              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 hover:underline font-medium cursor-pointer"
              title="Delete all records and wipe data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Records
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ExpenseProvider>
      <MainAppContent />
    </ExpenseProvider>
  );
}

export default App;
