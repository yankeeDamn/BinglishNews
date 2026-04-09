# BinglishNews

A community-driven news platform built with **Next.js (App Router)**, **Firebase**, and **GDELT**.

## Features

- 📰 **World News** — Fetched server-side from GDELT with 15-minute cache
- ✍️ **User-Generated Posts** — Authenticated users can submit news posts
- 🛡️ **Moderation System** — Posts default to `pending`; only admins can approve/reject
- 🔐 **Firebase Auth** — Email/password authentication with Firestore user profiles
- 🖼️ **Image Uploads** — Firebase Storage with 5 MB limit and image-only validation
- 🔍 **SEO Optimized** — Per-page metadata, Open Graph, Twitter cards
- 🚀 **Vercel Ready** — Deploys instantly on Vercel free tier

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Framework   | Next.js 16 (App Router)        |
| Styling     | Tailwind CSS 4                 |
| Auth        | Firebase Auth (email/password) |
| Database    | Cloud Firestore                |
| Storage     | Firebase Storage               |
| World News  | GDELT API v2                   |
| Hosting     | Vercel                         |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yankeeDamn/BinglishNews.git
cd BinglishNews
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Create a **Firestore** database
4. Enable **Storage**
5. Copy `.env.local.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.local.example .env.local
```

### 3. Deploy Security Rules

Copy the contents of `firestore.rules` and `storage.rules` into your Firebase Console.

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

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── gdelt/route.ts          # GDELT Route Handler (15-min cache)
│   │   └── posts/[id]/moderate/    # Moderation API endpoint
│   ├── admin/page.tsx               # Admin moderation dashboard
│   ├── auth/
│   │   ├── signin/page.tsx          # Sign-in page
│   │   └── signup/page.tsx          # Sign-up page
│   ├── posts/
│   │   ├── new/page.tsx             # Create post (pending status)
│   │   └── [id]/page.tsx            # Post detail page
│   ├── layout.tsx                   # Root layout with SEO metadata
│   └── page.tsx                     # Home page (SSR)
├── components/
│   ├── Navbar.tsx                   # Navigation with auth state
│   ├── PostCard.tsx                 # Post preview card
│   └── WorldNewsFeed.tsx            # GDELT world news feed
├── context/
│   └── AuthContext.tsx              # Firebase Auth context provider
├── lib/
│   ├── firebase.ts                  # Firebase client init
│   ├── firestore.ts                 # Firestore CRUD operations
│   └── storage.ts                   # Firebase Storage uploads
└── types/
    └── index.ts                     # TypeScript interfaces
firestore.rules                      # Firestore security rules
storage.rules                        # Storage security rules
```

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
