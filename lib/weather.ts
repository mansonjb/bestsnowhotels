import 'server-only'
import type { Destination } from './destinations'

/**
 * Open-Meteo weather client for live snow + forecast data on every resort.
 *
 * Why Open-Meteo:
 * - Free, no API key, very generous limits (~10k requests/day)
 * - Snow-specific fields: snow_depth (m), snowfall (cm), freezing_level_height
 * - Reliable European coverage (ECMWF + MeteoFrance + DWD + Met Norway models)
 *
 * Caching: each fetch goes through Next.js's data cache with revalidate=1800
 * (30 minutes). At ISR rebuild time the cached response is reused across pages,
 * so the /weather index sharing data with /weather/[slug] costs zero extra calls.
 */

export interface WeatherSnapshot {
  /** ISO timestamp of the data point (resort-local time). */
  asOf: string
  /** Live conditions at the resort's lat/lng (effectively the village). */
  current: {
    tempC: number | null
    /** Snow on the ground, in centimetres. */
    snowDepthCm: number | null
    /** Snow falling right now (last hour), in centimetres. */
    snowfallLastHourCm: number | null
    /** WMO weather code, see lib/weatherCodes.ts. */
    weatherCode: number | null
    windSpeedKmh: number | null
  }
  /** Aggregates over the past 24h (yesterday end-of-day). */
  past24h: {
    snowfallCm: number
  }
  /** 7-day daily forecast, starting today (index 0). */
  forecast: ForecastDay[]
  /** Summed forecast snowfall, useful for sorting. */
  summary: {
    snowfall7dCm: number
  }
}

export interface ForecastDay {
  /** ISO date, e.g. 2026-12-15. */
  date: string
  tempMaxC: number | null
  tempMinC: number | null
  snowfallCm: number
  precipitationMm: number
  weatherCode: number | null
  windMaxKmh: number | null
}

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

/** Cache window for the underlying fetch, in seconds. 30 min keeps pages fresh
 *  without melting the API quota. */
const REVALIDATE_SECONDS = 1800

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

/** Snow depth in Open-Meteo is metres; we surface centimetres everywhere. */
function metresToCm(v: unknown): number | null {
  const n = num(v)
  return n == null ? null : Math.round(n * 100)
}

/**
 * Fetch live + 7-day weather for one resort. Returns null on any failure so the
 * UI can gracefully fall back to seasonal averages.
 */
export async function fetchWeather(d: Destination): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: String(d.lat),
    longitude: String(d.lng),
    current: 'temperature_2m,snowfall,snow_depth,weather_code,wind_speed_10m',
    daily:
      'temperature_2m_max,temperature_2m_min,snowfall_sum,weather_code,wind_speed_10m_max,precipitation_sum',
    past_days: '1',
    forecast_days: '7',
    timezone: 'auto',
  })

  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null

    const data = (await res.json()) as OpenMeteoResponse
    const current = data.current ?? {}
    const daily = data.daily ?? {}
    const times: string[] = Array.isArray(daily.time) ? daily.time : []

    // past_days=1 means times[0] is yesterday, times[1] is today, ...times[7] is +6 days.
    const yesterdaySnow = Number(daily.snowfall_sum?.[0] ?? 0)

    const forecast: ForecastDay[] = []
    for (let i = 1; i < times.length && forecast.length < 7; i++) {
      forecast.push({
        date: times[i],
        tempMaxC: num(daily.temperature_2m_max?.[i]),
        tempMinC: num(daily.temperature_2m_min?.[i]),
        snowfallCm: Number(daily.snowfall_sum?.[i] ?? 0),
        precipitationMm: Number(daily.precipitation_sum?.[i] ?? 0),
        weatherCode: num(daily.weather_code?.[i]),
        windMaxKmh: num(daily.wind_speed_10m_max?.[i]),
      })
    }

    return {
      asOf: typeof current.time === 'string' ? current.time : new Date().toISOString(),
      current: {
        tempC: num(current.temperature_2m),
        snowDepthCm: metresToCm(current.snow_depth),
        snowfallLastHourCm: num(current.snowfall),
        weatherCode: num(current.weather_code),
        windSpeedKmh: num(current.wind_speed_10m),
      },
      past24h: { snowfallCm: Number.isFinite(yesterdaySnow) ? yesterdaySnow : 0 },
      forecast,
      summary: {
        snowfall7dCm: forecast.reduce((acc, f) => acc + f.snowfallCm, 0),
      },
    }
  } catch {
    return null
  }
}

interface OpenMeteoResponse {
  current?: {
    time?: string
    temperature_2m?: number
    snowfall?: number
    snow_depth?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    snowfall_sum?: number[]
    weather_code?: number[]
    wind_speed_10m_max?: number[]
    precipitation_sum?: number[]
  }
}

/**
 * Fetch weather for many resorts in parallel, with bounded concurrency to be
 * polite to the upstream and survive transient rate-limits. Failures map to
 * null entries (kept in the map for "no data" UI states downstream).
 */
export async function fetchManyWeather(
  destinations: Destination[],
): Promise<Map<string, WeatherSnapshot | null>> {
  const out = new Map<string, WeatherSnapshot | null>()
  const CHUNK = 25
  for (let i = 0; i < destinations.length; i += CHUNK) {
    const batch = destinations.slice(i, i + CHUNK)
    const results = await Promise.all(batch.map((d) => fetchWeather(d)))
    for (let j = 0; j < batch.length; j++) {
      out.set(batch[j].slug, results[j])
    }
  }
  return out
}

/** Map a destination + its snapshot to a sortable score, biased to recent fall. */
export function freshSnowScore(s: WeatherSnapshot | null | undefined): number {
  if (!s) return -Infinity
  // 70% recent fall (last 24h), 30% upcoming 7d forecast
  return s.past24h.snowfallCm * 0.7 + s.summary.snowfall7dCm * 0.3
}

export function snowDepthScore(s: WeatherSnapshot | null | undefined): number {
  if (!s || s.current.snowDepthCm == null) return -Infinity
  return s.current.snowDepthCm
}
