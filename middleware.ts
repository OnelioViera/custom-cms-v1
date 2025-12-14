import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/auth-edge';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  console.log('Middleware - Path:', path);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Is admin route:', isAdminRoute);

  // If trying to access admin route without token, redirect to login
  if (isAdminRoute && !token) {
    console.log('Middleware - Redirecting to login (no token)');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If has token, verify it
  if (isAdminRoute && token) {
    const payload = await verifyTokenEdge(token);
    
    console.log('Middleware - Token payload:', payload);
    
    // If token is invalid, redirect to login
    if (!payload) {
      console.log('Middleware - Redirecting to login (invalid token)');
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // If already logged in and trying to access login page, redirect to dashboard
  if (path === '/admin/login' && token) {
    const payload = await verifyTokenEdge(token);
    console.log('Middleware - On login page with token, payload:', payload);
    if (payload) {
      console.log('Middleware - Redirecting to dashboard (already logged in)');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  console.log('Middleware - Allowing request');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
