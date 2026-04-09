"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/85">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Binglish<span className="text-blue-600">News</span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/#world-news"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            World News
          </Link>
          <a
            href="https://sokal-bela.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Sokal Bela
          </a>
          <a
            href="https://quiz-app-regd.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Quiz App
          </a>

          {loading ? (
            <span className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : user ? (
            <>
              <Link
                href="/posts/new"
                className="rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                Write Post
              </Link>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="font-semibold text-amber-600 transition hover:text-amber-700"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="font-medium text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
