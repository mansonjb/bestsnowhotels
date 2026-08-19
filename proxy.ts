import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr', 'es', 'pt', 'it', 'nl', 'ja', 'zh-hk'] as const
export type Locale = (typeof locales)[number]
const defaultLocale: Locale = 'en'

// Analytics suppression by geo. GA4 + Clarity showed Singapore as a top
// "country" with sub-2s sessions and ~1% engagement: a datacenter scraper fleet
// spoofing user-agents, not a real market. But SG IS a genuine source market for
// ski trips to Japan (Niseko, Hakuba, Appi Kogen), so we do NOT 403 it: real SG
// visitors still browse and book. We only set a flag cookie the client reads to
// skip firing GA4/Clarity, so these bots stop polluting analytics while humans
// keep converting. Country comes from Vercel's x-vercel-ip-country header (null
// in local dev, so dev never gets the flag). Extend only for confirmed non-market
// bot sources. Kept out of any Server Component / headers() read on purpose, so
// the 455-resort ISR cache is never forced dynamic.
//
// We also suppress by CITY (Vercel x-vercel-ip-city) for datacenter hubs that sit
// inside an otherwise-real market: Council Bluffs, Iowa is a Google datacenter, so
// its traffic is crawler/datacenter bots, not real US skiers. Blocking the whole
// US country would be wrong, so we match the city and keep the rest of the US
// tracked. Compare in lowercase (city casing varies).
const NO_ANALYTICS_COUNTRIES = new Set(['SG'])
const NO_ANALYTICS_CITIES = new Set(['council bluffs'])
const GEO_BLOCK_COOKIE = 'bsh_geo_block'

// x-vercel-ip-city is URL-encoded (e.g. "Council%20Bluffs"); decode + lowercase
// for a robust compare. Absent in local dev, so dev is never flagged.
function blockedCity(request: NextRequest): boolean {
  const raw = request.headers.get('x-vercel-ip-city') ?? ''
  if (!raw) return false
  let city = raw
  try {
    city = decodeURIComponent(raw)
  } catch {
    // keep raw on malformed percent-encoding
  }
  return NO_ANALYTICS_CITIES.has(city.toLowerCase())
}

// Attach (or clear) the analytics-suppression cookie on a response, only when the
// desired state differs from what the client already has, so most responses carry
// no Set-Cookie at all.
function applyGeoCookie(request: NextRequest, response: NextResponse): NextResponse {
  const country = request.headers.get('x-vercel-ip-country') ?? ''
  const shouldBlock = NO_ANALYTICS_COUNTRIES.has(country) || blockedCity(request)
  const hasCookie = request.cookies.has(GEO_BLOCK_COOKIE)
  if (shouldBlock && !hasCookie) {
    response.cookies.set(GEO_BLOCK_COOKIE, '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false, // must be readable by the client analytics gate
      sameSite: 'lax',
    })
  } else if (!shouldBlock && hasCookie) {
    response.cookies.delete(GEO_BLOCK_COOKIE)
  }
  return response
}

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
  if (hasLocale) return applyGeoCookie(request, NextResponse.next())

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
  return applyGeoCookie(request, NextResponse.redirect(request.nextUrl, 307))
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)'],
}
