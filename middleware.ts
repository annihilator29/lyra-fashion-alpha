import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimiter } from './src/lib/rate-limiter'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Rate limiting for auth endpoints (NOT including OAuth callback)
  const isAuthEndpoint = request.nextUrl.pathname.startsWith('/login') ||
                          request.nextUrl.pathname.startsWith('/register') ||
                          request.nextUrl.pathname.startsWith('/reset-password')

  if (isAuthEndpoint) {
    // Get client IP address (considering proxy headers)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Check rate limit (5 attempts per 15 minutes)
    const rateLimitResult = rateLimiter.check(ip, 5, 15 * 60 * 1000)

    // Add rate limit headers to all responses
    response.headers.set('X-RateLimit-Limit', '5')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())

    if (rateLimitResult.isLimited) {
      // Rate limit exceeded - return 429 status
      const errorResponse = new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter!.toString()
          }
        }
      )

      return errorResponse
    }
  }

  // 2. Create Supabase client to refresh session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Protected Route Logic
  const isAuthRoute = request.nextUrl.pathname.startsWith('/account') ||
                      request.nextUrl.pathname.startsWith('/orders') ||
                      request.nextUrl.pathname.startsWith('/wishlist') ||
                      request.nextUrl.pathname.startsWith('/checkout')

  // Redirect unauthenticated users to login
  if (isAuthRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')

  // Redirect to account dashboard if user is logged in and accessing auth pages
  if (isAuthPage && user) {
     return NextResponse.redirect(new URL('/account/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
