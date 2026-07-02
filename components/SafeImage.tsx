'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/**
 * A resilient drop-in for next/image. If Vercel's image optimizer hiccups
 * (transient 500s under burst, monthly transform limits), the optimized
 * request can fail and the browser shows an ugly broken-image glyph. This
 * degrades gracefully in two steps instead:
 *   1. optimizer fails  -> retry the raw static file directly (photo still shows)
 *   2. raw file missing  -> a soft on-brand snow gradient, never a broken glyph
 * Use it for the photographic fill-images on cards and heroes.
 */
export default function SafeImage(props: ImageProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0)
  const { className, fill, alt, src } = props
  const srcStr = typeof src === 'string' ? src : ''

  if (stage === 2 || !srcStr) {
    return (
      <div
        aria-hidden
        className={`${fill ? 'absolute inset-0 ' : ''}bg-gradient-to-br from-ice-200 via-ice-100 to-frost flex items-center justify-center ${className ?? ''}`}
      >
        <span className="text-4xl text-ice-300 select-none">❄</span>
      </div>
    )
  }

  if (stage === 1) {
    // Bypass the optimizer and serve the committed static file directly.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={srcStr}
        alt={typeof alt === 'string' ? alt : ''}
        className={className}
        onError={() => setStage(2)}
        style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : undefined}
      />
    )
  }

  return <Image {...props} onError={() => setStage(1)} />
}
