import React from 'react';
import { Cloud, CloudCheck } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const CloudSyncIndicator: React.FC = () => {
  const { isCloudConnected, openCloudModal } = useExpense();

  return (
    <button
      onClick={openCloudModal}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
        isCloudConnected
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80'
          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-powder-blue/20 hover:text-slate-900 hover:border-powder-blue'
      }`}
      title={
        isCloudConnected
          ? 'Connected to Firebase Firestore. Click to view settings.'
          : 'Local mode. Click to connect Firebase Cloud Sync across devices.'
      }
    >
      {isCloudConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <CloudCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden md:inline">Cloud Synced</span>
          <span className="md:hidden">Sync</span>
        </>
      ) : (
        <>
          <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="hidden sm:inline">Connect Cloud</span>
          <span className="sm:hidden">Cloud</span>
        </>
      )}
    </button>
  );
};
