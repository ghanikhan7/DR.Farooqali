import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: (
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyBzfe43-mM8XT7fUwHu2XELV_1KqVpPhfk'
  ).trim(),
  authDomain: (
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'drfarooqali.firebaseapp.com'
  ).trim(),
  projectId: (
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'drfarooqali'
  ).trim(),
  storageBucket: (
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'drfarooqali.firebasestorage.app'
  ).trim(),
  messagingSenderId: (
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '859362907971'
  ).trim(),
  appId: (
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:859362907971:web:4a6304baac57bc453441f6'
  ).trim(),
  measurementId: (
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    'G-RNKXBJ5LWQ'
  ).trim() || undefined,
};

export const authorizedAdminUid = (
  import.meta.env.VITE_FIREBASE_ADMIN_UID ||
  'X2qros73RaYz1tEud3oToIjcusg1'
).trim();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes('your-firebase-api-key') &&
    !firebaseConfig.projectId.includes('your-project-id')
);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
