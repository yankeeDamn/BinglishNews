"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getAuthSafe, isConfigured } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isConfigured();

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: configured,
    error: null,
  });

  useEffect(() => {
    if (!configured) return;

    const firebaseAuth = getAuthSafe();
    if (!firebaseAuth) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setState({ user, profile, loading: false, error: null });
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setState({
            user,
            profile: null,
            loading: false,
            error: "Failed to load user profile. Some features may be unavailable.",
          });
        }
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });
    return unsub;
  }, [configured]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
