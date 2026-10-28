"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Gate for pages that need a signed-in user (optionally an admin).
 * Unauthenticated visitors are sent to sign-in and returned afterwards.
 */
export default function RequireAuth({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (!configured) {
    return (
      <Notice>
        This feature is unavailable because the site&apos;s Firebase configuration is missing.
      </Notice>
    );
  }

  if (loading || !user) {
    return <Notice muted>Loading…</Notice>;
  }

  // Role comes from the profile document, which loads just after sign-in.
  if (admin && !profile) {
    return <Notice muted>Checking permissions…</Notice>;
  }

  if (admin && profile?.role !== "admin") {
    return <Notice danger>Access denied. Admin privileges required.</Notice>;
  }

  return <>{children}</>;
}

function Notice({
  children,
  muted,
  danger,
}: {
  children: ReactNode;
  muted?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
      <p
        role={danger ? "alert" : "status"}
        className={danger ? "font-medium text-danger" : muted ? "text-muted" : "text-muted"}
      >
        {children}
      </p>
    </div>
  );
}
