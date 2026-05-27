'use client'

import { buildStay22MapSrc } from '@/lib/site'

interface Stay22MapProps {
  lat: number
  lng: number
  destName: string
  /** Map height in px, default 480 */
  height?: number
  /** Map zoom, default 13 */
  zoom?: number
}

/**
 * Stay22 interactive hotel map for a ski destination.
 *
 * The map shows hotels and apartments around the resort coordinates, with prices
 * live-fetched from Booking / Expedia / Hotels.com. The letmeallez script injected
 * in the locale layout auto-upgrades every link with our affiliate ID.
 */
export default function Stay22Map({
  lat,
  lng,
  destName,
  height = 480,
  zoom = 13,
}: Stay22MapProps) {
  const src = buildStay22MapSrc(lat, lng, zoom)

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-ice-200 shadow-sm">
      <iframe
        src={src}
        title={`Ski-in/ski-out hotels in ${destName}`}
        width="100%"
        height={height}
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
