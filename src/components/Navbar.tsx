"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/90 shadow-lg shadow-black/20 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-white"
        >
          Binglish<span className="text-gold-gradient">News</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="text-[#888] hover:text-gold md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 text-sm md:flex">
          <NavLinks />
          <AuthButtons
            user={user}
            profile={profile}
            loading={loading}
            onSignOut={handleSignOut}
          />
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <NavLinks />
            <AuthButtons
              user={user}
              profile={profile}
              loading={loading}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinks() {
  return (
    <>
      <Link
        href="/"
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        Home
      </Link>
      <Link
        href="/#news"
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        World News
      </Link>
      <Link
        href="/#india-news"
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        India
      </Link>
      <a
        href="https://sokal-bela.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        Sokal Bela
      </a>
    </>
  );
}

function AuthButtons({
  user,
  profile,
  loading,
  onSignOut,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  loading: boolean;
  onSignOut: () => void;
}) {
  if (loading) {
    return <span className="h-4 w-16 skeleton rounded" />;
  }

  if (user) {
    return (
      <>
        <Link
          href="/posts/new"
          className="rounded-full bg-gold px-4 py-1.5 font-medium text-black shadow-sm transition hover:bg-gold-light hover:shadow-md"
        >
          Write Post
        </Link>
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="font-semibold text-gold transition hover:text-gold-light"
          >
            Admin
          </Link>
        )}
        <button
          onClick={onSignOut}
          className="font-medium text-[#888] transition hover:text-white"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/signin"
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-full bg-gold px-4 py-1.5 font-medium text-black shadow-sm transition hover:bg-gold-light hover:shadow-md"
      >
        Sign Up
      </Link>
    </>
  );
}
