import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr', 'es', 'pt', 'it'] as const
export type Locale = (typeof locales)[number]
const defaultLocale: Locale = 'en'

function getLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const preferred = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase()
  return locales.includes(preferred as Locale) ? (preferred as Locale) : defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )
  if (hasLocale) return

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.\w+$/.test(pathname)
  )
    return

  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  // 307 (temporary), not 308: the target depends on Accept-Language, so
  // browsers + CDNs must not cache the redirect as permanent; otherwise a
  // shared device or shared CDN edge serves the first user's locale to
  // everyone after.
  return NextResponse.redirect(request.nextUrl, 307)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
}
