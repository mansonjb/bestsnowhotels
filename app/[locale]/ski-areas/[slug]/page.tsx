import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { SKI_AREAS, getSkiArea } from '@/lib/skiAreas'
import { getDestination } from '@/lib/destinations'
import { SITE_URL } from '@/lib/site'
import DestinationCard from '@/components/DestinationCard'
import Stay22Map from '@/components/Stay22Map'

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    SKI_AREAS.map((a) => ({ locale, slug: a.slug })),
  )
}

const AND: Record<Locale, string> = { en: 'and', fr: 'et', es: 'y', pt: 'e' }

function listJoin(names: string[], locale: Locale): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} ${AND[locale]} ${names[names.length - 1]}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const area = getSkiArea(slug)
  if (!area) return {}
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const titles: Record<Locale, string> = {
    en: `${area.name} ski area: resorts, piste map and ski-in/ski-out hotels | BestSnowHotels`,
    fr: `Domaine skiable de ${area.name} : stations, pistes et hôtels ski-in/ski-out | BestSnowHotels`,
    es: `Dominio esquiable de ${area.name}: estaciones, pistas y hoteles ski-in/ski-out | BestSnowHotels`,
    pt: `Domínio esquiável de ${area.name}: estâncias, pistas e hotéis ski-in/ski-out | BestSnowHotels`,
  }
  const descriptions: Record<Locale, string> = {
    en: `${area.name}: ${area.pistesKm} km of piste, ${area.members.length} linked resorts and ski-in/ski-out hotels. Compare Booking, Expedia and Hotels.com on a live map.`,
    fr: `${area.name} : ${area.pistesKm} km de pistes, ${area.members.length} stations reliées et des hôtels ski-in/ski-out. Comparez Booking, Expedia et Hotels.com sur une carte en direct.`,
    es: `${area.name}: ${area.pistesKm} km de pistas, ${area.members.length} estaciones enlazadas y hoteles ski-in/ski-out. Compara Booking, Expedia y Hotels.com en un mapa en directo.`,
    pt: `${area.name}: ${area.pistesKm} km de pistas, ${area.members.length} estâncias ligadas e hotéis ski-in/ski-out. Compare Booking, Expedia e Hotels.com num mapa em direto.`,
  }
  return {
    title: titles[l],
    description: descriptions[l],
    alternates: {
      canonical: `${SITE_URL}/${l}/ski-areas/${slug}`,
      languages: Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/ski-areas/${slug}`])),
    },
  }
}

export default async function SkiAreaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const area = getSkiArea(slug)
  if (!area) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const members = area.members.map((m) => getDestination(m)).filter(Boolean) as NonNullable<
    ReturnType<typeof getDestination>
  >[]
  const memberNames = members.map((m) => m.name)

  const cardLabels = {
    altitude: dict.destinations.altitude,
    pistes: dict.destinations.pistes,
    snowScore: dict.destinations.snowScore,
    viewHotels: dict.destinations.viewHotels,
  }

  const faqs = [
    {
      q: {
        en: `Which resorts are part of ${area.name}?`,
        fr: `Quelles stations font partie du domaine ${area.name} ?`,
        es: `¿Qué estaciones forman parte de ${area.name}?`,
        pt: `Que estâncias fazem parte de ${area.name}?`,
      } as Record<Locale, string>,
      a: {
        en: `${area.name} links ${listJoin(memberNames, 'en')} on the ${area.pass} pass, with ${area.pistesKm} km of piste served by around ${area.lifts} lifts.`,
        fr: `${area.name} relie ${listJoin(memberNames, 'fr')} sur le forfait ${area.pass}, soit ${area.pistesKm} km de pistes desservies par environ ${area.lifts} remontées.`,
        es: `${area.name} enlaza ${listJoin(memberNames, 'es')} con el forfait ${area.pass}, ${area.pistesKm} km de pistas servidas por unos ${area.lifts} remontes.`,
        pt: `${area.name} liga ${listJoin(memberNames, 'pt')} no forfait ${area.pass}, ${area.pistesKm} km de pistas servidas por cerca de ${area.lifts} teleféricos.`,
      } as Record<Locale, string>,
    },
    {
      q: {
        en: `How big is the ${area.name} ski area?`,
        fr: `Quelle est la taille du domaine skiable de ${area.name} ?`,
        es: `¿Qué tamaño tiene el dominio esquiable de ${area.name}?`,
        pt: `Qual é a dimensão do domínio esquiável de ${area.name}?`,
      } as Record<Locale, string>,
      a: {
        en: `${area.name} offers ${area.pistesKm} km of marked piste and about ${area.lifts} lifts, rising to ${area.topAltitude.toLocaleString()} m.`,
        fr: `${area.name} propose ${area.pistesKm} km de pistes balisées et environ ${area.lifts} remontées, jusqu'à ${area.topAltitude.toLocaleString()} m.`,
        es: `${area.name} ofrece ${area.pistesKm} km de pistas balizadas y unos ${area.lifts} remontes, hasta los ${area.topAltitude.toLocaleString()} m.`,
        pt: `${area.name} oferece ${area.pistesKm} km de pistas balizadas e cerca de ${area.lifts} teleféricos, até aos ${area.topAltitude.toLocaleString()} m.`,
      } as Record<Locale, string>,
    },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.skiAreas.title, item: `${SITE_URL}/${l}/ski-areas` },
        { '@type': 'ListItem', position: 3, name: area.name, item: `${SITE_URL}/${l}/ski-areas/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: area.name,
      itemListElement: members.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/destinations/${m.slug}`,
        name: m.name,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q[l],
        acceptedAnswer: { '@type': 'Answer', text: f.a[l] },
      })),
    },
  ]

  const otherAreas = SKI_AREAS.filter((a) => a.slug !== area.slug).slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden">
          <Image
            src={`/images/destinations/${area.members[0]}.jpg`}
            alt={area.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/40 to-slate-deep/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <nav className="text-xs text-white/80 mb-3 flex items-center gap-2">
                <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
                <span aria-hidden>/</span>
                <Link href={`/${l}/ski-areas`} className="hover:text-white">{dict.skiAreas.title}</Link>
              </nav>
              <div className="flex items-center gap-2 text-2xl mb-2">
                {area.flags.map((f) => (
                  <span key={f} aria-hidden>{f}</span>
                ))}
                <span className="text-xs font-semibold uppercase tracking-wide text-white/80 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                  {dict.skiAreas.passLabel}: {area.pass}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow">
                {area.name}
              </h1>
              <p className="mt-3 text-lg text-white/90 max-w-3xl drop-shadow">{area.intro[l]}</p>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="bg-slate-deep text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            <Stat value={`${area.members.length}`} label={dict.destinations.resorts} />
            <Stat value={`${area.pistesKm} km`} label={dict.destination.pistesKm} />
            <Stat value={`${area.lifts}`} label={dict.destination.lifts} />
            <Stat value={`${area.topAltitude.toLocaleString()} m`} label={dict.destination.altitudeSummit} />
          </div>
        </div>
      </section>

      {/* About the domain */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.skiAreas.aboutHeading}</h2>
        <p className="mt-4 text-lg text-ice-800/90 leading-relaxed max-w-4xl">
          {area.description[l]}
        </p>
      </section>

      {/* Resorts in this ski area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.skiAreas.resortsHeading}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <DestinationCard key={m.slug} destination={m} locale={l} labels={cardLabels} />
          ))}
        </div>
      </section>

      {/* Hotels map across the domain */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <h2 className="text-2xl font-bold text-slate-deep">
          {dict.skiAreas.mapHeading}
        </h2>
        <p className="mt-2 text-ice-800/80 max-w-3xl">{dict.skiAreas.mapSubtitle}</p>
        <div className="mt-6">
          <Stay22Map lat={area.lat} lng={area.lng} destName={area.name} zoom={area.zoom} height={520} />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.destination.faqTitle}</h2>
        <div className="mt-6 space-y-4 max-w-4xl">
          {faqs.map((f) => (
            <details key={f.q.en} className="group bg-white border border-ice-100 rounded-2xl p-5">
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex justify-between items-center">
                {f.q[l]}
                <span className="text-ice-400 group-open:rotate-45 transition" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-ice-800/90 leading-relaxed">{f.a[l]}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Other ski areas (maillage) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4">
        <h2 className="text-2xl font-bold text-slate-deep">{dict.skiAreas.title}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {otherAreas.map((a) => (
            <Link
              key={a.slug}
              href={`/${l}/ski-areas/${a.slug}`}
              className="inline-flex items-center gap-2 bg-white border border-ice-100 rounded-full px-4 py-2 text-sm font-medium text-ice-800 hover:border-ice-300 hover:text-slate-deep transition"
            >
              {a.flags[0]} {a.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-5 text-center">
      <div className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] sm:text-xs uppercase tracking-wide text-white/70 mt-1">{label}</div>
    </div>
  )
}
