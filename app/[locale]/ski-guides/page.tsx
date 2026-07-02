import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getThemes, themeContent } from '@/lib/skiThemes'
import { SITE_URL, hreflangFor } from '@/lib/site'

const T = {
  title: {
    en: 'Ski guides by theme', fr: 'Guides ski par thème', es: 'Guías de esquí por tema', pt: 'Guias de esqui por tema', it: 'Guide allo sci per tema',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Hand-picked guides around one idea: spa skiing, the liveliest après-ski, the most luxurious hotels. Resorts and hotels chosen from our own data.',
    fr: "Des guides choisis autour d'une idée : ski et thermes, l'après-ski le plus animé, les hôtels les plus luxueux. Stations et hôtels sélectionnés à partir de nos propres données.",
    es: 'Guías seleccionadas en torno a una idea: esquí y spa, el après-ski más animado, los hoteles más lujosos. Estaciones y hoteles elegidos con nuestros propios datos.',
    pt: 'Guias escolhidos à volta de uma ideia: esqui e termas, o après-ski mais animado, os hotéis mais luxuosos. Estâncias e hotéis escolhidos a partir dos nossos dados.',
    it: "Guide scelte attorno a un'idea: sci e terme, l'après-ski più vivace, gli hotel più lussuosi. Località e hotel scelti dai nostri dati.",
  } as Record<Locale, string>,
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${T.title[l]} | BestSnowHotels`,
    description: T.subtitle[l],
    alternates: { canonical: `${SITE_URL}/${l}/ski-guides`, languages: hreflangFor('/ski-guides') },
  }
}

export default async function SkiGuidesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const themes = getThemes()

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <nav className="text-xs text-ice-800/70 mb-3 flex items-center gap-2">
          <Link href={`/${l}`} className="hover:text-slate-deep">{dict.nav.home}</Link>
          <span aria-hidden>/</span>
          <span>{T.title[l]}</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">{T.title[l]}</h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-4xl">{T.subtitle[l]}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((t) => {
          const c = themeContent(t.slug)
          return (
            <Link key={t.slug} href={`/${l}/ski-guides/${t.slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <SafeImage src={`/images/destinations/${t.heroSlug}.jpg`} alt={c.title[l]} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
                <h2 className="absolute inset-x-0 bottom-0 p-4 text-white text-xl font-bold leading-tight">{c.title[l]}</h2>
              </div>
              <p className="p-4 text-sm text-ice-800/80 leading-relaxed">{c.intro[l]}</p>
            </Link>
          )
        })}
      </div>
    </>
  )
}
