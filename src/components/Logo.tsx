import Link from "next/link";

/** Half sun on a horizon line, next to the wordmark. */
export function SunMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 22a10 10 0 0120 0z" fill="var(--accent)" />
      <path d="M2 25.5h28" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 4.5v3.2M6.4 8.6l2.2 2.2M25.6 8.6l-2.2 2.2" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      aria-label="BinglishNews home"
      className="group flex items-center gap-2 text-ink"
    >
      <SunMark className={size === "lg" ? "h-8 w-8" : "h-6 w-6"} />
      <span
        className={`font-serif tracking-tight ${size === "lg" ? "text-3xl" : "text-[22px]"}`}
      >
        <span className="font-bold">Binglish</span>
        <span className="font-normal">News</span>
      </span>
    </Link>
  );
}
