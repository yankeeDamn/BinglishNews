"use client";

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        Sign In
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/30 bg-red-900/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#888]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-gold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
