import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
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
    en: 'All 41 ski destinations in the Alps and Pyrenees | BestSnowHotels',
    fr: 'Toutes les 41 destinations ski dans les Alpes et les Pyrénées | BestSnowHotels',
    es: 'Todos los 41 destinos de esquí en los Alpes y los Pirineos | BestSnowHotels',
    pt: 'Todos os 41 destinos de esqui nos Alpes e Pirenéus | BestSnowHotels',
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
  const byCountry = getDestinationsByCountry()

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {dict.destinations.title}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-2xl">
          {dict.destinations.subtitle}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {Array.from(byCountry.entries()).map(([country, list]) => (
          <section key={country} className="mt-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-deep mb-5">
              <span className="text-3xl" aria-hidden>
                {list[0].flag}
              </span>
              <span>{country}</span>
              <span className="text-sm font-medium text-ice-600 tabular-nums">
                ({list.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map((d) => (
                <DestinationCard
                  key={d.slug}
                  destination={d}
                  locale={locale as Locale}
                  labels={cardLabels}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
