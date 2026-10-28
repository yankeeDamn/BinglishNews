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

/** Thrown when a Firebase service is used before env vars are provided. */
export class FirebaseNotConfiguredError extends Error {
  code = "app/not-configured";
  constructor(service = "Firebase") {
    super(`${service} is not configured`);
    this.name = "FirebaseNotConfiguredError";
  }
}

function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.authDomain &&
      firebaseConfig.appId,
  );
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

/**
 * Returns the REAL Firebase Auth instance or throws a typed error.
 *
 * Never wrap the Auth instance in a Proxy: the SDK mutates its own fields
 * (e.g. `currentUser`) using `this`, so a proxy silently splits state between
 * the proxy and the real instance and listeners never see the signed-in user.
 */
export function requireAuth(): Auth {
  const a = getAuthSafe();
  if (!a) throw new FirebaseNotConfiguredError("Firebase Auth");
  return a;
}

export { isConfigured };
