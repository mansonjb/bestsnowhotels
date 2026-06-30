import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import Stay22Map from '@/components/Stay22Map'
import { directAnswer } from '@/lib/directAnswer'
import { partnerLinksFor } from '@/lib/partnerLinks'

const PARTNER_LABEL = {
  heading: {
    en: 'Planning your trip to {name}?',
    fr: 'Vous préparez votre voyage à {name} ?',
    es: '¿Preparas tu viaje a {name}?',
    pt: 'A planear a sua viagem a {name}?',
    it: 'Stai organizzando il tuo viaggio a {name}?',
  } as Record<Locale, string>,
  sub: {
    en: 'A few of our sister sites cover this destination too.',
    fr: "Quelques-uns de nos sites partenaires couvrent aussi cette destination.",
    es: 'Algunos de nuestros sitios hermanos también cubren este destino.',
    pt: 'Alguns dos nossos sites parceiros também cobrem este destino.',
    it: 'Alcuni dei nostri siti partner coprono anche questa destinazione.',
  } as Record<Locale, string>,
  visit: { en: 'Visit', fr: 'Voir', es: 'Ver', pt: 'Ver', it: 'Vai a' } as Record<Locale, string>,
}
import RelatedBridges from '@/components/RelatedBridges'
import HubChips from '@/components/HubChips'
import { linkifyProse } from '@/lib/textLinks'
import { nearbyResorts, similarResorts, hubLinksFor } from '@/lib/related'
import { regionSlug } from '@/lib/regionPages'
import {
  destinations,
  getDestination,
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
import { resortFacts } from '@/lib/resortFacts'
import { resortSite, skiRentalMapsUrl } from '@/lib/resortLinks'
import { getSkiAreaForResort } from '@/lib/skiAreas'
import { countrySlug } from '@/lib/countries'
import { getSioCountry } from '@/lib/skiInSkiOut'
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
  const near = nearbyResorts(slug, 4)
  const similar = similarResorts(slug, 4, near.map((n) => n.slug))
  const skiArea = getSkiAreaForResort(slug)
  const cSlug = countrySlug(d.country)
  const regionLabel = localizeRegion(d.region, l)
  const countryLabel = localizeCountry(d.country, l)
  const hubGroups = hubLinksFor(d, l, regionLabel, countryLabel)
  // Localised copy for the maillage sections (chip cloud + bridges).
  const cocoon = {
    hubHeading: ({ en: 'Keep exploring from here', fr: 'Continuer à explorer', es: 'Sigue explorando desde aquí', pt: 'Continue a explorar a partir daqui', it: 'Continua a esplorare da qui' } as Record<Locale, string>)[l],
    hubSub: ({ en: `Everything on our site connected to ${d.name}: its area, the lists it makes, head-to-heads and trip guides.`, fr: `Tout ce qui, sur le site, est lié à ${d.name} : sa région, les sélections où elle figure, les comparatifs et les guides pratiques.`, es: `Todo lo de nuestra web conectado con ${d.name}: su zona, las listas en las que aparece, los duelos y las guías de viaje.`, pt: `Tudo no nosso site ligado a ${d.name}: a sua zona, as listas em que aparece, os duelos e os guias de viagem.`, it: `Tutto ciò che sul sito è collegato a ${d.name}: la sua zona, le liste in cui compare, i confronti e le guide di viaggio.` } as Record<Locale, string>)[l],
    nearTitle: ({ en: `Ski resorts near ${d.name}`, fr: `Stations de ski près de ${d.name}`, es: `Estaciones de esquí cerca de ${d.name}`, pt: `Estâncias de esqui perto de ${d.name}`, it: `Località sciistiche vicino a ${d.name}` } as Record<Locale, string>)[l],
    nearSub: ({ en: 'The closest alternatives, an easy switch if dates or hotels are tight.', fr: 'Les alternatives les plus proches, faciles à substituer si les dates ou les hôtels coincent.', es: 'Las alternativas más cercanas, fáciles de cambiar si las fechas o los hoteles aprietan.', pt: 'As alternativas mais próximas, fáceis de trocar se as datas ou os hotéis apertarem.', it: 'Le alternative più vicine, facili da scegliere se date o hotel scarseggiano.' } as Record<Locale, string>)[l],
    simTitle: ({ en: `If you like ${d.name}, try these`, fr: `Si vous aimez ${d.name}, essayez`, es: `Si te gusta ${d.name}, prueba estas`, pt: `Se gosta de ${d.name}, experimente estas`, it: `Se ti piace ${d.name}, prova queste` } as Record<Locale, string>)[l],
    simSub: ({ en: 'Resorts with a similar feel, snow record and size.', fr: 'Des stations à l\'ambiance, l\'enneigement et la taille comparables.', es: 'Estaciones con un ambiente, una nieve y un tamaño parecidos.', pt: 'Estâncias com ambiente, neve e dimensão semelhantes.', it: 'Località con atmosfera, innevamento e dimensioni simili.' } as Record<Locale, string>)[l],
  }
  const bridges = [
    { key: 'near', title: cocoon.nearTitle, sub: cocoon.nearSub, items: near, accent: 'ice' as const },
    { key: 'similar', title: cocoon.simTitle, sub: cocoon.simSub, items: similar, accent: 'alpenglow' as const },
  ]
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
      .replace('{altitudeBase}', String(d.altitudeBase))
      .replace('{altitudeSummit}', String(d.altitudeSummit))
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
            <Link
              href={`/${l}/regions/${regionSlug(d.region)}`}
              className="text-sm font-semibold text-white/85 uppercase tracking-wide hover:text-white underline decoration-white/30 underline-offset-4 hover:decoration-white transition"
            >
              {localizeRegion(d.region, l)}
            </Link>
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
              { label: dict.destinations.altitude, value: `${d.altitudeBase} - ${d.altitudeSummit} m` },
              { label: dict.destination.verticalDrop, value: `${verticalDrop} m` },
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

      {/* Direct answer (GEO: one extractable, data-built statement for AI engines) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-lg sm:text-xl text-slate-deep leading-relaxed font-medium">
          {directAnswer(d, l)}
        </p>
        <Link
          href={`/${l}/methodology`}
          className="mt-2 inline-block text-sm text-ice-600 hover:text-alpenglow-700 underline decoration-ice-300 underline-offset-2"
        >
          {({ en: 'How we score and classify resorts', fr: 'Comment on note et classe les stations', es: 'Cómo puntuamos y clasificamos las estaciones', pt: 'Como pontuamos e classificamos as estâncias', it: 'Come valutiamo e classifichiamo le località' } as Record<Locale, string>)[l]}
        </Link>
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
          {linkifyProse(d.longDescription[l], d, l)}
        </p>

        {/* Good to know: data-driven facts, unique per resort */}
        <div className="mt-8 rounded-2xl border border-ice-100 bg-ice-50/60 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ice-700 mb-4">
            {dict.destination.goodToKnow}
          </h3>
          <ul className="space-y-3">
            {resortFacts(d, l).map((fact, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-ice-800/90 leading-relaxed">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ice-400" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

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

      {/* Semantic cocoon: coloured chip cloud of every connected page (maillage) */}
      <HubChips groups={hubGroups} heading={cocoon.hubHeading} sub={cocoon.hubSub} />

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

      {/* Sister sites: contextual cross-links, only on resorts they also cover */}
      {partnerLinksFor(d.slug, d.name, l).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-slate-deep">
            {PARTNER_LABEL.heading[l].replace('{name}', d.name)}
          </h2>
          <p className="mt-1 text-ice-800/75">{PARTNER_LABEL.sub[l]}</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {partnerLinksFor(d.slug, d.name, l).map((p) => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener"
                className="block rounded-2xl border border-ice-100 bg-white p-5 hover:border-ice-300 hover:shadow-sm transition"
              >
                <div className="text-sm font-bold uppercase tracking-wide text-ice-700">{p.name}</div>
                <p className="mt-2 text-sm text-ice-800/85 leading-relaxed">{p.blurb}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-alpenglow-700">
                  {PARTNER_LABEL.visit[l]} {p.name} →
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related: similar-resort bridges (nearest by geography + same character) */}
      <RelatedBridges buckets={bridges} locale={l} cardLabels={cardLabels} />
    </>
  )
}
