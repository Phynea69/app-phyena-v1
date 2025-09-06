import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (!req.cookies.get('uid')) {
    const uid = crypto.randomUUID();
    // cookie httpOnly minimal
    res.cookies.set('uid', uid, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }

  return res;
}

export const config = {
  // applique le middleware sur tout sauf assets statiques
  matcher: ['/((?!_next|favicon.ico|static|assets).*)'],
};
