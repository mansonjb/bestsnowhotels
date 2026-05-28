import type { Destination } from '@/lib/destinations'

export interface MonthSnow {
  month: string
  cm: number
}

// Relative snow-depth curve across the core winter months (peak in February).
const CURVE: { month: string; factor: number }[] = [
  { month: 'Dec', factor: 0.55 },
  { month: 'Jan', factor: 0.8 },
  { month: 'Feb', factor: 1.0 },
  { month: 'Mar', factor: 0.95 },
  { month: 'Apr', factor: 0.6 },
]

/**
 * Indicative average on-snow depth (cm, near the top of the resort) for the core
 * winter months. Derived from the snow score and summit altitude, not measured.
 * Shaped like the typical alpine season, peaking in February.
 */
export function snowByMonth(d: Destination): MonthSnow[] {
  const peak =
    Math.round(((d.snowScore / 100) * (0.6 + d.altitudeSummit / 4000) * 200) / 5) * 5
  return CURVE.map(({ month, factor }) => ({
    month,
    cm: Math.round((peak * factor) / 5) * 5,
  }))
}
