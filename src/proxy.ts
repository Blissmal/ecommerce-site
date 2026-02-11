// middleware.ts
import { stackServerApp } from '@/stack';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/cart')) {
    
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please log in to access your cart',
          redirectTo: '/login' 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/cart/:path*',
};