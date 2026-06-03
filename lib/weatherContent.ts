import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import type { WeatherSnapshot } from './weather'
import { snowByMonth } from './snow'

/** "12 cm", "1.2 m", "1,2 m" depending on locale and magnitude. */
export function formatSnowCm(cm: number | null, locale: Locale): string {
  if (cm == null) return '-'
  if (cm < 100) return `${Math.round(cm)} cm`
  const metres = cm / 100
  // Romance locales use comma decimal; English uses period.
  const decimal = locale === 'en' ? metres.toFixed(1) : metres.toFixed(1).replace('.', ',')
  return `${decimal} m`
}

/** Round to whole degrees and append the unit. */
export function formatTempC(t: number | null): string {
  if (t == null) return '-'
  return `${Math.round(t)}°C`
}

/** Range like "-8 / -2°C" with locale-appropriate dash (no en-dash). */
export function formatTempRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return '-'
  const lo = min == null ? '?' : Math.round(min)
  const hi = max == null ? '?' : Math.round(max)
  return `${lo} / ${hi}°C`
}

export function formatWindKmh(v: number | null): string {
  if (v == null) return '-'
  return `${Math.round(v)} km/h`
}

const DAY_NAMES: Record<Locale, string[]> = {
  // Sunday-first to match Date.getDay()
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  fr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  es: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  pt: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  it: ['dom.', 'lun.', 'mar.', 'mer.', 'gio.', 'ven.', 'sab.'],
}

/** Parse a yyyy-mm-dd ISO date as a local-time Date (no UTC drift). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((s) => Number(s))
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "Mon 15 Dec" / "lun. 15 déc." style, short and scannable. */
export function formatDayShort(iso: string, locale: Locale): string {
  const d = parseLocalDate(iso)
  const dayName = DAY_NAMES[locale][d.getDay()]
  const day = d.getDate()
  return `${dayName} ${day}`
}

/**
 * Compare the live snow depth to the season's seasonal average for the current
 * month, returning a percentage diff for the "% vs average" badge. Null when we
 * are off-season or the snapshot has no usable snow depth.
 */
export function compareToSeasonalAvg(
  d: Destination,
  snap: WeatherSnapshot | null,
): { pct: number; monthCm: number } | null {
  if (!snap || snap.current.snowDepthCm == null || snap.current.snowDepthCm <= 0) return null

  const month = parseLocalDate(snap.asOf.slice(0, 10)).getMonth() // 0-11
  // snowByMonth covers Dec(11), Jan(0), Feb(1), Mar(2), Apr(3). Off-season returns null.
  const monthMap: Record<number, string> = { 11: 'Dec', 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr' }
  const key = monthMap[month]
  if (!key) return null

  const seasonal = snowByMonth(d).find((m) => m.month === key)
  if (!seasonal || seasonal.cm <= 0) return null

  const pct = Math.round(((snap.current.snowDepthCm - seasonal.cm) / seasonal.cm) * 100)
  return { pct, monthCm: seasonal.cm }
}
