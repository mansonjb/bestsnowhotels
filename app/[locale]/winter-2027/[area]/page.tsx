import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getWinterAreas, getWinterArea, isWinterArea, winterReasons, winterTitle, winterMembers, winterStats, winterFaq } from '@/lib/winterHolidays'
import { localizeRegion } from '@/lib/regions'
import { localizeCountry } from '@/lib/countryNames'
import Stay22Map from '@/components/Stay22Map'
import SnowByMonth from '@/components/SnowByMonth'
import { snowByMonth } from '@/lib/snow'
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
  statPiste: { en: 'of piste', fr: 'de pistes', es: 'de pistas', pt: 'de pistas', it: 'di piste' } as Record<Locale, string>,
  statLifts: { en: 'lifts', fr: 'remontées', es: 'remontes', pt: 'teleféricos', it: 'impianti' } as Record<Locale, string>,
  statTop: { en: 'top altitude', fr: 'point culminant', es: 'cota máxima', pt: 'cota máxima', it: 'quota massima' } as Record<Locale, string>,
  statVert: { en: 'vertical', fr: 'dénivelé', es: 'desnivel', pt: 'desnível', it: 'dislivello' } as Record<Locale, string>,
  statResorts: { en: 'linked resorts', fr: 'stations reliées', es: 'estaciones enlazadas', pt: 'estâncias ligadas', it: 'località collegate' } as Record<Locale, string>,
  pisteMix: { en: 'Piste mix across the domain', fr: 'Répartition des pistes du domaine', es: 'Reparto de pistas del dominio', pt: 'Repartição das pistas do domínio', it: 'Ripartizione delle piste del comprensorio' } as Record<Locale, string>,
  green: { en: 'green', fr: 'vertes', es: 'verdes', pt: 'verdes', it: 'verdi' } as Record<Locale, string>,
  blue: { en: 'blue', fr: 'bleues', es: 'azules', pt: 'azuis', it: 'blu' } as Record<Locale, string>,
  red: { en: 'red', fr: 'rouges', es: 'rojas', pt: 'vermelhas', it: 'rosse' } as Record<Locale, string>,
  black: { en: 'black', fr: 'noires', es: 'negras', pt: 'pretas', it: 'nere' } as Record<Locale, string>,
  snowHeading: { en: 'Snow through the season', fr: 'La neige au fil de la saison', es: 'La nieve a lo largo de la temporada', pt: 'A neve ao longo da época', it: 'La neve nel corso della stagione' } as Record<Locale, string>,
  snowSub: {
    en: (name: string) => `Indicative average snow depth on the slopes at ${name}, the domain's snowiest base.`,
    fr: (name: string) => `Hauteur de neige moyenne indicative sur les pistes à ${name}, la base la plus enneigée du domaine.`,
    es: (name: string) => `Espesor medio indicativo de nieve en las pistas de ${name}, la base más nevada del dominio.`,
    pt: (name: string) => `Espessura média indicativa de neve nas pistas de ${name}, a base mais nevada do domínio.`,
    it: (name: string) => `Spessore medio indicativo della neve sulle piste a ${name}, la base più nevosa del comprensorio.`,
  } as Record<Locale, (name: string) => string>,
  liveSnow: { en: 'Live snow report', fr: 'Bulletin neige en direct', es: 'Parte de nieve en directo', pt: 'Boletim de neve em direto', it: 'Bollettino neve in tempo reale' } as Record<Locale, string>,
  faqHeading: { en: 'Frequently asked questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes', it: 'Domande frequenti' } as Record<Locale, string>,
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
  const stats = winterStats(a)
  const snow = stats.flagship ? snowByMonth(stats.flagship) : null
  const mixTotal = stats.mix.green + stats.mix.blue + stats.mix.red + stats.mix.black
  const mixBar = [
    { key: 'green', n: stats.mix.green, cls: 'bg-emerald-500' },
    { key: 'blue', n: stats.mix.blue, cls: 'bg-sky-500' },
    { key: 'red', n: stats.mix.red, cls: 'bg-rose-500' },
    { key: 'black', n: stats.mix.black, cls: 'bg-slate-800' },
  ] as const

  const faq = winterFaq(a, l)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.skiAreas?.title ?? 'Ski areas', item: `${SITE_URL}/${l}/ski-areas` },
        { '@type': 'ListItem', position: 3, name: winterTitle(a, l), item: `${SITE_URL}/${l}/winter-2027/${area}` },
      ],
    },
    ...(faq.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.title, acceptedAnswer: { '@type': 'Answer', text: f.body } })),
        }]
      : []),
  ]

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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-lg text-ice-800/85 leading-relaxed max-w-4xl">{a.intro[l]}</p>
      </section>

      {/* Stats strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { v: `${stats.km} km`, k: T.statPiste[l] },
            { v: stats.lifts, k: T.statLifts[l] },
            { v: `${stats.topAlt} m`, k: T.statTop[l] },
            { v: `${stats.vertical} m`, k: T.statVert[l] },
            { v: stats.resorts, k: T.statResorts[l] },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ice-100 px-4 py-3 text-center">
              <dd className="text-2xl font-bold text-slate-deep tabular-nums">{s.v}</dd>
              <dt className="mt-0.5 text-xs text-ice-800/70">{s.k}</dt>
            </div>
          ))}
        </dl>

        {/* Piste mix bar */}
        {mixTotal > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-ice-100 p-5">
            <div className="text-sm font-semibold text-slate-deep mb-3">{T.pisteMix[l]}</div>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {mixBar.filter((s) => s.n > 0).map((s) => (
                <div key={s.key} className={s.cls} style={{ width: `${(s.n / mixTotal) * 100}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ice-800/75 tabular-nums">
              {mixBar.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.cls}`} />
                  {Math.round((s.n / mixTotal) * 100)}% {T[s.key][l]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Reasons */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.whyHeading[l]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reasons.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ice-100 p-5">
              <h3 className="font-bold text-slate-deep">{r.title}</h3>
              <p className="mt-1.5 text-ice-800/85 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Snow through the season */}
      {snow && stats.flagship && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-2xl font-bold text-slate-deep">{T.snowHeading[l]}</h2>
          <p className="mt-2 text-ice-800/80 mb-5">{T.snowSub[l](stats.flagship.name)}</p>
          <div className="bg-white rounded-2xl border border-ice-100 p-5">
            <SnowByMonth data={snow} locale={l} />
          </div>
          <div className="mt-4">
            <Link href={`/${l}/weather/${stats.flagship.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ice-700 hover:text-slate-deep transition">
              {T.liveSnow[l]} →
            </Link>
          </div>
        </section>
      )}

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

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-slate-deep mb-5">{T.faqHeading[l]}</h2>
          <dl className="space-y-4">
            {faq.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ice-100 p-5">
                <dt className="font-semibold text-slate-deep">{f.title}</dt>
                <dd className="mt-1.5 text-ice-800/85 leading-relaxed">{f.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Cross-links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-wrap gap-3 text-sm">
        <Link href={`/${l}/ski-areas/${a.slug}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.fullGuide[l]}</Link>
        <Link href={`/${l}/when`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.whenLink[l]}</Link>
        <Link href={`/${l}/winter-2027`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">{T.hub[l]}</Link>
      </section>
    </>
  )
}
