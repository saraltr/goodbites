
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const session = req.cookies.get('__session');
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // protected route prefixes
  const protectedRoutes = ["/profile"];

  // check if the route is protected
  const isProtected = protectedRoutes.some(prefix => pathname.startsWith(prefix));


  // If there is a session cookie, verify it
  if (session) {
    try {
      const response = await fetch(new URL('/api/auth/verify-session', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session.value }),
      });

      // invalid session
      if (!response.ok) {
        const res = NextResponse.redirect(`${req.nextUrl.origin}/login`);
        res.cookies.delete("__session");
        return res;
      }

      // If the user is logged in and tries to access login or register, redirect to profile
      if (pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(`${req.nextUrl.origin}/profile`);
      }
      
      return NextResponse.next();

    } catch (error) {
      // If the verification API fails, redirect to login
      const res = NextResponse.redirect('/login');
      res.cookies.delete('__session');
      console.error(error);
      return res;
    }
  } 

  // only block protected routes
  if (isProtected) {
    return NextResponse.redirect(`${req.nextUrl.origin}/login`);
  }

  // allow public routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/profile/:path*', '/login', '/register'],
};
