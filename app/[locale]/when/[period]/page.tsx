import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { SEASONAL_GUIDES, getSeasonalGuide } from '@/lib/seasonalGuides'
import { destinations } from '@/lib/destinations'
import { SITE_URL, jsonLdGraph } from '@/lib/site'
import DestinationCard from '@/components/DestinationCard'

const T = {
  picks: {
    en: 'Top picks for this period',
    fr: 'Notre sélection pour cette période',
    es: 'Nuestra selección para este periodo',
    pt: 'A nossa seleção para este período',
    it: 'La nostra selezione per questo periodo',
  } as Record<Locale, string>,
  other: {
    en: 'Other periods',
    fr: 'Autres périodes',
    es: 'Otros periodos',
    pt: 'Outros períodos',
    it: 'Altri periodi',
  } as Record<Locale, string>,
  matched: {
    en: 'Resorts matching this period',
    fr: 'Stations qui collent à cette période',
    es: 'Estaciones que cuadran con este periodo',
    pt: 'Estâncias que encaixam neste período',
    it: 'Località adatte a questo periodo',
  } as Record<Locale, string>,
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => SEASONAL_GUIDES.map((g) => ({ locale, period: g.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; period: string }>
}): Promise<Metadata> {
  const { locale, period } = await params
  const g = getSeasonalGuide(period)
  if (!g) return {}
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${g.name[l]} | BestSnowHotels`,
    description: g.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/when/${period}`,
      languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/when/${period}`])), "x-default": `${SITE_URL}/en/when/${period}` },
    },
  }
}

export default async function WhenPeriodPage({
  params,
}: {
  params: Promise<{ locale: string; period: string }>
}) {
  const { locale, period } = await params
  if (!hasLocale(locale)) notFound()
  const g = getSeasonalGuide(period)
  if (!g) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const limit = g.limit ?? 24
  const matched = destinations.filter(g.filter).sort((a, c) => g.sort(c) - g.sort(a)).slice(0, limit)
  const otherGuides = SEASONAL_GUIDES.filter((x) => x.slug !== g.slug)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.when, item: `${SITE_URL}/${l}/when` },
        { '@type': 'ListItem', position: 3, name: g.name[l], item: `${SITE_URL}/${l}/when/${period}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: g.name[l],
      description: g.intro[l],
      itemListElement: matched.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/destinations/${m.slug}`,
        name: m.name,
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[36vh] min-h-[260px] w-full overflow-hidden">
          <Image
            src={`/images/destinations/${g.heroSlug}.jpg`}
            alt={g.name[l]}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/40 to-slate-deep/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <nav className="text-xs text-white/80 mb-3 flex items-center gap-2">
                <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
                <span aria-hidden>/</span>
                <Link href={`/${l}/when`} className="hover:text-white">{dict.nav.when}</Link>
              </nav>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">{g.name[l]}</h1>
              <p className="mt-3 text-base sm:text-lg text-white/90 max-w-3xl drop-shadow">{g.intro[l]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Picks editorial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h2 className="text-2xl font-bold text-slate-deep">{T.picks[l]}</h2>
        <p className="mt-3 text-lg text-ice-800/90 leading-relaxed max-w-4xl whitespace-pre-line">{g.picks[l]}</p>
      </section>

      {/* Description */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-base text-ice-800/85 leading-relaxed max-w-4xl whitespace-pre-line">{g.description[l]}</p>
      </section>

      {/* Resort grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{T.matched[l]}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matched.map((d) => (
            <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
          ))}
        </div>
      </section>

      {/* Other guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <h2 className="text-2xl font-bold text-slate-deep">{T.other[l]}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherGuides.map((x) => (
            <Link
              key={x.slug}
              href={`/${l}/when/${x.slug}`}
              className="inline-flex items-center gap-2 bg-white border border-ice-100 rounded-full px-4 py-2 text-sm font-medium text-ice-800 hover:border-ice-300 hover:text-slate-deep transition"
            >
              {x.name[l]}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
