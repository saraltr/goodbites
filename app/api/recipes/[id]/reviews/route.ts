import { NextRequest, NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET reviews for a recipe
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id;
    const reviewsSnapshot = await db.collection('reviews')
      .where('recipeId', '==', recipeId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST a new review for a recipe
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id;

    // 1. Verify user session
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;
    const userName = decodedClaims.name || 'Anonymous'; // Fallback for name

    // 2. Parse request body
    const { rating, comment } = await req.json();
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

    return NextResponse.json({ id: reviewRef.id, ...newReview }, { status: 201 });

  } catch (error) {
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
