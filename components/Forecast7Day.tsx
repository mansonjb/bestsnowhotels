import type { ForecastDay } from '@/lib/weather'
import type { Locale } from '@/app/[locale]/dictionaries'
import { weatherGlyph, weatherLabel } from '@/lib/weatherCodes'
import { formatDayShort, formatSnowCm, formatTempRange } from '@/lib/weatherContent'

interface Props {
  forecast: ForecastDay[]
  locale: Locale
}

export default function Forecast7Day({ forecast, locale }: Props) {
  // For the snow bars: scale relative to the heaviest day so the chart reads at a glance.
  const maxSnow = Math.max(1, ...forecast.map((f) => f.snowfallCm))

  return (
    <ul className="divide-y divide-ice-100">
      {forecast.map((f) => {
        const snowPct = Math.round((f.snowfallCm / maxSnow) * 100)
        return (
          <li
            key={f.date}
            className="grid grid-cols-12 gap-3 items-center py-3 text-sm"
          >
            {/* Day */}
            <div className="col-span-2 font-semibold text-slate-deep">
              {formatDayShort(f.date, locale)}
            </div>

            {/* Sky */}
            <div className="col-span-4 flex items-center gap-2 text-ice-800">
              <span className="text-xl" aria-hidden>
                {weatherGlyph(f.weatherCode)}
              </span>
              <span>{weatherLabel(f.weatherCode, locale)}</span>
            </div>

            {/* Temp */}
            <div className="col-span-3 text-ice-800 tabular-nums">
              {formatTempRange(f.tempMinC, f.tempMaxC)}
            </div>

            {/* Snow + bar */}
            <div className="col-span-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-ice-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ice-500 rounded-full"
                  style={{ width: `${f.snowfallCm > 0 ? snowPct : 0}%` }}
                />
              </div>
              <div className="w-14 text-right text-slate-deep font-semibold tabular-nums">
                {f.snowfallCm >= 1
                  ? formatSnowCm(f.snowfallCm, locale)
                  : '-'}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
