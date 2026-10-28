"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError, safeRedirect } from "@/lib/auth-errors";
import {
  AuthShell,
  Divider,
  FormAlert,
  GoogleButton,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/AuthUI";

function SignInForm() {
  const { user, loading: authLoading, configured, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeRedirect(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Once Firebase reports a signed-in user (from this form or an existing
  // session), leave the auth pages.
  useEffect(() => {
    if (!authLoading && user) router.replace(next);
  }, [authLoading, user, next, router]);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(friendlyAuthError(err, "sign-in"));
      setBusy(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    return run(() => signIn(email, password));
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to write posts and join the conversation."
      footer={
        <>
          New to BinglishNews?{" "}
          <Link
            href={next === "/" ? "/auth/signup" : `/auth/signup?next=${encodeURIComponent(next)}`}
            className="text-accent-text underline underline-offset-4 hover:no-underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {!configured && (
        <FormAlert>
          Sign-in is unavailable: the site&apos;s Firebase configuration is missing.
        </FormAlert>
      )}
      {error && <FormAlert>{error}</FormAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
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
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          labelAside={
            <Link href="/auth/forgot-password" className="text-xs text-accent-text hover:underline">
              Forgot password?
            </Link>
          }
        />
        <SubmitButton loading={busy || (!!user && !authLoading)} loadingText="Signing in…">
          Sign In
        </SubmitButton>
      </form>

      <Divider />
      <GoogleButton onClick={() => run(signInWithGoogle)} disabled={busy || !configured} />
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
