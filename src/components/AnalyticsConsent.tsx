"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: `ga-disable-${string}`]: unknown } }
const KEY = "binglish_analytics_consent";
export default function AnalyticsConsent({ measurementId }: { measurementId?: string }) {
  const id = measurementId && /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : undefined;
  const [choice, setChoice] = useState<"allow" | "decline" | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();
  // Restore the saved browser choice after hydration without loading analytics first.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { const v = localStorage.getItem(KEY); if (v === "allow" || v === "decline") setChoice(v); } catch {} setReady(true); }, []);
  useEffect(() => {
    if (!id || !ready) return;
    window[`ga-disable-${id}`] = choice !== "allow";
    if (choice !== "allow") return;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: false });
      const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`; document.head.appendChild(script);
    }
    // Do not send query strings, which may contain personal information.
    window.gtag("event", "page_view", { page_path: pathname, page_location: window.location.origin + pathname });
  }, [choice, id, pathname, search, ready]);
  function choose(value: "allow" | "decline") { try { localStorage.setItem(KEY, value); } catch {} setChoice(value); setOpen(false); }
  if (!id || !ready) return null;
  return <><button type="button" className="underline" onClick={() => setOpen(true)}>Analytics settings</button>
    {(open || !choice) && <div role="region" aria-label="Analytics preferences" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-line bg-surface p-5 shadow-xl"><p className="text-sm">Allow optional Google Analytics to help us understand site usage? You can change this choice at any time. <Link className="underline" href="/privacy">Privacy policy</Link></p><div className="mt-3 flex gap-3"><button onClick={() => choose("allow")} className="rounded bg-accent px-4 py-2 text-accent-ink">Allow analytics</button><button onClick={() => choose("decline")} className="rounded border border-line px-4 py-2">Decline</button></div></div>}
  </>;
}
