import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import Stay22Map from '@/components/Stay22Map'
import DestinationCard from '@/components/DestinationCard'
import SnowScoreBar from '@/components/SnowScoreBar'
import {
  destinations,
  getDestination,
  getRelatedDestinations,
} from '@/lib/destinations'
import { SITE_URL, buildAllezDestLink } from '@/lib/site'

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const d of destinations) {
      params.push({ locale, slug: d.slug })
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
  if (!hasLocale(locale)) return {}
  const d = getDestination(slug)
  if (!d) return {}

  const titles: Record<Locale, string> = {
    en: `Ski-in/ski-out hotels in ${d.name} (${d.country}) | BestSnowHotels`,
    fr: `Hôtels ski-in/ski-out à ${d.name} (${d.country}) | BestSnowHotels`,
    es: `Hoteles ski-in/ski-out en ${d.name} (${d.country}) | BestSnowHotels`,
    pt: `Hotéis ski-in/ski-out em ${d.name} (${d.country}) | BestSnowHotels`,
  }
  const descriptions: Record<Locale, string> = {
    en: `Best ski-in/ski-out hotels in ${d.name}. ${d.pistesKm} km of pistes, top at ${d.altitudeSummit} m. Compare Booking, Expedia and Hotels.com.`,
    fr: `Meilleurs hôtels ski-in/ski-out à ${d.name}. ${d.pistesKm} km de pistes, sommet à ${d.altitudeSummit} m. Comparez Booking, Expedia et Hotels.com.`,
    es: `Mejores hoteles ski-in/ski-out en ${d.name}. ${d.pistesKm} km de pistas, cumbre a ${d.altitudeSummit} m. Compara Booking, Expedia y Hotels.com.`,
    pt: `Melhores hotéis ski-in/ski-out em ${d.name}. ${d.pistesKm} km de pistas, cume a ${d.altitudeSummit} m. Compare Booking, Expedia e Hotels.com.`,
  }

  return {
    title: titles[locale as Locale],
    description: descriptions[locale as Locale],
    openGraph: {
      title: titles[locale as Locale],
      description: descriptions[locale as Locale],
      type: 'website',
      url: `${SITE_URL}/${locale}/destinations/${d.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/destinations/${d.slug}`,
      languages: {
        en: `${SITE_URL}/en/destinations/${d.slug}`,
        fr: `${SITE_URL}/fr/destinations/${d.slug}`,
        es: `${SITE_URL}/es/destinations/${d.slug}`,
        pt: `${SITE_URL}/pt/destinations/${d.slug}`,
        'x-default': `${SITE_URL}/en/destinations/${d.slug}`,
      },
    },
  }
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const d = getDestination(slug)
  if (!d) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const related = getRelatedDestinations(slug, 4)
  const allezLink = buildAllezDestLink(d.name, d.country, 'destination', 7)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  // JSON-LD
  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: d.name,
    description: d.intro[l],
    geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
    address: { '@type': 'PostalAddress', addressCountry: d.countryCode },
    touristType: ['Skier', 'Snowboarder', 'Winter sports'],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${l}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.destinations.title,
        item: `${SITE_URL}/${l}/destinations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: d.name,
        item: `${SITE_URL}/${l}/destinations/${d.slug}`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: dict.destination.faq1Q.replace('{name}', d.name),
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${d.name} has ${d.pistesKm} km of pistes spread across ${d.lifts} lifts, from ${d.altitudeBase} m to ${d.altitudeSummit} m. Suitability for beginners depends on the resort's beginner zones — check the local ski school options.`,
        },
      },
      {
        '@type': 'Question',
        name: dict.destination.faq2Q.replace('{name}', d.name),
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Season runs from ${d.seasonStart} to ${d.seasonEnd}. Snow score: ${d.snowScore}/100. Peak conditions typically January–February; spring skiing March–April benefits from longer days.`,
        },
      },
      {
        '@type': 'Question',
        name: dict.destination.faq3Q,
        acceptedAnswer: { '@type': 'Answer', text: d.skiInSkiOutNote },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ice-100 via-ice-50 to-white border-b border-ice-100">
        <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-ice-700 mb-4">
            <Link href={`/${l}`} className="hover:text-slate-deep">
              Home
            </Link>
            <span className="mx-2 text-ice-400">/</span>
            <Link href={`/${l}/destinations`} className="hover:text-slate-deep">
              {dict.destinations.title}
            </Link>
            <span className="mx-2 text-ice-400">/</span>
            <span className="text-slate-deep">{d.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>
              {d.flag}
            </span>
            <span className="text-sm font-medium text-ice-700 uppercase tracking-wide">
              {d.region}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-deep tracking-tight">
            {d.name}
          </h1>
          <p className="mt-5 text-lg text-ice-800/80 max-w-3xl leading-relaxed">
            {d.intro[l]}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={allezLink}
              target="_blank"
              rel="noopener sponsored"
              className="inline-block bg-slate-deep text-white font-semibold px-7 py-3 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20"
            >
              {dict.destination.bookCta} →
            </a>
            {d.vibes.map((v) => (
              <span
                key={v}
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-ice-800 bg-white border border-ice-200 px-3 py-1.5 rounded-full"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Essentials grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">
          {dict.destination.essentials}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: dict.destination.altitudeBase,
              value: `${d.altitudeBase.toLocaleString()} m`,
            },
            {
              label: dict.destination.altitudeSummit,
              value: `${d.altitudeSummit.toLocaleString()} m`,
            },
            {
              label: dict.destination.pistesKm,
              value: `${d.pistesKm} km`,
            },
            {
              label: dict.destination.lifts,
              value: `${d.lifts}`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-ice-100 p-5"
            >
              <div className="text-xs text-ice-600 font-medium uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-deep tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ice-100 p-5">
            <div className="text-xs text-ice-600 font-medium uppercase tracking-wide mb-1">
              {dict.destination.season}
            </div>
            <div className="text-lg font-semibold text-slate-deep">
              {d.seasonStart} → {d.seasonEnd}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-ice-100 p-5">
            <SnowScoreBar score={d.snowScore} label={dict.destinations.snowScore} />
          </div>
        </div>
      </section>

      {/* Ski-in/ski-out note */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-ice-50 border-l-4 border-ice-500 rounded-r-2xl p-5">
          <div className="text-xs font-bold text-ice-700 uppercase tracking-wider mb-1">
            {dict.destination.skiInSkiOut}
          </div>
          <p className="text-slate-deep leading-relaxed">{d.skiInSkiOutNote}</p>
        </div>
      </section>

      {/* Stay22 Map */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep">
          {dict.destination.mapTitle} {d.name}
        </h2>
        <p className="mt-2 text-ice-800/80 mb-6">{dict.destination.mapSubtitle}</p>
        <Stay22Map lat={d.lat} lng={d.lng} destName={d.name} height={540} />
        <div className="mt-6 text-center">
          <a
            href={allezLink}
            target="_blank"
            rel="noopener sponsored"
            className="inline-block bg-slate-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20"
          >
            {dict.destination.bookCta} →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">
          {dict.destination.faqTitle}
        </h2>
        <div className="space-y-4">
          {[
            {
              q: dict.destination.faq1Q.replace('{name}', d.name),
              a: `${d.name} offers ${d.pistesKm} km of pistes across ${d.lifts} lifts, from ${d.altitudeBase} m to ${d.altitudeSummit} m. The right level depends on the resort's beginner zones — see the dedicated ski school options.`,
            },
            {
              q: dict.destination.faq2Q.replace('{name}', d.name),
              a: `Season runs from ${d.seasonStart} to ${d.seasonEnd}. Snow score: ${d.snowScore}/100. Best conditions typically late January through February; spring skiing in March–April brings longer, sunnier days.`,
            },
            { q: dict.destination.faq3Q, a: d.skiInSkiOutNote },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-white border border-ice-100 rounded-2xl p-5"
            >
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex justify-between items-center">
                <span>{item.q}</span>
                <span className="text-ice-500 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-ice-800/80 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-ice-50 border-t border-ice-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-slate-deep mb-1">
              {dict.destination.relatedTitle}
            </h2>
            <p className="text-ice-800/80 mb-6">
              {dict.destination.relatedSubtitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((r) => (
                <DestinationCard
                  key={r.slug}
                  destination={r}
                  locale={l}
                  labels={cardLabels}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
