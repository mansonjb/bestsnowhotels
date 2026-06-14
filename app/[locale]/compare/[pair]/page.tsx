import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import type { Destination } from '@/lib/destinations'
import { COMPARE_PAIRS, getComparePair, getComparisonDestinations } from '@/lib/compare'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { formatSeasonRange } from '@/lib/dates'
import { SITE_URL } from '@/lib/site'

const HEADINGS = {
  verdict: {
    en: 'Verdict: who picks which',
    fr: 'Verdict : qui choisit laquelle',
    es: 'Veredicto: quién elige cuál',
    pt: 'Veredicto: quem escolhe qual',
    it: 'Verdetto: chi sceglie quale',
  } as Record<Locale, string>,
  sideBySide: {
    en: 'Side by side',
    fr: 'Face à face',
    es: 'Cara a cara',
    pt: 'Face a face',
    it: 'A confronto',
  } as Record<Locale, string>,
  altitudeBase: {
    en: 'Base altitude',
    fr: 'Altitude de base',
    es: 'Altitud de base',
    pt: 'Altitude da base',
    it: 'Quota base',
  } as Record<Locale, string>,
  altitudeSummit: {
    en: 'Summit altitude',
    fr: 'Altitude du sommet',
    es: 'Altitud de cima',
    pt: 'Altitude do cume',
    it: 'Quota della vetta',
  } as Record<Locale, string>,
  pistes: {
    en: 'Pistes',
    fr: 'Pistes',
    es: 'Pistas',
    pt: 'Pistas',
    it: 'Piste',
  } as Record<Locale, string>,
  lifts: {
    en: 'Lifts',
    fr: 'Remontées',
    es: 'Remontes',
    pt: 'Teleféricos',
    it: 'Impianti',
  } as Record<Locale, string>,
  season: {
    en: 'Season',
    fr: 'Saison',
    es: 'Temporada',
    pt: 'Época',
    it: 'Stagione',
  } as Record<Locale, string>,
  snowScore: {
    en: 'Snow score',
    fr: 'Score neige',
    es: 'Puntuación de nieve',
    pt: 'Pontuação de neve',
    it: 'Punteggio neve',
  } as Record<Locale, string>,
  country: {
    en: 'Country',
    fr: 'Pays',
    es: 'País',
    pt: 'País',
    it: 'Paese',
  } as Record<Locale, string>,
  region: {
    en: 'Region',
    fr: 'Massif',
    es: 'Región',
    pt: 'Região',
    it: 'Regione',
  } as Record<Locale, string>,
  goDeeper: {
    en: 'Go deeper:',
    fr: 'Aller plus loin :',
    es: 'Ir más a fondo:',
    pt: 'Ir mais a fundo:',
    it: 'Vai più a fondo:',
  } as Record<Locale, string>,
  moreCompares: {
    en: 'Other comparisons',
    fr: 'Autres comparatifs',
    es: 'Otras comparativas',
    pt: 'Outros comparativos',
    it: 'Altri confronti',
  } as Record<Locale, string>,
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => COMPARE_PAIRS.map((p) => ({ locale, pair: p.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pair: string }>
}): Promise<Metadata> {
  const { locale, pair } = await params
  const p = getComparePair(pair)
  if (!p) return {}
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const title = `${p.slugA.replace(/-/g, ' ')} vs ${p.slugB.replace(/-/g, ' ')}`
  return {
    title: `${title} | BestSnowHotels`,
    description: p.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/compare/${pair}`,
      languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/compare/${pair}`])),
    },
  }
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ locale: string; pair: string }>
}) {
  const { locale, pair } = await params
  if (!hasLocale(locale)) notFound()
  const p = getComparePair(pair)
  if (!p) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const { a, b } = getComparisonDestinations(p)
  if (!a || !b) notFound()

  const otherPairs = COMPARE_PAIRS.filter((x) => x.slug !== p.slug)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/${l}/compare` },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${a.name} vs ${b.name}`,
          item: `${SITE_URL}/${l}/compare/${p.slug}`,
        },
      ],
    },
  ]

  function Cell({ d }: { d: Destination }) {
    return (
      <div className="rounded-2xl border border-ice-100 bg-white overflow-hidden">
        <div className="relative h-44">
          <Image
            src={`/images/destinations/${d.slug}.jpg`}
            alt={d.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="text-white text-2xl font-bold">{d.name}</div>
            <div className="text-white/85 text-xs">{localizeCountry(d.country, l)}</div>
          </div>
        </div>
        <dl className="divide-y divide-ice-100 text-sm">
          <Row k={HEADINGS.region[l]} v={localizeRegion(d.region, l)} />
          <Row k={HEADINGS.altitudeBase[l]} v={`${d.altitudeBase} m`} />
          <Row k={HEADINGS.altitudeSummit[l]} v={`${d.altitudeSummit} m`} />
          <Row k={HEADINGS.pistes[l]} v={`${d.pistesKm} km`} />
          <Row k={HEADINGS.lifts[l]} v={`${d.lifts}`} />
          <Row k={HEADINGS.season[l]} v={formatSeasonRange(d.seasonStart, d.seasonEnd, l)} />
          <Row k={HEADINGS.snowScore[l]} v={`${d.snowScore} / 100`} />
        </dl>
        <div className="p-4 border-t border-ice-100">
          <Link
            href={`/${l}/destinations/${d.slug}`}
            className="text-sm font-medium text-alpenglow-700 hover:text-alpenglow-900"
          >
            {HEADINGS.goDeeper[l]} {d.name} →
          </Link>
        </div>
      </div>
    )
  }

  function Row({ k, v }: { k: string; v: string }) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5">
        <dt className="text-ice-800/70">{k}</dt>
        <dd className="font-medium text-slate-deep">{v}</dd>
      </div>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[36vh] min-h-[260px] w-full overflow-hidden">
          <Image
            src={`/images/destinations/${p.heroSlug}.jpg`}
            alt={`${a.name} vs ${b.name}`}
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
                <Link href={`/${l}/compare`} className="hover:text-white">Compare</Link>
              </nav>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">
                {a.name} <span className="text-white/75 font-normal">vs</span> {b.name}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/90 max-w-3xl drop-shadow">{p.intro[l]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Side by side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h2 className="text-2xl font-bold text-slate-deep">{HEADINGS.sideBySide[l]}</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Cell d={a} />
          <Cell d={b} />
        </div>
      </section>

      {/* Verdict */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{HEADINGS.verdict[l]}</h2>
        <p className="mt-3 text-lg text-ice-800/90 leading-relaxed max-w-4xl">{p.verdict[l]}</p>
      </section>

      {/* Description */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-base text-ice-800/85 leading-relaxed max-w-4xl whitespace-pre-line">{p.description[l]}</p>
      </section>

      {/* Other comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <h2 className="text-2xl font-bold text-slate-deep">{HEADINGS.moreCompares[l]}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherPairs.map((x) => (
            <Link
              key={x.slug}
              href={`/${l}/compare/${x.slug}`}
              className="inline-flex items-center gap-2 bg-white border border-ice-100 rounded-full px-4 py-2 text-sm font-medium text-ice-800 hover:border-ice-300 hover:text-slate-deep transition"
            >
              {x.slugA.replace(/-/g, ' ')} vs {x.slugB.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
