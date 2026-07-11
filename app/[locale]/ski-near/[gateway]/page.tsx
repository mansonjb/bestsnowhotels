import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getGateways, getGateway, resortsNear } from '@/lib/gateways'
import { localizeRegion } from '@/lib/regions'
import { localizeCountry } from '@/lib/countryNames'
import { countrySlug } from '@/lib/countries'
import { regionSlug } from '@/lib/regionPages'
import { SITE_URL, hreflangFor, jsonLdGraph, buildAllezDestLink, buildAllezHotelLink } from '@/lib/site'
import { getHotels } from '@/lib/hotels'
import HotelCard from '@/components/HotelCard'
import Stay22Map from '@/components/Stay22Map'

const T = {
  h1: (airport: string, l: Locale) => ({
    en: `Ski resorts near ${airport}`,
    fr: `Stations de ski près de ${airport}`,
    es: `Estaciones de esquí cerca de ${airport}`,
    pt: `Estâncias de esqui perto de ${airport}`,
    it: `Località sciistiche vicino a ${airport}`,
  }[l]),
  metaDesc: (airport: string, top: string, km: number, l: Locale) => ({
    en: `The closest ski resorts to ${airport}, ranked by distance. ${top} is the nearest at ${km} km, with ski-in/ski-out hotels you can compare in a click.`,
    fr: `Les stations de ski les plus proches de ${airport}, classées par distance. ${top} est la plus proche à ${km} km, avec des hôtels ski au pied à comparer en un clic.`,
    es: `Las estaciones de esquí más cercanas a ${airport}, ordenadas por distancia. ${top} es la más próxima a ${km} km, con hoteles a pie de pista para comparar en un clic.`,
    pt: `As estâncias de esqui mais próximas de ${airport}, ordenadas por distância. ${top} é a mais próxima a ${km} km, com hotéis à beira das pistas para comparar num clique.`,
    it: `Le località sciistiche più vicine a ${airport}, ordinate per distanza. ${top} è la più vicina a ${km} km, con hotel sugli sci da confrontare in un clic.`,
  }[l]),
  intro: (airport: string, n: number, l: Locale) => ({
    en: `Flying into ${airport}? These are the ${n} closest ski resorts, ranked by straight-line distance from the terminal. Mountain roads wind, so allow more time by car, but the order still tells you where the snow starts soonest. Each resort has ski-in/ski-out hotels you can compare in one click.`,
    fr: `Vous atterrissez à ${airport} ? Voici les ${n} stations de ski les plus proches, classées par distance à vol d'oiseau depuis le terminal. Les routes de montagne serpentent, comptez donc plus de temps en voiture, mais l'ordre indique où la neige commence le plus vite. Chaque station a des hôtels ski au pied à comparer en un clic.`,
    es: `¿Aterrizas en ${airport}? Estas son las ${n} estaciones de esquí más cercanas, ordenadas por distancia en línea recta desde la terminal. Las carreteras de montaña serpentean, así que cuenta con más tiempo en coche, pero el orden indica dónde empieza antes la nieve. Cada estación tiene hoteles a pie de pista para comparar en un clic.`,
    pt: `Aterras em ${airport}? Estas são as ${n} estâncias de esqui mais próximas, ordenadas por distância em linha reta desde o terminal. As estradas de montanha serpenteiam, por isso conta com mais tempo de carro, mas a ordem indica onde a neve começa mais cedo. Cada estância tem hotéis à beira das pistas para comparar num clique.`,
    it: `Atterri a ${airport}? Queste sono le ${n} località sciistiche più vicine, ordinate per distanza in linea d'aria dal terminal. Le strade di montagna serpeggiano, quindi metti in conto più tempo in auto, ma l'ordine dice dove la neve inizia prima. Ogni località ha hotel sugli sci da confrontare in un clic.`,
  }[l]),
  quick: (top: string, km: number, region: string, l: Locale) => ({
    en: `The closest ski resort to the airport is ${top}, about ${km} km away in ${region}.`,
    fr: `La station de ski la plus proche de l'aéroport est ${top}, à environ ${km} km, ${region}.`,
    es: `La estación de esquí más cercana al aeropuerto es ${top}, a unos ${km} km, en ${region}.`,
    pt: `A estância de esqui mais próxima do aeroporto é ${top}, a cerca de ${km} km, em ${region}.`,
    it: `La località sciistica più vicina all'aeroporto è ${top}, a circa ${km} km, in ${region}.`,
  }[l]),
  rankTitle: { en: 'Closest resorts, nearest first', fr: 'Les stations les plus proches, par distance', es: 'Las estaciones más cercanas, por distancia', pt: 'As estâncias mais próximas, por distância', it: 'Le località più vicine, per distanza' } as Record<Locale, string>,
  fromCity: (city: string, l: Locale) => ({ en: `km from ${city}`, fr: `km de ${city}`, es: `km de ${city}`, pt: `km de ${city}`, it: `km da ${city}` }[l]),
  easyPistes: { en: 'easy pistes', fr: 'de pistes faciles', es: 'de pistas fáciles', pt: 'de pistas fáceis', it: 'di piste facili' } as Record<Locale, string>,
  guide: { en: 'Resort guide', fr: 'Guide de la station', es: 'Guía de la estación', pt: 'Guia da estância', it: 'Guida della località' } as Record<Locale, string>,
  book: { en: 'Find a hotel', fr: 'Trouver un hôtel', es: 'Buscar un hotel', pt: 'Encontrar um hotel', it: 'Trova un hotel' } as Record<Locale, string>,
  mapTitle: { en: 'Hotels around', fr: 'Hôtels autour de', es: 'Hoteles en torno a', pt: 'Hotéis em redor de', it: 'Hotel intorno a' } as Record<Locale, string>,
  allGateways: { en: 'Ski resorts near an airport', fr: "Stations près d'un aéroport", es: 'Estaciones cerca de un aeropuerto', pt: 'Estâncias perto de um aeroporto', it: "Località vicino a un aeroporto" } as Record<Locale, string>,
  faqTitle: { en: 'Getting there', fr: 'Y aller', es: 'Cómo llegar', pt: 'Como chegar', it: 'Come arrivare' } as Record<Locale, string>,
}

