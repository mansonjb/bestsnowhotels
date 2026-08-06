'use client'

import { useEffect } from 'react'

// Analytics loader, gated on the geo-suppression cookie set by proxy.ts.
// When a visitor's country is in NO_ANALYTICS_COUNTRIES (currently Singapore:
// a datacenter scraper fleet), the edge sets bsh_geo_block=1 and we skip firing
// GA4 + Clarity for that request, so those bots never reach analytics. Everyone
// else (including real SG humans, who still browse and book) is tracked as usual.
// Injected client-side on mount rather than as server <Script> tags so that
// reading the cookie never forces the 455-resort ISR cache to render dynamically.

const GA_ID = 'G-L8WQTP6VZ8'
const CLARITY_ID = 'x1fb3rw1u5'

export default function Analytics() {
  useEffect(() => {
    const blocked = document.cookie
      .split('; ')
      .some((c) => c === 'bsh_geo_block=1')
    if (blocked) return

    // Google Analytics 4 (gtag.js loader + inline init, verbatim the canonical
    // snippet so behaviour matches a standard GA4 install).
    const gaLoader = document.createElement('script')
    gaLoader.async = true
    gaLoader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(gaLoader)

    const gaInit = document.createElement('script')
    gaInit.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`
    document.head.appendChild(gaInit)

    // Microsoft Clarity (session recordings + heatmaps).
    const clarity = document.createElement('script')
    clarity.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`
    document.head.appendChild(clarity)
  }, [])

  return null
}
