"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#news", label: "World News" },
  { href: "/#india-news", label: "India" },
];

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // The menu is "open" only for the route it was opened on, so navigating
  // anywhere closes it without needing an effect.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const mobileOpen = openOnPath === pathname;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    setOpenOnPath(null);
    router.push("/");
  };

  const authProps = { user, profile, loading, onSignOut: handleSignOut, pathname };

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/90 shadow-lg shadow-black/20 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-white"
        >
          Binglish<span className="text-gold-gradient">News</span>
        </Link>

        <button
          className="rounded p-1 text-[#888] hover:text-gold md:hidden"
          onClick={() => setOpenOnPath(mobileOpen ? null : pathname)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-5 text-sm md:flex">
          <NavLinks pathname={pathname} />
          <AuthButtons {...authProps} />
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <NavLinks pathname={pathname} />
            <AuthButtons {...authProps} mobile />
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" && pathname === "/";
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`font-medium transition hover:text-gold ${active ? "text-gold" : "text-[#ccc]"}`}
          >
            {link.label}
          </Link>
        );
      })}
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
  pathname,
  mobile = false,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  loading: boolean;
  onSignOut: () => void;
  pathname: string;
  mobile?: boolean;
}) {
  if (loading) {
    return <span className="skeleton h-4 w-16 rounded" aria-hidden="true" />;
  }

  if (user) {
    const name = profile?.displayName || user.displayName || user.email || "Account";
    return (
      <>
        <span
          className={`flex items-center gap-2 text-[#aaa] ${mobile ? "" : "max-w-[10rem]"}`}
          title={user.email ?? undefined}
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold uppercase text-gold"
          >
            {name.charAt(0)}
          </span>
          <span className="truncate">{name}</span>
        </span>
        <Link
          href="/posts/new"
          className="rounded-full bg-gold px-4 py-1.5 text-center font-medium text-black shadow-sm transition hover:bg-gold-light hover:shadow-md"
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
          className="text-left font-medium text-[#888] transition hover:text-white"
        >
          Sign Out
        </button>
      </>
    );
  }

  const next = pathname && pathname !== "/" && !pathname.startsWith("/auth") ? `?next=${encodeURIComponent(pathname)}` : "";

  return (
    <>
      <Link
        href={`/auth/signin${next}`}
        className="font-medium text-[#ccc] transition hover:text-gold"
      >
        Sign In
      </Link>
      <Link
        href={`/auth/signup${next}`}
        className="rounded-full bg-gold px-4 py-1.5 text-center font-medium text-black shadow-sm transition hover:bg-gold-light hover:shadow-md"
      >
        Sign Up
      </Link>
    </>
  );
}
