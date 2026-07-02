import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { COMPARE_PAIRS } from '@/lib/compare'
import { SITE_URL } from '@/lib/site'

const T = {
  title: {
    en: 'Ski resort comparisons: head-to-head',
    fr: 'Comparatifs de stations de ski : face à face',
    es: 'Comparativas de estaciones de esquí: cara a cara',
    pt: 'Comparativos de estâncias de esqui: face a face',
    it: 'Confronti tra località sciistiche: testa a testa',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Six side-by-side ski resort matchups: where each one wins and who should pick which.',
    fr: "Six face-à-face de stations de ski : sur quoi chacune l'emporte et qui doit choisir laquelle.",
    es: 'Seis enfrentamientos entre estaciones: dónde gana cada una y a quién le conviene cada cual.',
    pt: 'Seis confrontos entre estâncias: onde cada uma ganha e a quem convém cada qual.',
    it: 'Sei confronti tra località: dove vince ciascuna e a chi conviene quale.',
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
      canonical: `${SITE_URL}/${l}/compare`,
      languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/compare`])), "x-default": `${SITE_URL}/en/compare` },
    },
  }
}

export default async function CompareIndexPage({
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
        {COMPARE_PAIRS.map((p) => (
          <Link
            key={p.slug}
            href={`/${l}/compare/${p.slug}`}
            className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
          >
            <div className="relative h-40 overflow-hidden">
              <SafeImage
                src={`/images/destinations/${p.heroSlug}.jpg`}
                alt={p.slug}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-white text-lg font-bold uppercase tracking-wide">
                  {p.slugA.replace(/-/g, ' ')} <span className="text-white/70 normal-case font-normal">vs</span> {p.slugB.replace(/-/g, ' ')}
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-ice-800/80 line-clamp-3">{p.intro[l]}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
