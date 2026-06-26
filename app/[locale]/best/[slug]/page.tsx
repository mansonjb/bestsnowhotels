import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { BEST_FOR_LISTS, getBestForList } from '@/lib/bestFor'
import { destinations } from '@/lib/destinations'
import type { Destination } from '@/lib/destinations'
import { SITE_URL, jsonLdGraph, buildAllezHotelLink, buildAllezDestLink } from '@/lib/site'
import { getHotels } from '@/lib/hotels'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { formatSeasonRange } from '@/lib/dates'
import HotelCard from '@/components/HotelCard'
import Stay22Map from '@/components/Stay22Map'
import bestForGuide from '@/data/bestForGuide.json'

interface GuideContent {
  longIntro: Record<Locale, string>
  criteria: { title: Record<Locale, string>; text: Record<Locale, string> }[]
  faq: { q: Record<Locale, string>; a: Record<Locale, string> }[]
}
const GUIDE = bestForGuide as Record<string, GuideContent | undefined>

const T = {
  topPicks: { en: 'Our top picks', fr: 'Notre sélection', es: 'Nuestra selección', pt: 'A nossa seleção', it: 'La nostra selezione' },
  topAnswer: {
    en: 'At a glance, the best resorts on this list are',
    fr: 'En bref, les meilleures stations de cette liste sont',
    es: 'En resumen, las mejores estaciones de esta lista son',
    pt: 'Em resumo, as melhores estâncias desta lista são',
    it: 'In sintesi, le migliori località di questa lista sono',
  },
  criteriaTitle: { en: 'What to look for', fr: 'Ce qu’il faut regarder', es: 'Qué buscar', pt: 'O que procurar', it: 'Cosa cercare' },
  rundownTitle: { en: 'The resorts, ranked', fr: 'Les stations, classées', es: 'Las estaciones, clasificadas', pt: 'As estâncias, classificadas', it: 'Le località, in classifica' },
  whereToStay: { en: 'Where to stay', fr: 'Où dormir', es: 'Dónde alojarse', pt: 'Onde ficar', it: 'Dove dormire' },
  fullGuide: { en: 'Full resort guide', fr: 'Guide complet de la station', es: 'Guía completa de la estación', pt: 'Guia completo da estância', it: 'Guida completa della località' },
  findHotels: { en: 'Find hotels', fr: 'Trouver des hôtels', es: 'Buscar hoteles', pt: 'Procurar hotéis', it: 'Cerca hotel' },
  mapTitle: { en: 'Map: hotels in', fr: 'Carte : hôtels à', es: 'Mapa: hoteles en', pt: 'Mapa: hotéis em', it: 'Mappa: hotel a' },
  mapSub: {
    en: 'Live prices from Booking, Expedia and Hotels.com around the top resort on this list.',
    fr: 'Prix en direct sur Booking, Expedia et Hotels.com autour de la meilleure station de cette liste.',
    es: 'Precios en directo de Booking, Expedia y Hotels.com alrededor de la mejor estación de esta lista.',
    pt: 'Preços em direto da Booking, Expedia e Hotels.com em torno da melhor estância desta lista.',
    it: 'Prezzi in tempo reale da Booking, Expedia e Hotels.com attorno alla migliore località di questa lista.',
  },
  faqTitle: { en: 'Frequently asked questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes', it: 'Domande frequenti' },
  base: { en: 'Base', fr: 'Base', es: 'Base', pt: 'Base', it: 'Base' },
  summit: { en: 'Summit', fr: 'Sommet', es: 'Cima', pt: 'Cume', it: 'Vetta' },
  pistes: { en: 'Pistes', fr: 'Pistes', es: 'Pistas', pt: 'Pistas', it: 'Piste' },
  lifts: { en: 'Lifts', fr: 'Remontées', es: 'Remontes', pt: 'Teleféricos', it: 'Impianti' },
  snow: { en: 'Snow score', fr: 'Score neige', es: 'Nieve', pt: 'Neve', it: 'Neve' },
  season: { en: 'Season', fr: 'Saison', es: 'Temporada', pt: 'Época', it: 'Stagione' },
  exploreAll: { en: 'See all resorts', fr: 'Voir toutes les stations', es: 'Ver todas las estaciones', pt: 'Ver todas as estâncias', it: 'Vedi tutte le località' },
} as Record<string, Record<Locale, string>>

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
      languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/best/${slug}`])), 'x-default': `${SITE_URL}/en/best/${slug}` },
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

  const guide = GUIDE[slug]
  const ranked = matched.slice(0, 12)
  const topPicks = matched.slice(0, 8)
  const mapDest = matched[0]
  const otherLists = BEST_FOR_LISTS.filter((x) => x.slug !== b.slug).slice(0, 8)

  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }

  const jsonLd: object[] = [
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
      numberOfItems: matched.length,
      itemListElement: matched.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/destinations/${m.slug}`,
        name: m.name,
      })),
    },
  ]
  if (guide?.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map((f) => ({
        '@type': 'Question',
        name: f.q[l],
        acceptedAnswer: { '@type': 'Answer', text: f.a[l] },
      })),
    })
  }

  function StatPill({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-xl bg-ice-50 border border-ice-100 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-ice-700/80">{label}</div>
        <div className="font-bold text-slate-deep text-sm tabular-nums">{value}</div>
      </div>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
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
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow max-w-4xl">
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

      {/* Quick answer (GEO snippet) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-2xl bg-gradient-to-br from-ice-50 to-white border border-ice-200 p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-alpenglow-700">{T.topPicks[l]}</div>
          <p className="mt-2 text-lg text-slate-deep leading-relaxed">
            {T.topAnswer[l]}{' '}
            {topPicks.map((d, i) => (
              <span key={d.slug}>
                <a href={`#r-${d.slug}`} className="font-semibold text-ice-800 underline decoration-ice-300 underline-offset-2 hover:text-alpenglow-700">
                  {d.name}
                </a>
                {i < topPicks.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* How we picked + long intro */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.best.howRanked}</h2>
        <p className="mt-3 text-lg text-ice-800/90 leading-relaxed">{b.description[l]}</p>
        {guide?.longIntro?.[l] && (
          <div className="mt-4 text-base text-ice-800/85 leading-relaxed whitespace-pre-line md:columns-2 md:gap-10">
            {guide.longIntro[l]}
          </div>
        )}
      </section>

      {/* Criteria: what to look for */}
      {guide?.criteria?.length ? (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <h2 className="text-2xl font-bold text-slate-deep">{T.criteriaTitle[l]}</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.criteria.map((c, i) => (
              <div key={i} className="rounded-2xl border border-ice-100 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex-none mt-0.5 h-7 w-7 rounded-full bg-alpenglow-100 text-alpenglow-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-deep">{c.title[l]}</h3>
                    <p className="mt-1 text-sm text-ice-800/85 leading-relaxed">{c.text[l]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Ranked rundown: the meat. Real per-resort intro, stats, a hotel, CTAs. */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <h2 className="text-2xl font-bold text-slate-deep">{T.rundownTitle[l]}</h2>
        <div className="mt-6 space-y-8">
          {ranked.map((d, i) => {
            const hotels = getHotels(d.slug).slice(0, 2)
            return (
              <article
                key={d.slug}
                id={`r-${d.slug}`}
                className="scroll-mt-24 rounded-3xl border border-ice-100 bg-white overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  <div className="relative h-52 lg:h-auto lg:col-span-2">
                    <Image
                      src={`/images/destinations/${d.slug}.jpg`}
                      alt={d.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 h-9 w-9 rounded-full bg-slate-deep/90 text-white font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="p-6 lg:col-span-3">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <h3 className="text-2xl font-bold text-slate-deep">{d.name}</h3>
                      <div className="text-sm text-ice-700">
                        {localizeCountry(d.country, l)} · {localizeRegion(d.region, l)}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <StatPill label={T.base[l]} value={`${d.altitudeBase} m`} />
                      <StatPill label={T.summit[l]} value={`${d.altitudeSummit} m`} />
                      <StatPill label={T.pistes[l]} value={`${d.pistesKm} km`} />
                      <StatPill label={T.lifts[l]} value={`${d.lifts}`} />
                      <StatPill label={T.snow[l]} value={`${d.snowScore}`} />
                      <StatPill label={T.season[l]} value={formatSeasonRange(d.seasonStart, d.seasonEnd, l)} />
                    </div>
                    <p className="mt-4 text-[15px] text-ice-800/90 leading-relaxed">{d.intro[l]}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/${l}/destinations/${d.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ice-600 hover:bg-ice-700 text-white text-sm font-semibold px-4 py-1.5 transition"
                      >
                        {T.fullGuide[l]} →
                      </Link>
                      <a
                        href={buildAllezDestLink(d.name, d.country, 'best', 7)}
                        target="_blank"
                        rel="nofollow noopener"
                        className="inline-flex items-center gap-1.5 rounded-full bg-alpenglow-500 hover:bg-alpenglow-600 text-white text-sm font-semibold px-4 py-1.5 transition"
                      >
                        {T.findHotels[l]} · {d.name}
                      </a>
                    </div>
                  </div>
                </div>
                {hotels.length > 0 && (
                  <div className="border-t border-ice-100 bg-ice-50/40 p-6">
                    <div className="text-sm font-bold uppercase tracking-wide text-ice-700 mb-3">
                      {T.whereToStay[l]} · {d.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {hotels.map((h) => (
                        <HotelCard
                          key={h.id}
                          hotel={h}
                          bookHref={buildAllezHotelLink(h.name, d.name, d.country, 'best', 7)}
                          resortName={d.name}
                          locale={l}
                          labels={hotelLabels}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
        {matched.length > ranked.length && (
          <div className="mt-8">
            <Link href={`/${l}/destinations`} className="text-ice-700 font-semibold hover:text-slate-deep">
              {T.exploreAll[l]} →
            </Link>
          </div>
        )}
      </section>

      {/* Map of the top resort (hotels + prices) */}
      {mapDest && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className="text-2xl font-bold text-slate-deep">
            {T.mapTitle[l]} {mapDest.name}
          </h2>
          <p className="mt-2 text-ice-800/80 max-w-3xl">{T.mapSub[l]}</p>
          <div className="mt-5">
            <Stay22Map lat={mapDest.lat} lng={mapDest.lng} destName={mapDest.name} height={460} />
          </div>
        </section>
      )}

      {/* FAQ (GEO/SEO) */}
      {guide?.faq?.length ? (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className="text-2xl font-bold text-slate-deep">{T.faqTitle[l]}</h2>
          <div className="mt-6 space-y-3">
            {guide.faq.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-ice-100 bg-white p-5 open:shadow-sm">
                <summary className="cursor-pointer list-none font-semibold text-slate-deep flex items-center justify-between gap-4">
                  {f.q[l]}
                  <span className="flex-none text-ice-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-[15px] text-ice-800/85 leading-relaxed">{f.a[l]}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Other lists (maillage) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
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
