import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database.types' // Adjusted path

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  await supabase.auth.getSession() // Refreshes session cookies
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes like login, callback)
     * - login (explicitly exclude login page if not covered by auth)
     * - public (any public assets if you have a /public folder at root being served)
     * It's important to not run middleware on these paths to avoid issues
     * and unnecessary processing.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|login|public|api/).*)',
  ],
} 