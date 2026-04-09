import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getAppSafe(): FirebaseApp | null {
  if (!isConfigured()) return null;
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

/** Firebase Auth – returns null when Firebase is not configured */
export function getAuthSafe(): Auth | null {
  if (_auth) return _auth;
  const app = getAppSafe();
  if (!app) return null;
  _auth = getAuth(app);
  return _auth;
}

/** Firestore – returns null when Firebase is not configured */
export function getDbSafe(): Firestore | null {
  if (_db) return _db;
  const app = getAppSafe();
  if (!app) return null;
  _db = getFirestore(app);
  return _db;
}

/** Firebase Storage – returns null when Firebase is not configured */
export function getStorageSafe(): FirebaseStorage | null {
  if (_storage) return _storage;
  const app = getAppSafe();
  if (!app) return null;
  _storage = getStorage(app);
  return _storage;
}

// Convenience getters that throw when Firebase is not configured (for client-side use)
export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const a = getAuthSafe();
    if (!a) throw new Error("Firebase is not configured");
    return (a as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    const d = getDbSafe();
    if (!d) throw new Error("Firebase is not configured");
    return (d as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    const s = getStorageSafe();
    if (!s) throw new Error("Firebase is not configured");
    return (s as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { isConfigured };
export default getAppSafe();
