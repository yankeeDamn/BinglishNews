import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import { getSiteUrl } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f13" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "BinglishNews – Modern News Platform",
    template: "%s | BinglishNews",
  },
  description:
    "BinglishNews is a modern news platform featuring multi-source world news, Indian headlines, and moderated community content.",
  keywords: ["news", "world news", "india news", "community news", "BinglishNews"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BinglishNews",
    title: "BinglishNews – Modern News Platform",
    description: "Multi-source news aggregation with community stories.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BinglishNews",
    description: "Multi-source news aggregation with community stories.",
  },
  robots: { index: true, follow: true },
};

// Runs before first paint so a saved theme never flashes the wrong colours.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <footer className="border-t border-line bg-surface px-4 py-12">
            <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Logo />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                  Headlines from around the world and across India, plus stories
                  from readers, reviewed by our editors before they go live.
                </p>
              </div>
              <nav aria-label="Sections" className="lg:col-span-3">
                <h2 className="text-sm font-semibold">Read</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li><Link href="/#news" className="transition hover:text-ink">News</Link></li>
                  <li><Link href="/#india-news" className="transition hover:text-ink">India</Link></li>
                  <li><Link href="/#community" className="transition hover:text-ink">Community</Link></li>
                </ul>
              </nav>
              <nav aria-label="Account" className="lg:col-span-3">
                <h2 className="text-sm font-semibold">Contribute</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li><Link href="/posts/new" className="transition hover:text-ink">Write a story</Link></li>
                  <li><Link href="/auth/signin" className="transition hover:text-ink">Sign in</Link></li>
                  <li><Link href="/auth/signup" className="transition hover:text-ink">Create an account</Link></li>
                </ul>
              </nav>
            </div>
            <p className="mx-auto mt-10 max-w-6xl border-t border-line pt-6 text-xs text-muted">
              © {new Date().getFullYear()} BinglishNews. Headlines link to their original publishers.
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
