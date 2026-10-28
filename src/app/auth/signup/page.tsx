"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError, safeRedirect, validatePassword } from "@/lib/auth-errors";
import {
  AuthShell,
  Divider,
  FormAlert,
  GoogleButton,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/AuthUI";

function SignUpForm() {
  const { user, loading: authLoading, configured, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeRedirect(searchParams.get("next"));

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace(next);
  }, [authLoading, user, next, router]);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(friendlyAuthError(err, "sign-up"));
      setBusy(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    const passwordProblem = validatePassword(password);
    if (passwordProblem) {
      setError(passwordProblem);
      return;
    }
    return run(() => signUp(displayName, email, password));
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join BinglishNews to publish stories and follow the news that matters."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={next === "/" ? "/auth/signin" : `/auth/signin?next=${encodeURIComponent(next)}`}
            className="text-accent-text underline underline-offset-4 hover:no-underline"
          >
            Sign In
          </Link>
        </>
      }
    >
      {!configured && (
        <FormAlert>
          Sign-up is unavailable: the site&apos;s Firebase configuration is missing.
        </FormAlert>
      )}
      {error && <FormAlert>{error}</FormAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Display name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
          hint="Shown as the author name on your posts."
        />
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
        <PasswordField
          label="Password"
          name="new-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          hint="At least 8 characters, with a letter and a number."
        />
        <SubmitButton loading={busy || (!!user && !authLoading)} loadingText="Creating account…">
          Sign Up
        </SubmitButton>
      </form>

      <Divider />
      <GoogleButton
        onClick={() => run(signInWithGoogle)}
        disabled={busy || !configured}
        label="Sign up with Google"
      />
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
