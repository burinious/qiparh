import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const qiparhFirebaseDefaults = {
  apiKey: 'AIzaSyC_aUE13zyLhbBL95YhB4OvEjqldnA3TgI',
  authDomain: 'qiparh.firebaseapp.com',
  projectId: 'qiparh',
  storageBucket: 'qiparh.firebasestorage.app',
  messagingSenderId: '28854937466',
  appId: '1:28854937466:web:25b22e04c87467fe77d8c3',
  measurementId: 'G-HR58MGLZPZ',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || qiparhFirebaseDefaults.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || qiparhFirebaseDefaults.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || qiparhFirebaseDefaults.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || qiparhFirebaseDefaults.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || qiparhFirebaseDefaults.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || qiparhFirebaseDefaults.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || qiparhFirebaseDefaults.measurementId,
};

export const hasFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean);

export const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const analyticsPromise = app && firebaseConfig.measurementId
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
  : Promise.resolve(null);
