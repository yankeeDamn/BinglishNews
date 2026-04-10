"use client";

import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Sign-up failed. Please try again.";
  }
}

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
      await createUserProfile(cred.user.uid, email, displayName.trim());
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(friendlyAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">
        Create Account
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/30 bg-red-900/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Display Name
          <input
            type="text"
            required
            minLength={2}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gold py-2.5 font-semibold text-black transition hover:bg-gold-light disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#888]">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-gold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
