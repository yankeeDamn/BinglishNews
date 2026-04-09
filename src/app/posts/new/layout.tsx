import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Post | BinglishNews",
  description: "Write and submit a news post for review on BinglishNews.",
};

export default function NewPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
