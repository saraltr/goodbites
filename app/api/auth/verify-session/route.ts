import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { sessionCookie } = await req.json();

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Session cookie not found.' }, { status: 400 });
    }

    const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ user: decodedClaims }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session cookie.' }, { status: 401 });
  }
}
