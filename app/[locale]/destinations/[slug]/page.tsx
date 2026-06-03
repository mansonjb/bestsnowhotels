import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import Stay22Map from '@/components/Stay22Map'
import DestinationCard from '@/components/DestinationCard'
import {
  destinations,
  getDestination,
  getRelatedDestinations,
} from '@/lib/destinations'
import HotelCard from '@/components/HotelCard'
import PisteBreakdown from '@/components/PisteBreakdown'
import SnowByMonth from '@/components/SnowByMonth'
import { snowByMonth } from '@/lib/snow'
// SnowScoreBar no longer used: snow score now shown in the hero stats strip.
import { getSkiTypes } from '@/lib/skiTypes'
import { SITE_URL, buildAllezDestLink, buildAllezHotelLink } from '@/lib/site'
import Image from 'next/image'
import { getHotels } from '@/lib/hotels'
import { getGallery } from '@/lib/galleries'
import { resortSite, skiRentalMapsUrl } from '@/lib/resortLinks'
import { getSkiAreaForResort } from '@/lib/skiAreas'
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
  const countryIt = localizeCountry(d.country, 'it')

  const titles: Record<Locale, string> = {
    en: `Ski-in/ski-out hotels in ${d.name} (${countryEn}) | BestSnowHotels`,
    fr: `Hôtels ski-in/ski-out à ${d.name} (${countryFr}) | BestSnowHotels`,
    es: `Hoteles ski-in/ski-out en ${d.name} (${countryEs}) | BestSnowHotels`,
    pt: `Hotéis ski-in/ski-out em ${d.name} (${countryPt}) | BestSnowHotels`,
    it: `Hotel ski-in/ski-out a ${d.name} (${countryIt}) | BestSnowHotels`,
  }
  const descriptions: Record<Locale, string> = {
    en: `Best ski-in/ski-out hotels in ${d.name}. ${d.pistesKm} km of pistes, top at ${d.altitudeSummit} m. Compare Booking, Expedia and Hotels.com.`,
    fr: `Meilleurs hôtels ski-in/ski-out à ${d.name}. ${d.pistesKm} km de pistes, sommet à ${d.altitudeSummit} m. Comparez Booking, Expedia et Hotels.com.`,
    es: `Mejores hoteles ski-in/ski-out en ${d.name}. ${d.pistesKm} km de pistas, cumbre a ${d.altitudeSummit} m. Compara Booking, Expedia y Hotels.com.`,
    pt: `Melhores hotéis ski-in/ski-out em ${d.name}. ${d.pistesKm} km de pistas, cume a ${d.altitudeSummit} m. Compare Booking, Expedia e Hotels.com.`,
    it: `Migliori hotel ski-in/ski-out a ${d.name}. ${d.pistesKm} km di piste, cima a ${d.altitudeSummit} m. Confronta Booking, Expedia e Hotels.com.`,
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
        it: `${SITE_URL}/it/destinations/${d.slug}`,
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
  const skiArea = getSkiAreaForResort(slug)
  const allezLink = buildAllezDestLink(d.name, d.country, 'destination', 7)
  const hotels = getHotels(slug)
  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }
  const verticalDrop = d.altitudeSummit - d.altitudeBase
  const hasGlacier = d.vibes.includes('glacier')
  const snow = snowByMonth(d)
  const skiTypeLabels: Record<string, string> = {
    alpine: dict.destination.skiAlpine,
    snowboard: dict.destination.skiSnowboard,
    freeride: dict.destination.skiFreeride,
    snowpark: dict.destination.skiSnowpark,
    glacier: dict.destination.skiGlacier,
    nordic: dict.destination.skiNordic,
    touring: dict.destination.skiTouring,
  }
  const skiTypes = getSkiTypes(d)
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
      .replace(
        '{totalRuns}',
        String(d.pisteCounts.green + d.pisteCounts.blue + d.pisteCounts.red + d.pisteCounts.black),
      )

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

      {/* Hero, photo background */}
      <section className="relative overflow-hidden border-b border-ice-100">
        <Image
          src={`/images/destinations/${d.slug}.jpg`}
          alt={`${d.name}, ${localizeRegion(d.region, l)}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/70 to-slate-deep/45" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <nav className="text-sm text-white/70 mb-5">
            <Link href={`/${l}`} className="hover:text-white">
              {dict.nav.home}
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href={`/${l}/destinations`} className="hover:text-white">
              {dict.destinations.title}
            </Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{d.name}</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>
              {d.flag}
            </span>
            <span className="text-sm font-semibold text-white/85 uppercase tracking-wide">
              {localizeRegion(d.region, l)}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
            {d.name}
          </h1>
          <p className="mt-4 text-lg text-white/90 leading-relaxed drop-shadow-sm">
            {d.intro[l]}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={allezLink}
              target="_blank"
              rel="noopener sponsored"
              className="inline-block bg-ice-600 text-white font-semibold px-7 py-3 rounded-full hover:bg-ice-500 transition shadow-lg shadow-ice-950/30"
            >
              {dict.destination.bookCta} →
            </a>
            <Link
              href={`/${l}/weather/${d.slug}`}
              className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white font-semibold px-5 py-3 rounded-full hover:bg-white/25 transition border border-white/25"
            >
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
              {dict.weather.pageTitleResort} →
            </Link>
            {d.vibes.map((v) => (
              <span
                key={v}
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-white bg-white/15 border border-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm"
              >
                {localizeVibe(v, l)}
              </span>
            ))}
          </div>

          {/* Key stats, above the fold */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-ice-100 rounded-2xl overflow-hidden shadow-2xl shadow-slate-deep/40">
            {[
              { label: dict.destinations.altitude, value: `${d.altitudeBase.toLocaleString()} - ${d.altitudeSummit.toLocaleString()} m` },
              { label: dict.destination.verticalDrop, value: `${verticalDrop.toLocaleString()} m` },
              { label: dict.destination.pistesKm, value: `${d.pistesKm} km` },
              { label: dict.destination.lifts, value: `${d.lifts}` },
              { label: dict.destinations.snowScore, value: `${d.snowScore}/100` },
              { label: dict.destination.season, value: formatSeasonRange(d.seasonStart, d.seasonEnd, l) },
            ].map((s) => (
              <div key={s.label} className="bg-white px-4 py-4">
                <div className="text-[11px] uppercase tracking-wide text-ice-600">
                  {s.label}
                </div>
                <div className="mt-1 text-base font-bold text-slate-deep tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Part of a ski area (maillage) */}
      {skiArea && (
        <div className="bg-ice-50 border-b border-ice-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              href={`/${l}/ski-areas/${skiArea.slug}`}
              className="group flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ice-600">
                {dict.skiAreas.partOf}
              </span>
              <span className="font-bold text-slate-deep">{skiArea.name}</span>
              <span className="text-ice-600 tabular-nums">
                · {skiArea.pistesKm} km · {skiArea.members.length} {dict.destinations.resorts}
              </span>
              <span className="font-semibold text-ice-700 group-hover:translate-x-0.5 transition">
                {dict.skiAreas.exploreArea} →
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Pistes and lifts (high on the page) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h2 className="text-2xl font-bold text-slate-deep">
            {dict.destination.pisteTitle}
          </h2>
          {hasGlacier && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ice-700 bg-ice-100 px-3 py-1 rounded-full">
              <span aria-hidden>🧊</span>
              {dict.destination.glacierSkiing}
            </span>
          )}
        </div>

        {/* Ski types */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wide text-ice-600 mb-2">
            {dict.destination.skiTypesTitle}
          </div>
          <div className="flex flex-wrap gap-2">
            {skiTypes.map((t) => (
              <span
                key={t}
                className="inline-flex items-center text-sm font-medium text-ice-800 bg-ice-50 border border-ice-200 px-3 py-1.5 rounded-full"
              >
                {skiTypeLabels[t]}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PisteBreakdown
            destination={d}
            labels={{
              green: dict.destination.pisteGreen,
              blue: dict.destination.pisteBlue,
              red: dict.destination.pisteRed,
              black: dict.destination.pisteBlack,
              runs: dict.destination.runs,
            }}
          />
          <div className="bg-white rounded-2xl border border-ice-100 p-6">
            <div className="text-sm font-bold text-slate-deep mb-4">
              {dict.destination.snowTitle}
            </div>
            <SnowByMonth data={snow} locale={l} />
          </div>
        </div>
        <p className="mt-3 text-xs text-ice-500">
          {dict.destination.pisteNote} {dict.destination.snowNote}
        </p>
      </section>

      {/* Where to stay: example hotels */}
      {hotels.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-slate-deep">
            {dict.destination.whereToStay}
          </h2>
          <p className="mt-2 text-ice-800/80 mb-6">
            {dict.destination.whereToStaySubtitle}
          </p>
          <div className="space-y-5">
            <HotelCard
              hotel={hotels[0]}
              featured
              bookHref={buildAllezHotelLink(hotels[0].name, d.name, d.country, 'hotel', 7)}
              resortName={d.name}
              locale={l}
              labels={hotelLabels}
            />
            {hotels.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotels.slice(1).map((h) => (
                  <HotelCard
                    key={h.id}
                    hotel={h}
                    bookHref={buildAllezHotelLink(h.name, d.name, d.country, 'hotel', 7)}
                    resortName={d.name}
                    locale={l}
                    labels={hotelLabels}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-ice-500">{dict.destination.ratingsNote}</p>
        </section>
      )}

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
        <p className="text-lg text-ice-800/80 leading-relaxed">
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
