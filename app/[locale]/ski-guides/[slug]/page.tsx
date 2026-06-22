import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getThemes, getTheme, themeContent, themeResorts, themeHotels } from '@/lib/skiThemes'
import DestinationCard from '@/components/DestinationCard'
import HotelCard from '@/components/HotelCard'
import { localizeRegion } from '@/lib/regions'
import { localizeCountry } from '@/lib/countryNames'
import { hotelReason, whyWeLikeLabel } from '@/lib/hotelContent'
import { SITE_URL, hreflangFor, buildAllezHotelLink } from '@/lib/site'

const T = {
  picksResorts: { en: 'Our picks', fr: 'Notre sélection', es: 'Nuestra selección', pt: 'A nossa seleção', it: 'La nostra selezione' } as Record<Locale, string>,
  picksHotels: { en: 'The hotels, resort by resort', fr: 'Les hôtels, station par station', es: 'Los hoteles, estación por estación', pt: 'Os hotéis, estância a estância', it: 'Gli hotel, località per località' } as Record<Locale, string>,
  viewResort: { en: 'View resort', fr: 'Voir la station', es: 'Ver estación', pt: 'Ver estância', it: 'Vedi località' } as Record<Locale, string>,
  faqHeading: { en: 'Frequently asked questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes', it: 'Domande frequenti' } as Record<Locale, string>,
  ratingsNote: {
    en: 'Ratings from Google Places. We may earn a commission on bookings.',
    fr: 'Notes via Google Places. Nous pouvons percevoir une commission sur les réservations.',
    es: 'Valoraciones de Google Places. Podemos ganar una comisión por las reservas.',
    pt: 'Avaliações do Google Places. Podemos ganhar uma comissão nas reservas.',
    it: 'Valutazioni da Google Places. Potremmo guadagnare una commissione sulle prenotazioni.',
  } as Record<Locale, string>,
  allGuides: { en: 'All ski guides', fr: 'Tous les guides ski', es: 'Todas las guías', pt: 'Todos os guias', it: 'Tutte le guide' } as Record<Locale, string>,
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const l of locales) for (const t of getThemes()) params.push({ locale: l, slug: t.slug })
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const theme = getTheme(slug)
  if (!theme) return {}
  const c = themeContent(slug)
  return {
    title: `${c.title[l]} | BestSnowHotels`,
    description: c.intro[l],
    alternates: { canonical: `${SITE_URL}/${l}/ski-guides/${slug}`, languages: hreflangFor(`/ski-guides/${slug}`) },
  }
}

export default async function SkiGuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const theme = getTheme(slug)
  if (!theme) notFound()
  const dict = await getDictionary(l)
  const c = themeContent(slug)
  const resorts = theme.kind === 'resorts' ? themeResorts(slug) : []
  const hotels = theme.kind === 'hotels' ? themeHotels(slug) : []

  // Group hotels by resort so the page reads as scannable categories.
  const hotelGroups: { resort: (typeof hotels)[number]['resort']; items: typeof hotels }[] = []
  for (const h of hotels) {
    let g = hotelGroups.find((x) => x.resort.slug === h.resort.slug)
    if (!g) {
      g = { resort: h.resort, items: [] }
      hotelGroups.push(g)
    }
    g.items.push(h)
  }

  const bodyParas = c.body[l].split(/\n+/).map((p) => p.trim()).filter(Boolean)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }
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
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: T.allGuides[l], item: `${SITE_URL}/${l}/ski-guides` },
        { '@type': 'ListItem', position: 3, name: c.title[l], item: `${SITE_URL}/${l}/ski-guides/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q[l], acceptedAnswer: { '@type': 'Answer', text: f.a[l] } })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        <Image src={`/images/destinations/${theme.heroSlug}.jpg`} alt={c.title[l]} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/40 to-slate-deep/15" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <nav className="text-xs text-white/80 mb-3 flex items-center gap-2 flex-wrap">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span aria-hidden>/</span>
            <Link href={`/${l}/ski-guides`} className="hover:text-white">{T.allGuides[l]}</Link>
            <span aria-hidden>/</span>
            <span>{c.title[l]}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-4xl">{c.title[l]}</h1>
        </div>
      </section>

      {/* Intro + body */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-xl sm:text-2xl text-slate-deep font-medium leading-snug max-w-4xl">{c.intro[l]}</p>
        <div className="mt-6 max-w-5xl text-ice-800/80 leading-relaxed md:columns-2 md:gap-12 [&>p]:mb-4">
          {bodyParas.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Picks */}
      {theme.kind === 'resorts' && resorts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.picksResorts[l]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resorts.map((d) => (
              <DestinationCard key={d.slug} destination={d} locale={l} labels={cardLabels} />
            ))}
          </div>
        </section>
      )}

      {theme.kind === 'hotels' && hotelGroups.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-slate-deep mb-8">{T.picksHotels[l]}</h2>
          <div className="space-y-12">
            {hotelGroups.map((g) => (
              <div key={g.resort.slug}>
                <div className="flex items-baseline justify-between gap-3 border-b border-ice-100 pb-2 mb-5">
                  <h3 className="text-xl font-bold text-slate-deep flex items-center gap-2">
                    <span aria-hidden>{g.resort.flag}</span>
                    {g.resort.name}
                    <span className="text-sm font-normal text-ice-600">{localizeRegion(g.resort.region, l)}, {localizeCountry(g.resort.country, l)}</span>
                  </h3>
                  <Link href={`/${l}/destinations/${g.resort.slug}`} className="shrink-0 text-sm font-semibold text-ice-700 hover:text-slate-deep">
                    {T.viewResort[l]} →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {g.items.map(({ hotel, resort }) => (
                    <div key={hotel.id} className="flex flex-col">
                      <HotelCard
                        hotel={hotel}
                        bookHref={buildAllezHotelLink(hotel.name, resort.name, resort.country, 'ski-guide', 7)}
                        resortName={resort.name}
                        locale={l}
                        labels={hotelLabels}
                      />
                      <p className="mt-2 text-sm text-ice-800/85 leading-relaxed">
                        <span className="font-semibold text-slate-deep">{whyWeLikeLabel(l)} </span>
                        {hotelReason(hotel, resort.name, l)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ice-500">{T.ratingsNote[l]}</p>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-5">{T.faqHeading[l]}</h2>
        <dl className="space-y-4">
          {c.faq.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ice-100 p-5">
              <dt className="font-semibold text-slate-deep">{f.q[l]}</dt>
              <dd className="mt-1.5 text-ice-800/85 leading-relaxed">{f.a[l]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href={`/${l}/ski-guides`} className="text-sm font-semibold text-ice-700 hover:text-slate-deep">← {T.allGuides[l]}</Link>
      </section>
    </>
  )
}
