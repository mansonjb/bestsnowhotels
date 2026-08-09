'use client'

import { useEffect } from 'react'

// Fires a GA4 `affiliate_click` event whenever a user clicks an affiliate/Book
// link, with the hotel/resort context read straight off the Stay22 "allez" URL
// (which already encodes hotelname + address + campaign). One delegated listener
// covers every CTA on the site, so no per-link wiring is needed.
//
// It reuses the same gtag that components/Analytics.tsx injects. When analytics
// is suppressed (bot geos, via the bsh_geo_block cookie) gtag is undefined and
// this simply no-ops, so bot clicks never pollute the funnel either. Stay22 map
// clicks live inside a cross-origin iframe and cannot be captured here.

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const AFFILIATE_HOSTS = ['stay22.com', 'booking.com', 'expedia.', 'hotels.com']

function partnerFromHost(host: string): string {
  if (host.includes('stay22')) return 'stay22'
  if (host.includes('booking')) return 'booking'
  if (host.includes('expedia')) return 'expedia'
  if (host.includes('hotels.com')) return 'hotels'
  return 'other'
}

function safeDecode(v: string | null): string {
  if (!v) return ''
  try {
    return decodeURIComponent(v.replace(/\+/g, ' '))
  } catch {
    return v
  }
}

export default function AffiliateTracker() {
  useEffect(() => {
    function handle(e: Event) {
      const target = e.target as Element | null
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      let url: URL
      try {
        url = new URL(href, window.location.origin)
      } catch {
        return
      }
      if (!AFFILIATE_HOSTS.some((h) => url.hostname.includes(h))) return

      const q = url.searchParams
      const seg = window.location.pathname.split('/').filter(Boolean)
      const params = {
        partner: partnerFromHost(url.hostname),
        // Stay22's letmeallez prepends its own auto campaign; our buildAllez
        // campaign ("destination", "hotel", "andes2026"...) is appended last.
        campaign: q.getAll('campaign').pop() || '',
        resort: safeDecode(q.get('address')), // "Resort Country"
        hotel: safeDecode(q.get('hotelname')) || '(no hotel)',
        placement: seg[1] || 'home', // page type: destinations, best, compare, weather...
        page_path: window.location.pathname,
        locale: seg[0] || '',
        link_text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'affiliate_click', params)
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(['event', 'affiliate_click', params])
      }
    }

    // Capture phase so we run before Stay22's letmeallez handlers; auxclick
    // catches middle-click / open-in-new-tab. We never preventDefault.
    document.addEventListener('click', handle, { capture: true })
    document.addEventListener('auxclick', handle, { capture: true })
    return () => {
      document.removeEventListener('click', handle, { capture: true })
      document.removeEventListener('auxclick', handle, { capture: true })
    }
  }, [])

  return null
}
