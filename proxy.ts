
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const session = req.cookies.get('__session');
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // If there is a session cookie, verify it
  if (session) {
    try {
      const response = await fetch(new URL('/api/auth/verify-session', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session.value }),
      });

      // If the session is invalid, delete the cookie and redirect to login
      if (!response.ok) {
        url.pathname = '/login';
        const res = NextResponse.redirect(url);
        res.cookies.delete('__session');
        return res;
      }

      // If the user is logged in and tries to access login or register, redirect to profile
      if (pathname === '/login' || pathname === '/register') {
        url.pathname = '/profile';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If the verification API fails, redirect to login
      url.pathname = '/login';
      const res = NextResponse.redirect(url);
      res.cookies.delete('__session');
      return res;
    }
  } else {
    // If the user is not logged in and tries to access a protected route, redirect to login
    if (pathname.startsWith('/profile') || pathname === '/') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/profile/:path*', '/login', '/register'],
};
