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
import HotelCard from '@/components/HotelCard'
import PisteBreakdown from '@/components/PisteBreakdown'
import { SITE_URL, buildAllezDestLink, buildAllezHotelLink } from '@/lib/site'
import Image from 'next/image'
import { getHotels } from '@/lib/hotels'
import { getGallery } from '@/lib/galleries'
import { resortSite, skiRentalMapsUrl } from '@/lib/resortLinks'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { localizeVibe } from '@/lib/vibes'
import { formatSeasonDate, formatSeasonRange } from '@/lib/dates'

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

  const countryEn = localizeCountry(d.country, 'en')
  const countryFr = localizeCountry(d.country, 'fr')
  const countryEs = localizeCountry(d.country, 'es')
  const countryPt = localizeCountry(d.country, 'pt')

  const titles: Record<Locale, string> = {
    en: `Ski-in/ski-out hotels in ${d.name} (${countryEn}) | BestSnowHotels`,
    fr: `Hôtels ski-in/ski-out à ${d.name} (${countryFr}) | BestSnowHotels`,
    es: `Hoteles ski-in/ski-out en ${d.name} (${countryEs}) | BestSnowHotels`,
    pt: `Hotéis ski-in/ski-out em ${d.name} (${countryPt}) | BestSnowHotels`,
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
  const hotels = getHotels(slug)
  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
  }
  const officialSite = resortSite(slug)
  const rentalUrl = skiRentalMapsUrl(d.name, d.country)
  const gallery = getGallery(slug)

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
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
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

  // Build localised FAQ answers from per-locale templates, with placeholders
  // replaced by the destination's actual figures. Keeps the displayed copy and the
  // JSON-LD answer text perfectly in sync.
  const fillTemplate = (tpl: string) =>
    tpl
      .replace('{name}', d.name)
      .replace('{pistesKm}', String(d.pistesKm))
      .replace('{lifts}', String(d.lifts))
      .replace('{altitudeBase}', d.altitudeBase.toLocaleString())
      .replace('{altitudeSummit}', d.altitudeSummit.toLocaleString())
      .replace('{seasonStart}', formatSeasonDate(d.seasonStart, l))
      .replace('{seasonEnd}', formatSeasonDate(d.seasonEnd, l))
      .replace('{snowScore}', String(d.snowScore))
      .replace('{easy}', String(d.runs.easy))
      .replace('{intermediate}', String(d.runs.intermediate))
      .replace('{difficult}', String(d.runs.difficult))

  const faqItems = [
    {
      q: dict.destination.faq1Q.replace('{name}', d.name),
      a: fillTemplate(dict.destination.faq1A),
    },
    {
      q: dict.destination.faq2Q.replace('{name}', d.name),
      a: fillTemplate(dict.destination.faq2A),
    },
    {
      q: dict.destination.faq3Q,
      a: d.skiInSkiOutNote[l],
    },
    {
      q: dict.destination.faq4Q.replace('{name}', d.name),
      a: fillTemplate(dict.destination.faq4A),
    },
    {
      q: dict.destination.faq5Q.replace('{name}', d.name),
      a: fillTemplate(dict.destination.faq5A),
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
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
              {dict.nav.home}
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
              {localizeRegion(d.region, l)}
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
                {localizeVibe(v, l)}
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
              {formatSeasonRange(d.seasonStart, d.seasonEnd, l)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-ice-100 p-5">
            <SnowScoreBar score={d.snowScore} label={dict.destinations.snowScore} />
          </div>
        </div>
      </section>

      {/* Pistes and lifts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-5">
          {dict.destination.pisteTitle}
        </h2>
        <PisteBreakdown
          destination={d}
          labels={{
            easy: dict.destination.easy,
            intermediate: dict.destination.intermediate,
            difficult: dict.destination.difficult,
          }}
        />
        <p className="mt-3 text-xs text-ice-500">{dict.destination.pisteNote}</p>
      </section>

      {/* Ski-in/ski-out note */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-ice-50 border-l-4 border-ice-500 rounded-r-2xl p-5">
          <div className="text-xs font-bold text-ice-700 uppercase tracking-wider mb-1">
            {dict.destination.skiInSkiOut}
          </div>
          <p className="text-slate-deep leading-relaxed">{d.skiInSkiOutNote[l]}</p>
        </div>
      </section>

      {/* Get to know the resort: editorial + gallery */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-5">
          {dict.destination.aboutTitle}
        </h2>
        <p className="text-lg text-ice-800/80 leading-relaxed max-w-3xl">
          {d.longDescription[l]}
        </p>
        {gallery.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {gallery.map((file) => (
              <div
                key={file}
                className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-ice-100"
              >
                <Image
                  src={`/images/destinations/${file}`}
                  alt={`${d.name}, ${localizeRegion(d.region, l)}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Where to stay: example hotels */}
      {hotels.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-slate-deep">
            {dict.destination.whereToStay}
          </h2>
          <p className="mt-2 text-ice-800/80 mb-6 max-w-3xl">
            {dict.destination.whereToStaySubtitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                bookHref={buildAllezHotelLink(h.name, d.name, d.country, 'hotel', 7)}
                labels={hotelLabels}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-ice-500">{dict.destination.ratingsNote}</p>
        </section>
      )}

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

      {/* Plan your trip: practical links */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">
          {dict.destination.planTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {officialSite && (
            <a
              href={officialSite}
              target="_blank"
              rel="noopener"
              className="card-hover block bg-white rounded-2xl border border-ice-100 p-5"
            >
              <div className="text-2xl mb-2" aria-hidden>
                🎫
              </div>
              <div className="font-bold text-slate-deep">{dict.destination.liftPass}</div>
              <p className="mt-1 text-sm text-ice-600">{dict.destination.liftPassHint}</p>
            </a>
          )}
          <a
            href={rentalUrl}
            target="_blank"
            rel="noopener"
            className="card-hover block bg-white rounded-2xl border border-ice-100 p-5"
          >
            <div className="text-2xl mb-2" aria-hidden>
              🎿
            </div>
            <div className="font-bold text-slate-deep">{dict.destination.skiRental}</div>
            <p className="mt-1 text-sm text-ice-600">{dict.destination.skiRentalHint}</p>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">
          {dict.destination.faqTitle}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
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
