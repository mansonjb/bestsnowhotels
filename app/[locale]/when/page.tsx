import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { SEASONAL_GUIDES } from '@/lib/seasonalGuides'
import { SITE_URL } from '@/lib/site'

const T = {
  title: {
    en: 'Where to ski in 2027: month-by-month guide',
    fr: 'Où skier en 2027 : guide mois par mois',
    es: 'Dónde esquiar en 2027: guía mes a mes',
    pt: 'Onde esquiar em 2027: guia mês a mês',
    it: 'Dove sciare nel 2027: guida mese per mese',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Six guides that pick the right resort for each month of the 2026-2027 season, plus the Southern Hemisphere winter.',
    fr: "Six guides qui choisissent la bonne station pour chaque mois de la saison 2026-2027, plus l'hiver de l'hémisphère sud.",
    es: 'Seis guías que eligen la estación adecuada para cada mes de la temporada 2026-2027, más el invierno austral.',
    pt: 'Seis guias que escolhem a estância certa para cada mês da época 2026-2027, mais o inverno austral.',
    it: "Sei guide che scelgono la località giusta per ogni mese della stagione 2026-2027, più l'inverno australe.",
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
      canonical: `${SITE_URL}/${l}/when`,
      languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/when`])), "x-default": `${SITE_URL}/en/when` },
    },
  }
}

export default async function WhenIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

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
        {SEASONAL_GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/${l}/when/${g.slug}`}
            className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
          >
            <div className="relative h-40 overflow-hidden">
              <SafeImage
                src={`/images/destinations/${g.heroSlug}.jpg`}
                alt={g.name[l]}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-white text-lg font-bold">{g.name[l]}</div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-ice-800/80 line-clamp-3">{g.intro[l]}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
