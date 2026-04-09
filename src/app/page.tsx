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
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Binglish<span className="text-blue-600">News</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Community-driven news platform — read world headlines from GDELT and
          stories written by our members.
        </p>
      </section>

      {/* Community Posts */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
          Community Posts
        </h2>
        {posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">
            No published posts yet. Be the first to{" "}
            <Link href="/posts/new" className="text-blue-600 hover:underline">
              write one
            </Link>
            !
          </p>
        )}
      </section>

      <section id="world-news">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">
          World News
        </h2>
        <WorldNewsFeed />
      </section>
    </div>
  );
}
