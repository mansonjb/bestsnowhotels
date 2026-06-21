import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from './dictionaries'
import type { Locale } from './dictionaries'
import Hero from '@/components/Hero'
import DestinationCard from '@/components/DestinationCard'
import { destinations, getDestinationsByCountry } from '@/lib/destinations'
import { SITE_URL } from '@/lib/site'
import { localizeCountry } from '@/lib/countryNames'

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

  const titles: Record<Locale, string> = {
    en: 'Ski-in/ski-out hotels: the 417 best snow resorts in Europe | BestSnowHotels',
    fr: 'Hôtels ski-in/ski-out : les 417 meilleures stations de ski d\'Europe | BestSnowHotels',
    es: 'Hoteles ski-in/ski-out : las 417 mejores estaciones de esquí de Europa | BestSnowHotels',
    pt: 'Hotéis ski-in/ski-out: as 417 melhores estâncias de esqui da Europa | BestSnowHotels',
    it: 'Hotel ski-in/ski-out: le 417 migliori località sciistiche d\'Europa | BestSnowHotels',
  }
  const descriptions: Record<Locale, string> = {
    en: 'Browse 417 hand-picked ski resorts in the Alps and Pyrenees with verified ski-in/ski-out hotels. Live maps powered by Stay22 and the best prices across Booking, Expedia and Hotels.com.',
    fr: 'Parcourez 417 stations triées sur le volet dans les Alpes et les Pyrénées, avec des hôtels ski-in/ski-out vérifiés. Cartes en direct grâce à Stay22 et les meilleurs prix sur Booking, Expedia et Hotels.com.',
    es: 'Explora 417 estaciones de esquí cuidadosamente seleccionadas en los Alpes y los Pirineos, con hoteles ski-in/ski-out verificados. Mapas en directo gracias a Stay22 y los mejores precios en Booking, Expedia y Hotels.com.',
    pt: 'Percorra 417 estâncias de esqui cuidadosamente escolhidas nos Alpes e nos Pirenéus, com hotéis ski-in/ski-out verificados. Mapas em directo graças à Stay22 e os melhores preços no Booking, na Expedia e no Hotels.com.',
    it: 'Esplora 417 località sciistiche scelte sulle Alpi e sui Pirenei, con hotel ski-in/ski-out verificati. Mappe in tempo reale con Stay22 e i migliori prezzi tra Booking, Expedia e Hotels.com.',
  }

  return {
    title: titles[locale as Locale],
    description: descriptions[locale as Locale],
    openGraph: {
      title: titles[locale as Locale],
      description: descriptions[locale as Locale],
      type: 'website',
      url: `${SITE_URL}/${locale}`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        fr: `${SITE_URL}/fr`,
        es: `${SITE_URL}/es`,
        pt: `${SITE_URL}/pt`,
        it: `${SITE_URL}/it`,
        'x-default': `${SITE_URL}/en`,
      },
    },
  }
}