const easyPct = (green: number, blue: number, red: number, black: number) => {
  const total = green + blue + red + black
  return total > 0 ? Math.round(((green + blue) / total) * 100) : 0
}

export async function generateStaticParams() {
  const params: { locale: string; gateway: string }[] = []
  for (const locale of locales) {
    for (const g of getGateways()) params.push({ locale, gateway: g.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; gateway: string }>
}): Promise<Metadata> {
  const { locale, gateway } = await params
  const g = getGateway(gateway)
  if (!g) return {}
  const l = locale as Locale
  const near = resortsNear(g)
  return {
    title: `${T.h1(g.airport, l)} | BestSnowHotels`,
    description: T.metaDesc(g.airport, near[0].d.name, near[0].km, l),
    alternates: { canonical: `${SITE_URL}/${locale}/ski-near/${g.slug}`, languages: hreflangFor(`/ski-near/${g.slug}`) },
  }
}

export default async function GatewayPage({
  params,
}: {
  params: Promise<{ locale: string; gateway: string }>
}) {
  const { locale, gateway } = await params
  if (!hasLocale(locale)) notFound()
  const g = getGateway(gateway)
  if (!g) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const near = resortsNear(g)
  if (near.length < 3) notFound()
  const top = near[0]

  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }

  const faq = [
    {
      q: ({ en: `Which ski resort is closest to ${g.airport}?`, fr: `Quelle station de ski est la plus proche de ${g.airport} ?`, es: `¿Qué estación de esquí está más cerca de ${g.airport}?`, pt: `Que estância de esqui está mais perto de ${g.airport}?`, it: `Quale località sciistica è più vicina a ${g.airport}?` } as Record<Locale, string>)[l],
      a: ({ en: `${top.d.name}, in ${localizeRegion(top.d.region, 'en')}, is the nearest at about ${top.km} km in a straight line. By mountain road it is longer, but nothing else is closer.`, fr: `${top.d.name}, ${localizeRegion(top.d.region, 'fr')}, est la plus proche, à environ ${top.km} km à vol d'oiseau. Par la route de montagne c'est plus long, mais rien n'est plus près.`, es: `${top.d.name}, en ${localizeRegion(top.d.region, 'es')}, es la más cercana, a unos ${top.km} km en línea recta. Por carretera de montaña es más, pero nada está más cerca.`, pt: `${top.d.name}, em ${localizeRegion(top.d.region, 'pt')}, é a mais próxima, a cerca de ${top.km} km em linha reta. Por estrada de montanha é mais, mas nada está mais perto.`, it: `${top.d.name}, in ${localizeRegion(top.d.region, 'it')}, è la più vicina, a circa ${top.km} km in linea d'aria. Su strada di montagna è di più, ma niente è più vicino.` } as Record<Locale, string>)[l],
    },
    {
      q: ({ en: `How are these distances measured?`, fr: `Comment ces distances sont-elles mesurées ?`, es: `¿Cómo se miden estas distancias?`, pt: `Como são medidas estas distâncias?`, it: `Come sono misurate queste distanze?` } as Record<Locale, string>)[l],
      a: ({ en: `As the crow flies, from the airport coordinates to each resort. It is a fair way to rank what is nearest, but real driving distance is longer on winding Alpine roads, so treat it as an order of proximity, not a transfer time.`, fr: `À vol d'oiseau, des coordonnées de l'aéroport à chaque station. C'est une façon juste de classer le plus proche, mais la distance réelle par la route est plus longue sur les routes alpines sinueuses : voyez-le comme un ordre de proximité, pas un temps de transfert.`, es: `En línea recta, desde las coordenadas del aeropuerto a cada estación. Es una forma justa de ordenar lo más cercano, pero la distancia real por carretera es mayor en las sinuosas carreteras alpinas: tómalo como un orden de proximidad, no un tiempo de traslado.`, pt: `Em linha reta, das coordenadas do aeroporto a cada estância. É uma forma justa de ordenar o mais próximo, mas a distância real por estrada é maior nas sinuosas estradas alpinas: veja-o como uma ordem de proximidade, não um tempo de transfer.`, it: `In linea d'aria, dalle coordinate dell'aeroporto a ogni località. È un modo equo per ordinare ciò che è più vicino, ma la distanza reale su strada è maggiore sulle tortuose strade alpine: consideralo un ordine di vicinanza, non un tempo di trasferimento.` } as Record<Locale, string>)[l],
    },
  ]

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: T.h1(g.airport, 'en'),
    numberOfItems: near.length,
    itemListElement: near.map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${l}/destinations/${n.d.slug}`, name: n.d.name })),
  }
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: T.allGateways[l], item: `${SITE_URL}/${l}/ski-near` },
      { '@type': 'ListItem', position: 3, name: g.airport, item: `${SITE_URL}/${l}/ski-near/${g.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph([itemList, faqSchema, breadcrumb]) }} />

      <section className="relative overflow-hidden border-b border-ice-100">
        <SafeImage src={`/images/destinations/${top.d.slug}.jpg`} alt={T.h1(g.airport, l)} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/70 to-slate-deep/45" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-white/70 mb-4">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href={`/${l}/ski-near`} className="hover:text-white">{T.allGateways[l]}</Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{g.city}</span>
          </nav>
          <div className="text-sm font-semibold text-white/85 uppercase tracking-wide mb-2">✈ {g.code}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">{T.h1(g.airport, l)}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/90 leading-relaxed drop-shadow-sm">{T.intro(g.airport, near.length, l)}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-2xl border border-ice-200 bg-ice-50 p-5">
          <p className="text-lg text-slate-deep leading-relaxed font-medium">{T.quick(top.d.name, top.km, localizeRegion(top.d.region, l), l)}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.rankTitle[l]}</h2>
        <div className="space-y-6">
          {near.map((n, i) => {
            const d = n.d
            const hotels = getHotels(d.slug).slice(0, 1)
            return (
              <div key={d.slug} className="rounded-3xl border border-ice-100 bg-white overflow-hidden shadow-sm shadow-ice-900/5">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-56 lg:h-full min-h-[220px]">
                    <SafeImage src={`/images/destinations/${d.slug}.jpg`} alt={d.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute top-3 left-3 bg-slate-deep text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                    <div className="absolute top-3 right-3 bg-alpenglow-500 text-white rounded-full px-3 py-1 text-sm font-bold tabular-nums shadow">{n.km} {T.fromCity(g.city, l)}</div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ice-600 mb-1">
                      <Link href={`/${l}/regions/${regionSlug(d.region)}`} className="hover:text-alpenglow-600">{localizeRegion(d.region, l)}</Link>
                      <span className="mx-1.5 text-ice-300">·</span>
                      <Link href={`/${l}/countries/${countrySlug(d.country)}`} className="hover:text-alpenglow-600">{localizeCountry(d.country, l)}</Link>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-deep">{d.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ice-800 bg-ice-50 border border-ice-200 rounded-full px-3 py-1 tabular-nums">{d.altitudeBase} - {d.altitudeSummit} m</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ice-800 bg-ice-50 border border-ice-200 rounded-full px-3 py-1 tabular-nums">{d.pistesKm} km</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ice-800 bg-ice-50 border border-ice-200 rounded-full px-3 py-1 tabular-nums">{easyPct(d.pisteCounts.green, d.pisteCounts.blue, d.pisteCounts.red, d.pisteCounts.black)}% {T.easyPistes[l]}</span>
                    </div>
                    <p className="mt-4 text-sm text-ice-800/80 leading-relaxed line-clamp-3">{d.intro[l]}</p>
                    {hotels.length > 0 && (
                      <div className="mt-4">
                        <HotelCard hotel={hotels[0]} bookHref={buildAllezHotelLink(hotels[0].name, d.name, d.country, 'hotel', 7)} resortName={d.name} locale={l} labels={hotelLabels} />
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={`/${l}/destinations/${d.slug}`} className="inline-block text-sm font-semibold text-ice-700 border border-ice-200 rounded-full px-4 py-2 hover:bg-ice-50 transition">{T.guide[l]} →</Link>
                      <a href={buildAllezDestLink(d.name, d.country, 'destination', 7)} target="_blank" rel="noopener sponsored" className="inline-block text-sm font-semibold text-white bg-slate-deep rounded-full px-4 py-2 hover:bg-ice-800 transition">{T.book[l]} →</a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-4">{T.mapTitle[l]} {top.d.name}</h2>
        <Stay22Map lat={top.d.lat} lng={top.d.lng} destName={top.d.name} height={460} />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.faqTitle[l]}</h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <details key={i} className="group bg-white border border-ice-100 rounded-2xl p-5">
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex justify-between items-center">
                <span>{f.q}</span>
                <span className="text-ice-500 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-ice-800/80 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href={`/${l}/ski-near`} className="inline-block rounded-full border border-ice-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-deep hover:bg-ice-50 transition">← {T.allGateways[l]}</Link>
      </section>
    </>
  )
}
