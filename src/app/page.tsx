import Link from "next/link";
import PostCard from "@/components/PostCard";
import WorldNewsFeed from "@/components/WorldNewsFeed";
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-24 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur-sm">
            🌐 Real-time world news & community stories
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Binglish<span className="text-yellow-300">News</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            Stay informed with English-only world headlines powered by GDELT,
            plus original stories written by our community.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#world-news"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
            >
              World News ↓
            </a>
            <Link
              href="/posts/new"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ✍️ Community Posts
            </h2>
            <Link
              href="/posts/new"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">
                No published posts yet. Be the first to{" "}
                <Link
                  href="/posts/new"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  write one
                </Link>
                !
              </p>
            </div>
          )}
        </section>

        {/* World News */}
        <section id="world-news">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              🌍 World News
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              English · via GDELT
            </span>
          </div>
          <WorldNewsFeed />
        </section>
      </div>
    </div>
  );
}
