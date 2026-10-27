import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "BinglishNews – Modern News Platform",
    template: "%s | BinglishNews",
  },
  description:
    "BinglishNews is a modern news platform featuring multi-source world news, Indian headlines, and moderated community content.",
  keywords: ["news", "world news", "india news", "community news", "GDELT", "BinglishNews"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BinglishNews",
    title: "BinglishNews – Modern News Platform",
    description:
      "Multi-source news aggregation with community stories.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BinglishNews",
    description:
      "Multi-source news aggregation with community stories.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-8 text-xs text-[#888]">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
              <p>
                <span className="text-gold-gradient font-semibold">BinglishNews</span>{" "}
                © {new Date().getFullYear()}. All rights reserved.
              </p>
              <nav aria-label="Footer" className="flex gap-5">
                <Link href="/#news" className="transition hover:text-gold">World News</Link>
                <Link href="/#india-news" className="transition hover:text-gold">India</Link>
                <Link href="/posts/new" className="transition hover:text-gold">Write a story</Link>
              </nav>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
