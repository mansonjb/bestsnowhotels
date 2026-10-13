import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getDestination } from '@/lib/destinations'
import { getHotels } from '@/lib/hotels'
import { BEST_HOTELS_SLUGS } from '@/lib/bestHotels'
import { localizeCountry } from '@/lib/countryNames'
import { SITE_URL, hreflangFor, jsonLdGraph } from '@/lib/site'

const TITLE: Record<Locale, string> = {
  en: 'Best ski hotels, compared resort by resort | BestSnowHotels',
  fr: 'Meilleurs hôtels de ski, comparés station par station | BestSnowHotels',
  es: 'Mejores hoteles de esquí, comparados estación por estación | BestSnowHotels',
  pt: 'Melhores hotéis de esqui, comparados estância a estância | BestSnowHotels',
  it: 'Migliori hotel sulla neve, confrontati località per località | BestSnowHotels',
  nl: 'Beste skihotels, vergeleken per skigebied | BestSnowHotels',
  ja: 'スキー場別・おすすめホテル比較 | BestSnowHotels',
  'zh-hk': '滑雪酒店比較：逐個雪場精選 | BestSnowHotels',
}
const H1: Record<Locale, string> = {
  en: 'Best hotels, compared resort by resort', fr: 'Meilleurs hôtels, comparés station par station', es: 'Mejores hoteles, comparados estación por estación', pt: 'Melhores hotéis, comparados estância a estância', it: 'Migliori hotel, confrontati località per località', nl: 'Beste hotels, vergeleken per skigebied', ja: 'スキー場別・おすすめホテル比較', 'zh-hk': '逐個雪場比較最佳酒店',
}
const INTRO: Record<Locale, string> = {
  en: 'For each resort we compare the top hotels point by point: best overall, best luxury, best value and more, so you can book the right one in minutes.',
  fr: 'Pour chaque station, on compare les meilleurs hôtels point par point : meilleur choix global, luxe, rapport qualité-prix et plus, pour réserver le bon en quelques minutes.',
  es: 'Para cada estación comparamos los mejores hoteles punto por punto: mejor en general, de lujo, calidad-precio y más, para reservar el adecuado en minutos.',
  pt: 'Para cada estância comparamos os melhores hotéis ponto por ponto: melhor no geral, de luxo, custo-benefício e mais, para reservar o certo em minutos.',
  it: 'Per ogni località confrontiamo i migliori hotel punto per punto: migliore in assoluto, lusso, qualità-prezzo e altro, per prenotare quello giusto in pochi minuti.',
  nl: 'Voor elk skigebied vergelijken we de beste hotels punt voor punt: beste algemeen, luxe, prijs-kwaliteit en meer, zodat je in minuten de juiste boekt.',
  ja: '各スキー場で、総合・ラグジュアリー・コスパなど観点別にトップホテルを比較。数分でぴったりの一軒が予約できます。',
  'zh-hk': '每個雪場我們都逐項比較頂級酒店：綜合、豪華、性價比等，助你幾分鐘揀啱一間。',
}
const COMPARE_N: Record<Locale, string> = {
  en: 'Compare {n} hotels', fr: 'Comparer {n} hôtels', es: 'Comparar {n} hoteles', pt: 'Comparar {n} hotéis', it: 'Confronta {n} hotel', nl: '{n} hotels vergelijken', ja: '{n}軒を比較', 'zh-hk': '比較{n}間酒店',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(locale)) return {}
  const l = locale as Locale
  return {
    title: TITLE[l],
    description: INTRO[l],
    alternates: { canonical: `${SITE_URL}/${l}/best-hotels`, languages: hreflangFor('/best-hotels') },
  }
}

export default async function BestHotelsHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const items = BEST_HOTELS_SLUGS.flatMap((slug) => {
    const d = getDestination(slug)
    return d ? [{ d, slug: slug as string, n: getHotels(slug).length }] : []
  })

  // Group by country, preserving the France-first order of the source list.
  const groups: { country: string; rows: typeof items }[] = []
  for (const it of items) {
    let g = groups.find((x) => x.country === it.d.country)
    if (!g) { g = { country: it.d.country, rows: [] }; groups.push(g) }
    g.rows.push(it)
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: H1[l],
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${l}/best-hotels/${it.slug}`, name: it.d.name })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: H1[l], item: `${SITE_URL}/${l}/best-hotels` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-ice-100 via-ice-50 to-white border-b border-ice-100">
        <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-ice-700 mb-4">
            <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
            <span className="mx-2 text-ice-400">/</span>
            <span className="text-slate-deep">{H1[l]}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{H1[l]}</h1>
          <p className="mt-4 text-lg text-ice-800/80 leading-relaxed max-w-3xl">{INTRO[l]}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {groups.map((g) => (
          <section key={g.country}>
            <h2 className="text-2xl font-bold text-slate-deep mb-5 flex items-center gap-3">
              <span aria-hidden>{g.rows[0].d.flag}</span>
              {localizeCountry(g.country, l)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {g.rows.map(({ d, slug, n }) => (
                <Link key={slug} href={`/${l}/best-hotels/${slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-ice-600">{localizeCountry(d.country, l)}</div>
                  <div className="mt-1 text-xl font-bold text-slate-deep">{d.name}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ice-700 group-hover:translate-x-0.5 transition">
                    {COMPARE_N[l].replace('{n}', String(n))} →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
