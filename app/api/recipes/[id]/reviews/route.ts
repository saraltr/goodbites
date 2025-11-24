import { NextRequest, NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET reviews for a recipe
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: recipeId } = await context.params;
    if (!recipeId) return NextResponse.json([], { status: 200 });
    const reviewsSnapshot = await db.collection('reviews')
      .where('recipeId', '==', recipeId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
        console.error("[REVIEWS GET ERROR]", err.message);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST a new review for a recipe
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: recipeId } = await context.params;

    // get session cookie
    const sessionCookie = req.cookies.get('__session')?.value;
    let userId: string | null = null;
    let userName = "Anonymous";

    if (sessionCookie) {
      try {
        const decoded = await authAdmin.verifySessionCookie(sessionCookie, true);
        userId = decoded.uid;
        userName = decoded.name || "Anonymous";
      } catch (err) {
        console.warn("[REVIEWS POST] Invalid session cookie, posting as anonymous");
      }
    }

    // parse request body
    const { rating, comment } = await req.json();

    // validate input
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string' || comment.length > 1000) {
      return NextResponse.json({ error: 'Invalid comment' }, { status: 400 });
    }

    // 3. Create new review document
    const newReview = {
      recipeId,
      userId,
      userName,
      rating,
      comment,
      createdAt: FieldValue.serverTimestamp(),
    };

    const reviewRef = await db.collection('reviews').add(newReview);

    // debug 
    // console.log("[REVIEWS POST] Recipe:", recipeId, "User:", userId || "Anonymous");

    return NextResponse.json({ id: reviewRef.id, ...newReview }, { status: 201 });

  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[REVIEWS POST ERROR]", err.message);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
