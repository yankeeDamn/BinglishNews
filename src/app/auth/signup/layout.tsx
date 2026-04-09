import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | BinglishNews",
  description: "Create a BinglishNews account to write and share news posts with the community.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
