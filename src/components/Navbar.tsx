"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/#news", label: "News" },
  { href: "/#india-news", label: "India" },
  { href: "/#community", label: "Community" },
];

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // The menu counts as "open" only on the route it was opened from, so any
  // navigation closes it without an effect.
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
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4"
      >
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-6 text-sm md:flex">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-4 pl-2 text-sm md:flex">
            <AuthButtons {...authProps} />
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-sunken md:hidden"
            onClick={() => setOpenOnPath(mobileOpen ? null : pathname)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="swap-in border-t border-line bg-paper px-4 pb-5 pt-3 md:hidden"
          // Anchor links (/#india-news) don't change the route, so close on any link tap.
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpenOnPath(null);
          }}
        >
          <div className="flex flex-col gap-4 text-base">
            <NavLinks />
            <div className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
              <AuthButtons {...authProps} mobile />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLinks() {
  const link = "font-medium text-ink/80 transition hover:text-ink";
  return (
    <>
      {NAV_LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={link}>
          {l.label}
        </Link>
      ))}
      <a
        href="https://sokal-bela.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className={link}
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
  const pill =
    "rounded-full bg-accent px-4 py-1.5 text-center font-semibold text-accent-ink transition hover:bg-accent-hover active:scale-[0.97]";

  if (loading) {
    return <span className="skeleton h-4 w-20 rounded" aria-hidden="true" />;
  }

  if (user) {
    const name = profile?.displayName || user.displayName || user.email || "Account";
    return (
      <>
        <span
          className={`flex items-center gap-2 text-muted ${mobile ? "" : "max-w-[9rem]"}`}
          title={user.email ?? undefined}
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-bold uppercase text-ink"
          >
            {name.charAt(0)}
          </span>
          <span className="truncate">{name}</span>
        </span>
        {profile?.role === "admin" && (
          <Link href="/admin" className="font-semibold text-accent-text transition hover:underline">
            Admin
          </Link>
        )}
        <Link href="/posts/mine" className="font-medium text-muted transition hover:text-ink">My stories</Link>
        <button
          onClick={onSignOut}
          className="text-left font-medium text-muted transition hover:text-ink"
        >
          Sign out
        </button>
        <Link href="/posts/new" className={pill}>
          Write a story
        </Link>
      </>
    );
  }

  const next =
    pathname && pathname !== "/" && !pathname.startsWith("/auth")
      ? `?next=${encodeURIComponent(pathname)}`
      : "";

  return (
    <>
      <Link
        href={`/auth/signin${next}`}
        className="font-medium text-ink/80 transition hover:text-ink"
      >
        Sign in
      </Link>
      <Link href={`/auth/signup${next}`} className={pill}>
        Sign up
      </Link>
    </>
  );
}
