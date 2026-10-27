import { NextResponse } from "next/server";

/**
 * Moderation currently happens client-side through the Firestore SDK, where
 * security rules restrict status changes to admins (see `firestore.rules`).
 *
 * This route used to report `{ success: true }` without verifying the caller
 * or changing anything, which is misleading. It now says so explicitly. If
 * server-side moderation is added later, verify a Firebase ID token with the
 * Admin SDK before touching Firestore.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Not implemented. Posts are moderated from the admin dashboard via Firestore security rules.",
    },
    { status: 501 },
  );
}
