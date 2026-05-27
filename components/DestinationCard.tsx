import Link from 'next/link'
import type { Destination } from '@/lib/destinations'
import type { Locale } from '@/app/[locale]/dictionaries'

interface DestinationCardProps {
  destination: Destination
  locale: Locale
  labels: {
    altitude: string
    pistes: string
    snowScore: string
    viewHotels: string
  }
}

export default function DestinationCard({
  destination: d,
  locale,
  labels,
}: DestinationCardProps) {
  return (
    <Link
      href={`/${locale}/destinations/${d.slug}`}
      className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
    >
      <div className="relative h-44 bg-gradient-to-br from-ice-100 via-ice-200 to-ice-400 overflow-hidden">
        <div className="absolute inset-0 bg-snow-grain opacity-50" />
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-ice-800">
          <span aria-hidden>{d.flag}</span>
          <span>{d.country}</span>
        </div>
        <div className="absolute top-3 right-3 bg-slate-deep/90 text-white rounded-full px-3 py-1 text-xs font-bold tabular-nums">
          {d.altitudeSummit.toLocaleString()} m
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-sm">{d.name}</h3>
          <p className="text-sm text-white/90 drop-shadow-sm">{d.region}</p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-ice-600 font-medium uppercase tracking-wide">
              {labels.altitude}
            </div>
            <div className="text-slate-deep font-semibold tabular-nums">
              {d.altitudeBase}–{d.altitudeSummit} m
            </div>
          </div>
          <div>
            <div className="text-ice-600 font-medium uppercase tracking-wide">
              {labels.pistes}
            </div>
            <div className="text-slate-deep font-semibold tabular-nums">
              {d.pistesKm} km
            </div>
          </div>
          <div>
            <div className="text-ice-600 font-medium uppercase tracking-wide">
              {labels.snowScore}
            </div>
            <div className="text-slate-deep font-semibold tabular-nums">
              {d.snowScore}/100
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-ice-100">
          <div className="flex flex-wrap gap-1">
            {d.vibes.slice(0, 2).map((v) => (
              <span
                key={v}
                className="inline-block text-[10px] font-medium uppercase tracking-wide text-ice-700 bg-ice-50 px-2 py-0.5 rounded-full"
              >
                {v}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-ice-700 group-hover:text-ice-900 group-hover:translate-x-0.5 transition">
            {labels.viewHotels} →
          </span>
        </div>
      </div>
    </Link>
  )
}
