import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { getWinterAreas, winterMembers } from '@/lib/winterHolidays'
import { SITE_URL, hreflangFor } from '@/lib/site'

const T = {
  title: {
    en: 'Where to ski for the 2027 winter holidays?',
    fr: "Où partir au ski pour les vacances d'hiver 2027 ?",
    es: '¿Dónde esquiar en las vacaciones de invierno 2027?',
    pt: 'Onde esquiar nas férias de inverno de 2027?',
    it: 'Dove sciare per le vacanze invernali 2027?',
  } as Record<Locale, string>,
  subtitle: {
    en: 'Planning the 2027 winter holidays? Here is why each big linked domain is worth a week, with one pass, real piste numbers and where to base yourself. No marketing, just our data.',
    fr: "Vous préparez les vacances d'hiver 2027 ? Voici pourquoi chaque grand domaine relié vaut une semaine, avec un seul forfait, de vrais chiffres de pistes et où poser ses valises. Pas de marketing, juste nos données.",
    es: '¿Planeando las vacaciones de invierno 2027? Aquí tienes por qué cada gran dominio enlazado merece una semana, con un forfait, cifras reales de pistas y dónde alojarse. Sin marketing, solo nuestros datos.',
    pt: 'A planear as férias de inverno de 2027? Eis porque cada grande domínio ligado merece uma semana, com um passe, números reais de pistas e onde ficar. Sem marketing, só os nossos dados.',
    it: 'State pianificando le vacanze invernali 2027? Ecco perché ogni grande comprensorio collegato vale una settimana, con un solo skipass, numeri reali delle piste e dove sistemarsi. Niente marketing, solo i nostri dati.',
  } as Record<Locale, string>,
  resortsWord: {
    en: 'resorts', fr: 'stations', es: 'estaciones', pt: 'estâncias', it: 'località',
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
      canonical: `${SITE_URL}/${l}/winter-2027`,
      languages: hreflangFor('/winter-2027'),
    },
  }
}

export default async function WinterHubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const areas = getWinterAreas()

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
        {areas.map((a) => {
          const hero = winterMembers(a)[0]?.slug ?? a.members[0]
          return (
            <Link key={a.slug} href={`/${l}/winter-2027/${a.slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <SafeImage src={`/images/destinations/${hero}.jpg`} alt={a.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/85 via-slate-deep/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                  <span className="text-white text-xl font-bold leading-tight">{a.name}</span>
                  <span className="text-lg" aria-hidden>{a.flags?.join('')}</span>
                </div>
              </div>
              <div className="p-4 text-sm text-ice-800/80 tabular-nums">
                {a.pistesKm} km · {a.members.length} {T.resortsWord[l]}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
