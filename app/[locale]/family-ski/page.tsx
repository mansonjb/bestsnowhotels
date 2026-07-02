import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getFamilyCountries } from '@/lib/familyCountries'
import { localizeCountry } from '@/lib/countryNames'
import { SITE_URL, hreflangFor } from '@/lib/site'

const LBL = {
  title: { en: 'Best family ski resorts, by country', fr: 'Meilleures stations de ski en famille, par pays', es: 'Mejores estaciones de esquí para niños, por país', pt: 'Melhores estâncias de esqui em família, por país', it: 'Migliori località sciistiche per famiglie, per paese' } as Record<Locale, string>,
  intro: {
    en: 'Skiing with kids is its own puzzle: you want gentle slopes, real beginner terrain and a base that keeps small legs close to the door. Pick a country to see its resorts ranked for families.',
    fr: "Skier avec des enfants, c'est un autre casse-tête : il faut des pentes douces, un vrai domaine débutant et un village qui garde les petites jambes près de la porte. Choisissez un pays pour voir ses stations classées pour les familles.",
    es: 'Esquiar con niños es otro rompecabezas: quieres pistas suaves, verdadero terreno para debutantes y una base que mantenga las piernas pequeñas cerca de la puerta. Elige un país para ver sus estaciones clasificadas para familias.',
    pt: 'Esquiar com crianças é outro quebra-cabeças: quer pistas suaves, verdadeiro terreno de iniciação e uma base que mantenha as perninhas perto da porta. Escolha um país para ver as suas estâncias classificadas para famílias.',
    it: 'Sciare con i bambini è un rebus a parte: servono pendii dolci, vero terreno per principianti e una base che tenga le gambine vicino alla porta. Scegli un paese per vedere le sue località in classifica per le famiglie.',
  } as Record<Locale, string>,
  resorts: { en: 'family resorts', fr: 'stations familiales', es: 'estaciones familiares', pt: 'estâncias familiares', it: 'località per famiglie' } as Record<Locale, string>,
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  return {
    title: `${LBL.title[l]} | BestSnowHotels`,
    description: LBL.intro[l],
    alternates: { canonical: `${SITE_URL}/${locale}/family-ski`, languages: hreflangFor('/family-ski') },
  }
}

export default async function FamilyIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const hubs = getFamilyCountries()

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best family ski resorts by country',
    numberOfItems: hubs.length,
    itemListElement: hubs.map((h, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${l}/family-ski/${h.slug}`, name: localizeCountry(h.country, 'en') })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-ice-100 via-ice-50 to-white border-b border-ice-100">
        <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-ice-700 mb-4">
            <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
            <span className="mx-2 text-ice-400">/</span>
            <span className="text-slate-deep">{LBL.title[l]}</span>
          </nav>
          <div className="text-4xl mb-2" aria-hidden>👨‍👩‍👧‍👦</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{LBL.title[l]}</h1>
          <p className="mt-4 max-w-3xl text-lg text-ice-800/80 leading-relaxed">{LBL.intro[l]}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hubs.map((h) => (
            <Link key={h.slug} href={`/${l}/family-ski/${h.slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <SafeImage src={`/images/destinations/${h.resorts[0].slug}.jpg`} alt={localizeCountry(h.country, l)} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>{h.flag}</span>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">{localizeCountry(h.country, l)}</h2>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-ice-700">{h.total} {LBL.resorts[l]}</span>
                <span className="text-sm font-semibold text-ice-700 group-hover:translate-x-0.5 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
