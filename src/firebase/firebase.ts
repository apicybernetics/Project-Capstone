/**
 * Firebase Client Initialization & Configuration
 * Connected to live production Google Firebase project: project-management-outlook
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// Retrieve from generated applet config or local storage overrides
const getActiveConfig = (): FirebaseClientConfig => {
  const customConfig = localStorage.getItem('pm_custom_firebase_config');
  if (customConfig) {
    try {
      return JSON.parse(customConfig);
    } catch {
      // ignore
    }
  }

  return {
    apiKey: appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: appletConfig.authDomain || 'project-management-outlook.firebaseapp.com',
    projectId: appletConfig.projectId || 'project-management-outlook',
    storageBucket: appletConfig.storageBucket || 'project-management-outlook.firebasestorage.app',
    messagingSenderId: appletConfig.messagingSenderId || '629313153131',
    appId: appletConfig.appId || '',
    firestoreDatabaseId: appletConfig.firestoreDatabaseId || '',
  };
};

export const firebaseConfig = getActiveConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'undefined' &&
  !firebaseConfig.apiKey.includes('YOUR_')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    storage = getStorage(app);
    console.info('[Firebase] Successfully connected to project:', firebaseConfig.projectId, 'Database:', firebaseConfig.firestoreDatabaseId || 'default');
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to local engine:', err);
  }
}

export { app, auth, db, storage };

export const saveCustomFirebaseConfig = (config: FirebaseClientConfig) => {
  localStorage.setItem('pm_custom_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('pm_custom_firebase_config');
  window.location.reload();
};
