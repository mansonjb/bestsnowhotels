import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { destinations } from '@/lib/destinations'
import { fetchManyWeather, freshSnowScore, snowDepthScore } from '@/lib/weather'
import WeatherCard from '@/components/WeatherCard'
import { SITE_URL } from '@/lib/site'
import { localizeCountry } from '@/lib/countryNames'
import { formatSnowCm } from '@/lib/weatherContent'

/** ISR: top of the funnel; regenerate every 30 minutes. */
export const revalidate = 1800

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(locale)) return {}
  const l = locale as Locale
  const dict = await getDictionary(l)
  return {
    title: `${dict.weather.title} | BestSnowHotels`,
    description: dict.weather.subtitle,
    alternates: {
      canonical: `${SITE_URL}/${l}/weather`,
      languages: Object.fromEntries([
        ...locales.map((x) => [x, `${SITE_URL}/${x}/weather`]),
        ['x-default', `${SITE_URL}/en/weather`],
      ]),
    },
  }
}

export default async function WeatherIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const t = dict.weather
  const snapshots = await fetchManyWeather(destinations)

  // Sort by best snow on the slopes (snow depth). Fall back: snow score from data,
  // so resorts with no live data still appear in a sensible order at the bottom.
  const sorted = [...destinations].sort((a, b) => {
    const sa = snapshots.get(a.slug)
    const sb = snapshots.get(b.slug)
    const da = snowDepthScore(sa)
    const db = snowDepthScore(sb)
    if (db !== da) return db - da
    return b.snowScore - a.snowScore
  })

  const TOP = 24
  const featured = sorted.slice(0, TOP)
  const rest = sorted.slice(TOP)

  // Fresh-powder shortlist (sort by 24h + 7d forecast).
  const freshSorted = [...destinations].sort(
    (a, b) => freshSnowScore(snapshots.get(b.slug)) - freshSnowScore(snapshots.get(a.slug)),
  )
  const freshFeatured = freshSorted.slice(0, 6)

  const cardLabels = {
    snowDepth: t.snowDepth,
    freshSnow24h: t.freshSnow24h,
    snowfall7d: t.snowfall7d,
    livePill: t.livePill,
    noWeatherData: t.noWeatherData,
    viewFullForecast: t.viewFullForecast,
  }

  // JSON-LD ItemList for the live ranking.
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    description: t.subtitle,
    numberOfItems: featured.length,
    itemListElement: featured.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${l}/weather/${d.slug}`,
      name: d.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-ice-600 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
            {t.livePill}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {t.title}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{t.subtitle}</p>

        {/* Quick-jump curated pages */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${l}/weather/best-snow`}
            className="inline-flex items-center gap-2 bg-slate-deep text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ice-800 transition text-sm"
          >
            ❄️ {t.bestSnowTitle}
          </Link>
          <Link
            href={`/${l}/weather/fresh-powder`}
            className="inline-flex items-center gap-2 bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 rounded-full hover:border-ice-400 transition text-sm"
          >
            🌨️ {t.freshPowderTitle}
          </Link>
        </div>
      </section>

      {/* Top 24 by snow depth */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-1">
          {t.bestSnowTitle}
        </h2>
        <p className="text-ice-800/80 mb-6">{t.bestSnowSubtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featured.map((d) => (
            <WeatherCard
              key={d.slug}
              destination={d}
              snapshot={snapshots.get(d.slug) ?? null}
              locale={l}
              labels={cardLabels}
              highlight="snowDepth"
            />
          ))}
        </div>
      </section>

      {/* Fresh powder strip */}
      <section className="bg-ice-50 border-y border-ice-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-deep">
                {t.freshPowderTitle}
              </h2>
              <p className="mt-1 text-ice-800/80">{t.freshPowderSubtitle}</p>
            </div>
            <Link
              href={`/${l}/weather/fresh-powder`}
              className="text-sm font-semibold text-ice-700 hover:text-slate-deep"
            >
              {dict.best.exploreList} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {freshFeatured.map((d) => (
              <WeatherCard
                key={d.slug}
                destination={d}
                snapshot={snapshots.get(d.slug) ?? null}
                locale={l}
                labels={cardLabels}
                highlight="fresh24h"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Compact list of remaining resorts (text-only, lightweight, indexable) */}
      {rest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-slate-deep mb-6">
            {dict.destinations.title}
          </h2>
          <div className="bg-white border border-ice-100 rounded-2xl overflow-hidden">
            <ul className="divide-y divide-ice-100">
              {rest.map((d) => {
                const s = snapshots.get(d.slug)
                const depth = s?.current.snowDepthCm
                return (
                  <li key={d.slug}>
                    <Link
                      href={`/${l}/weather/${d.slug}`}
                      className="grid grid-cols-12 gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 hover:bg-ice-50 transition text-sm"
                    >
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-2 min-w-0">
                        <span aria-hidden>{d.flag}</span>
                        <span className="font-semibold text-slate-deep truncate">
                          {d.name}
                        </span>
                        <span className="text-xs text-ice-600 hidden sm:inline truncate">
                          {localizeCountry(d.country, l)}
                        </span>
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-ice-700 tabular-nums text-xs sm:text-sm">
                        {d.altitudeBase} - {d.altitudeSummit} m
                      </div>
                      <div className="col-span-2 sm:col-span-2 font-bold text-slate-deep tabular-nums text-right">
                        {formatSnowCm(depth ?? null, l)}
                      </div>
                      <div className="col-span-1 sm:col-span-2 text-right text-ice-500">→</div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
