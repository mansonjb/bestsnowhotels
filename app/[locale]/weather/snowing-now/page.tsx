import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { destinations } from '@/lib/destinations'
import { fetchManyWeather, freshSnowScore } from '@/lib/weather'
import { localizeCountry } from '@/lib/countryNames'
import WeatherCard from '@/components/WeatherCard'
import { SITE_URL, jsonLdGraph } from '@/lib/site'

export const revalidate = 1800

// Question-framed page targeting "where is it snowing right now" / "ou neige-t-il
// en ce moment" (we already rank ~#5 for these with tangential pages).
const T = {
  title: {
    en: 'Where is it snowing right now?',
    fr: 'Où neige-t-il en ce moment dans le monde ?',
    es: '¿Dónde está nevando ahora mismo?',
    pt: 'Onde está a nevar neste momento?',
    it: 'Dove sta nevicando in questo momento?',
  } as Record<Locale, string>,
  subtitle: {
    en: 'A live look at which ski resorts in the world have the most fresh snow on the slopes right now, ranked from real conditions and updated every 30 minutes.',
    fr: "Un aperçu en direct des stations de ski du monde qui ont le plus de neige fraîche sur les pistes en ce moment, classées d'après les conditions réelles et mises à jour toutes les 30 minutes.",
    es: 'Una mirada en directo a las estaciones de esquí del mundo con más nieve fresca en las pistas ahora mismo, ordenadas según las condiciones reales y actualizadas cada 30 minutos.',
    pt: 'Uma vista em direto das estâncias de esqui do mundo com mais neve fresca nas pistas neste momento, ordenadas pelas condições reais e atualizadas a cada 30 minutos.',
    it: 'Uno sguardo in tempo reale alle località sciistiche del mondo con più neve fresca sulle piste in questo momento, ordinate in base alle condizioni reali e aggiornate ogni 30 minuti.',
  } as Record<Locale, string>,
  answerSnowing: {
    en: 'Right now, the most fresh snow is falling at',
    fr: 'En ce moment, c\'est à',
    es: 'Ahora mismo, la mayor nevada cae en',
    pt: 'Neste momento, a maior queda de neve fresca é em',
    it: 'In questo momento, la maggiore nevicata fresca è a',
  } as Record<Locale, string>,
  answerSnowingTail: {
    en: '',
    fr: ' qu\'il neige le plus',
    es: '',
    pt: '',
    it: '',
  } as Record<Locale, string>,
  answerCalm: {
    en: 'No major snowfall worldwide right now. The deepest snow currently on the slopes is at',
    fr: "Pas de grosse chute de neige dans le monde en ce moment. La neige la plus profonde actuellement sur les pistes est à",
    es: 'Sin grandes nevadas en el mundo ahora mismo. La nieve más profunda actualmente en las pistas está en',
    pt: 'Sem grandes quedas de neve no mundo neste momento. A neve mais profunda atualmente nas pistas é em',
    it: 'Nessuna grande nevicata nel mondo in questo momento. La neve più profonda attualmente sulle piste è a',
  } as Record<Locale, string>,
} as const

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
  return {
    title: `${T.title[l]} | BestSnowHotels`,
    description: T.subtitle[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/weather/snowing-now`,
      languages: Object.fromEntries([
        ...locales.map((x) => [x, `${SITE_URL}/${x}/weather/snowing-now`]),
        ['x-default', `${SITE_URL}/en/weather/snowing-now`],
      ]),
    },
  }
}

export default async function SnowingNowPage({
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
    (a, b) => freshSnowScore(snapshots.get(b.slug)) - freshSnowScore(snapshots.get(a.slug)),
  )
  const top = ranked.slice(0, 24)
  const top3 = top.slice(0, 3)
  const isSnowing = freshSnowScore(snapshots.get(top[0]?.slug)) > 0
  const namesList = top3.map((d) => `${d.name} (${localizeCountry(d.country, l)})`).join(', ')
  const answer = isSnowing
    ? `${T.answerSnowing[l]} ${namesList}${T.answerSnowingTail[l]}.`
    : `${T.answerCalm[l]} ${namesList}.`

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
        { '@type': 'ListItem', position: 3, name: T.title[l], item: `${SITE_URL}/${l}/weather/snowing-now` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: T.title[l],
      description: T.subtitle[l],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <nav className="text-sm text-ice-700 mb-4">
          <Link href={`/${l}/weather`} className="hover:text-slate-deep">
            {dict.nav.weather}
          </Link>
          <span className="mx-2 text-ice-400">/</span>
          <span className="text-slate-deep">{T.title[l]}</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-ice-600 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
            {t.livePill}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {T.title[l]}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{T.subtitle[l]}</p>
        {/* Direct answer (GEO snippet), computed live from the top 3 */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-ice-50 to-white border border-ice-200 p-5 shadow-sm max-w-3xl">
          <p className="text-lg text-slate-deep leading-relaxed">{answer}</p>
        </div>
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
              highlight="fresh24h"
            />
          ))}
        </div>
      </section>

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
            className="inline-flex items-center gap-2 bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 rounded-full hover:border-ice-400 transition text-sm"
          >
            🌨️ {t.freshPowderTitle} →
          </Link>
          <Link
            href={`/${l}/weather/best-snow`}
            className="inline-flex items-center gap-2 bg-slate-deep text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ice-800 transition text-sm"
          >
            ❄️ {t.bestSnowTitle} →
          </Link>
        </div>
      </section>
    </>
  )
}
