"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  AuthShell,
  FormAlert,
  SubmitButton,
  TextField,
} from "@/components/auth/AuthUI";

export default function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // Don't reveal whether an account exists for this address.
      if (code === "auth/user-not-found") {
        setSent(true);
      } else {
        console.error("Password reset error:", err);
        setError(friendlyAuthError(err, "reset"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link href="/auth/signin" className="text-gold hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {!configured && (
        <FormAlert>Password reset is unavailable: Firebase is not configured.</FormAlert>
      )}
      {error && <FormAlert>{error}</FormAlert>}
      {sent ? (
        <FormAlert kind="success">
          If an account exists for <strong>{email}</strong>, a reset link is on its
          way. Check your inbox (and spam folder).
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
          <SubmitButton loading={busy} loadingText="Sending…">
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
