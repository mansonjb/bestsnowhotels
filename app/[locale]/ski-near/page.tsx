import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getGateways, resortsNear } from '@/lib/gateways'
import { SITE_URL, hreflangFor } from '@/lib/site'

const LBL = {
  title: { en: 'Ski resorts near an airport', fr: "Stations de ski près d'un aéroport", es: 'Estaciones de esquí cerca de un aeropuerto', pt: 'Estâncias de esqui perto de um aeroporto', it: "Località sciistiche vicino a un aeroporto" } as Record<Locale, string>,
  intro: {
    en: 'Pick the airport you are flying into and see the closest ski resorts, ranked by distance, each with ski-in/ski-out hotels. The fastest way to turn a flight into a first run.',
    fr: "Choisissez l'aéroport où vous atterrissez et découvrez les stations de ski les plus proches, classées par distance, chacune avec ses hôtels ski au pied. Le moyen le plus rapide de passer de l'avion à la première descente.",
    es: 'Elige el aeropuerto al que llegas y descubre las estaciones de esquí más cercanas, ordenadas por distancia, cada una con hoteles a pie de pista. La forma más rápida de pasar del vuelo a la primera bajada.',
    pt: 'Escolha o aeroporto onde aterra e veja as estâncias de esqui mais próximas, ordenadas por distância, cada uma com hotéis à beira das pistas. A forma mais rápida de passar do voo à primeira descida.',
    it: "Scegli l'aeroporto in cui atterri e scopri le località sciistiche più vicine, ordinate per distanza, ognuna con hotel sugli sci. Il modo più rapido di trasformare un volo nella prima discesa.",
  } as Record<Locale, string>,
  nearest: { en: 'closest', fr: 'la plus proche', es: 'la más cercana', pt: 'a mais próxima', it: 'la più vicina' } as Record<Locale, string>,
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  return { title: `${LBL.title[l]} | BestSnowHotels`, description: LBL.intro[l], alternates: { canonical: `${SITE_URL}/${locale}/ski-near`, languages: hreflangFor('/ski-near') } }
}

export default async function SkiNearIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const gateways = getGateways()

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Ski resorts near an airport', numberOfItems: gateways.length,
    itemListElement: gateways.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${l}/ski-near/${g.slug}`, name: `Ski resorts near ${g.airport}` })),
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
          <div className="text-4xl mb-2" aria-hidden>✈</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{LBL.title[l]}</h1>
          <p className="mt-4 max-w-3xl text-lg text-ice-800/80 leading-relaxed">{LBL.intro[l]}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gateways.map((g) => {
            const near = resortsNear(g)
            const top = near[0]
            return (
              <Link key={g.slug} href={`/${l}/ski-near/${g.slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <SafeImage src={`/images/destinations/${top.d.slug}.jpg`} alt={g.airport} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/25 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 text-ice-800 rounded-full px-2.5 py-0.5 text-xs font-bold">{g.code}</div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-md leading-tight">{g.city}</h2>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm text-ice-700">{top.d.name} · {top.km} km <span className="text-ice-500">({LBL.nearest[l]})</span></div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
