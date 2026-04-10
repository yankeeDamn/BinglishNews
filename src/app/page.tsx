import Link from "next/link";
import PostCard from "@/components/PostCard";
import NewsFeed from "@/components/NewsFeed";
import { getPublishedPosts } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    // Firestore may not be configured yet — render empty
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a] px-4 py-24 text-white">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-sm font-medium text-gold">
            📰 Multi-source news &amp; community stories
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Binglish<span className="text-gold-gradient">News</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#aaa]">
            Stay informed with headlines from GDELT, RSS feeds, and Hacker News
            — plus original stories written by our community.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#news"
              className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-gold-light hover:shadow-xl"
            >
              Browse News ↓
            </a>
            <Link
              href="/posts/new"
              className="rounded-full border border-gold/40 bg-gold/10 px-7 py-3 text-sm font-semibold text-gold backdrop-blur-sm transition hover:bg-gold/20"
            >
              Write a Story
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Community Posts */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              ✍️ Community Posts
            </h2>
            <Link
              href="/posts/new"
              className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-light"
            >
              + Write Post
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#141414] p-10 text-center">
              <p className="text-[#888]">
                No published posts yet. Be the first to{" "}
                <Link
                  href="/posts/new"
                  className="font-semibold text-gold hover:underline"
                >
                  write one
                </Link>
                !
              </p>
            </div>
          )}
        </section>

        {/* World News Feed */}
        <section id="news">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              🌍 World News
            </h2>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-xs font-medium text-gold">
              GDELT · RSS · HackerNews
            </span>
          </div>
          <NewsFeed id="news-feed" />
        </section>

        {/* India News Feed */}
        <section id="india-news" className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              🇮🇳 India News
            </h2>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-xs font-medium text-gold">
              BBC India · TOI · The Hindu
            </span>
          </div>
          <NewsFeed id="india-news-feed" initialCategory="india" />
        </section>
      </div>
    </div>
  );
}
