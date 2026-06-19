import Link from 'next/link'
import Image from 'next/image'
import type { Destination } from '@/lib/destinations'
import type { WeatherSnapshot } from '@/lib/weather'
import type { Locale } from '@/app/[locale]/dictionaries'
import { localizeCountry } from '@/lib/countryNames'
import { weatherGlyph, weatherLabel } from '@/lib/weatherCodes'
import { formatSnowCm, formatTempC } from '@/lib/weatherContent'

export interface WeatherCardLabels {
  snowDepth: string
  freshSnow24h: string
  snowfall7d: string
  livePill: string
  noWeatherData: string
  viewFullForecast: string
}

interface Props {
  destination: Destination
  snapshot: WeatherSnapshot | null
  locale: Locale
  labels: WeatherCardLabels
  /** Highlight one of the snow stats (used by best-snow vs fresh-powder pages). */
  highlight?: 'snowDepth' | 'fresh24h' | 'snow7d'
}

export default function WeatherCard({
  destination: d,
  snapshot: s,
  locale,
  labels,
  highlight = 'snowDepth',
}: Props) {
  const depth = s?.current.snowDepthCm
  const fresh = s?.past24h.snowfallCm ?? 0
  const sevenDay = s?.summary.snowfall7dCm ?? 0
  const temp = s?.current.tempC
  const weatherCode = s?.current.weatherCode ?? null

  return (
    <Link
      href={`/${locale}/weather/${d.slug}`}
      className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={`/images/destinations/${d.slug}.jpg`}
          alt={d.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 via-slate-deep/20 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-ice-800">
          <span aria-hidden>{d.flag}</span>
          <span>{localizeCountry(d.country, locale)}</span>
        </div>

        {s && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-ice-600/95 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
            {labels.livePill}
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">{d.name}</h3>
          <p className="text-sm text-white/90 drop-shadow tabular-nums">
            {d.altitudeBase} - {d.altitudeSummit} m
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {s ? (
          <>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <Stat
                label={labels.snowDepth}
                value={formatSnowCm(depth ?? null, locale)}
                highlighted={highlight === 'snowDepth'}
              />
              <Stat
                label={labels.freshSnow24h}
                value={fresh > 0 ? `+${Math.round(fresh)} cm` : '0 cm'}
                highlighted={highlight === 'fresh24h'}
              />
              <Stat
                label={labels.snowfall7d}
                value={sevenDay > 0 ? `+${Math.round(sevenDay)} cm` : '0 cm'}
                highlighted={highlight === 'snow7d'}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-ice-100 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {weatherGlyph(weatherCode)}
                </span>
                <span className="text-ice-800">
                  {weatherLabel(weatherCode, locale)}
                </span>
              </div>
              <div className="font-semibold text-slate-deep tabular-nums">
                {formatTempC(temp ?? null)}
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-ice-600 py-3">{labels.noWeatherData}</div>
        )}

        <div className="text-sm font-semibold text-ice-700 group-hover:text-ice-900 group-hover:translate-x-0.5 transition">
          {labels.viewFullForecast} →
        </div>
      </div>
    </Link>
  )
}

function Stat({
  label,
  value,
  highlighted,
}: {
  label: string
  value: string
  highlighted?: boolean
}) {
  return (
    <div
      className={
        highlighted
          ? 'rounded-xl bg-ice-50 border border-ice-200 p-2'
          : 'p-2'
      }
    >
      <div className="text-ice-600 font-medium uppercase tracking-wide text-[10px]">
        {label}
      </div>
      <div className="mt-0.5 text-slate-deep font-bold tabular-nums">
        {value}
      </div>
    </div>
  )
}
