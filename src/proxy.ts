// middleware.ts (or proxy.ts)
import { stackServerApp } from '@/stack';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/login-check',           // Check login status
    '/api/mpesa/:path',        // M-Pesa webhook callback
  ];
  
  // Check if current path is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // All other API routes require authentication
  const user = await stackServerApp.getUser();
  
  if (!user) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        message: 'Please log in to continue',
        redirectTo: '/handler/login' 
      },
      { status: 401 }
    );
  }
  
  // User is authenticated, proceed
  return NextResponse.next();
}

// Protect all API routes
export const config = {
  matcher: '/api/:path*',
};