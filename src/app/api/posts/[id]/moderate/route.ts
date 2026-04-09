import { NextResponse } from "next/server";
import type { PostStatus } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, status, moderatorId } = body as {
      postId: string;
      status: PostStatus;
      moderatorId: string;
    };

    if (!postId || !status || !moderatorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (status !== "published" && status !== "rejected") {
      return NextResponse.json(
        { error: "Status must be 'published' or 'rejected'" },
        { status: 400 },
      );
    }

    // Moderation is performed client-side via Firestore SDK
    // with security rules enforcing admin-only writes to the status field.
    // This endpoint exists for potential future server-side admin verification.
    return NextResponse.json({ success: true, postId, status });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