// Top picks for the homepage, handpicked by snow score and notoriety.
const TOP_SLUGS = [
  'val-thorens',
  'zermatt',
  'st-anton',
  'val-d-isere',
  'verbier',
  'courchevel',
  'cervinia',
  'baqueira-beret',
  'lech-zurs',
  'saas-fee',
  'grandvalira',
  'cortina-d-ampezzo',
]

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const topPicks = TOP_SLUGS.map((s) => destinations.find((d) => d.slug === s)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d),
  )

  const byCountry = getDestinationsByCountry()

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BestSnowHotels',
    alternateName: 'BestSnowHotels.com',
    url: SITE_URL,
    description: '417 ski-in/ski-out resorts in the Alps and Pyrenees with verified altitudes, snow data and best-price hotel maps.',
    inLanguage: ['en', 'fr', 'es', 'pt', 'it'],
    publisher: { '@type': 'Organization', name: 'BestSnowHotels', url: SITE_URL },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Hero locale={locale as Locale} dict={dict} />

      {/* Top destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-deep tracking-tight">
            {dict.home.topTitle}
          </h2>
          <p className="mt-3 text-ice-800/80 leading-relaxed">
            {dict.home.topSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {topPicks.map((d) => (
            <DestinationCard
              key={d.slug}
              destination={d}
              locale={locale as Locale}
              labels={cardLabels}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/destinations`}
            className="inline-block text-ice-700 font-semibold hover:text-slate-deep"
          >
            {dict.destinations.title} →
          </Link>
        </div>
      </section>

      {/* Explore by theme (internal hubs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-deep mb-6">
          {({ en: 'Explore by theme', fr: 'Explorer par thème', es: 'Explora por tema', pt: 'Explore por tema', it: 'Esplora per tema' } as Record<Locale, string>)[locale]}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: `/${locale}/guides`, label: dict.nav.guides, emoji: '📋' },
            { href: `/${locale}/winter-2027`, label: ({ en: 'Winter 2027', fr: 'Hiver 2027', es: 'Invierno 2027', pt: 'Inverno 2027', it: 'Inverno 2027' } as Record<Locale, string>)[locale], emoji: '🗓️' },
            { href: `/${locale}/ski-in-ski-out`, label: dict.nav.skiInSkiOut, emoji: '🎿' },
            { href: `/${locale}/best`, label: dict.nav.best, emoji: '🏆' },
            { href: `/${locale}/compare`, label: dict.nav.compare, emoji: '⚖️' },
            { href: `/${locale}/when`, label: dict.nav.when, emoji: '❄️' },
          ].map((h) => (
            <Link key={h.href} href={h.href} className="card-hover flex items-center gap-3 bg-white rounded-2xl border border-ice-100 px-5 py-4 font-semibold text-slate-deep">
              <span className="text-xl" aria-hidden>{h.emoji}</span>
              <span>{h.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* By country */}
      <section className="bg-ice-50 border-y border-ice-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-deep tracking-tight">
              {dict.home.byCountryTitle}
            </h2>
            <p className="mt-3 text-ice-800/80">{dict.home.byCountrySubtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from(byCountry.entries()).map(([country, list]) => (
              <Link
                key={country}
                href={`/${locale}/countries/${country.toLowerCase()}`}
                className="bg-white rounded-2xl border border-ice-100 p-5 text-center card-hover block"
              >
                <div className="text-3xl" aria-hidden>
                  {list[0].flag}
                </div>
                <div className="mt-2 font-semibold text-slate-deep">
                  {localizeCountry(country, locale as Locale)}
                </div>
                <div className="text-xs text-ice-700">
                  {list.length} {list.length === 1 ? dict.destinations.resort : dict.destinations.resorts}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mb-12 text-center mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-deep tracking-tight">
            {dict.home.howTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: dict.home.howStep1Title, x: dict.home.howStep1Text, n: '01' },
            { t: dict.home.howStep2Title, x: dict.home.howStep2Text, n: '02' },
            { t: dict.home.howStep3Title, x: dict.home.howStep3Text, n: '03' },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-white rounded-2xl border border-ice-100 p-6"
            >
              <div className="text-ice-400 font-bold text-xs tracking-widest">
                {dict.home.stepLabel} {s.n}
              </div>
              <h3 className="mt-2 font-bold text-lg text-slate-deep">{s.t}</h3>
              <p className="mt-2 text-sm text-ice-800/80 leading-relaxed">{s.x}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this site exists */}
      <section className="bg-slate-deep text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {dict.home.trustTitle}
          </h2>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            {dict.home.trustText}
          </p>
          <div className="mt-8">
            <Link
              href={`/${locale}/destinations`}
              className="inline-block bg-white text-slate-deep font-semibold px-8 py-3.5 rounded-full hover:bg-ice-100 transition"
            >
              {dict.hero.cta} →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
