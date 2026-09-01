import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDGGuVsAAlwfF1BtChlfmVushOCL5g-j_g',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'baiku-48104.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'baiku-48104',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'baiku-48104.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '325696955022',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:325696955022:android:21cb0f8c8c35a2fb989fdf',
};

let app;
let auth;
let db;
let storage;
let firebaseInitError = false;

try {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error('Missing Firebase config in environment variables');
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  // Log but don't rethrow so the UI can handle a missing config gracefully
  // eslint-disable-next-line no-console
  console.error('Firebase initialization error:', e);
  firebaseInitError = true;
}

export { auth, db, storage, firebaseInitError };
