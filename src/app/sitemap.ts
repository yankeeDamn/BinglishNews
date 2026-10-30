import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/firestore";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    ...["about", "contact", "editorial-policy", "corrections", "privacy", "terms"].map((path) => ({ url: `${base}/${path}` })),
  ];

  try {
    const posts = await getPublishedPosts();
    for (const post of posts) {
      const updated = new Date(post.updatedAt || post.createdAt);
      entries.push({
        url: `${base}/posts/${post.id}`,
        lastModified: isNaN(updated.getTime()) ? undefined : updated,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Firestore unavailable: still serve the static entries.
  }

  return entries;
}
