import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (
    !path.endsWith('/') &&
    !path.includes('.') &&
    !path.startsWith('/_next') &&
    !path.startsWith('/api')
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (
      session &&
      !path.startsWith('/onboarding') &&
      !path.startsWith('/auth') &&
      path !== '/'
    ) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query?name=users:isOnboardingComplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          args: { userId: session.user.id },
        }),
      });
      
      if (response.ok) {
        const { result: isComplete } = await response.json();
        
        if (!isComplete) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}