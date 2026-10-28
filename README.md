# BinglishNews

A modern, multi-source news aggregation platform built with **Next.js 16 (App Router)**, **Firebase**, and a **Black + Gold** dark theme. Aggregates headlines from GDELT, RSS feeds, and Hacker News — plus original community stories with admin moderation.

## Features

- 📰 **Multi-Source News** — Aggregated from GDELT, RSS (BBC, NYT, Reuters), and Hacker News with automatic de-duplication
- 🇮🇳 **Dedicated India Feed** — India-focused RSS feeds (BBC India, Times of India, The Hindu) with GDELT region filtering
- ✍️ **Community Posts** — Authenticated users submit news posts; admin moderation required for publishing
- 🛡️ **Admin Moderation** — Posts start as `pending`; admin dashboard at `/admin` for approve/reject workflow
- 🔐 **Firebase Auth** — Email/password and Google sign-in, password reset, safe `?next=` redirects, self-healing user profiles and actionable error messages
- 🖼️ **Image Uploads** — Firebase Storage with 5 MB limit and image-only validation
- 🔍 **Search + Filters** — Category tabs (All / World / India / Tech), search bar, and pagination
- 🎨 **Black + Gold Theme** — Dark background, gold accents, shimmer skeletons, responsive mobile-first design
- 🔎 **SEO & Sharing** — Server-rendered post pages with Open Graph / Twitter / JSON-LD metadata, `sitemap.xml` and `robots.txt`
- ♿ **Accessible** — Skip link, labelled forms, ARIA states, keyboard-friendly navigation
- 🚀 **Vercel Ready** — Serverless-compatible with `Cache-Control` headers (no in-memory cache)

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Framework   | Next.js 16 (App Router, Turbopack)                  |
| Styling     | Tailwind CSS 4, Black + Gold theme                  |
| Auth        | Firebase Auth (email/password)                      |
| Database    | Cloud Firestore                                     |
| Storage     | Firebase Storage                                    |
| News Sources| GDELT API v2 · RSS (BBC, NYT, Reuters, TOI, The Hindu) · Hacker News |
| Hosting     | Vercel                                              |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yankeeDamn/BinglishNews.git
cd BinglishNews
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in method → **Email/Password** (and **Google**, if you want Google sign-in)
3. Create a **Firestore** database
4. Enable **Storage**
5. Authentication → Settings → **Authorized domains**: add your production domain (e.g. `your-app.vercel.app`) — required for Google sign-in
6. Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

> The site loads without Firebase env vars, but auth, posts, and moderation features require them.

### 3. Deploy Security Rules & Indexes

Copy the contents of `firestore.rules` and `storage.rules` into your Firebase Console.

The home page and author queries need composite indexes (`firestore.indexes.json`). Deploy them with the Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

