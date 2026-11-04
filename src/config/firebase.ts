import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_CONFIG_KEY = 'user_firebase_config_v1';

// Default configuration provided by user
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyBPka0GVtnJwjvwjuYd1EwyxBq0FDTk5ac',
  authDomain: 'expense-tracker-accb7.firebaseapp.com',
  projectId: 'expense-tracker-accb7',
  storageBucket: 'expense-tracker-accb7.firebasestorage.app',
  messagingSenderId: '785115172323',
  appId: '1:785115172323:web:7162e0a547dfe897d224d6',
  measurementId: 'G-PMMGN3PRM4',
};

export const getStoredFirebaseConfig = (): FirebaseConfig => {
  // 1. Check browser localStorage first (user manual override)
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId && parsed.appId) {
        return parsed as FirebaseConfig;
      }
    }
  } catch (e) {
    console.warn('Could not read firebase config from localStorage', e);
  }

  // 2. Check Vite environment variables
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId && envConfig.appId) {
    return envConfig;
  }

  // 3. Fallback to default user project configuration
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfigToStorage = (config: FirebaseConfig): void => {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Firebase config to localStorage', e);
  }
};

export const clearFirebaseConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
  } catch (e) {
    console.error('Failed to clear Firebase config', e);
  }
};

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export const initFirebase = (): { app: FirebaseApp | null; db: Firestore | null } => {
  const config = getStoredFirebaseConfig();

  try {
    if (!appInstance) {
      const existingApps = getApps();
      appInstance = existingApps.length > 0 ? existingApps[0] : initializeApp(config);
    }

    if (!firestoreInstance && appInstance) {
      firestoreInstance = initializeFirestore(appInstance, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    }

    return { app: appInstance, db: firestoreInstance };
  } catch (error) {
    console.error('Failed to initialize Firebase / Firestore:', error);
    return { app: appInstance, db: firestoreInstance };
  }
};

export const getFirestoreDb = (): Firestore | null => {
  if (firestoreInstance) return firestoreInstance;
  return initFirebase().db;
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getStoredFirebaseConfig();
  return Boolean(cfg && cfg.apiKey && cfg.projectId && cfg.appId);
};
