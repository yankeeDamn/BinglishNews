"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getAuthSafe, isConfigured, requireAuth } from "@/lib/firebase";
import { createUserProfile, getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  /** True until Firebase has reported the initial auth state. */
  loading: boolean;
  /** Non-fatal problem loading the profile (the user is still signed in). */
  error: string | null;
  /** False when NEXT_PUBLIC_FIREBASE_* env vars are missing. */
  configured: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const notReady = async () => {
  throw new Error("AuthProvider is not mounted");
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  configured: false,
  signIn: notReady,
  signUp: notReady,
  signInWithGoogle: notReady,
  signOut: notReady,
  resetPassword: notReady,
  refreshProfile: notReady,
});

function fallbackName(user: User): string {
  return (
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Reader"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isConfigured();

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: configured,
    error: null,
    configured,
  });

  // While sign-up is creating the Firestore profile itself, the auth listener
  // must not race it by creating a profile with an incomplete display name.
  const signingUp = useRef(false);

  const loadProfile = useCallback(async (user: User) => {
    try {
      let profile = await getUserProfile(user.uid);
      if (!profile && !signingUp.current) {
        // Self-heal accounts that exist in Auth but have no profile document
        // (Google sign-in, or a sign-up whose profile write failed).
        await createUserProfile(user.uid, user.email ?? "", fallbackName(user));
        profile = await getUserProfile(user.uid);
      }
      return { profile, error: null as string | null };
    } catch (err) {
      console.error("Failed to load user profile:", err);
      return {
        profile: null,
        error: "We couldn't load your profile. Some features may be unavailable.",
      };
    }
  }, []);

  useEffect(() => {
    if (!configured) return;

    const firebaseAuth = getAuthSafe();
    if (!firebaseAuth) return;

    let cancelled = false;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        if (!cancelled) {
          setState((s) => ({ ...s, user: null, profile: null, loading: false, error: null }));
        }
        return;
      }

      // Unblock the UI as soon as we know who the user is; the profile
      // (role, display name) streams in right after.
      if (!cancelled) {
        setState((s) => ({ ...s, user, loading: false }));
      }

      const { profile, error } = await loadProfile(user);
      if (!cancelled) {
        setState((s) => (s.user?.uid === user.uid ? { ...s, profile, error } : s));
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [configured, loadProfile]);

  const refreshProfile = useCallback(async () => {
    const current = getAuthSafe()?.currentUser;
    if (!current) return;
    const { profile, error } = await loadProfile(current);
    setState((s) => (s.user?.uid === current.uid ? { ...s, user: current, profile, error } : s));
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (displayName: string, email: string, password: string) => {
      const authInstance = requireAuth();
      const name = displayName.trim();
      signingUp.current = true;
      try {
        const cred = await createUserWithEmailAndPassword(authInstance, email.trim(), password);
        // The account now exists. Anything below failing must not make the
        // user think sign-up failed, so profile steps are best-effort.
        try {
          await updateProfile(cred.user, { displayName: name });
        } catch (err) {
          console.error("Failed to set display name:", err);
        }
        try {
          await createUserProfile(cred.user.uid, cred.user.email ?? email.trim(), name);
        } catch (err) {
          console.error("Failed to create user profile:", err);
        }
      } finally {
        signingUp.current = false;
      }
      await refreshProfile();
    },
    [refreshProfile],
  );

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(requireAuth(), provider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(requireAuth());
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(requireAuth(), email.trim());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [state, signIn, signUp, signInWithGoogle, signOut, resetPassword, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
