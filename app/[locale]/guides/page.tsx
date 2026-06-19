import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getGuideDestinations } from '@/lib/resortGuide'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { SITE_URL, hreflangFor } from '@/lib/site'

const T = {
  title: {
    en: 'Ski resort guides: what to know before you go',
    fr: 'Guides de stations : à savoir avant de partir',
    es: 'Guías de estaciones: lo que saber antes de ir',
    pt: 'Guias de estâncias: o que saber antes de ir',
    it: 'Guide alle località: cosa sapere prima di partire',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Short, practical briefings on each resort: snow, getting there, the ski area, the vibe and when to go. Every point is drawn from our own data, not marketing.',
    fr: "Des fiches pratiques et courtes pour chaque station : neige, accès, domaine, ambiance et meilleure période. Chaque point vient de nos propres données, pas du marketing.",
    es: 'Fichas breves y prácticas de cada estación: nieve, cómo llegar, el dominio, el ambiente y cuándo ir. Cada punto sale de nuestros propios datos, no del marketing.',
    pt: 'Fichas curtas e práticas de cada estância: neve, como chegar, o domínio, o ambiente e quando ir. Cada ponto vem dos nossos próprios dados, não do marketing.',
    it: 'Schede brevi e pratiche per ogni località: neve, come arrivare, il comprensorio, l’atmosfera e quando andare. Ogni punto viene dai nostri dati, non dal marketing.',
  } as Record<Locale, string>,
  read: {
    en: 'Things to know', fr: 'À savoir', es: 'Qué saber', pt: 'O que saber', it: 'Cosa sapere',
  } as Record<Locale, string>,
}

export function generateStaticParams() {
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
      canonical: `${SITE_URL}/${l}/guides`,
      languages: hreflangFor('/guides'),
    },
  }
}

export default async function GuidesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const guides = getGuideDestinations()

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <nav className="text-xs text-ice-800/70 mb-3 flex items-center gap-2">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span aria-hidden>/</span>
          <span>{dict.nav.guides}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{T.title[l]}</h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{T.subtitle[l]}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((d) => (
          <Link
            key={d.slug}
            href={`/${l}/guides/${d.slug}`}
            className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={`/images/destinations/${d.slug}.jpg`}
                alt={`${d.name}, ${localizeRegion(d.region, l)}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h2 className="text-white text-xl font-bold leading-tight">{d.name}</h2>
                <p className="text-white/80 text-xs">{localizeCountry(d.country, l)} {d.flag}</p>
              </div>
            </div>
            <div className="p-4 text-sm font-semibold text-ice-700 group-hover:text-slate-deep transition">
              {T.read[l]} →
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
