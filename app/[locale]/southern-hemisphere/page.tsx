import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import SafeImage from '@/components/SafeImage'
import Stay22Map from '@/components/Stay22Map'
import DestinationCard from '@/components/DestinationCard'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { destinations } from '@/lib/destinations'
import { isSouthernHemisphere, countrySlug } from '@/lib/countries'
import { SITE_URL, hreflangFor, jsonLdGraph, buildAllezDestLink } from '@/lib/site'
import { SH_SECTIONS, SH_COPY, SH_COMPARE_SLUGS, assertShParity } from '@/lib/southernHemisphere'

const HERO_SLUG = 'valle-nevado'

export function generateStaticParams() {
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
    title: `${SH_COPY.metaTitle[l]} | BestSnowHotels`,
    description: SH_COPY.heroIntro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/southern-hemisphere`,
      languages: hreflangFor('/southern-hemisphere'),
    },
    openGraph: {
      title: SH_COPY.metaTitle[l],
      description: SH_COPY.heroIntro[l],
      url: `${SITE_URL}/${l}/southern-hemisphere`,
      images: [`${SITE_URL}/images/destinations/${HERO_SLUG}.jpg`],
    },
  }
}

export default async function SouthernHemispherePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  assertShParity()

  const sh = destinations.filter(isSouthernHemisphere)
  const sections = SH_SECTIONS.map((sec) => {
    const resorts = sh
      .filter((d) => sec.countryCodes.includes(d.countryCode))
      .sort((a, b) => b.snowScore - a.snowScore)
    const mapDest = destinations.find((d) => d.slug === sec.mapSlug) ?? resorts[0]
    return { sec, resorts, mapDest }
  }).filter((s) => s.resorts.length > 0)

  const totalResorts = sh.length
  const countryCount = new Set(sh.map((d) => d.countryCode)).size

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const monthTints = [
    'from-ice-50 to-white border-ice-100',
    'from-alpenglow-400/15 to-white border-alpenglow-400/30',
    'from-frost/40 to-white border-ice-100',
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: SH_COPY.heroTitle[l], item: `${SITE_URL}/${l}/southern-hemisphere` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: SH_COPY.metaTitle[l],
      description: SH_COPY.heroIntro[l],
      numberOfItems: totalResorts,
      itemListElement: sh
        .sort((a, b) => b.snowScore - a.snowScore)
        .map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${l}/destinations/${d.slug}`,
          name: d.name,
        })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: SH_COPY.faq.map((f) => ({
        '@type': 'Question',
        name: f.q[l],
        acceptedAnswer: { '@type': 'Answer', text: f.a[l] },
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[46vh] min-h-[340px] w-full overflow-hidden">
          <SafeImage
            src={`/images/destinations/${HERO_SLUG}.jpg`}
            alt={SH_COPY.heroTitle[l]}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/55 to-slate-deep/25" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-9">
              <nav className="text-xs text-white/80 mb-3 flex items-center gap-2">
                <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
                <span aria-hidden>/</span>
                <span className="text-white/90">{SH_COPY.heroKicker[l]}</span>
              </nav>
              <p className="text-sm font-semibold uppercase tracking-wide text-alpenglow-400 drop-shadow">
                {SH_COPY.heroKicker[l]}
              </p>
              <h1 className="mt-2 text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow">
                {SH_COPY.heroTitle[l]}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed drop-shadow">
                {SH_COPY.heroIntro[l]}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/90">
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-semibold">
                  ❄ {totalResorts} {SH_COPY.resortsLabel[l].toLowerCase()}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-semibold">
                  🌍 {countryCount} {l === 'fr' ? 'pays' : l === 'es' ? 'países' : l === 'pt' ? 'países' : l === 'it' ? 'paesi' : 'countries'}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-semibold">
                  📅 {l === 'fr' ? 'Juin à octobre' : l === 'es' ? 'Junio a octubre' : l === 'pt' ? 'Junho a outubro' : l === 'it' ? 'Giugno a ottobre' : 'June to October'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Region quick-nav chips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-2">
          {sections.map(({ sec, resorts }) => (
            <a
              key={sec.key}
              href={`#${sec.key}`}
              className="inline-flex items-center gap-2 bg-white border border-ice-200 rounded-full px-4 py-2 text-sm font-semibold text-ice-800 hover:border-ice-400 hover:bg-ice-50 transition shadow-sm"
            >
              <span aria-hidden>{sec.flag}</span>
              {sec.name[l]}
              <span className="text-ice-500 tabular-nums">{resorts.length}</span>
            </a>
          ))}
        </div>
      </section>

      {/* GEO quick answer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-2xl border border-ice-200 bg-gradient-to-br from-ice-50 to-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-deep flex items-center gap-2">
            <span aria-hidden>💡</span> {SH_COPY.geoTitle[l]}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-ice-900/90 leading-relaxed max-w-4xl">
            {SH_COPY.geoBody[l]}
          </p>
        </div>
      </section>

      {/* Season month by month */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{SH_COPY.monthsTitle[l]}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SH_COPY.months.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl border bg-gradient-to-b ${monthTints[i]} p-5 shadow-sm`}
            >
              <p className="text-sm font-bold uppercase tracking-wide text-alpenglow-600">{m.tag[l]}</p>
              <p className="mt-2 text-sm text-ice-900/85 leading-relaxed">{m.body[l]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <h2 className="text-2xl font-bold text-slate-deep">{SH_COPY.sectionsTitle[l]}</h2>
      </section>

      {sections.map(({ sec, resorts, mapDest }) => {
        const flagship = resorts[0]
        const bookHref = buildAllezDestLink(flagship.name, flagship.country)
        return (
          <section
            key={sec.key}
            id={sec.key}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 scroll-mt-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ice-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-deep flex items-center gap-3">
                  <span aria-hidden className="text-3xl">{sec.flag}</span>
                  <Link href={`/${l}/countries/${countrySlug((mapDest ?? flagship).country)}`} className="hover:text-ice-700 transition">
                    {sec.name[l]}
                  </Link>
                </h3>
              </div>
              <span className="text-sm font-semibold text-ice-600">
                {resorts.length} {SH_COPY.resortsLabel[l].toLowerCase()}
              </span>
            </div>

            <p className="mt-5 text-base text-ice-800/90 leading-relaxed max-w-4xl">{sec.blurb[l]}</p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resorts.map((d) => (
                <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
              ))}
            </div>

            {/* Prominent Stay22 hotel map for the region */}
            {mapDest && (
              <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h4 className="text-base font-bold text-slate-deep">
                    {SH_COPY.mapLabel[l]} <span className="text-ice-700">{mapDest.name}</span>
                  </h4>
                  <a
                    href={bookHref}
                    target="_blank"
                    rel="noopener sponsored"
                    className="inline-block bg-ice-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-ice-500 transition shadow-sm"
                  >
                    {SH_COPY.bookCta[l]}
                  </a>
                </div>
                <Stay22Map lat={mapDest.lat} lng={mapDest.lng} destName={mapDest.name} zoom={sec.mapZoom} height={420} />
              </div>
            )}
          </section>
        )
      })}

      {/* Head to head comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <h2 className="text-2xl font-bold text-slate-deep">{SH_COPY.compareTitle[l]}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SH_COMPARE_SLUGS.map((slug) => {
            const [aSlug, bSlug] = slug.split('-vs-')
            const a = destinations.find((d) => d.slug === aSlug)
            const b = destinations.find((d) => d.slug === bSlug)
            if (!a || !b) return null
            return (
              <Link
                key={slug}
                href={`/${l}/compare/${slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-ice-200 bg-white p-5 hover:border-ice-400 hover:shadow-md transition"
              >
                <span className="font-semibold text-slate-deep">
                  {a.flag} {a.name} <span className="text-ice-500">vs</span> {b.flag} {b.name}
                </span>
                <span className="text-ice-700 font-semibold group-hover:translate-x-0.5 transition" aria-hidden>→</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <h2 className="text-2xl font-bold text-slate-deep">{SH_COPY.faqTitle[l]}</h2>
        <div className="mt-6 space-y-4 max-w-4xl">
          {SH_COPY.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-ice-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-slate-deep">
                {f.q[l]}
                <span className="text-ice-400 group-open:rotate-45 transition text-xl leading-none" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-base text-ice-800/85 leading-relaxed">{f.a[l]}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Keep planning / related bridges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <h2 className="text-xl font-bold text-slate-deep">{SH_COPY.relatedTitle[l]}</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={`/${l}/when/southern-hemisphere-winter-2027`} className="rounded-2xl border border-ice-200 bg-white p-5 hover:border-ice-400 hover:shadow-md transition">
            <p className="font-semibold text-slate-deep">{dict.nav.when}</p>
            <p className="mt-1 text-sm text-ice-700/80">{SH_COPY.heroKicker[l]}</p>
          </Link>
          <Link href={`/${l}/destinations`} className="rounded-2xl border border-ice-200 bg-white p-5 hover:border-ice-400 hover:shadow-md transition">
            <p className="font-semibold text-slate-deep">{dict.nav.destinations}</p>
            <p className="mt-1 text-sm text-ice-700/80">{dict.destinations.title}</p>
          </Link>
          <Link href={`/${l}/weather`} className="rounded-2xl border border-ice-200 bg-white p-5 hover:border-ice-400 hover:shadow-md transition">
            <p className="font-semibold text-slate-deep">{dict.nav.weather ?? 'Weather'}</p>
            <p className="mt-1 text-sm text-ice-700/80">{SH_COPY.geoTitle[l]}</p>
          </Link>
        </div>
      </section>
    </>
  )
}
