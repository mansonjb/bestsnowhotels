import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import {
  destinations,
  getDestination,
  getRelatedDestinations,
} from '@/lib/destinations'
import { fetchWeather } from '@/lib/weather'
import { compareToSeasonalAvg, formatSnowCm, formatTempC, formatWindKmh } from '@/lib/weatherContent'
import { weatherGlyph, weatherLabel } from '@/lib/weatherCodes'
import Forecast7Day from '@/components/Forecast7Day'
import WeatherCard from '@/components/WeatherCard'
import { SITE_URL, jsonLdGraph } from '@/lib/site'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { getSkiAreaForResort } from '@/lib/skiAreas'

/** ISR: regenerate every 30 minutes from Open-Meteo. */
export const revalidate = 1800

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const d of destinations) {
      params.push({ locale, slug: d.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(locale)) return {}
  const d = getDestination(slug)
  if (!d) return {}

  const countryEn = localizeCountry(d.country, 'en')
  const countryFr = localizeCountry(d.country, 'fr')
  const countryEs = localizeCountry(d.country, 'es')
  const countryPt = localizeCountry(d.country, 'pt')
  const countryIt = localizeCountry(d.country, 'it')

  const titles: Record<Locale, string> = {
    en: `${d.name} snow report and 7-day weather forecast (${countryEn}) | BestSnowHotels`,
    fr: `Bulletin neige et prévisions 7 jours à ${d.name} (${countryFr}) | BestSnowHotels`,
    es: `Parte de nieve y previsión 7 días en ${d.name} (${countryEs}) | BestSnowHotels`,
    pt: `Boletim de neve e previsão a 7 dias em ${d.name} (${countryPt}) | BestSnowHotels`,
    it: `Bollettino neve e previsioni a 7 giorni a ${d.name} (${countryIt}) | BestSnowHotels`,
  }
  const descriptions: Record<Locale, string> = {
    en: `Live snow report for ${d.name}: current snow depth, fresh snow over the last 24 hours and a 7-day forecast. Updated every 30 minutes.`,
    fr: `Bulletin neige en direct pour ${d.name} : hauteur de neige, neige tombée ces dernières 24 h et prévisions à 7 jours. Mise à jour toutes les 30 minutes.`,
    es: `Parte de nieve en directo de ${d.name}: altura de nieve, nieve nueva en las últimas 24 horas y previsión a 7 días. Actualizado cada 30 minutos.`,
    pt: `Boletim de neve em direto de ${d.name}: altura de neve, neve fresca nas últimas 24 horas e previsão a 7 dias. Atualizado a cada 30 minutos.`,
    it: `Bollettino neve in tempo reale di ${d.name}: altezza neve, neve fresca delle ultime 24 ore e previsioni a 7 giorni. Aggiornato ogni 30 minuti.`,
  }

  return {
    title: titles[locale as Locale],
    description: descriptions[locale as Locale],
    openGraph: {
      title: titles[locale as Locale],
      description: descriptions[locale as Locale],
      type: 'website',
      url: `${SITE_URL}/${locale}/weather/${d.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/weather/${d.slug}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [l, `${SITE_URL}/${l}/weather/${d.slug}`]),
        ['x-default', `${SITE_URL}/en/weather/${d.slug}`],
      ]),
    },
  }
}

export default async function ResortWeatherPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const d = getDestination(slug)
  if (!d) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const t = dict.weather
  const snap = await fetchWeather(d)
  const skiArea = getSkiAreaForResort(slug)
  const related = getRelatedDestinations(slug, 3)

  // Fetch related snapshots for the carousel at the bottom. Cached fetches mean
  // we usually pay nothing for them on a warm cycle.
  const relatedSnaps = await Promise.all(related.map((r) => fetchWeather(r)))

  const cmpAvg = compareToSeasonalAvg(d, snap)

  const formattedUpdate = snap
    ? new Date(snap.asOf).toLocaleString(localeForDateFns(l), {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      })
    : ''

  // JSON-LD: WebPage + BreadcrumbList + FAQPage
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${d.name} ${t.pageTitleResort}`,
      description: snap
        ? `Snow depth ${formatSnowCm(snap.current.snowDepthCm, 'en')}, fresh ${Math.round(snap.past24h.snowfallCm)} cm, forecast +${Math.round(snap.summary.snowfall7dCm)} cm over 7 days.`
        : undefined,
      dateModified: snap?.asOf,
      isPartOf: { '@type': 'WebSite', name: 'BestSnowHotels', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        {
          '@type': 'ListItem',
          position: 2,
          name: dict.nav.weather,
          item: `${SITE_URL}/${l}/weather`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: d.name,
          item: `${SITE_URL}/${l}/weather/${d.slug}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: t.faq1Q, acceptedAnswer: { '@type': 'Answer', text: t.faq1A } },
        { '@type': 'Question', name: t.faq2Q, acceptedAnswer: { '@type': 'Answer', text: t.faq2A } },
        { '@type': 'Question', name: t.faq3Q, acceptedAnswer: { '@type': 'Answer', text: t.faq3A } },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }}
      />

      {/* Hero with photo */}
      <section className="relative overflow-hidden border-b border-ice-100">
        <Image
          src={`/images/destinations/${d.slug}.jpg`}
          alt={`${d.name}, ${localizeRegion(d.region, l)}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/70 to-slate-deep/45" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <nav className="text-sm text-white/70 mb-5">
            <Link href={`/${l}`} className="hover:text-white">
              {dict.nav.home}
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href={`/${l}/weather`} className="hover:text-white">
              {dict.nav.weather}
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{d.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>
              {d.flag}
            </span>
            <span className="text-sm font-semibold text-white/85 uppercase tracking-wide">
              {localizeRegion(d.region, l)}
            </span>
            {snap && (
              <span className="inline-flex items-center gap-1.5 bg-ice-600/95 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
                {t.livePill}
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
            {d.name}
          </h1>
          <p className="mt-2 text-lg text-white/85">{t.pageTitleResort}</p>

          {snap && (
            <p className="mt-2 text-sm text-white/70">
              {t.asOf} · {formattedUpdate}
            </p>
          )}

          {/* Current conditions strip */}
          {snap ? (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ice-100 rounded-2xl overflow-hidden shadow-2xl shadow-slate-deep/40">
              <Stat
                label={t.snowDepth}
                value={formatSnowCm(snap.current.snowDepthCm, l)}
                emphasised
              />
              <Stat
                label={t.freshSnow24h}
                value={
                  snap.past24h.snowfallCm > 0
                    ? `+${Math.round(snap.past24h.snowfallCm)} cm`
                    : '0 cm'
                }
              />
              <Stat
                label={t.temperature}
                value={formatTempC(snap.current.tempC)}
              />
              <Stat
                label={t.sky}
                value={`${weatherGlyph(snap.current.weatherCode)} ${weatherLabel(
                  snap.current.weatherCode,
                  l,
                )}`}
              />
            </div>
          ) : (
            <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 text-sm text-slate-deep shadow-2xl">
              {t.noWeatherData}
            </div>
          )}

          {/* Comparison to seasonal average */}
          {cmpAvg && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm text-white">
              <span aria-hidden>📊</span>
              <span>
                {cmpAvg.pct > 5
                  ? t.aboveAvg.replace('{pct}', String(cmpAvg.pct))
                  : cmpAvg.pct < -5
                    ? t.belowAvg.replace('{pct}', String(Math.abs(cmpAvg.pct)))
                    : t.atAvg}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Part of ski area maillage */}
      {skiArea && (
        <div className="bg-ice-50 border-b border-ice-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              href={`/${l}/ski-areas/${skiArea.slug}`}
              className="group flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ice-600">
                {dict.skiAreas.partOf}
              </span>
              <span className="font-bold text-slate-deep">{skiArea.name}</span>
              <span className="font-semibold text-ice-700 group-hover:translate-x-0.5 transition">
                {dict.skiAreas.exploreArea} →
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      {snap && snap.forecast.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-slate-deep">
            {t.forecast7dTitle}
          </h2>
          <p className="mt-2 text-ice-800/80">{t.forecast7dSubtitle}</p>
          <div className="mt-6 bg-white border border-ice-100 rounded-2xl p-4 sm:p-6">
            <Forecast7Day forecast={snap.forecast} locale={l} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-ice-700">
            <span>
              {t.snowfall7d}:{' '}
              <span className="font-bold text-slate-deep tabular-nums">
                +{Math.round(snap.summary.snowfall7dCm)} cm
              </span>
            </span>
            {snap.current.windSpeedKmh != null && (
              <span>
                {t.wind}:{' '}
                <span className="font-bold text-slate-deep tabular-nums">
                  {formatWindKmh(snap.current.windSpeedKmh)}
                </span>
              </span>
            )}
          </div>
        </section>
      )}

      {/* Editorial context: who is this resort, why this matters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-lg text-ice-800/85 leading-relaxed max-w-3xl">
          {d.intro[l]}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/${l}/destinations/${d.slug}`}
            className="inline-block bg-slate-deep text-white font-semibold px-6 py-3 rounded-full hover:bg-ice-800 transition"
          >
            {t.backToResort} →
          </Link>
          {skiArea && (
            <Link
              href={`/${l}/ski-areas/${skiArea.slug}`}
              className="inline-block bg-white border border-ice-200 text-slate-deep font-semibold px-6 py-3 rounded-full hover:border-ice-400 transition"
            >
              {skiArea.name} →
            </Link>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{t.faqTitle}</h2>
        <div className="space-y-4">
          {[
            { q: t.faq1Q, a: t.faq1A },
            { q: t.faq2Q, a: t.faq2A },
            { q: t.faq3Q, a: t.faq3A },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-white border border-ice-100 rounded-2xl p-5"
            >
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex justify-between items-center">
                <span>{item.q}</span>
                <span className="text-ice-500 group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <p className="mt-3 text-ice-800/80 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related resorts weather */}
      {related.length > 0 && (
        <section className="bg-ice-50 border-t border-ice-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="text-2xl font-bold text-slate-deep mb-6">
              {dict.destination.relatedTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r, i) => (
                <WeatherCard
                  key={r.slug}
                  destination={r}
                  snapshot={relatedSnaps[i]}
                  locale={l}
                  labels={{
                    snowDepth: t.snowDepth,
                    freshSnow24h: t.freshSnow24h,
                    snowfall7d: t.snowfall7d,
                    livePill: t.livePill,
                    noWeatherData: t.noWeatherData,
                    viewFullForecast: t.viewFullForecast,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function Stat({
  label,
  value,
  emphasised,
}: {
  label: string
  value: string
  emphasised?: boolean
}) {
  return (
    <div className={`bg-white px-4 py-4 ${emphasised ? 'sm:px-6' : ''}`}>
      <div className="text-[11px] uppercase tracking-wide text-ice-600">{label}</div>
      <div
        className={`mt-1 font-bold text-slate-deep tabular-nums ${
          emphasised ? 'text-2xl' : 'text-base'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function localeForDateFns(l: Locale): string {
  if (l === 'fr') return 'fr-FR'
  if (l === 'es') return 'es-ES'
  if (l === 'pt') return 'pt-PT'
  if (l === 'it') return 'it-IT'
  return 'en-GB'
}
