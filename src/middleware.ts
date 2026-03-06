import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const PROTECTED_ROUTES = ['/dashboard', '/settings', '/projects', '/locations', '/onboarding']

const localePattern = new RegExp(`^/(${routing.locales.join('|')})`)

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const withoutLocale = pathname.replace(localePattern, '') || '/'

    const isProtected = PROTECTED_ROUTES.some(
        (r) => withoutLocale === r || withoutLocale.startsWith(r + '/')
    )

    if (isProtected) {
        const sessionCookie = request.cookies.get('better-auth.session_token')
        if (!sessionCookie?.value) {
            const localeMatch = pathname.match(localePattern)
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale
            const loginUrl = new URL(`/${locale}/login`, request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return intlMiddleware(request)
}

export const config = {
    matcher: [
        // Match all paths except: API routes, Next.js internals, static files
        '/((?!api|_next/static|_next/image|icons|images|manifest\\.webmanifest|manifest\\.json|sw\\.js|workbox-.+\\.js|favicon\\.ico).*)',
    ],
}
