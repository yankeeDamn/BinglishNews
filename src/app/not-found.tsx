import Link from "next/link";
import { SunMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <SunMark className="h-14 w-14" />
      <h1 className="font-serif text-4xl font-semibold tracking-tight">We can&apos;t find that page</h1>
      <p className="text-muted">
        The story may have been moved, or it hasn&apos;t been published yet.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover active:scale-[0.97]"
      >
        Back to the front page
      </Link>
    </div>
  );
}
