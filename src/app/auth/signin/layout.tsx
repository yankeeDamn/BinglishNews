import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | BinglishNews",
  description: "Sign in to your BinglishNews account to create and share news posts.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
