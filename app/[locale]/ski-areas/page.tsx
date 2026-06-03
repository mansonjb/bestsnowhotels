import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { SKI_AREAS } from '@/lib/skiAreas'
import { SITE_URL } from '@/lib/site'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    en: 'Ski areas: the big linked domains of the Alps and Pyrenees | BestSnowHotels',
    fr: "Domaines skiables : les grands domaines reliés des Alpes et des Pyrénées | BestSnowHotels",
    es: 'Dominios esquiables: los grandes dominios enlazados de los Alpes y los Pirineos | BestSnowHotels',
    pt: 'Domínios esquiáveis: os grandes domínios ligados dos Alpes e dos Pirenéus | BestSnowHotels',
    it: 'Comprensori sciistici: i grandi domini collegati delle Alpi e dei Pirenei | BestSnowHotels',
  }
  const descriptions: Record<string, string> = {
    en: 'Explore the great linked ski domains where several resorts share one lift pass: Les 3 Vallées, Paradiski, Portes du Soleil, Ski Arlberg and more. Compare resorts and find ski-in/ski-out hotels.',
    fr: "Explorez les grands domaines skiables reliés où plusieurs stations partagent un forfait : Les 3 Vallées, Paradiski, Portes du Soleil, Ski Arlberg et plus. Comparez les stations et trouvez des hôtels ski-in/ski-out.",
    es: 'Explora los grandes dominios esquiables enlazados donde varias estaciones comparten un forfait: Les 3 Vallées, Paradiski, Portes du Soleil, Ski Arlberg y más. Compara estaciones y encuentra hoteles ski-in/ski-out.',
    pt: 'Explore os grandes domínios esquiáveis ligados onde várias estâncias partilham um forfait: Les 3 Vallées, Paradiski, Portes du Soleil, Ski Arlberg e mais. Compare estâncias e encontre hotéis ski-in/ski-out.',
    it: 'Esplora i grandi comprensori collegati dove più località condividono lo stesso skipass: Les 3 Vallées, Paradiski, Portes du Soleil, Ski Arlberg e altri. Confronta le località e trova hotel ski-in/ski-out.',
  }
  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    alternates: {
      canonical: `${SITE_URL}/${locale}/ski-areas`,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/ski-areas`])),
    },
  }
}

export default async function SkiAreasIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const l = locale as Locale

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: dict.skiAreas.title,
    itemListElement: SKI_AREAS.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${l}/ski-areas/${a.slug}`,
      name: a.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {dict.skiAreas.title}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{dict.skiAreas.subtitle}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SKI_AREAS.map((a) => (
          <Link
            key={a.slug}
            href={`/${l}/ski-areas/${a.slug}`}
            className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={`/images/destinations/${a.members[0]}.jpg`}
                alt={a.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 via-slate-deep/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1 text-lg">
                {a.flags.map((f) => (
                  <span key={f} aria-hidden>
                    {f}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{a.name}</h2>
                <p className="text-sm text-white/90 drop-shadow tabular-nums">
                  {a.members.length} {dict.destinations.resorts} · {a.pistesKm} km
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-ice-800/80 leading-relaxed line-clamp-3">{a.intro[l]}</p>
              <div className="mt-4 text-sm font-semibold text-ice-700 group-hover:text-ice-900 transition">
                {dict.skiAreas.exploreArea} →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
