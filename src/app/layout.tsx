import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "BinglishNews – Community-Driven News Platform",
    template: "%s | BinglishNews",
  },
  description:
    "BinglishNews is a community-driven news platform featuring world news from GDELT and moderated user-generated content.",
  keywords: ["news", "world news", "community news", "GDELT", "BinglishNews"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BinglishNews",
    title: "BinglishNews – Community-Driven News Platform",
    description:
      "World news and moderated user-generated content in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BinglishNews",
    description:
      "World news and moderated user-generated content in one place.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
            © {new Date().getFullYear()} BinglishNews. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
