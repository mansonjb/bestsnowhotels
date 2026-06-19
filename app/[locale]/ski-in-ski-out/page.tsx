import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { skiInSkiOutByCountry } from '@/lib/skiInSkiOut'
import { localizeCountry } from '@/lib/countryNames'
import { SITE_URL, hreflangFor } from '@/lib/site'

const T = {
  title: {
    en: 'Ski-in/ski-out resorts by country',
    fr: 'Stations ski au pied, par pays',
    es: 'Estaciones ski-in/ski-out por país',
    pt: 'Estâncias ski-in/ski-out por país',
    it: 'Località ski-in/ski-out per paese',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Where you can genuinely ski to your door, country by country. We only list resorts our own notes call real ski-in/ski-out, not marketing.',
    fr: "Où l'on peut vraiment skier dès la porte, pays par pays. On ne liste que les stations que nos propres notes jugent ski au pied authentique, pas du marketing.",
    es: 'Dónde se puede esquiar de verdad hasta la puerta, país por país. Solo listamos estaciones que nuestras propias notas consideran ski-in/ski-out real, no marketing.',
    pt: 'Onde se pode mesmo esquiar até à porta, país a país. Só listamos estâncias que as nossas próprias notas consideram ski-in/ski-out real, não marketing.',
    it: 'Dove si può davvero sciare fino alla porta, paese per paese. Elenchiamo solo le località che le nostre note giudicano ski-in/ski-out vero, non marketing.',
  } as Record<Locale, string>,
  resortsWord: {
    en: 'resorts', fr: 'stations', es: 'estaciones', pt: 'estâncias', it: 'località',
  } as Record<Locale, string>,
  carFree: {
    en: 'car-free', fr: 'sans voiture', es: 'sin coches', pt: 'sem carros', it: 'senza auto',
  } as Record<Locale, string>,
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${T.title[l]} | BestSnowHotels`,
    description: T.subtitle[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/ski-in-ski-out`,
      languages: hreflangFor('/ski-in-ski-out'),
    },
  }
}

export default async function SkiInSkiOutHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const countries = skiInSkiOutByCountry()

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <nav className="text-xs text-ice-800/70 mb-3 flex items-center gap-2">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span aria-hidden>/</span>
          <span>{T.title[l]}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{T.title[l]}</h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{T.subtitle[l]}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((c) => (
          <Link
            key={c.slug}
            href={`/${l}/ski-in-ski-out/${c.slug}`}
            className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={`/images/destinations/${c.resorts[0].slug}.jpg`}
                alt={localizeCountry(c.country, l)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                <span className="text-white text-xl font-bold">{localizeCountry(c.country, l)}</span>
                <span className="text-2xl" aria-hidden>{c.resorts[0].flag}</span>
              </div>
            </div>
            <div className="p-4 text-sm text-ice-800/80 tabular-nums">
              {c.resorts.length} {T.resortsWord[l]}
              {c.carFreeCount > 0 && (
                <span className="ml-2 text-ice-600">
                  · {c.carFreeCount} {T.carFree[l]}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
