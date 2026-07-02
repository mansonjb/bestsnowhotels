import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getRegionHubs, getRegionHub, regionIntro } from '@/lib/regionPages'
import DestinationCard from '@/components/DestinationCard'
import { SITE_URL } from '@/lib/site'
import { localizeRegion } from '@/lib/regions'
import { localizeCountry } from '@/lib/countryNames'
import { countrySlug } from '@/lib/countries'

const LBL = {
  regions: { en: 'Ski regions', fr: 'Régions de ski', es: 'Regiones de esquí', pt: 'Regiões de esqui', it: 'Regioni sciistiche' } as Record<Locale, string>,
  byCountry: { en: 'Browse by country', fr: 'Parcourir par pays', es: 'Explora por país', pt: 'Explorar por país', it: 'Sfoglia per paese' } as Record<Locale, string>,
  resorts: { en: 'resorts', fr: 'stations', es: 'estaciones', pt: 'estâncias', it: 'località' } as Record<Locale, string>,
  resort: { en: 'resort', fr: 'station', es: 'estación', pt: 'estância', it: 'località' } as Record<Locale, string>,
  title: { en: 'Ski resorts in', fr: 'Stations de ski', es: 'Estaciones de esquí en', pt: 'Estâncias de esqui em', it: 'Località sciistiche in' } as Record<Locale, string>,
}

const titleFor = (region: string, l: Locale) =>
  l === 'fr' ? `Stations de ski des ${region}` : `${LBL.title[l]} ${region}`

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const h of getRegionHubs()) params.push({ locale, slug: h.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const h = getRegionHub(slug)
  if (!h) return {}
  const l = locale as Locale
  const region = localizeRegion(h.name, l)
  return {
    title: `${titleFor(region, l)} | BestSnowHotels`,
    description: regionIntro(h, l),
    alternates: {
      canonical: `${SITE_URL}/${locale}/regions/${h.slug}`,
      languages: {
        ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/regions/${h.slug}`])),
        'x-default': `${SITE_URL}/en/regions/${h.slug}`,
      },
    },
  }
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const h = getRegionHub(slug)
  if (!h) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const region = localizeRegion(h.name, l)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titleFor(h.name, 'en'),
    numberOfItems: h.resorts.length,
    itemListElement: h.resorts.map((d, i) => ({
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
      { '@type': 'ListItem', position: 2, name: LBL.regions[l], item: `${SITE_URL}/${l}/regions` },
      { '@type': 'ListItem', position: 3, name: region, item: `${SITE_URL}/${l}/regions/${h.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="relative overflow-hidden border-b border-ice-100">
        <SafeImage
          src={`/images/destinations/${h.stats.topSlug}.jpg`}
          alt={region}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/70 to-slate-deep/45" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-white/70 mb-4">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href={`/${l}/regions`} className="hover:text-white">{LBL.regions[l]}</Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{region}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">
            {titleFor(region, l)}
          </h1>
          <div className="mt-3 text-sm font-medium text-white/85">
            {h.stats.count} {h.stats.count === 1 ? LBL.resort[l] : LBL.resorts[l]}
          </div>
          <p className="mt-4 max-w-3xl text-lg text-white/90 leading-relaxed drop-shadow-sm">
            {regionIntro(h, l)}
          </p>
        </div>
      </section>

      {/* Cross-link to the countries that make up this region */}
      {h.countries.length > 0 && (
        <div className="bg-ice-50 border-b border-ice-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ice-700 mr-1">
              {LBL.byCountry[l]}
            </span>
            {h.countries.map((c) => (
              <Link
                key={c}
                href={`/${l}/countries/${countrySlug(c)}`}
                className="inline-flex items-center text-sm font-medium border border-ice-200 bg-white rounded-full px-3.5 py-1.5 text-ice-800 hover:bg-ice-100 hover:border-ice-300 transition"
              >
                {localizeCountry(c, l)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {h.resorts.map((d) => (
            <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
          ))}
        </div>
      </div>
    </>
  )
}