Without them, published posts silently fail to load and the home page shows "No published posts yet".

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
npx vercel
```

Add the same environment variables from `.env.local` to your Vercel project settings.

## Troubleshooting Sign-in

| Symptom | Likely cause |
|---|---|
| "…site is not fully configured" / "Firebase configuration is missing" | The `NEXT_PUBLIC_FIREBASE_*` variables are not set for the **deployed** environment. Add them in Vercel → Settings → Environment Variables and **redeploy** (they are inlined at build time). |
| "This sign-in method is not enabled yet" | Enable Email/Password (or Google) under Firebase Authentication → Sign-in method. |
| "This domain is not authorized" | Add your domain under Authentication → Settings → Authorized domains. |
| Signed in but no posts / role is not admin | Deploy `firestore.rules` and `firestore.indexes.json`; set `role: "admin"` on your `users/{uid}` document. |

> **Developer note:** never wrap the Firebase `Auth` instance in a `Proxy`. The SDK assigns fields like `currentUser` using `this`, so a proxy splits state between itself and the real instance and `onAuthStateChanged` never reports the new user. Use `requireAuth()` from `src/lib/firebase.ts`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── gdelt/route.ts              # Legacy GDELT endpoint (validated)
│   │   ├── news/route.ts               # Unified news endpoint (paginated, multi-source)
│   │   └── posts/[id]/moderate/        # Moderation API
│   ├── admin/page.tsx                   # Admin moderation dashboard
│   ├── auth/
│   │   ├── signin/page.tsx              # Sign-in (email + Google, ?next= redirect)
│   │   ├── signup/page.tsx              # Sign-up with password policy
│   │   └── forgot-password/page.tsx     # Password reset email
│   ├── posts/
│   │   ├── new/page.tsx                 # Create post (pending moderation)
│   │   └── [id]/page.tsx                # Server-rendered post page (SEO metadata)
│   ├── error.tsx / not-found.tsx        # Error boundary and 404 page
│   ├── sitemap.ts / robots.ts           # SEO
│   ├── globals.css                      # Black + Gold theme variables
│   ├── layout.tsx                       # Root layout with SEO metadata
│   └── page.tsx                         # Home: hero, community posts, world & India news
├── components/
│   ├── Navbar.tsx                       # Responsive nav with mobile toggle
│   ├── NewsFeed.tsx                     # Category tabs, search, pagination, skeletons
│   ├── PostCard.tsx                     # Post preview card
│   ├── RequireAuth.tsx                  # Route guard (signed-in / admin)
│   ├── auth/AuthUI.tsx                  # Shared auth form components
│   └── WorldNewsFeed.tsx                # Legacy GDELT-only feed
├── context/
│   └── AuthContext.tsx                  # Auth state + signIn/signUp/Google/reset/signOut actions
├── lib/
│   ├── firebase.ts                      # Firebase client init (safe lazy loading)
│   ├── auth-errors.ts                   # Friendly error mapping, password policy, safe redirects
│   ├── firestore.ts                     # Firestore CRUD operations
│   ├── storage.ts                       # Firebase Storage uploads
│   └── news/
│       ├── provider.ts                  # NewsProvider interface
│       ├── gdelt-provider.ts            # GDELT provider (48h rolling window)
│       ├── rss-provider.ts              # RSS provider (world + India feeds)
│       ├── hackernews-provider.ts       # Hacker News provider
│       ├── aggregator.ts                # Merge, dedupe, retry, fallback
│       ├── utils.ts                     # Shared hostname extraction
│       └── index.ts                     # Barrel exports
└── types/
    └── index.ts                         # Article, NewsResponse, Post, UserProfile
firestore.rules                          # Firestore security rules
firestore.indexes.json                   # Composite indexes for post queries
storage.rules                            # Storage security rules
```

## News Provider Architecture

All providers implement `NewsProvider` interface with a `fetch(options)` method:

```
┌──────────┐    ┌──────────┐    ┌──────────────┐
│  GDELT   │    │   RSS    │    │  HackerNews  │
│ Provider │    │ Provider │    │   Provider   │
└────┬─────┘    └────┬─────┘    └──────┬───────┘
     │               │                 │
     └───────────┬───┴─────────────────┘
                 │
          ┌──────▼──────┐
          │  Aggregator  │  ← retry, dedupe, fallback
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │  /api/news   │  ← pagination, Cache-Control
          └─────────────┘
```

To add a new source: implement `NewsProvider`, add to `providers[]` in `aggregator.ts`.

## API Endpoints

| Endpoint                       | Description                                      |
|-------------------------------|--------------------------------------------------|
| `GET /api/news`                | Aggregated news (all sources, paginated)          |
| `GET /api/news?region=IN`      | India-focused news                               |
| `GET /api/news?category=tech`  | Category filter (world, india, tech)              |
| `GET /api/news?page=2&pageSize=20` | Pagination                                  |
| `GET /api/news?q=climate`      | Search query                                     |
| `GET /api/gdelt`               | Legacy GDELT-only endpoint                       |

## Moderation Flow

1. User creates a post → saved with `status: "pending"`
2. Admin sees pending posts in `/admin` dashboard
3. Admin approves → `status: "published"` (appears on home page)
4. Admin rejects → `status: "rejected"` (hidden from public)

## Setting Up an Admin User

After creating a user account, manually set their role to `"admin"` in Firestore:

1. Go to Firebase Console → Firestore
2. Find the user document in `users/{uid}`
3. Change `role` from `"user"` to `"admin"`

## License

MIT
