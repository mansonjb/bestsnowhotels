import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from './dictionaries'
import type { Locale } from './dictionaries'
import Hero from '@/components/Hero'
import DestinationCard from '@/components/DestinationCard'
import { destinations, getDestinationsByCountry } from '@/lib/destinations'
import { SITE_URL } from '@/lib/site'

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
    en: 'Ski-in/ski-out hotels: 41 best snow resorts across Europe | BestSnowHotels',
    fr: 'Hôtels ski-in/ski-out : 41 meilleures stations enneigées d\'Europe | BestSnowHotels',
    es: 'Hoteles ski-in/ski-out: 41 mejores estaciones nevadas de Europa | BestSnowHotels',
    pt: 'Hotéis ski-in/ski-out: 41 melhores estâncias nevadas da Europa | BestSnowHotels',
  }
  const descriptions: Record<Locale, string> = {
    en: 'Browse 41 hand-picked ski resorts in the Alps and Pyrenees with verified ski-in/ski-out hotels. Live maps powered by Stay22, best prices across Booking, Expedia and Hotels.com.',
    fr: 'Parcourez 41 stations triées sur le volet dans les Alpes et les Pyrénées avec hôtels ski-in/ski-out vérifiés. Cartes en direct par Stay22, meilleurs prix sur Booking, Expedia et Hotels.com.',
    es: 'Explora 41 estaciones de esquí seleccionadas en los Alpes y los Pirineos con hoteles ski-in/ski-out verificados. Mapas en vivo de Stay22, mejores precios en Booking, Expedia y Hotels.com.',
    pt: 'Explore 41 estâncias de esqui selecionadas nos Alpes e Pirenéus com hotéis ski-in/ski-out verificados. Mapas em direto Stay22, melhores preços em Booking, Expedia e Hotels.com.',
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
        'x-default': `${SITE_URL}/en`,
      },
    },
  }
}

// Top picks for the homepage — handpicked by snow score and notoriety.
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
    description: '41 ski-in/ski-out resorts in the Alps and Pyrenees with verified altitudes, snow data and best-price hotel maps.',
    inLanguage: ['en', 'fr', 'es', 'pt'],
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

      {/* By country */}
      <section className="bg-ice-50 border-y border-ice-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-deep tracking-tight">
              {dict.home.byCountryTitle}
            </h2>
            <p className="mt-3 text-ice-800/80">{dict.home.byCountrySubtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from(byCountry.entries()).map(([country, list]) => (
              <div
                key={country}
                className="bg-white rounded-2xl border border-ice-100 p-5 text-center"
              >
                <div className="text-3xl" aria-hidden>
                  {list[0].flag}
                </div>
                <div className="mt-2 font-semibold text-slate-deep">{country}</div>
                <div className="text-xs text-ice-700">
                  {list.length} {list.length === 1 ? 'resort' : 'resorts'}
                </div>
              </div>
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
                STEP {s.n}
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
