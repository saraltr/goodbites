import { NextRequest, NextResponse } from "next/server";
import { db, authAdmin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// PUT update a review
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await context.params;

    // get session cookie
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await authAdmin.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    // parse request body
    const { rating, comment } = await req.json();

    // validate input
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }
    if (!comment || typeof comment !== "string" || comment.length > 1000) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const reviewRef = db.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (reviewDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await reviewRef.update({
      rating,
      comment,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await context.params;

    // get session cookie
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await authAdmin.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    const reviewRef = db.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (reviewDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await reviewRef.delete();

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
