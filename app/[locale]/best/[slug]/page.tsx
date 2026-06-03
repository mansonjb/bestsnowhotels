import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { BEST_FOR_LISTS, getBestForList } from '@/lib/bestFor'
import { destinations } from '@/lib/destinations'
import { SITE_URL } from '@/lib/site'
import DestinationCard from '@/components/DestinationCard'

export async function generateStaticParams() {
  return locales.flatMap((locale) => BEST_FOR_LISTS.map((b) => ({ locale, slug: b.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const b = getBestForList(slug)
  if (!b) return {}
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${b.name[l]} | BestSnowHotels`,
    description: b.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/best/${slug}`,
      languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/best/${slug}`])),
    },
  }
}

export default async function BestForListPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const b = getBestForList(slug)
  if (!b) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const limit = b.limit ?? 24
  const matched = destinations
    .filter(b.filter)
    .sort((a, c) => b.sort(c) - b.sort(a))
    .slice(0, limit)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const otherLists = BEST_FOR_LISTS.filter((x) => x.slug !== b.slug).slice(0, 6)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.best.title, item: `${SITE_URL}/${l}/best` },
        { '@type': 'ListItem', position: 3, name: b.name[l], item: `${SITE_URL}/${l}/best/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: b.name[l],
      description: b.intro[l],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
          <Image
            src={`/images/destinations/${b.heroSlug}.jpg`}
            alt={b.name[l]}
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
                <Link href={`/${l}/best`} className="hover:text-white">{dict.best.title}</Link>
              </nav>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">
                {b.name[l]}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/90 max-w-3xl drop-shadow">{b.intro[l]}</p>
              <p className="mt-3 text-xs text-white/80 tabular-nums">
                {matched.length} {matched.length === 1 ? dict.destinations.resort : dict.destinations.resorts}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How we picked */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.best.howRanked}</h2>
        <p className="mt-3 text-lg text-ice-800/90 leading-relaxed max-w-4xl">{b.description[l]}</p>
      </section>

      {/* Resorts grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matched.map((d) => (
            <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
          ))}
        </div>
      </section>

      {/* Other lists (maillage) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.best.title}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherLists.map((x) => (
            <Link
              key={x.slug}
              href={`/${l}/best/${x.slug}`}
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
