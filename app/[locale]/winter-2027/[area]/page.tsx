import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getWinterAreas, getWinterArea, isWinterArea, winterReasons, winterTitle, winterMembers } from '@/lib/winterHolidays'
import { localizeRegion } from '@/lib/regions'
import { localizeCountry } from '@/lib/countryNames'
import Stay22Map from '@/components/Stay22Map'
import { SITE_URL, hreflangFor, buildAllezDestLink } from '@/lib/site'

const T = {
  whyHeading: {
    en: 'Why this domain for winter 2027', fr: "Pourquoi ce domaine pour l'hiver 2027", es: 'Por qué este dominio para el invierno 2027', pt: 'Porquê este domínio para o inverno 2027', it: "Perché questo comprensorio per l'inverno 2027",
  } as Record<Locale, string>,
  baseHeading: {
    en: 'Where to base yourself', fr: 'Où poser ses valises', es: 'Dónde alojarse', pt: 'Onde ficar', it: 'Dove sistemarsi',
  } as Record<Locale, string>,
  baseSub: {
    en: 'Each of these resorts opens onto the linked domain on one pass. Pick the village, ski it all.',
    fr: "Chacune de ces stations ouvre sur le domaine relié avec un seul forfait. Choisissez le village, skiez l'ensemble.",
    es: 'Cada una de estas estaciones da al dominio enlazado con un forfait. Elige el pueblo, esquíalo todo.',
    pt: 'Cada uma destas estâncias abre para o domínio ligado com um passe. Escolha a aldeia, esquie tudo.',
    it: 'Ognuna di queste località si apre sul comprensorio collegato con un solo skipass. Scegli il paese, scia tutto.',
  } as Record<Locale, string>,
  planHeading: {
    en: 'Plan your 2027 stay', fr: 'Préparez votre séjour 2027', es: 'Planifica tu estancia 2027', pt: 'Planeie a sua estadia 2027', it: 'Pianifica il tuo soggiorno 2027',
  } as Record<Locale, string>,
  book: {
    en: 'Compare stays in the area', fr: 'Comparer les séjours sur le domaine', es: 'Comparar alojamientos en el dominio', pt: 'Comparar estadias no domínio', it: 'Confronta soggiorni nel comprensorio',
  } as Record<Locale, string>,
  fullGuide: {
    en: 'Full domain guide', fr: 'Guide complet du domaine', es: 'Guía completa del dominio', pt: 'Guia completo do domínio', it: 'Guida completa del comprensorio',
  } as Record<Locale, string>,
  whenLink: {
    en: 'Where to ski in 2027', fr: 'Où skier en 2027', es: 'Dónde esquiar en 2027', pt: 'Onde esquiar em 2027', it: 'Dove sciare nel 2027',
  } as Record<Locale, string>,
  hub: {
    en: 'All domains', fr: 'Tous les domaines', es: 'Todos los dominios', pt: 'Todos os domínios', it: 'Tutti i comprensori',
  } as Record<Locale, string>,
}

export function generateStaticParams() {
  const params: { locale: string; area: string }[] = []
  for (const l of locales) for (const a of getWinterAreas()) params.push({ locale: l, area: a.slug })
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; area: string }>
}): Promise<Metadata> {
  const { locale, area } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const a = getWinterArea(area)
  if (!a) return {}
  const reasons = winterReasons(a, l)
  return {
    title: `${winterTitle(a, l)} | BestSnowHotels`,
    description: reasons[0]?.body ?? a.intro[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/winter-2027/${area}`,
      languages: hreflangFor(`/winter-2027/${area}`),
    },
  }
}

export default async function WinterAreaPage({
  params,
}: {
  params: Promise<{ locale: string; area: string }>
}) {
  const { locale, area } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const a = getWinterArea(area)
  if (!a || !isWinterArea(area)) notFound()
  const dict = await getDictionary(l)
  const reasons = winterReasons(a, l)
  const members = winterMembers(a)
  const heroSlug = members[0]?.slug ?? a.members[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: dict.skiAreas?.title ?? 'Ski areas', item: `${SITE_URL}/${l}/ski-areas` },
      { '@type': 'ListItem', position: 3, name: winterTitle(a, l), item: `${SITE_URL}/${l}/winter-2027/${area}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-[44vh] min-h-[340px] w-full overflow-hidden">
        <Image src={`/images/destinations/${heroSlug}.jpg`} alt={a.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/40 to-slate-deep/15" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <nav className="text-xs text-white/80 mb-3 flex items-center gap-2 flex-wrap">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span aria-hidden>/</span>
            <Link href={`/${l}/winter-2027`} className="hover:text-white">{T.hub[l]}</Link>
            <span aria-hidden>/</span>
            <span>{a.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl">{winterTitle(a, l)}</h1>
          <p className="mt-2 text-white/85 text-sm tabular-nums">
            {a.flags?.join(' ')} {a.pistesKm} km · {a.members.length} {dict.nav.destinations.toLowerCase()} · {a.pass}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-lg text-ice-800/85 leading-relaxed">{a.intro[l]}</p>
      </section>

      {/* Reasons */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.whyHeading[l]}</h2>
        <div className="space-y-5">
          {reasons.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ice-100 p-5">
              <h3 className="font-bold text-slate-deep">{r.title}</h3>
              <p className="mt-1.5 text-ice-800/85 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Where to base */}
      {members.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-slate-deep">{T.baseHeading[l]}</h2>
          <p className="mt-2 text-ice-800/80 mb-6">{T.baseSub[l]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((m) => (
              <Link key={m.slug} href={`/${l}/destinations/${m.slug}`} className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <Image src={`/images/destinations/${m.slug}.jpg`} alt={m.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <span className="text-white font-bold">{m.name}</span>
                    <span className="block text-white/75 text-xs">{localizeRegion(m.region, l)}, {localizeCountry(m.country, l)}</span>
                  </div>
                </div>
                <div className="p-3 text-xs text-ice-800/75 tabular-nums">{m.altitudeBase} m, {m.pistesKm} km</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Map + CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-4">{T.planHeading[l]}</h2>
        <Stay22Map lat={a.lat} lng={a.lng} destName={a.name} zoom={a.zoom} height={460} />
        <div className="mt-6 text-center">
          <a href={buildAllezDestLink(a.name, members[0]?.country ?? '', 'winter-2027')} target="_blank" rel="noopener sponsored" className="inline-block bg-slate-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20">
            {T.book[l]} →
          </a>
        </div>
      </section>

      {/* Cross-links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-wrap gap-3 text-sm">
        <Link href={`/${l}/ski-areas/${a.slug}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.fullGuide[l]}</Link>
        <Link href={`/${l}/when`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.whenLink[l]}</Link>
        <Link href={`/${l}/winter-2027`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.hub[l]}</Link>
      </section>
    </>
  )
}
