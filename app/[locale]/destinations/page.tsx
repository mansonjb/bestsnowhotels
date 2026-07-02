import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import DestinationFilters from '@/components/DestinationFilters'
import { destinations } from '@/lib/destinations'
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
    en: 'All 448 ski destinations in the Alps and Pyrenees | BestSnowHotels',
    fr: 'Les 448 destinations ski dans les Alpes et les Pyrénées | BestSnowHotels',
    es: 'Los 448 destinos de esquí en los Alpes y los Pirineos | BestSnowHotels',
    pt: 'Os 448 destinos de esqui nos Alpes e nos Pirenéus | BestSnowHotels',
    it: 'Le 448 destinazioni sci sulle Alpi e sui Pirenei | BestSnowHotels',
  }

  return {
    title: titles[locale as Locale],
    alternates: {
      canonical: `${SITE_URL}/${locale}/destinations`,
      languages: {
        en: `${SITE_URL}/en/destinations`,
        fr: `${SITE_URL}/fr/destinations`,
        es: `${SITE_URL}/es/destinations`,
        pt: `${SITE_URL}/pt/destinations`,
        it: `${SITE_URL}/it/destinations`,
        'x-default': `${SITE_URL}/en/destinations`,
      },
    },
  }
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
    filterCountry: dict.destinations.filterCountry,
    filterAll: dict.destinations.filterAll,
  }
  const uiLabels = {
    minAltitude: dict.destinations.minAltitude,
    minSnow: dict.destinations.minSnow,
    vibe: dict.destinations.vibe,
    reset: dict.destinations.reset,
    showing: dict.destinations.showing,
    noResults: dict.destinations.noResults,
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ski destinations in the Alps and Pyrenees',
    numberOfItems: destinations.length,
    itemListElement: destinations.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${locale}/destinations/${d.slug}`,
      name: d.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {dict.destinations.title}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80">
          {dict.destinations.subtitle}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <DestinationFilters
          destinations={destinations}
          locale={locale as Locale}
          labels={cardLabels}
          uiLabels={uiLabels}
        />
      </div>
    </>
  )
}
