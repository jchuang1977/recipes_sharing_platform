// middleware.ts
import { NextRequest, NextResponse } from 'next/server';


import { createSupabaseServerClient } from './src/utils/supabaseServer';

export default async function Page() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('recipes').select('*');
  // ...
}

export function middleware(request: NextRequest) {
  // Example: Protect all routes under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabaseToken = request.cookies.get('sb-access-token');
    if (!supabaseToken) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}

// Optionally, specify which paths to match
export const config = {
  matcher: ['/dashboard/:path*'],
};


