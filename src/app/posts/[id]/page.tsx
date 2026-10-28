import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/firestore";
import type { Post } from "@/types";

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

// Shared by generateMetadata and the page so Firestore is read once per request.
const loadPost = cache(async (id: string): Promise<Post | null> => {
  try {
    const post = await getPostById(id);
    return post && post.status === "published" ? post : null;
  } catch {
    // Missing doc, rules denial, or Firestore not configured.
    return null;
  }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) return { title: "Post not found", robots: { index: false } };

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/posts/${post.id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.createdAt || undefined,
      authors: [post.authorName],
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
    twitter: {
      card: post.imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export default async function PostDetailPage({ params }: Params) {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) notFound();

  const date = post.createdAt ? new Date(post.createdAt) : null;
  const validDate = date && !isNaN(date.getTime()) ? date : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: validDate?.toISOString(),
    author: { "@type": "Person", name: post.authorName },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-[#888] transition hover:text-gold"
      >
        ← Back to news
      </Link>

      {post.imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.imageUrl}
          alt=""
          className="mb-6 h-72 w-full rounded-xl object-cover sm:h-96"
        />
      )}

      <h1 className="mb-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
        {post.title}
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#888]">
        <span>By {post.authorName}</span>
        {validDate && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={validDate.toISOString()}>
              {validDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{readingMinutes(post.content)} min read</span>
      </div>

      <p className="mb-8 border-l-2 border-gold/60 pl-4 text-lg italic text-[#aaa]">
        {post.summary}
      </p>

      <div className="whitespace-pre-wrap text-[17px] leading-8 text-[#ddd]">
        {post.content}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
