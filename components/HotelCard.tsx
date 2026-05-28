import Image from 'next/image'
import type { Hotel } from '@/lib/hotels'

interface HotelCardProps {
  hotel: Hotel
  /** Stay22 Allez deep link, built by the page with the resort + country. */
  bookHref: string
  labels: {
    reviews: string
    checkAvailability: string
    toSlopes: string
  }
}

function priceTag(level: number | null): string {
  if (level == null || level <= 0) return ''
  return '€'.repeat(Math.min(level, 4))
}

function formatReviews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`
  return `${(m / 1000).toFixed(1)} km`
}

export default function HotelCard({ hotel, bookHref, labels }: HotelCardProps) {
  const price = priceTag(hotel.priceLevel)

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-ice-100 overflow-hidden card-hover">
      <div className="relative h-40 overflow-hidden">
        {hotel.hasPhoto ? (
          <Image
            src={`/images/hotels/${hotel.id}.jpg`}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ice-100 via-ice-200 to-ice-400">
            <div className="absolute inset-0 bg-snow-grain opacity-50" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
          <span className="text-amber-500 leading-none" aria-hidden>
            ★
          </span>
          <span className="text-slate-deep font-bold text-sm leading-none tabular-nums">
            {hotel.rating.toFixed(1)}
          </span>
          <span className="text-ice-500 text-xs leading-none tabular-nums">
            {formatReviews(hotel.reviewCount)}
          </span>
        </div>
        {price && (
          <div className="absolute top-3 right-3 bg-slate-deep/90 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold leading-none">
            {price}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-slate-deep leading-snug">{hotel.name}</h3>
        {hotel.distanceToSlopesM != null && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-ice-700">
            <span aria-hidden>⛷</span>
            <span className="tabular-nums">≈ {formatDistance(hotel.distanceToSlopesM)}</span>
            <span className="font-normal text-ice-600">{labels.toSlopes}</span>
          </p>
        )}
        <p className="mt-1 text-xs text-ice-600 line-clamp-2 flex-1">{hotel.address}</p>
        <a
          href={bookHref}
          target="_blank"
          rel="noopener sponsored"
          className="mt-4 block text-center bg-ice-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-ice-500 transition"
        >
          {labels.checkAvailability}
        </a>
      </div>
    </article>
  )
}
