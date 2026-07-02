import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { skiInSkiOutByCountry, getSioCountry, skiInSkiOutTier, isCarFree } from '@/lib/skiInSkiOut'
import type { SioCountry } from '@/lib/skiInSkiOut'
import type { Destination } from '@/lib/destinations'
import { localizeCountry, inCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { countrySlug } from '@/lib/countries'
import { SITE_URL, hreflangFor, buildAllezDestLink, buildAllezHotelLink, jsonLdGraph } from '@/lib/site'
import { getHotels } from '@/lib/hotels'
import HotelCard from '@/components/HotelCard'
import Stay22Map from '@/components/Stay22Map'

// Localised "ski-in/ski-out" term as natives actually search it (ski au pied,
// a pie de pista, sulle piste). Used in titles, copy and the FAQ for SEO.
const TERM: Record<Locale, string> = {
  en: 'ski-in/ski-out',
  fr: 'ski au pied',
  es: 'a pie de pista',
  pt: 'ski-in/ski-out',
  it: 'sci ai piedi',
}

const NOUN: Record<Locale, string> = {
  en: 'Ski-in/ski-out resorts',
  fr: 'Stations ski au pied',
  es: 'Estaciones a pie de pista',
  pt: 'Estâncias ski-in/ski-out',
  it: 'Località ski-in/ski-out',
}

const T = {
  strongHeading: {
    en: 'Ski to your door',
    fr: 'Skis aux pieds dès la porte',
    es: 'Esquía hasta la puerta',
    pt: 'Esquia até à porta',
    it: 'Sci ai piedi fin dalla porta',
  } as Record<Locale, string>,
  strongLead: {
    en: 'Most of the village is genuinely on the snow: you can clip in outside your hotel.',
    fr: "L'essentiel du village est vraiment sur la neige : on chausse devant l'hôtel.",
    es: 'La mayor parte del pueblo está realmente sobre la nieve: te calzas los esquís a la salida del hotel.',
    pt: 'A maior parte da aldeia está mesmo sobre a neve: calça os esquis à porta do hotel.',
    it: 'Gran parte del paese è davvero sulla neve: ci si allaccia gli sci davanti all’hotel.',
  } as Record<Locale, string>,
  partialHeading: {
    en: 'Ski-in/ski-out addresses',
    fr: 'Adresses ski au pied',
    es: 'Direcciones a pie de pista',
    pt: 'Moradas ski-in/ski-out',
    it: 'Indirizzi ski-in/ski-out',
  } as Record<Locale, string>,
  partialLead: {
    en: 'Not the whole resort, but specific hotels or sectors put you right on the piste. Pick the address carefully.',
    fr: "Pas toute la station, mais certains hôtels ou secteurs vous posent au bord de la piste. Choisissez bien l'adresse.",
    es: 'No toda la estación, pero hoteles o sectores concretos te dejan justo en la pista. Elige bien la dirección.',
    pt: 'Não toda a estância, mas hotéis ou setores específicos deixam-no mesmo na pista. Escolha bem a morada.',
    it: 'Non tutta la località, ma hotel o settori specifici vi mettono proprio sulla pista. Scegliete bene l’indirizzo.',
  } as Record<Locale, string>,
  carFree: {
    en: 'Car-free', fr: 'Sans voitures', es: 'Sin coches', pt: 'Sem carros', it: 'Senza auto',
  } as Record<Locale, string>,
  viewHotels: {
    en: 'View hotels', fr: 'Voir les hôtels', es: 'Ver hoteles', pt: 'Ver hotéis', it: 'Vedi hotel',
  } as Record<Locale, string>,
  book: {
    en: 'Compare stays', fr: 'Comparer les séjours', es: 'Comparar alojamientos', pt: 'Comparar estadias', it: 'Confronta soggiorni',
  } as Record<Locale, string>,
  alt: { en: 'Base', fr: 'Bas', es: 'Base', pt: 'Base', it: 'Base' } as Record<Locale, string>,
  pistes: { en: 'Pistes', fr: 'Pistes', es: 'Pistas', pt: 'Pistas', it: 'Piste' } as Record<Locale, string>,
  allCountries: {
    en: 'All countries', fr: 'Tous les pays', es: 'Todos los países', pt: 'Todos os países', it: 'Tutti i paesi',
  } as Record<Locale, string>,
  hotelsHeading: {
    en: 'Ski-in/ski-out hotels', fr: 'Hôtels ski au pied', es: 'Hoteles a pie de pista', pt: 'Hotéis ski-in/ski-out', it: 'Hotel sci ai piedi',
  } as Record<Locale, string>,
  hotelsSub: {
    en: 'A standout slope-side hotel in the most ski-in/ski-out resorts, with live prices.',
    fr: 'Un hôtel marquant au bord des pistes dans les stations les plus ski au pied, avec prix en direct.',
    es: 'Un hotel destacado a pie de pista en las estaciones más ski-in/ski-out, con precios en directo.',
    pt: 'Um hotel de destaque junto às pistas nas estâncias mais ski-in/ski-out, com preços em direto.',
    it: 'Un hotel di spicco sulle piste nelle località più sci ai piedi, con prezzi in tempo reale.',
  } as Record<Locale, string>,
  mapHeading: {
    en: 'Map: ski-in/ski-out hotels in', fr: 'Carte : hôtels ski au pied à', es: 'Mapa: hoteles a pie de pista en', pt: 'Mapa: hotéis ski-in/ski-out em', it: 'Mappa: hotel sci ai piedi a',
  } as Record<Locale, string>,
  faqHeading: {
    en: 'Frequently asked questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes', it: 'Domande frequenti',
  } as Record<Locale, string>,
}

function title(country: string, l: Locale): string {
  return `${NOUN[l]} ${inCountry(country, l)}`
}

// SEO title weaves "hotels" + the localised term + the exact phrasings people
// search ("ski in ski out hotels france", "hoteles a pie de pista", ...).
function seoTitle(country: string, l: Locale): string {
  const c = inCountry(country, l)
  switch (l) {
    case 'fr': return `Hôtels ski au pied ${c} : stations ski-in/ski-out`
    case 'es': return `Hoteles a pie de pista ${c}: estaciones ski-in/ski-out`
    case 'pt': return `Hotéis ski-in/ski-out ${c}: estâncias na neve`
    case 'it': return `Hotel sci ai piedi ${c}: località ski-in/ski-out`
    default: return `Ski-in/ski-out hotels ${c}: the best slope-side resorts`
  }
}

function intro(c: SioCountry, l: Locale): string {
  const country = inCountry(c.country, l)
  const n = c.resorts.length
  const carFree = c.carFreeCount
  switch (l) {
    case 'fr':
      return `${n} stations ${country} où le ski au pied est réel, avec des hôtels ski-in/ski-out vérifiés, classées d'après nos propres notes terrain plutôt que les arguments marketing. ${
        carFree > 0 ? `Dont ${carFree} entièrement sans voitures. ` : ''
      }Pour chacune, on précise jusqu'où va vraiment le ski-in/ski-out, et où dormir au bord des pistes.`
    case 'es':
      return `${n} estaciones ${country} con esquí a pie de pista real y hoteles ski-in/ski-out verificados, clasificadas según nuestras propias notas y no según el marketing. ${
        carFree > 0 ? `${carFree} de ellas, totalmente sin coches. ` : ''
      }En cada una explicamos hasta dónde llega de verdad el esquí a pie de pista y dónde alojarse junto a la nieve.`
    case 'pt':
      return `${n} estâncias ${country} com ski-in/ski-out real e hotéis verificados junto às pistas, classificadas pelas nossas próprias notas e não pelo marketing. ${
        carFree > 0 ? `${carFree} delas totalmente sem carros. ` : ''
      }Em cada uma explicamos até onde vai mesmo o esqui à porta e onde ficar sobre a neve.`
    case 'it':
      return `${n} località ${country} con sci ai piedi reale e hotel ski-in/ski-out verificati, classificate in base alle nostre note e non al marketing. ${
        carFree > 0 ? `${carFree} di queste completamente senza auto. ` : ''
      }Per ognuna spieghiamo fin dove arriva davvero lo sci ai piedi e dove dormire sulle piste.`
    default:
      return `${n} resorts ${country} where ski-in/ski-out is real, with verified slope-side hotels, ranked from our own on-the-ground notes rather than marketing. ${
        carFree > 0 ? `${carFree} of them are fully car-free. ` : ''
      }For each, we say exactly how far the ski-in/ski-out really goes, and where to stay on the snow.`
  }
}

// Templated 4-question FAQ, country- and data-interpolated, in all 5 locales.
function faqItems(c: SioCountry, l: Locale): { q: string; a: string }[] {
  const country = inCountry(c.country, l)
  const cName = localizeCountry(c.country, l)
  const strong = c.resorts.filter((d) => skiInSkiOutTier(d.slug) === 'strong')
  const top = strong.slice(0, 4).map((d) => d.name).join(', ') || c.resorts.slice(0, 4).map((d) => d.name).join(', ')
  const carFree = c.carFreeCount
  const term = TERM[l]
  if (l === 'fr') return [
    { q: `Qu'est-ce que le ski au pied (ski-in/ski-out) ?`, a: `Le ski au pied signifie que vous chaussez et déchaussez vos skis juste devant votre hôtel ou votre résidence, sans navette ni marche. C'est le vrai luxe d'un séjour au ski : pistes à la porte le matin, retour skis aux pieds le soir.` },
    { q: `Quelles stations ${country} sont vraiment ski au pied ?`, a: `Nos stations ${cName} les plus ski au pied sont ${top}. Pour chacune, nous indiquons honnêtement si toute la station est sur la neige ou seulement certains hôtels et secteurs.` },
    { q: `Y a-t-il des stations sans voitures ${country} ?`, a: carFree > 0 ? `Oui, ${carFree} de nos stations ${cName} sont entièrement sans voitures, ce qui rend le ski au pied encore plus naturel.` : `Peu de stations ${cName} sont totalement sans voitures, mais beaucoup proposent des hôtels directement au bord des pistes.` },
    { q: `Où trouver des hôtels ${term} de luxe ou famille ${country} ?`, a: `Voyez nos sélections hôtels de luxe et stations familiales, et la carte ci-dessous pour comparer les hôtels au bord des pistes avec leurs prix en direct.` },
  ]
  if (l === 'es') return [
    { q: `¿Qué es esquiar a pie de pista (ski-in/ski-out)?`, a: `A pie de pista significa que te calzas y descalzas los esquís justo a la salida de tu hotel o apartamento, sin transbordos ni caminatas. Es el verdadero lujo de un viaje de esquí: pista en la puerta por la mañana y regreso esquiando por la tarde.` },
    { q: `¿Qué estaciones ${country} son de verdad a pie de pista?`, a: `Nuestras estaciones ${cName} más a pie de pista son ${top}. En cada una decimos con honestidad si toda la estación está sobre la nieve o solo ciertos hoteles y sectores.` },
    { q: `¿Hay estaciones sin coches ${country}?`, a: carFree > 0 ? `Sí, ${carFree} de nuestras estaciones ${cName} son totalmente sin coches, lo que hace el esquí a pie de pista aún más natural.` : `Pocas estaciones ${cName} son totalmente sin coches, pero muchas ofrecen hoteles justo al borde de la pista.` },
    { q: `¿Dónde encontrar hoteles ${term} de lujo o para familias ${country}?`, a: `Consulta nuestras selecciones de hoteles de lujo y estaciones familiares, y el mapa de abajo para comparar hoteles a pie de pista con sus precios en directo.` },
  ]
  if (l === 'pt') return [
    { q: `O que é ski-in/ski-out (esqui à porta)?`, a: `Ski-in/ski-out significa que calça e descalça os esquis mesmo à porta do hotel ou apartamento, sem transferes nem caminhadas. É o verdadeiro luxo de uma viagem de esqui: pista à porta de manhã e regresso a esquiar ao fim do dia.` },
    { q: `Que estâncias ${country} são mesmo ski-in/ski-out?`, a: `As nossas estâncias ${cName} mais ski-in/ski-out são ${top}. Em cada uma dizemos com honestidade se toda a estância está sobre a neve ou apenas certos hotéis e setores.` },
    { q: `Há estâncias sem carros ${country}?`, a: carFree > 0 ? `Sim, ${carFree} das nossas estâncias ${cName} são totalmente sem carros, o que torna o esqui à porta ainda mais natural.` : `Poucas estâncias ${cName} são totalmente sem carros, mas muitas oferecem hotéis mesmo junto à pista.` },
    { q: `Onde encontrar hotéis ${term} de luxo ou para famílias ${country}?`, a: `Veja as nossas seleções de hotéis de luxo e estâncias familiares, e o mapa abaixo para comparar hotéis junto às pistas com preços em direto.` },
  ]
  if (l === 'it') return [
    { q: `Cosa significa sci ai piedi (ski-in/ski-out)?`, a: `Sci ai piedi significa che allacci e togli gli sci proprio davanti al tuo hotel o appartamento, senza navette né camminate. È il vero lusso di una vacanza sulla neve: piste alla porta la mattina e rientro con gli sci ai piedi la sera.` },
    { q: `Quali località ${country} sono davvero sci ai piedi?`, a: `Le nostre località ${cName} più sci ai piedi sono ${top}. Per ognuna diciamo onestamente se tutta la località è sulla neve o solo alcuni hotel e settori.` },
    { q: `Ci sono località senza auto ${country}?`, a: carFree > 0 ? `Sì, ${carFree} delle nostre località ${cName} sono completamente senza auto, il che rende lo sci ai piedi ancora più naturale.` : `Poche località ${cName} sono del tutto senza auto, ma molte offrono hotel proprio a bordo pista.` },
    { q: `Dove trovare hotel ${term} di lusso o per famiglie ${country}?`, a: `Guarda le nostre selezioni di hotel di lusso e località per famiglie, e la mappa qui sotto per confrontare gli hotel sulle piste con i prezzi in tempo reale.` },
  ]
  return [
    { q: `What does ski-in/ski-out mean?`, a: `Ski-in/ski-out means you clip your skis on and off right outside your hotel or apartment, with no transfer or walk. It is the real luxury of a ski trip: the piste at your door in the morning and skiing home at the end of the day.` },
    { q: `Which resorts ${country} are genuinely ski-in/ski-out?`, a: `Our most ski-in/ski-out resorts ${cName} are ${top}. For each one we say honestly whether the whole resort is on the snow or only certain hotels and sectors.` },
    { q: `Are there car-free ski resorts ${country}?`, a: carFree > 0 ? `Yes, ${carFree} of our resorts ${cName} are fully car-free, which makes ski-in/ski-out even more natural.` : `Few resorts ${cName} are fully car-free, but many offer hotels right on the edge of the piste.` },
    { q: `Where can I find luxury or family ski-in/ski-out hotels ${country}?`, a: `See our luxury hotels and family resorts picks, and the map below to compare slope-side hotels with their live prices.` },
  ]
}

export async function generateStaticParams() {
  const params: { locale: string; country: string }[] = []
  for (const l of locales) {
    for (const c of skiInSkiOutByCountry()) params.push({ locale: l, country: c.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>
}): Promise<Metadata> {
  const { locale, country } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const c = getSioCountry(country)
  if (!c) return {}
  return {
    title: `${seoTitle(c.country, l)} | BestSnowHotels`,
    description: intro(c, l),
    alternates: {
      canonical: `${SITE_URL}/${l}/ski-in-ski-out/${c.slug}`,
      languages: hreflangFor(`/ski-in-ski-out/${c.slug}`),
    },
  }
}

function ResortCard({ d, l }: { d: Destination; l: Locale }) {
  const carFree = isCarFree(d)
  return (
    <article className="bg-white rounded-2xl border border-ice-100 overflow-hidden flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <SafeImage
          src={`/images/destinations/${d.slug}.jpg`}
          alt={`${d.name}, ${localizeRegion(d.region, l)}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 via-slate-deep/15 to-transparent" />
        {carFree && (
          <span className="absolute top-3 left-3 bg-ice-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
            {T.carFree[l]}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white text-xl font-bold leading-tight">{d.name}</h3>
          <p className="text-white/80 text-xs">{localizeRegion(d.region, l)}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 grow">
        <p className="text-sm text-ice-800/85 leading-relaxed">{d.skiInSkiOutNote[l]}</p>
        <p className="text-xs text-ice-800/70 tabular-nums mt-auto">
          {T.alt[l]} {d.altitudeBase} m · {T.pistes[l]} {d.pistesKm} km
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href={`/${l}/destinations/${d.slug}`}
            className="flex-1 text-center text-sm font-semibold rounded-xl border border-ice-200 text-slate-deep px-3 py-2 hover:bg-ice-50 transition"
          >
            {T.viewHotels[l]}
          </Link>
          <a
            href={buildAllezDestLink(d.name, d.country, 'ski-in-ski-out')}
            target="_blank"
            rel="sponsored noopener"
            className="flex-1 text-center text-sm font-semibold rounded-xl bg-slate-deep text-white px-3 py-2 hover:bg-slate-deep/90 transition"
          >
            {T.book[l]}
          </a>
        </div>
      </div>
    </article>
  )
}

export default async function SkiInSkiOutCountryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>
}) {
  const { locale, country } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const c = getSioCountry(country)
  if (!c) notFound()
  const dict = await getDictionary(l)

  const strong = c.resorts.filter((d) => skiInSkiOutTier(d.slug) === 'strong')
  const partial = c.resorts.filter((d) => skiInSkiOutTier(d.slug) === 'partial')

  // Featured slope-side hotels: the top hotel from the most ski-in/ski-out
  // resorts in this country, so the page is hotel-forward (its money intent).
  const featured = [...strong, ...partial]
    .map((d) => ({ dest: d, hotel: getHotels(d.slug)[0] }))
    .filter((x): x is { dest: Destination; hotel: NonNullable<typeof x.hotel> } => Boolean(x.hotel))
    .slice(0, 6)
  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }
  const mapDest = strong[0] || partial[0] || c.resorts[0]
  const faq = faqItems(c, l)

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title(c.country, l),
      numberOfItems: c.resorts.length,
      itemListElement: c.resorts.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/destinations/${d.slug}`,
        name: d.name,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <nav className="text-xs text-ice-800/70 mb-3 flex items-center gap-2 flex-wrap">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${l}/ski-in-ski-out`} className="hover:text-slate-deep">{NOUN[l]}</Link>
          <span aria-hidden>/</span>
          <span>{localizeCountry(c.country, l)}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          <span className="mr-2" aria-hidden>{c.resorts[0].flag}</span>
          {title(c.country, l)}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{intro(c, l)}</p>
      </section>

      {/* Featured slope-side hotels (hotel-forward, affiliate) */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-slate-deep">{T.hotelsHeading[l]} {inCountry(c.country, l)}</h2>
          <p className="mt-1 text-ice-800/75 max-w-2xl">{T.hotelsSub[l]}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(({ dest, hotel }) => (
              <div key={dest.slug}>
                <Link href={`/${l}/destinations/${dest.slug}`} className="group inline-flex items-baseline gap-2 mb-3">
                  <span className="text-sm font-bold uppercase tracking-wide text-ice-700 group-hover:text-alpenglow-700">{dest.name}</span>
                </Link>
                <HotelCard
                  hotel={hotel}
                  bookHref={buildAllezHotelLink(hotel.name, dest.name, dest.country, 'ski-in-ski-out', 7)}
                  resortName={dest.name}
                  locale={l}
                  labels={hotelLabels}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {strong.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-bold text-slate-deep">{T.strongHeading[l]}</h2>
          <p className="mt-1 text-ice-800/75 max-w-2xl">{T.strongLead[l]}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {strong.map((d) => <ResortCard key={d.slug} d={d} l={l} />)}
          </div>
        </section>
      )}

      {partial.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-slate-deep">{T.partialHeading[l]}</h2>
          <p className="mt-1 text-ice-800/75 max-w-2xl">{T.partialLead[l]}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partial.map((d) => <ResortCard key={d.slug} d={d} l={l} />)}
          </div>
        </section>
      )}

      {/* Map of slope-side hotels in the top resort */}
      {mapDest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-slate-deep">{T.mapHeading[l]} {mapDest.name}</h2>
          <div className="mt-5">
            <Stay22Map lat={mapDest.lat} lng={mapDest.lng} destName={mapDest.name} height={440} />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-slate-deep">{T.faqHeading[l]}</h2>
        <div className="mt-6 space-y-3">
          {faq.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-ice-100 bg-white p-5 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-deep flex items-center justify-between gap-4">
                {f.q}
                <span className="flex-none text-ice-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-[15px] text-ice-800/85 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-wrap gap-3 text-sm">
        <Link href={`/${l}/ski-in-ski-out`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">
          {T.allCountries[l]}
        </Link>
        <Link href={`/${l}/countries/${countrySlug(c.country)}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">
          {localizeCountry(c.country, l)}
        </Link>
      </section>
    </>
  )
}
