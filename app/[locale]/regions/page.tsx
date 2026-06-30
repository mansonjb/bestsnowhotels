import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { notFound } from 'next/navigation'
import { getRegionHubs } from '@/lib/regionPages'
import { localizeRegion } from '@/lib/regions'
import { SITE_URL } from '@/lib/site'

const LBL = {
  title: { en: 'Ski regions', fr: 'Régions de ski', es: 'Regiones de esquí', pt: 'Regiões de esqui', it: 'Regioni sciistiche' } as Record<Locale, string>,
  intro: {
    en: 'Every massif and mountain range in our guide, from the French Alps to the Andes. Pick a region to see all its resorts and their ski-in/ski-out hotels.',
    fr: 'Tous les massifs de notre guide, des Alpes françaises aux Andes. Choisissez une région pour voir toutes ses stations et leurs hôtels ski au pied.',
    es: 'Todos los macizos de nuestra guía, de los Alpes franceses a los Andes. Elige una región para ver todas sus estaciones y sus hoteles a pie de pista.',
    pt: 'Todos os maciços do nosso guia, dos Alpes franceses aos Andes. Escolha uma região para ver todas as suas estâncias e os hotéis à beira das pistas.',
    it: 'Tutti i massicci della nostra guida, dalle Alpi francesi alle Ande. Scegli una regione per vedere tutte le sue località e gli hotel sugli sci.',
  } as Record<Locale, string>,
  resorts: { en: 'resorts', fr: 'stations', es: 'estaciones', pt: 'estâncias', it: 'località' } as Record<Locale, string>,
  resort: { en: 'resort', fr: 'station', es: 'estación', pt: 'estância', it: 'località' } as Record<Locale, string>,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  return {
    title: `${LBL.title[l]} | BestSnowHotels`,
    description: LBL.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${locale}/regions`,
      languages: {
        ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/regions`])),
        'x-default': `${SITE_URL}/en/regions`,
      },
    },
  }
}

export default async function RegionsIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const hubs = getRegionHubs()

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ski regions',
    numberOfItems: hubs.length,
    itemListElement: hubs.map((h, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${l}/regions/${h.slug}`,
      name: h.name,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-ice-100 via-ice-50 to-white border-b border-ice-100">
        <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-ice-700 mb-4">
            <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
            <span className="mx-2 text-ice-400">/</span>
            <span className="text-slate-deep">{LBL.title[l]}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{LBL.title[l]}</h1>
          <p className="mt-4 max-w-3xl text-lg text-ice-800/80 leading-relaxed">{LBL.intro[l]}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hubs.map((h) => (
            <Link
              key={h.slug}
              href={`/${l}/regions/${h.slug}`}
              className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={`/images/destinations/${h.stats.topSlug}.jpg`}
                  alt={localizeRegion(h.name, l)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                  <h2 className="text-xl font-bold text-white drop-shadow-md leading-tight">
                    {localizeRegion(h.name, l)}
                  </h2>
                  <span className="shrink-0 bg-white/90 text-ice-800 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                    {h.stats.count}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-ice-700">
                  {h.stats.count} {h.stats.count === 1 ? LBL.resort[l] : LBL.resorts[l]}
                </span>
                <span className="text-sm font-semibold text-ice-700 group-hover:translate-x-0.5 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
