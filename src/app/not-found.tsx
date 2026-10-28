import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-extrabold text-gold-gradient">404</p>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="text-[#888]">
        The story you&apos;re looking for doesn&apos;t exist, hasn&apos;t been
        published yet, or has moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-gold-light"
      >
        Back to the front page
      </Link>
    </div>
  );
}
