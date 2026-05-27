import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { COUNTRIES, getCountry } from '@/lib/countries'
import { destinations } from '@/lib/destinations'
import DestinationCard from '@/components/DestinationCard'
import { SITE_URL } from '@/lib/site'
import { localizeCountry, inCountry } from '@/lib/countryNames'

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const c of COUNTRIES) {
      params.push({ locale, slug: c.slug })
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
  const country = getCountry(slug)
  if (!country) return {}
  const titles: Record<Locale, string> = {
    en: `Ski-in/ski-out hotels ${inCountry(country.name, 'en')} | BestSnowHotels`,
    fr: `Hôtels ski-in/ski-out ${inCountry(country.name, 'fr')} | BestSnowHotels`,
    es: `Hoteles ski-in/ski-out ${inCountry(country.name, 'es')} | BestSnowHotels`,
    pt: `Hotéis ski-in/ski-out ${inCountry(country.name, 'pt')} | BestSnowHotels`,
  }
  return {
    title: titles[locale as Locale],
    description: country.intro[locale as Locale],
    alternates: {
      canonical: `${SITE_URL}/${locale}/countries/${country.slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/countries/${country.slug}`]),
      ),
    },
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const country = getCountry(slug)
  if (!country) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const list = destinations.filter((d) => d.country === country.name)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Ski resorts in ${country.name}`,
    numberOfItems: list.length,
    itemListElement: list.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${l}/destinations/${d.slug}`,
      name: d.name,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: dict.nav.countries, item: `${SITE_URL}/${l}/countries` },
      { '@type': 'ListItem', position: 3, name: localizeCountry(country.name, l), item: `${SITE_URL}/${l}/countries/${country.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-ice-100 via-ice-50 to-white border-b border-ice-100">
        <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-ice-700 mb-4">
            <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
            <span className="mx-2 text-ice-400">/</span>
            <Link href={`/${l}/countries`} className="hover:text-slate-deep">{dict.nav.countries}</Link>
            <span className="mx-2 text-ice-400">/</span>
            <span className="text-slate-deep">{localizeCountry(country.name, l)}</span>
          </nav>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl" aria-hidden>{country.flag}</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
              {localizeCountry(country.name, l)}
            </h1>
          </div>
          <div className="text-sm font-medium text-ice-700 mb-4">
            {list.length} {list.length === 1 ? dict.destinations.resort : dict.destinations.resorts}
          </div>
          <p className="mt-3 text-lg text-ice-800/80 max-w-3xl leading-relaxed">
            {country.intro[l]}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {list.map((d) => (
            <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
          ))}
        </div>
      </div>
    </>
  )
}
