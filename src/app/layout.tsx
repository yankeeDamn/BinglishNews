import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
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
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] py-6 text-center text-xs text-[#888]">
            <span className="text-gold-gradient font-semibold">BinglishNews</span>{" "}
            © {new Date().getFullYear()}. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
