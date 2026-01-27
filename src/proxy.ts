import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/settings',
    '/projects',
    '/locations',
    '/onboarding',
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup']

// Public routes that don't require auth check
const PUBLIC_ROUTES = [
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/share',
    '/invite',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for API routes, static files
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Check for Better Auth session cookie
    // Better Auth uses 'better-auth.session_token' cookie by default
    const sessionCookie = request.cookies.get('better-auth.session_token')
    const hasSession = !!sessionCookie?.value

    // Check if route is public (no auth required)
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        pathname.startsWith(route)
    )

    // Allow access to public routes
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    )

    // Check if route is an auth route (login/signup)
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

    // Redirect to login if not authenticated on protected routes
    if (isProtectedRoute && !hasSession) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from login/signup
    // COMMENTED OUT TO PREVENT REDIRECT LOOP
    /*
    if (isAuthRoute && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    */

    // Add security headers to response
    const response = NextResponse.next()

    // HSTS header (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        )
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
