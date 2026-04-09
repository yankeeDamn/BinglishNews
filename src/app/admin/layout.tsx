import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation Dashboard | BinglishNews",
  description: "Admin moderation dashboard for reviewing and approving user-submitted news posts.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
