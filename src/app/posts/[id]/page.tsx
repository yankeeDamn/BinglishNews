import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButton from "@/components/ShareButton";
import { readingMinutes } from "@/lib/format";
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
      publishedTime: post.publishedAt || post.moderatedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
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

export default async function PostDetailPage({ params }: Params) {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) notFound();

  // Older stories may not have a publication timestamp. Never label creation as publication.
  const publication = post.publishedAt || post.moderatedAt;
  const date = publication ? new Date(publication) : null;
  const updated = post.updatedAt ? new Date(post.updatedAt) : null;
  const validUpdated = updated && !isNaN(updated.getTime()) ? updated : null;
  let sourceUrl: string | undefined;
  try { const parsed = new URL(post.sourceUrl || ""); if (["http:", "https:"].includes(parsed.protocol)) sourceUrl = parsed.href; } catch { /* No valid source URL. */ }
  const validDate = date && !isNaN(date.getTime()) ? date : null;
  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: validDate?.toISOString(),
    dateModified: validUpdated?.toISOString(),
    author: { "@type": "Person", name: post.authorName },
  };

  return (
    <>
      <ReadingProgress targetId="article-body" />
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
        >
          <span aria-hidden="true">←</span> Back to news
        </Link>

        <h1
          className="rise mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
          style={{ "--d": 0 } as React.CSSProperties}
        >
          {post.title}
        </h1>

        <p
          className="rise mt-5 font-serif text-xl leading-relaxed text-muted sm:text-2xl"
          style={{ "--d": 1 } as React.CSSProperties}
        >
          {post.summary}
        </p>

        <div
          className="rise mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3"
          style={{ "--d": 2 } as React.CSSProperties}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-semibold text-ink">{post.authorName}</span>
            {validDate && (
              <>
                <span aria-hidden="true">/</span>
                <time dateTime={validDate.toISOString()}>
                  Published {validDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </>
            )}
            {validUpdated && validDate && validUpdated.getTime() > validDate.getTime() + 60000 && <span>Updated <time dateTime={validUpdated.toISOString()}>{validUpdated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></span>}
            <span aria-hidden="true">/</span>
            <span>{readingMinutes(post.content)} min read</span>
          </div>
          <ShareButton title={post.title} />
        </div>

        {post.imageUrl && (
          <figure className="rise mt-8" style={{ "--d": 3 } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              className="aspect-[16/9] w-full rounded-md bg-sunken object-cover"
            />
            {post.imageCredit && <figcaption className="mt-2 text-sm text-muted">Image: {post.imageCredit}</figcaption>}
          </figure>
        )}

        <div id="article-body" className="mt-10 space-y-6 font-serif text-[20px] leading-[1.75] text-ink/90">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {sourceUrl && <p className="mt-8 text-sm text-muted">Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{sourceUrl}</a></p>}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </article>
    </>
  );
}
