import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { SITE_URL, jsonLdGraph } from '@/lib/site'
import methodology from '@/data/methodology.json'

interface Section { title: Record<Locale, string>; body: Record<Locale, string> }
interface Methodology {
  intro: Record<Locale, string>
  snowScore: Section
  skiInSkiOut: Section
  data: Section
  honesty: Section
}
const M = methodology as Methodology

const PAGE_TITLE: Record<Locale, string> = {
  en: 'How we score and classify ski resorts',
  fr: 'Comment nous notons et classons les stations de ski',
  es: 'Cómo puntuamos y clasificamos las estaciones de esquí',
  pt: 'Como pontuamos e classificamos as estâncias de esqui',
  it: 'Come valutiamo e classifichiamo le località sciistiche',
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
  if (!hasLocale(locale)) return {}
  const l = locale as Locale
  return {
    title: `${PAGE_TITLE[l]} | BestSnowHotels`,
    description: M.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/methodology`,
      languages: Object.fromEntries([
        ...locales.map((x) => [x, `${SITE_URL}/${x}/methodology`]),
        ['x-default', `${SITE_URL}/en/methodology`],
      ]),
    },
  }
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const sections = [M.snowScore, M.skiInSkiOut, M.data, M.honesty]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: PAGE_TITLE[l], item: `${SITE_URL}/${l}/methodology` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: PAGE_TITLE[l],
      description: M.intro[l],
      url: `${SITE_URL}/${l}/methodology`,
      inLanguage: l,
      publisher: { '@type': 'Organization', name: 'BestSnowHotels', url: SITE_URL },
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <nav className="text-sm text-ice-700 mb-4">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span className="mx-2 text-ice-400">/</span>
          <span className="text-slate-deep">{PAGE_TITLE[l]}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {PAGE_TITLE[l]}
        </h1>
        <p className="mt-5 text-lg text-ice-800/85 leading-relaxed">{M.intro[l]}</p>

        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <div key={i} className="border-t border-ice-100 pt-8">
              <h2 className="text-2xl font-bold text-slate-deep">{s.title[l]}</h2>
              <p className="mt-3 text-[15px] text-ice-800/85 leading-relaxed">{s.body[l]}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={`/${l}/destinations`} className="rounded-full bg-slate-deep text-white font-semibold px-5 py-2.5 text-sm hover:bg-ice-800 transition">
            {dict.destinations.title} →
          </Link>
          <Link href={`/${l}/weather`} className="rounded-full bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 text-sm hover:border-ice-400 transition">
            {dict.nav.weather} →
          </Link>
        </div>
      </section>
    </>
  )
}
