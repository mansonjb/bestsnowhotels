import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { skiInSkiOutByCountry, getSioCountry, skiInSkiOutTier, isCarFree } from '@/lib/skiInSkiOut'
import type { SioCountry } from '@/lib/skiInSkiOut'
import type { Destination } from '@/lib/destinations'
import { localizeCountry, inCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { countrySlug } from '@/lib/countries'
import { SITE_URL, hreflangFor, buildAllezDestLink } from '@/lib/site'

const NOUN: Record<Locale, string> = {
  en: 'Ski-in/ski-out resorts',
  fr: 'Stations ski au pied',
  es: 'Estaciones ski-in/ski-out',
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
    es: 'Direcciones ski-in/ski-out',
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
}

function title(country: string, l: Locale): string {
  return `${NOUN[l]} ${inCountry(country, l)}`
}

function intro(c: SioCountry, l: Locale): string {
  const country = inCountry(c.country, l)
  const n = c.resorts.length
  const carFree = c.carFreeCount
  switch (l) {
    case 'fr':
      return `${n} stations ${country} où le ski au pied est réel, classées d'après nos propres notes terrain plutôt que les arguments marketing. ${
        carFree > 0 ? `Dont ${carFree} entièrement sans voitures. ` : ''
      }Pour chacune, on précise jusqu'où va vraiment le ski-in/ski-out.`
    case 'es':
      return `${n} estaciones ${country} con ski-in/ski-out real, clasificadas según nuestras propias notas y no según el marketing. ${
        carFree > 0 ? `${carFree} de ellas, totalmente sin coches. ` : ''
      }En cada una explicamos hasta dónde llega de verdad el esquí a pie de pista.`
    case 'pt':
      return `${n} estâncias ${country} com ski-in/ski-out real, classificadas pelas nossas próprias notas e não pelo marketing. ${
        carFree > 0 ? `${carFree} delas totalmente sem carros. ` : ''
      }Em cada uma explicamos até onde vai mesmo o esqui à porta.`
    case 'it':
      return `${n} località ${country} con ski-in/ski-out reale, classificate in base alle nostre note e non al marketing. ${
        carFree > 0 ? `${carFree} di queste completamente senza auto. ` : ''
      }Per ognuna spieghiamo fin dove arriva davvero lo sci ai piedi.`
    default:
      return `${n} resorts ${country} where ski-in/ski-out is real, ranked from our own on-the-ground notes rather than marketing. ${
        carFree > 0 ? `${carFree} of them are fully car-free. ` : ''
      }For each, we say exactly how far the ski-in/ski-out really goes.`
  }
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
  const t = title(c.country, l)
  return {
    title: `${t} | BestSnowHotels`,
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
        <Image
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

  const jsonLd = {
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
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
