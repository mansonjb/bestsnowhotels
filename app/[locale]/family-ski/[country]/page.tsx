import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getFamilyCountries, getFamilyCountry, familyReasons } from '@/lib/familyCountries'
import type { Destination } from '@/lib/destinations'
import { localizeCountry, inCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { countrySlug } from '@/lib/countries'
import { getSioCountry } from '@/lib/skiInSkiOut'
import { regionSlug } from '@/lib/regionPages'
import { SITE_URL, hreflangFor, jsonLdGraph, buildAllezDestLink, buildAllezHotelLink } from '@/lib/site'
import { getHotels } from '@/lib/hotels'
import HotelCard from '@/components/HotelCard'
import Stay22Map from '@/components/Stay22Map'

const REASON: Record<'champion' | 'gentle' | 'beginner' | 'carfree' | 'sio' | 'tagged', Record<Locale, string>> = {
  champion: { en: 'Renowned for families', fr: 'Référence en famille', es: 'Referente familiar', pt: 'Referência em família', it: 'Icona per le famiglie' },
  gentle: { en: 'Gentle slopes', fr: 'Pentes douces', es: 'Pistas suaves', pt: 'Pistas suaves', it: 'Piste dolci' },
  beginner: { en: 'Real beginner runs', fr: 'Vraies pistes débutants', es: 'Pistas para principiantes', pt: 'Pistas para principiantes', it: 'Piste per principianti' },
  carfree: { en: 'Car-free village', fr: 'Village sans voitures', es: 'Pueblo sin coches', pt: 'Aldeia sem carros', it: 'Borgo senza auto' },
  sio: { en: 'Ski-in/ski-out', fr: 'Ski au pied', es: 'A pie de pista', pt: 'À beira das pistas', it: 'Sci ai piedi' },
  tagged: { en: 'Family favourite', fr: 'Valeur sûre en famille', es: 'Ideal en familia', pt: 'Ideal em família', it: 'Perfetta per famiglie' },
}

const T = {
  h1: (c: string, l: Locale) => ({
    en: `Best family ski resorts in ${c}`,
    fr: `Meilleures stations de ski en famille ${inCountry(c, 'fr')}`,
    es: `Mejores estaciones de esquí para niños ${inCountry(c, 'es')}`,
    pt: `Melhores estâncias de esqui em família ${inCountry(c, 'pt')}`,
    it: `Migliori località sciistiche per famiglie ${inCountry(c, 'it')}`,
  }[l]),
  metaDesc: (c: string, top: string, l: Locale) => ({
    en: `The best ski resorts for kids and families in ${c}, ranked by gentle terrain, beginner runs and safe, ski-in/ski-out or car-free villages. ${top} leads our list.`,
    fr: `Les meilleures stations de ski pour enfants et familles ${inCountry(c, 'fr')}, classées selon les pentes douces, les pistes débutants et les villages sûrs, ski au pied ou sans voitures. ${top} arrive en tête.`,
    es: `Las mejores estaciones de esquí para niños y familias ${inCountry(c, 'es')}, ordenadas por terreno suave, pistas de principiantes y pueblos seguros, a pie de pista o sin coches. ${top} encabeza la lista.`,
    pt: `As melhores estâncias de esqui para crianças e famílias ${inCountry(c, 'pt')}, ordenadas por terreno suave, pistas de iniciação e aldeias seguras, à beira das pistas ou sem carros. ${top} lidera a lista.`,
    it: `Le migliori località sciistiche per bambini e famiglie ${inCountry(c, 'it')}, ordinate per pendii dolci, piste per principianti e borghi sicuri, sugli sci o senza auto. ${top} guida la classifica.`,
  }[l]),
  intro: (c: string, n: number, l: Locale) => ({
    en: `A great family resort is more than a kids' club: it wants gentle, wide runs, genuine beginner terrain, and a village that is safe to walk around, ideally car-free or ski-in/ski-out. These ${n} resorts in ${c} score highest on exactly that, each with slope-side hotels you can compare in one click.`,
    fr: `Une bonne station familiale, c'est plus qu'un club enfants : il faut des pistes larges et douces, un vrai domaine débutant et un village sûr où marcher, idéalement sans voitures ou ski au pied. Ces ${n} stations ${inCountry(c, 'fr')} obtiennent les meilleurs scores sur ces critères, chacune avec des hôtels au pied des pistes à comparer en un clic.`,
    es: `Una buena estación familiar es más que un club infantil: hacen falta pistas anchas y suaves, un verdadero terreno para debutantes y un pueblo seguro para pasear, a ser posible sin coches o a pie de pista. Estas ${n} estaciones ${inCountry(c, 'es')} son las mejores en eso, cada una con hoteles junto a la nieve que puedes comparar en un clic.`,
    pt: `Uma boa estância familiar é mais do que um clube infantil: precisa de pistas largas e suaves, um verdadeiro terreno de iniciação e uma aldeia segura para passear, de preferência sem carros ou à beira das pistas. Estas ${n} estâncias ${inCountry(c, 'pt')} são as melhores nisso, cada uma com hotéis junto à neve para comparar num clique.`,
    it: `Una buona località per famiglie è molto più di un mini club: servono piste larghe e dolci, un vero terreno per principianti e un borgo sicuro dove camminare, meglio se senza auto o sugli sci. Queste ${n} località ${inCountry(c, 'it')} ottengono i punteggi migliori proprio su questo, ognuna con hotel sulle piste da confrontare in un clic.`,
  }[l]),
  quick: (top: string, region: string, l: Locale) => ({
    en: `The top family pick in this list is ${top}, in ${region}: gentle terrain, easy lift-served beginner zones and a base that keeps small skiers close to the door.`,
    fr: `Le meilleur choix familial de cette liste est ${top}, ${region} : terrain doux, zones débutants desservies par remontées et un pied de station qui garde les petits skieurs près de la porte.`,
    es: `La mejor opción familiar de esta lista es ${top}, en ${region}: terreno suave, zonas de debutantes con remontes y una base que mantiene a los pequeños esquiadores cerca de la puerta.`,
    pt: `A melhor opção familiar desta lista é ${top}, em ${region}: terreno suave, zonas de iniciação com teleféricos e uma base que mantém os pequenos esquiadores perto da porta.`,
    it: `La migliore scelta per famiglie di questa lista è ${top}, in ${region}: terreno dolce, zone per principianti servite da impianti e una base che tiene i piccoli sciatori vicino alla porta.`,
  }[l]),
  rankTitle: { en: 'The resorts, ranked for families', fr: 'Les stations, classées pour les familles', es: 'Las estaciones, clasificadas para familias', pt: 'As estâncias, classificadas para famílias', it: 'Le località, in classifica per le famiglie' } as Record<Locale, string>,
  rankNote: { en: 'Resorts the family-ski press consistently recommends lead the list (marked ★), then our own terrain score for gentle, kid-friendly skiing.', fr: 'Les stations que la presse spécialisée recommande le plus arrivent en tête (repère ★), puis notre score de terrain pour un ski doux, adapté aux enfants.', es: 'Encabezan las estaciones que la prensa de esquí en familia más recomienda (marca ★), luego nuestro score de terreno para un esquí suave y apto para niños.', pt: 'Lideram as estâncias que a imprensa de esqui em família mais recomenda (marca ★), depois o nosso score de terreno para um esqui suave e adequado a crianças.', it: 'Guidano le località che la stampa dello sci in famiglia consiglia di più (segno ★), poi il nostro punteggio di terreno per uno sci dolce e adatto ai bambini.' } as Record<Locale, string>,
  easyPistes: { en: 'easy pistes', fr: 'de pistes faciles', es: 'de pistas fáciles', pt: 'de pistas fáceis', it: 'di piste facili' } as Record<Locale, string>,
  guide: { en: 'Resort guide', fr: 'Guide de la station', es: 'Guía de la estación', pt: 'Guia da estância', it: 'Guida della località' } as Record<Locale, string>,
  book: { en: 'Find a family hotel', fr: 'Trouver un hôtel familial', es: 'Buscar un hotel familiar', pt: 'Encontrar um hotel familiar', it: 'Trova un hotel per famiglie' } as Record<Locale, string>,
  mapTitle: { en: 'Family hotels around', fr: 'Hôtels familiaux autour de', es: 'Hoteles familiares en torno a', pt: 'Hotéis familiares em redor de', it: 'Hotel per famiglie intorno a' } as Record<Locale, string>,
  more: { en: 'Keep planning', fr: 'Continuer à préparer', es: 'Sigue planificando', pt: 'Continue a planear', it: 'Continua a pianificare' } as Record<Locale, string>,
  allCountries: { en: 'Family skiing by country', fr: 'Ski en famille par pays', es: 'Esquí en familia por país', pt: 'Esqui em família por país', it: 'Sci in famiglia per paese' } as Record<Locale, string>,
  europeList: { en: 'Best family resorts in Europe', fr: "Meilleures stations familiales d'Europe", es: 'Mejores estaciones familiares de Europa', pt: 'Melhores estâncias familiares da Europa', it: "Migliori località per famiglie d'Europa" } as Record<Locale, string>,
  faqTitle: { en: 'Family skiing questions', fr: 'Questions ski en famille', es: 'Preguntas sobre esquí en familia', pt: 'Perguntas sobre esqui em família', it: 'Domande sullo sci in famiglia' } as Record<Locale, string>,
}

const easyPct = (d: Destination) => {
  const total = d.pisteCounts.green + d.pisteCounts.blue + d.pisteCounts.red + d.pisteCounts.black
  return total > 0 ? Math.round(((d.pisteCounts.green + d.pisteCounts.blue) / total) * 100) : 0
}

export async function generateStaticParams() {
  const params: { locale: string; country: string }[] = []
  for (const locale of locales) {
    for (const h of getFamilyCountries()) params.push({ locale, country: h.slug })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>
}): Promise<Metadata> {
  const { locale, country } = await params
  const h = getFamilyCountry(country)
  if (!h) return {}
  const l = locale as Locale
  const c = localizeCountry(h.country, l)
  return {
    title: `${T.h1(c, l)} | BestSnowHotels`,
    description: T.metaDesc(c, h.resorts[0].name, l),
    alternates: {
      canonical: `${SITE_URL}/${locale}/family-ski/${h.slug}`,
      languages: hreflangFor(`/family-ski/${h.slug}`),
    },
  }
}

export default async function FamilyCountryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>
}) {
  const { locale, country } = await params
  if (!hasLocale(locale)) notFound()
  const h = getFamilyCountry(country)
  if (!h) notFound()

  const l = locale as Locale
  const dict = await getDictionary(l)
  const c = localizeCountry(h.country, l)
  const top = h.resorts[0]
  const hasSio = !!getSioCountry(h.slug)

  const hotelLabels = {
    reviews: dict.destination.reviews,
    checkAvailability: dict.destination.checkAvailability,
    toSlopes: dict.destination.toSlopes,
    from: dict.destination.from,
    perNight: dict.destination.perNight,
  }

  const faq = [
    {
      q: ({ en: `Which is the best family ski resort in ${c}?`, fr: `Quelle est la meilleure station de ski en famille ${inCountry(h.country, 'fr')} ?`, es: `¿Cuál es la mejor estación de esquí para niños ${inCountry(h.country, 'es')}?`, pt: `Qual é a melhor estância de esqui em família ${inCountry(h.country, 'pt')}?`, it: `Qual è la migliore località sciistica per famiglie ${inCountry(h.country, 'it')}?` } as Record<Locale, string>)[l],
      a: ({ en: `${top.name}, in ${localizeRegion(top.region, 'en')}, tops our family ranking here: ${easyPct(top)}% of its pistes are green or blue, with genuine beginner terrain and a convenient base.`, fr: `${top.name}, ${localizeRegion(top.region, 'fr')}, arrive en tête de notre classement familial ici : ${easyPct(top)}% de ses pistes sont vertes ou bleues, avec un vrai domaine débutant et un pied de station pratique.`, es: `${top.name}, en ${localizeRegion(top.region, 'es')}, encabeza aquí nuestra clasificación familiar: el ${easyPct(top)}% de sus pistas son verdes o azules, con verdadero terreno para debutantes y una base cómoda.`, pt: `${top.name}, em ${localizeRegion(top.region, 'pt')}, lidera aqui a nossa classificação familiar: ${easyPct(top)}% das suas pistas são verdes ou azuis, com verdadeiro terreno de iniciação e uma base prática.`, it: `${top.name}, in ${localizeRegion(top.region, 'it')}, guida qui la nostra classifica famiglie: il ${easyPct(top)}% delle sue piste è verde o blu, con vero terreno per principianti e una base comoda.` } as Record<Locale, string>)[l],
    },
    {
      q: ({ en: `What makes a resort good for young children?`, fr: `Qu'est-ce qui rend une station adaptée aux jeunes enfants ?`, es: `¿Qué hace que una estación sea buena para niños pequeños?`, pt: `O que torna uma estância boa para crianças pequenas?`, it: `Cosa rende una località adatta ai bambini piccoli?` } as Record<Locale, string>)[l],
      a: ({ en: `Wide, gentle runs to build confidence, lift-served beginner areas, short transfers, and a safe, ideally car-free or ski-in/ski-out base so tired little legs never walk far. We weight our ranking towards exactly these.`, fr: `Des pistes larges et douces pour prendre confiance, des espaces débutants desservis par remontées, des trajets courts et un pied de station sûr, idéalement sans voitures ou ski au pied, pour que les petites jambes fatiguées ne marchent jamais loin. Notre classement privilégie précisément ces critères.`, es: `Pistas anchas y suaves para ganar confianza, zonas de debutantes con remontes, trayectos cortos y una base segura, a ser posible sin coches o a pie de pista, para que las piernas cansadas no caminen lejos. Nuestra clasificación prioriza justo eso.`, pt: `Pistas largas e suaves para ganhar confiança, zonas de iniciação com teleféricos, transferências curtas e uma base segura, de preferência sem carros ou à beira das pistas, para que as perninhas cansadas nunca caminhem muito. A nossa classificação valoriza exatamente isto.`, it: `Piste larghe e dolci per prendere confidenza, aree per principianti servite da impianti, trasferimenti brevi e una base sicura, meglio se senza auto o sugli sci, così le gambine stanche non camminano mai a lungo. La nostra classifica premia proprio questo.` } as Record<Locale, string>)[l],
    },
  ]

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: T.h1(localizeCountry(h.country, 'en'), 'en'),
    numberOfItems: h.resorts.length,
    itemListElement: h.resorts.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/${l}/destinations/${d.slug}`, name: d.name })),
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: T.allCountries[l], item: `${SITE_URL}/${l}/family-ski` },
      { '@type': 'ListItem', position: 3, name: c, item: `${SITE_URL}/${l}/family-ski/${h.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph([itemList, faqSchema, breadcrumb]) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ice-100">
        <SafeImage src={`/images/destinations/${top.slug}.jpg`} alt={T.h1(c, l)} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/70 to-slate-deep/45" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-sm text-white/70 mb-4">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span className="mx-2 text-white/40">/</span>
            <Link href={`/${l}/family-ski`} className="hover:text-white">{T.allCountries[l]}</Link>
            <span className="mx-2 text-white/40">/</span>
            <span className="text-white">{c}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden>{h.flag}</span>
            <span className="text-sm font-semibold text-white/85 uppercase tracking-wide">👨‍👩‍👧‍👦 {c}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow">{T.h1(c, l)}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/90 leading-relaxed drop-shadow-sm">{T.intro(c, h.resorts.length, l)}</p>
        </div>
      </section>

      {/* GEO quick answer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-2xl border border-alpenglow-400/40 bg-alpenglow-500/[0.06] p-5">
          <p className="text-lg text-slate-deep leading-relaxed font-medium">{T.quick(top.name, localizeRegion(top.region, l), l)}</p>
        </div>
      </section>

      {/* Ranked resorts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-1">{T.rankTitle[l]}</h2>
        <p className="text-sm text-ice-800/70 mb-6 max-w-3xl">{T.rankNote[l]}</p>
        <div className="space-y-6">
          {h.resorts.map((d, i) => {
            const reasons = familyReasons(d)
            const hotels = getHotels(d.slug).slice(0, 1)
            return (
              <div key={d.slug} className="rounded-3xl border border-ice-100 bg-white overflow-hidden shadow-sm shadow-ice-900/5">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-56 lg:h-full min-h-[220px]">
                    <SafeImage src={`/images/destinations/${d.slug}.jpg`} alt={d.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute top-3 left-3 bg-slate-deep text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ice-600 mb-1">
                      <Link href={`/${l}/regions/${regionSlug(d.region)}`} className="hover:text-alpenglow-600">{localizeRegion(d.region, l)}</Link>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-deep">{d.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ice-800 bg-ice-50 border border-ice-200 rounded-full px-3 py-1 tabular-nums">{easyPct(d)}% {T.easyPistes[l]}</span>
                      {reasons.map((r) => (
                        <span
                          key={r}
                          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 border ${r === 'champion' ? 'bg-alpenglow-500 text-white border-alpenglow-500 shadow-sm' : 'text-alpenglow-600 bg-alpenglow-500/10 border-alpenglow-400/40'}`}
                        >
                          {r === 'champion' ? '★ ' : ''}{REASON[r][l]}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-ice-800/80 leading-relaxed line-clamp-3">{d.intro[l]}</p>
                    {hotels.length > 0 && (
                      <div className="mt-4">
                        <HotelCard hotel={hotels[0]} bookHref={buildAllezHotelLink(hotels[0].name, d.name, d.country, 'hotel', 7)} resortName={d.name} locale={l} labels={hotelLabels} />
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={`/${l}/destinations/${d.slug}`} className="inline-block text-sm font-semibold text-ice-700 border border-ice-200 rounded-full px-4 py-2 hover:bg-ice-50 transition">{T.guide[l]} →</Link>
                      <a href={buildAllezDestLink(d.name, d.country, 'destination', 7)} target="_blank" rel="noopener sponsored" className="inline-block text-sm font-semibold text-white bg-slate-deep rounded-full px-4 py-2 hover:bg-ice-800 transition">{T.book[l]} →</a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Map of the top family resort */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-4">{T.mapTitle[l]} {top.name}</h2>
        <Stay22Map lat={top.lat} lng={top.lng} destName={top.name} height={460} />
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{T.faqTitle[l]}</h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <details key={i} className="group bg-white border border-ice-100 rounded-2xl p-5">
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex justify-between items-center">
                <span>{f.q}</span>
                <span className="text-ice-500 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-ice-800/80 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ice-700 mb-3">{T.more[l]}</div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/${l}/family-ski`} className="rounded-full border border-ice-200 bg-white px-4 py-2 text-slate-deep hover:bg-ice-50 transition">{T.allCountries[l]}</Link>
          <Link href={`/${l}/best/family`} className="rounded-full border border-ice-200 bg-white px-4 py-2 text-slate-deep hover:bg-ice-50 transition">{T.europeList[l]}</Link>
          <Link href={`/${l}/countries/${h.slug}`} className="rounded-full border border-ice-200 bg-white px-4 py-2 text-slate-deep hover:bg-ice-50 transition">{localizeCountry(h.country, l)}</Link>
          {hasSio && (
            <Link href={`/${l}/ski-in-ski-out/${h.slug}`} className="rounded-full border border-ice-200 bg-white px-4 py-2 text-slate-deep hover:bg-ice-50 transition">{REASON.sio[l]}: {localizeCountry(h.country, l)}</Link>
          )}
        </div>
      </section>
    </>
  )
}
