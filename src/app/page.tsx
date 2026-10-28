import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";
import Dateline from "@/components/Dateline";
import NewsFeed from "@/components/NewsFeed";
import PostCard from "@/components/PostCard";
import Ticker from "@/components/Ticker";
import { getPublishedPosts } from "@/lib/firestore";
import { sourceLabel, timeAgo } from "@/lib/format";
import { fetchAggregatedNews } from "@/lib/news";
import type { Article, Post } from "@/types";

// Re-render at most once a minute instead of on every request.
export const revalidate = 60;

/** Resolve to `fallback` instead of letting one slow upstream stall the page. */
async function withTimeout<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function loadFrontPage() {
  const [articles, posts] = await Promise.all([
    withTimeout(
      fetchAggregatedNews({ page: 1, pageSize: 14 })
        .then((r) => r.articles)
        .catch((): Article[] => []),
      6000,
      [] as Article[],
    ),
    withTimeout(
      getPublishedPosts().catch((): Post[] => []),
      6000,
      [] as Post[],
    ),
  ]);
  return { articles, posts };
}

function Meta({ article }: { article: Article }) {
  const when = timeAgo(article.publishedAt);
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className="font-semibold text-ink/80">{sourceLabel(article.source)}</span>
      {when && (
        <>
          <span aria-hidden="true">/</span>
          <time dateTime={article.publishedAt}>{when}</time>
        </>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { articles, posts } = await loadFrontPage();

  // Lead with the newest story that has a picture; everything else is "Latest".
  const lead = articles.find((a) => a.imageUrl) ?? articles[0];
  const latest = articles.filter((a) => a !== lead).slice(0, 5);

  return (
    <div>
      <h1 className="sr-only">BinglishNews: today&apos;s top stories</h1>

      <Ticker articles={articles} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <p className="mb-6 h-5 text-sm text-muted">
          <Dateline />
        </p>

        {/* Front page */}
        {lead ? (
          <section aria-label="Top stories" className="grid gap-10 lg:grid-cols-12 lg:gap-0">
            <article className="lg:col-span-8 lg:pr-10">
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {lead.imageUrl && (
                  <div className="wipe-in overflow-hidden rounded-md">
                    <ArticleImage
                      priority
                      src={lead.imageUrl}
                      label={sourceLabel(lead.source)}
                      fallbackClassName="text-4xl"
                      className="aspect-[16/9] w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="rise mt-6" style={{ "--d": 4 } as React.CSSProperties}>
                  <Meta article={lead} />
                </div>
                <h2
                  className="rise mt-3 font-serif text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-[56px]"
                  style={{ "--d": 5 } as React.CSSProperties}
                >
                  <span className="hl">{lead.title}</span>
                </h2>
                {lead.summary && (
                  <p
                    className="rise mt-4 max-w-2xl text-lg leading-relaxed text-muted"
                    style={{ "--d": 6 } as React.CSSProperties}
                  >
                    {lead.summary}
                  </p>
                )}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </article>

            <aside
              aria-labelledby="latest-title"
              className="border-line lg:col-span-4 lg:border-l lg:pl-8"
            >
              <h2
                id="latest-title"
                className="rise flex items-center gap-2 text-sm font-semibold"
                style={{ "--d": 3 } as React.CSSProperties}
              >
                <span className="live-dot h-2 w-2 rounded-full bg-breaking" aria-hidden="true" />
                Latest
              </h2>
              <ol className="mt-3 divide-y divide-line">
                {latest.map((article, i) => (
                  <li
                    key={article.url}
                    className="rise py-4"
                    style={{ "--d": i + 4 } as React.CSSProperties}
                  >
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <Meta article={article} />
                      <h3 className="mt-1.5 font-serif text-xl font-semibold leading-snug tracking-tight">
                        <span className="hl">{article.title}</span>
                      </h3>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        ) : (
          <section className="rounded-xl bg-surface p-10 text-center">
            <p className="font-serif text-2xl font-semibold">Headlines are taking a moment.</p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              We couldn&apos;t reach our news sources just now. Refresh in a minute, or
              read the community stories below.
            </p>
          </section>
        )}

        {/* Community */}
        <section id="community" className="mt-24 scroll-mt-20" aria-labelledby="community-title">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
            <h2 id="community-title" className="font-serif text-3xl font-semibold tracking-tight">
              From our community
            </h2>
            <Link
              href="/posts/new"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover active:scale-[0.97]"
            >
              Write a story
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-surface p-10 text-center">
              <p className="font-serif text-2xl font-semibold">No community stories yet.</p>
              <p className="mt-1 text-muted">
                Reporting something local? Write it up and our editors will review it.
              </p>
              <Link
                href="/posts/new"
                className="mt-5 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover active:scale-[0.97]"
              >
                Write the first one
              </Link>
            </div>
          )}
        </section>

        {/* Feeds */}
        <div className="mt-24">
          <NewsFeed id="news" title="News" />
        </div>
        <div className="mt-24">
          <NewsFeed id="india-news" title="India" initialCategory="india" showTabs={false} />
        </div>
      </div>
    </div>
  );
}
