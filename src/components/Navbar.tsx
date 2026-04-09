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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
        >
          Binglish<span className="text-blue-600">News</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/posts/new"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            World News
          </Link>

          {loading ? (
            <span className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          ) : user ? (
            <>
              <Link
                href="/posts/new"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700"
              >
                Write Post
              </Link>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700"
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
