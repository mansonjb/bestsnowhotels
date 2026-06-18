import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { openingBuckets } from '@/lib/openingPeriods'
import { localizeCountry } from '@/lib/countryNames'
import { formatSeasonRange } from '@/lib/dates'
import { resortSite } from '@/lib/resortLinks'
import { SITE_URL, hreflangFor } from '@/lib/site'

const T = {
  title: {
    en: 'Ski resort opening dates 2026-2027',
    fr: "Dates d'ouverture des stations de ski 2026-2027",
    es: 'Fechas de apertura de las estaciones de esquí 2026-2027',
    pt: 'Datas de abertura das estâncias de esqui 2026-2027',
    it: "Date di apertura delle località sciistiche 2026-2027",
  } as Record<Locale, string>,
  subtitle: {
    en: 'When does the season start? Resorts grouped by their typical opening window, from year-round glaciers to the December crowd, across both hemispheres.',
    fr: "Quand commence la saison ? Les stations regroupées par fenêtre d'ouverture typique, des glaciers ouverts toute l'année à la vague de décembre, dans les deux hémisphères.",
    es: '¿Cuándo empieza la temporada? Estaciones agrupadas por su ventana de apertura típica, de los glaciares abiertos todo el año a la oleada de diciembre, en ambos hemisferios.',
    pt: 'Quando começa a época? Estâncias agrupadas pela sua janela de abertura típica, dos glaciares abertos todo o ano à vaga de dezembro, nos dois hemisférios.',
    it: "Quando inizia la stagione? Località raggruppate per la loro tipica finestra di apertura, dai ghiacciai aperti tutto l'anno all'ondata di dicembre, in entrambi gli emisferi.",
  } as Record<Locale, string>,
  // Honesty disclaimer: these are indicative windows, not confirmed dates.
  disclaimer: {
    en: 'These are indicative windows based on recent seasons, not confirmed 2026-2027 dates. Most resorts only publish exact opening dates in the autumn, and early-season terrain depends on snowfall. Always confirm on the official resort site before you travel.',
    fr: "Ce sont des fenêtres indicatives, basées sur les saisons récentes, et non des dates 2026-2027 confirmées. La plupart des stations ne publient leurs dates exactes qu'à l'automne, et l'ouverture dépend de l'enneigement. Vérifiez toujours sur le site officiel de la station avant de partir.",
    es: 'Son ventanas indicativas basadas en temporadas recientes, no fechas confirmadas para 2026-2027. La mayoría de las estaciones solo publican las fechas exactas en otoño, y la apertura depende de la nieve. Confirma siempre en la web oficial de la estación antes de viajar.',
    pt: 'São janelas indicativas baseadas em épocas recentes, não datas confirmadas para 2026-2027. A maioria das estâncias só publica as datas exatas no outono, e a abertura depende da neve. Confirme sempre no site oficial da estância antes de viajar.',
    it: "Sono finestre indicative basate sulle stagioni recenti, non date confermate per il 2026-2027. La maggior parte delle località pubblica le date esatte solo in autunno, e l'apertura dipende dalla neve. Conferma sempre sul sito ufficiale della località prima di partire.",
  } as Record<Locale, string>,
  official: {
    en: 'Official site', fr: 'Site officiel', es: 'Web oficial', pt: 'Site oficial', it: 'Sito ufficiale',
  } as Record<Locale, string>,
  typicalSeason: {
    en: 'Typical season', fr: 'Saison habituelle', es: 'Temporada habitual', pt: 'Época habitual', it: 'Stagione abituale',
  } as Record<Locale, string>,
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${T.title[l]} | BestSnowHotels`,
    description: T.subtitle[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/opening-dates`,
      languages: hreflangFor('/opening-dates'),
    },
  }
}

export default async function OpeningDatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const buckets = openingBuckets()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: T.title[l], item: `${SITE_URL}/${l}/opening-dates` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <nav className="text-xs text-ice-800/70 mb-3 flex items-center gap-2">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span aria-hidden>/</span>
          <span>{T.title[l]}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{T.title[l]}</h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{T.subtitle[l]}</p>

        {/* Honesty disclaimer, prominent */}
        <p className="mt-5 max-w-3xl text-sm text-ice-700/90 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {T.disclaimer[l]}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {buckets.map((bucket) => (
          <section key={bucket.id}>
            <h2 className="text-2xl font-bold text-slate-deep">{bucket.label[l]}</h2>
            <p className="mt-1 text-ice-800/75 max-w-3xl">{bucket.blurb[l]}</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bucket.resorts.map((d) => {
                const site = resortSite(d.slug)
                return (
                  <div
                    key={d.slug}
                    className="bg-white rounded-xl border border-ice-100 p-4 flex flex-col"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/${l}/destinations/${d.slug}`}
                        className="font-bold text-slate-deep hover:text-alpenglow-700"
                      >
                        {d.name}
                      </Link>
                      <span className="text-xs text-ice-500 shrink-0">{localizeCountry(d.country, l)}</span>
                    </div>
                    <div className="mt-2 text-sm text-ice-700">
                      <span className="text-[11px] uppercase tracking-wide text-ice-500">
                        {T.typicalSeason[l]}
                      </span>
                      <div className="font-medium tabular-nums text-slate-deep">
                        {formatSeasonRange(d.seasonStart, d.seasonEnd, l)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <Link
                        href={`/${l}/weather/${d.slug}`}
                        className="text-ice-600 hover:text-slate-deep"
                      >
                        {dict.weather.pageTitleResort}
                      </Link>
                      {site && (
                        <a
                          href={site}
                          target="_blank"
                          rel="noopener"
                          className="text-ice-600 hover:text-slate-deep"
                        >
                          {T.official[l]} →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
