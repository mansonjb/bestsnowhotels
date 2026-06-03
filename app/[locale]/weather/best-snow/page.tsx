import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { destinations } from '@/lib/destinations'
import { fetchManyWeather, snowDepthScore } from '@/lib/weather'
import WeatherCard from '@/components/WeatherCard'
import { SITE_URL } from '@/lib/site'

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
    title: `${dict.weather.bestSnowTitle} | BestSnowHotels`,
    description: dict.weather.bestSnowSubtitle,
    alternates: {
      canonical: `${SITE_URL}/${l}/weather/best-snow`,
      languages: Object.fromEntries([
        ...locales.map((x) => [x, `${SITE_URL}/${x}/weather/best-snow`]),
        ['x-default', `${SITE_URL}/en/weather/best-snow`],
      ]),
    },
  }
}

export default async function BestSnowPage({
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

  const ranked = [...destinations].sort(
    (a, b) => snowDepthScore(snapshots.get(b.slug)) - snowDepthScore(snapshots.get(a.slug)),
  )
  const top = ranked.slice(0, 24)

  const cardLabels = {
    snowDepth: t.snowDepth,
    freshSnow24h: t.freshSnow24h,
    snowfall7d: t.snowfall7d,
    livePill: t.livePill,
    noWeatherData: t.noWeatherData,
    viewFullForecast: t.viewFullForecast,
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.weather, item: `${SITE_URL}/${l}/weather` },
        { '@type': 'ListItem', position: 3, name: t.bestSnowTitle, item: `${SITE_URL}/${l}/weather/best-snow` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t.bestSnowTitle,
      description: t.bestSnowSubtitle,
      itemListElement: top.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/weather/${d.slug}`,
        name: d.name,
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <nav className="text-sm text-ice-700 mb-4">
          <Link href={`/${l}/weather`} className="hover:text-slate-deep">
            {dict.nav.weather}
          </Link>
          <span className="mx-2 text-ice-400">/</span>
          <span className="text-slate-deep">{t.bestSnowTitle}</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-ice-600 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
            {t.livePill}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {t.bestSnowTitle}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{t.bestSnowSubtitle}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {top.map((d) => (
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

      {/* Cross-link */}
      <section className="bg-ice-50 border-t border-ice-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap gap-3">
          <Link
            href={`/${l}/weather`}
            className="inline-flex items-center gap-2 bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 rounded-full hover:border-ice-400 transition text-sm"
          >
            ← {dict.nav.weather}
          </Link>
          <Link
            href={`/${l}/weather/fresh-powder`}
            className="inline-flex items-center gap-2 bg-slate-deep text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ice-800 transition text-sm"
          >
            🌨️ {t.freshPowderTitle} →
          </Link>
        </div>
      </section>
    </>
  )
}
