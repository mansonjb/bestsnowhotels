import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getDestination } from '@/lib/destinations'
import { GUIDE_SLUGS, resortGuide, resortFaq, isGuide } from '@/lib/resortGuide'
import { getHotels } from '@/lib/hotels'
import HotelCard from '@/components/HotelCard'
import Stay22Map from '@/components/Stay22Map'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { countrySlug } from '@/lib/countries'
import { skiInSkiOutTier } from '@/lib/skiInSkiOut'
import { SITE_URL, hreflangFor, buildAllezHotelLink, buildAllezDestLink, jsonLdGraph } from '@/lib/site'

const T = {
  h1: {
    en: (name: string, n: number) => `${name}: ${n} things to know before you go`,
    fr: (name: string, n: number) => `${name} : ${n} choses à savoir avant de partir`,
    es: (name: string, n: number) => `${name}: ${n} cosas que saber antes de ir`,
    pt: (name: string, n: number) => `${name}: ${n} coisas a saber antes de ir`,
    it: (name: string, n: number) => `${name}: ${n} cose da sapere prima di partire`,
  } as Record<Locale, (name: string, n: number) => string>,
  metaTitle: {
    en: (name: string) => `${name}: things to know before you go`,
    fr: (name: string) => `${name} : à savoir avant de partir`,
    es: (name: string) => `${name}: lo que saber antes de ir`,
    pt: (name: string) => `${name}: o que saber antes de ir`,
    it: (name: string) => `${name}: cosa sapere prima di partire`,
  } as Record<Locale, (name: string) => string>,
  whereToStay: {
    en: 'Where to stay', fr: 'Où dormir', es: 'Dónde alojarse', pt: 'Onde ficar', it: 'Dove alloggiare',
  } as Record<Locale, string>,
  whereToStaySub: {
    en: 'Hotels we like for ski access and value. Prices are indicative; check live availability.',
    fr: "Des hôtels qu'on aime pour l'accès aux pistes et le rapport qualité-prix. Prix indicatifs, vérifiez les disponibilités en direct.",
    es: 'Hoteles que nos gustan por el acceso a pistas y la relación calidad-precio. Precios indicativos; comprueba la disponibilidad en directo.',
    pt: 'Hotéis de que gostamos pelo acesso às pistas e pela relação qualidade-preço. Preços indicativos; verifique a disponibilidade em direto.',
    it: "Hotel che ci piacciono per l'accesso alle piste e il rapporto qualità-prezzo. Prezzi indicativi; verifica la disponibilità in tempo reale.",
  } as Record<Locale, string>,
  fullGuide: {
    en: 'Full resort guide', fr: 'Guide complet de la station', es: 'Guía completa de la estación', pt: 'Guia completo da estância', it: 'Guida completa della località',
  } as Record<Locale, string>,
  ctaTitle: {
    en: (name: string) => `The full ${name} guide`,
    fr: (name: string) => `Le guide complet de ${name}`,
    es: (name: string) => `La guía completa de ${name}`,
    pt: (name: string) => `O guia completo de ${name}`,
    it: (name: string) => `La guida completa di ${name}`,
  } as Record<Locale, (name: string) => string>,
  ctaSub: {
    en: 'Hotels, piste breakdown, snow month by month, lift and rental info, map and more.',
    fr: 'Hôtels, détail des pistes, neige mois par mois, forfait et location, carte et plus encore.',
    es: 'Hoteles, desglose de pistas, nieve mes a mes, forfait y alquiler, mapa y mucho más.',
    pt: 'Hotéis, detalhe das pistas, neve mês a mês, passe e aluguer, mapa e muito mais.',
    it: 'Hotel, dettaglio delle piste, neve mese per mese, skipass e noleggio, mappa e altro.',
  } as Record<Locale, string>,
  ctaButton: {
    en: (name: string) => `See the full ${name} guide`,
    fr: (name: string) => `Voir le guide complet de ${name}`,
    es: (name: string) => `Ver la guía completa de ${name}`,
    pt: (name: string) => `Ver o guia completo de ${name}`,
    it: (name: string) => `Vedi la guida completa di ${name}`,
  } as Record<Locale, (name: string) => string>,
  faqHeading: {
    en: 'More questions, answered', fr: 'Plus de questions, des réponses', es: 'Más preguntas, respondidas', pt: 'Mais perguntas, respondidas', it: 'Altre domande, con risposta',
  } as Record<Locale, string>,
  snowReport: {
    en: 'Live snow report', fr: 'Bulletin neige en direct', es: 'Parte de nieve en directo', pt: 'Boletim de neve em direto', it: 'Bollettino neve in tempo reale',
  } as Record<Locale, string>,
  skiInCountry: {
    en: 'Ski-in/ski-out', fr: 'Stations ski au pied', es: 'Ski-in/ski-out', pt: 'Ski-in/ski-out', it: 'Ski-in/ski-out',
  } as Record<Locale, string>,
  ratingsNote: {
    en: 'Ratings and review counts from Google Places. We may earn a commission on bookings.',
    fr: 'Notes et nombre d’avis via Google Places. Nous pouvons percevoir une commission sur les réservations.',
    es: 'Valoraciones y número de reseñas de Google Places. Podemos ganar una comisión por las reservas.',
    pt: 'Avaliações e número de comentários do Google Places. Podemos ganhar uma comissão nas reservas.',
    it: 'Valutazioni e numero di recensioni da Google Places. Potremmo guadagnare una commissione sulle prenotazioni.',
  } as Record<Locale, string>,
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) for (const slug of GUIDE_SLUGS) params.push({ locale, slug })
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const d = getDestination(slug)
  if (!d || !isGuide(slug)) return {}
  const points = resortGuide(d, l)
  return {
    title: `${T.metaTitle[l](d.name)} | BestSnowHotels`,
    description: points[0]?.a ?? d.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/guides/${slug}`,
      languages: hreflangFor(`/guides/${slug}`),
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const d = getDestination(slug)
  if (!d || !isGuide(slug)) notFound()

  const dict = await getDictionary(l)
  const points = resortGuide(d, l)
  const faq = resortFaq(d, l)
  const hotels = getHotels(slug).slice(0, 4)
  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [...points, ...faq].map((p) => ({
        '@type': 'Question',
        name: p.q,
        acceptedAnswer: { '@type': 'Answer', text: p.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.guides, item: `${SITE_URL}/${l}/guides` },
        { '@type': 'ListItem', position: 3, name: d.name, item: `${SITE_URL}/${l}/guides/${slug}` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        <SafeImage
          src={`/images/destinations/${slug}.jpg`}
          alt={`${d.name}, ${localizeRegion(d.region, l)}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/40 to-slate-deep/20" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <nav className="text-xs text-white/80 mb-3 flex items-center gap-2 flex-wrap">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span aria-hidden>/</span>
            <Link href={`/${l}/guides`} className="hover:text-white">{dict.nav.guides}</Link>
            <span aria-hidden>/</span>
            <span>{d.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-4xl">
            {T.h1[l](d.name, points.length)}
          </h1>
          <p className="mt-2 text-white/85 text-sm">
            {localizeRegion(d.region, l)}, {localizeCountry(d.country, l)} {d.flag}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-lg text-ice-800/85 leading-relaxed">{d.intro[l]}</p>
      </section>

      {/* The points */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {points.map((p, i) => (
          <div key={i} className="border-l-4 border-ice-400 pl-5">
            <h2 className="text-xl font-bold text-slate-deep flex gap-3">
              <span className="text-ice-500 tabular-nums">{i + 1}.</span>
              <span>{p.q}</span>
            </h2>
            <p className="mt-2 text-ice-800/85 leading-relaxed">{p.a}</p>
          </div>
        ))}
      </section>

      {/* Prominent full-resort-guide CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-2xl bg-slate-deep text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold">{T.ctaTitle[l](d.name)}</h2>
            <p className="mt-1 text-white/80 text-sm">{T.ctaSub[l]}</p>
          </div>
          <Link
            href={`/${l}/destinations/${slug}`}
            className="shrink-0 inline-flex items-center justify-center bg-white text-slate-deep font-semibold px-6 py-3.5 rounded-full hover:bg-ice-50 transition shadow-lg"
          >
            {T.ctaButton[l](d.name)} →
          </Link>
        </div>
      </section>

      {/* Extra FAQ (distinct, data-driven questions) */}
      {faq.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-slate-deep mb-5">{T.faqHeading[l]}</h2>
          <dl className="space-y-5">
            {faq.map((p, i) => (
              <div key={i} className="bg-ice-50 rounded-2xl p-5">
                <dt className="font-semibold text-slate-deep">{p.q}</dt>
                <dd className="mt-1.5 text-ice-800/85 leading-relaxed">{p.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Where to stay (hotel CTAs) */}
      {hotels.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-deep">{T.whereToStay[l]}</h2>
          <p className="mt-2 text-ice-800/80 mb-6">{T.whereToStaySub[l]}</p>
          <div className="space-y-5">
            <HotelCard
              hotel={hotels[0]}
              featured
              bookHref={buildAllezHotelLink(hotels[0].name, d.name, d.country, 'guide', 7)}
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
                    bookHref={buildAllezHotelLink(h.name, d.name, d.country, 'guide', 7)}
                    resortName={d.name}
                    locale={l}
                    labels={hotelLabels}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-ice-500">{T.ratingsNote[l]}</p>
        </section>
      )}

      {/* Map */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Stay22Map lat={d.lat} lng={d.lng} destName={d.name} height={460} />
        <div className="mt-6 text-center">
          <a
            href={buildAllezDestLink(d.name, d.country, 'guide')}
            target="_blank"
            rel="noopener sponsored"
            className="inline-block bg-slate-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20"
          >
            {dict.destination.bookCta} →
          </a>
        </div>
      </section>

      {/* Cross-links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-wrap gap-3 text-sm">
        <Link href={`/${l}/weather/${slug}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">
          {T.snowReport[l]}
        </Link>
        {skiInSkiOutTier(slug) !== 'limited' && (
          <Link href={`/${l}/ski-in-ski-out/${countrySlug(d.country)}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">
            {T.skiInCountry[l]}: {localizeCountry(d.country, l)}
          </Link>
        )}
      </section>
    </>
  )
}
