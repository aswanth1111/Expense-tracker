import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Trash2,
  Sparkles,
  HelpCircle,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfigToStorage,
  clearFirebaseConfigFromStorage,
  type FirebaseConfig,
} from '../config/firebase';
import { migrateLocalDataToFirestore } from '../services/firestoreService';
import { useExpense } from '../context/ExpenseContext';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { expenses, accountBalances, lendingRecords, isCloudConnected, clearAllData } = useExpense();

  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');
  const [pasteSnippet, setPasteSnippet] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [authDomain, setAuthDomain] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [storageBucket, setStorageBucket] = useState<string>('');
  const [messagingSenderId, setMessagingSenderId] = useState<string>('');
  const [appId, setAppId] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getStoredFirebaseConfig();
      if (existing) {
        setApiKey(existing.apiKey || '');
        setAuthDomain(existing.authDomain || '');
        setProjectId(existing.projectId || '');
        setStorageBucket(existing.storageBucket || '');
        setMessagingSenderId(existing.messagingSenderId || '');
        setAppId(existing.appId || '');
      }
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-parse snippet pasted from Firebase console
  const handleParseSnippet = () => {
    if (!pasteSnippet.trim()) return;

    try {
      const extractField = (name: string): string => {
        const regex = new RegExp(`${name}\\s*:\\s*["']([^"']+)["']`, 'i');
        const match = pasteSnippet.match(regex);
        return match ? match[1] : '';
      };

      const extractedApiKey = extractField('apiKey');
      const extractedAuthDomain = extractField('authDomain');
      const extractedProjectId = extractField('projectId');
      const extractedStorageBucket = extractField('storageBucket');
      const extractedMessagingSenderId = extractField('messagingSenderId');
      const extractedAppId = extractField('appId');

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedProjectId) setProjectId(extractedProjectId);
      if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
      if (extractedMessagingSenderId) setMessagingSenderId(extractedMessagingSenderId);
      if (extractedAppId) setAppId(extractedAppId);

      if (extractedApiKey && extractedProjectId) {
        setStatusMessage('✅ Successfully extracted credentials from pasted code!');
        setPasteSnippet('');
      } else {
        setStatusMessage('⚠️ Could not find apiKey and projectId in pasted text. Please fill manually below.');
      }
    } catch {
      setStatusMessage('⚠️ Could not parse the snippet. Please fill the fields below.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim() || !appId.trim()) {
      alert('Please provide at least API Key, Project ID, and App ID.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfigToStorage(config);
    setStatusMessage('Firebase config saved! Reloading connection...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect Firebase and return to local storage? Your data will remain on your device.')) {
      clearFirebaseConfigFromStorage();
      window.location.reload();
    }
  };

  const handleMigrate = async () => {
    try {
      setIsMigrating(true);
      const count = await migrateLocalDataToFirestore(expenses, accountBalances, lendingRecords);
      setStatusMessage(`🎉 Successfully synced ${count} records (expenses, account balances, and friends loans) to Cloud Firestore!`);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage(`❌ Sync error: ${errorMessage}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${isCloudConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-powder-blue/30 text-slate-900 border border-[#8ebdbb]/50'}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Firebase Firestore Cloud Sync</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Real-time sync across all your phones and computers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">Status:</span>
          {isCloudConnected ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected & Live Syncing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Local Storage Mode (Offline)
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-0 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-powder-blue text-slate-950 font-bold shadow-xs border border-[#8ebdbb]/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Firebase Credentials</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-powder-blue text-slate-950 font-bold shadow-xs border border-[#8ebdbb]/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>1-Min Setup Guide</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {statusMessage && (
            <div className="p-3 text-xs rounded-xl bg-powder-blue/20 border border-powder-blue/40 text-slate-900 font-medium">
              {statusMessage}
            </div>
          )}

          {activeTab === 'config' ? (
            <div className="space-y-4">
              {/* Quick Auto-Paste Box */}
              <div className="p-3.5 bg-gradient-to-r from-powder-blue/20 to-powder-blue/10 rounded-xl border border-powder-blue/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                    Quick Auto-Paste:
                  </span>
                  <span className="text-[10px] text-slate-500">From Firebase Console</span>
                </div>
                <textarea
                  value={pasteSnippet}
                  onChange={(e) => setPasteSnippet(e.target.value)}
                  placeholder={`Paste full firebaseConfig object here:\nconst firebaseConfig = {\n  apiKey: "AIza...",\n  projectId: "..."\n};`}
                  rows={3}
                  className="w-full text-xs font-mono p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-powder-blue text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleParseSnippet}
                  className="w-full py-2 text-xs font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover active:bg-[#8ebdbb] border border-[#8ebdbb] rounded-lg shadow-xs shadow-powder-glow transition-all cursor-pointer"
                >
                  Auto-Fill Credentials Below
                </button>
              </div>

              {/* Form Manual Fields */}
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        API Key *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showApiKey ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••••"
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="my-expense-tracker"
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      App ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:123456:web:abcd..."
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Auth Domain (Optional)
                    </label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="my-tracker.firebaseapp.com"
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Storage Bucket (Optional)
                    </label>
                    <input
                      type="text"
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                      placeholder="my-tracker.appspot.com"
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Messaging Sender ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={messagingSenderId}
                      onChange={(e) => setMessagingSenderId(e.target.value)}
                      placeholder="1234567890"
                      className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-powder-blue"
                    />
                  </div>
                </div>

                {/* Privacy & Security Note */}
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Private &amp; Secure Storage:</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Credentials are kept strictly in your local device storage or your local <code>.env.local</code> file. They are never published to GitHub or made publicly visible.
                    </p>
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex items-center justify-between pt-2">
                  {isCloudConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  ) : <div />}

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover active:bg-[#8ebdbb] border border-[#8ebdbb] rounded-lg shadow-xs shadow-powder-glow transition-all cursor-pointer"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Save & Connect
                    </button>
                  </div>
                </div>
              </form>

              {/* Migrate local data to cloud option & Wipe Data */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {isCloudConnected && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Upload Local Data to Cloud
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Sync existing local expenses ({expenses.length}) and balances to Firestore.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleMigrate}
                      disabled={isMigrating}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-powder-blue hover:bg-powder-blue-hover border border-[#8ebdbb] rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {isMigrating ? 'Syncing...' : 'Upload Now'}
                    </button>
                  </div>
                )}

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">
                      Delete All Records (Clean Slate)
                    </h4>
                    <p className="text-[11px] text-rose-600/90">
                      Permanently wipe all expenses, loans, and reset balances to 0.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        confirm(
                          '⚠️ Are you sure you want to permanently delete ALL records from Cloud Firestore and local storage? This cannot be undone.'
                        )
                      ) {
                        await clearAllData();
                        setStatusMessage('✅ All records have been completely deleted.');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Wipe All Data
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Setup Guide Tab */
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  💡 Free Google Cloud / Firebase Account
                </span>
                <p className="text-[11px]">
                  Cloud Firestore provides a generous free tier (1GB storage, 50,000 reads/day, 20,000 writes/day), which is more than enough for personal expense tracking.
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside font-medium text-slate-700">
                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong>Create a Firebase Project:</strong>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Go to{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 underline font-semibold inline-flex items-center gap-0.5"
                    >
                      console.firebase.google.com <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    and click <strong>Add Project</strong>.
                  </p>
                </li>

                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong>Create Firestore Database:</strong>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    In the left menu, click <strong>Build &gt; Firestore Database</strong> &gt; <strong>Create Database</strong>. Choose your location (e.g. <code>asia-south1</code> for India) and start in <strong>Test mode</strong> (or apply the project rules).
                  </p>
                </li>

                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong>Register Web App:</strong>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Click the Settings gear ⚙️ &gt; <strong>Project settings</strong> &gt; scroll to <strong>Your apps</strong> &gt; click the <code>&lt;/&gt;</code> Web icon. Enter any nickname and copy the <code>firebaseConfig</code> code snippet.
                  </p>
                </li>

                <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <strong>Paste It Here:</strong>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Paste the snippet in the <strong>Credentials</strong> tab or paste into a <code>.env.local</code> file!
                  </p>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
