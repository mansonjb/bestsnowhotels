import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import SafeImage from '@/components/SafeImage'
import Stay22Map from '@/components/Stay22Map'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { destinations } from '@/lib/destinations'
import type { Destination } from '@/lib/destinations'
import { formatSeasonDate } from '@/lib/dates'
import { SITE_URL, hreflangFor, jsonLdGraph, buildAllezDestLink } from '@/lib/site'

const HERO_SLUG = 'valle-nevado'

// High-intent, in-season conversion page: the Southern Hemisphere Andes season
// closes late Sept to late Oct, and Chile/Argentina/Brazil is exactly where we
// rank page 1 right now. This page pushes the booking (Stay22) hard while the
// intent is live. All dates are real (from each resort's season window).
// Every localized value uses double-quote delimiters + straight apostrophes.
const T = {
  metaTitle: {
    en: "The last weeks to ski the Andes in 2026: book now",
    fr: "Dernieres semaines pour skier dans les Andes en 2026",
    es: "Ultimas semanas para esquiar en los Andes 2026: reserva ahora",
    pt: "Ultimas semanas para esquiar nos Andes 2026: reserve agora",
    it: "Ultime settimane per sciare sulle Ande nel 2026: prenota ora",
    nl: "De laatste weken om in de Andes te skien in 2026: boek nu",
    ja: "2026年アンデス、滑れる最後の数週間。今すぐ予約を",
  } as Record<Locale, string>,
  kicker: {
    en: "Southern Hemisphere, 2026 season",
    fr: "Hemisphere sud, saison 2026",
    es: "Hemisferio sur, temporada 2026",
    pt: "Hemisferio sul, temporada 2026",
    it: "Emisfero sud, stagione 2026",
    nl: "Zuidelijk halfrond, seizoen 2026",
    ja: "南半球、2026年シーズン",
  } as Record<Locale, string>,
  title: {
    en: "The last weeks of Andes snow",
    fr: "Dernieres semaines de neige dans les Andes",
    es: "Ultimas semanas de nieve en los Andes",
    pt: "Ultimas semanas de neve nos Andes",
    it: "Ultime settimane di neve sulle Ande",
    nl: "De laatste weken sneeuw in de Andes",
    ja: "アンデスに雪が残る最後の数週間",
  } as Record<Locale, string>,
  intro: {
    en: "The 2026 Andes season closes between late September and late October. There is still deep snow up high in Chile and Argentina. Here are the resorts staying open longest with the best snow, and where to book a hotel before it ends.",
    fr: "La saison 2026 des Andes ferme entre fin septembre et fin octobre. Il reste de la neige profonde en altitude, au Chili et en Argentine. Voici les stations ouvertes le plus longtemps et les mieux enneigees, et ou reserver un hotel avant la fin.",
    es: "La temporada 2026 en los Andes cierra entre finales de septiembre y finales de octubre. Todavia hay nieve profunda en altura, en Chile y Argentina. Estas son las estaciones abiertas mas tiempo y con mejor nieve, y donde reservar hotel antes de que termine.",
    pt: "A temporada 2026 nos Andes fecha entre o fim de setembro e o fim de outubro. Ainda ha neve profunda em altitude, no Chile e na Argentina. Estas sao as estancias abertas por mais tempo e com melhor neve, e onde reservar hotel antes que acabe.",
    it: "La stagione 2026 sulle Ande chiude tra fine settembre e fine ottobre. In quota, in Cile e Argentina, c'e ancora neve abbondante. Ecco le localita aperte piu a lungo e con la neve migliore, e dove prenotare un hotel prima che finisca.",
    nl: "Het Andes-seizoen 2026 sluit tussen eind september en eind oktober. Hoog in de bergen ligt in Chili en Argentina nog diepe sneeuw. Dit zijn de skigebieden die het langst open blijven met de beste sneeuw, en waar je een hotel boekt voordat het seizoen eindigt.",
    ja: "2026年のアンデスシーズンは9月下旬から10月下旬にかけて閉幕します。チリとアルゼンチンの高地には、まだ深い積雪が残っています。ここでは営業期間が長く雪質の良いリゾートと、シーズン終了前にホテルを予約する方法を紹介します。",
  } as Record<Locale, string>,
  urgency: {
    en: "Book now: Portillo and Las Leñas close first, at the end of September. The high resorts, Valle Nevado, Nevados de Chillan, Corralco and Pucon, hold snow into October.",
    fr: "Reservez maintenant : Portillo et Las Leñas ferment en premier, fin septembre. Les stations d'altitude, Valle Nevado, Nevados de Chillan, Corralco et Pucon, tiennent jusqu'en octobre.",
    es: "Reserva ahora: Portillo y Las Leñas cierran primero, a finales de septiembre. Las estaciones de altura, Valle Nevado, Nevados de Chillan, Corralco y Pucon, mantienen nieve hasta octubre.",
    pt: "Reserve agora: Portillo e Las Leñas fecham primeiro, no fim de setembro. As estancias de altitude, Valle Nevado, Nevados de Chillan, Corralco e Pucon, mantem neve ate outubro.",
    it: "Prenota ora: Portillo e Las Leñas chiudono per prime, a fine settembre. Le localita d'alta quota, Valle Nevado, Nevados de Chillan, Corralco e Pucon, tengono la neve fino a ottobre.",
    nl: "Boek nu: Portillo en Las Leñas sluiten als eerste, eind september. De hooggelegen skigebieden, Valle Nevado, Nevados de Chillan, Corralco en Pucon, houden de sneeuw tot in oktober.",
    ja: "今すぐ予約を。PortilloとLas Leñasが9月末に最初に閉まります。標高の高いValle Nevado、Nevados de Chillan、CorralcoとPuconは10月まで積雪が残ります。",
  } as Record<Locale, string>,
  openUntil: {
    en: "Open until", fr: "Ouvert jusqu'au", es: "Abierto hasta", pt: "Aberto ate", it: "Aperto fino al", nl: "Open tot", ja: "営業終了日",
  } as Record<Locale, string>,
  book: { en: "Book hotels", fr: "Reserver un hotel", es: "Reservar hoteles", pt: "Reservar hoteis", it: "Prenota hotel", nl: "Boek hotels", ja: "ホテルを予約" } as Record<Locale, string>,
  report: { en: "Snow report", fr: "Bulletin neige", es: "Parte de nieve", pt: "Boletim de neve", it: "Bollettino neve", nl: "Sneeuwbericht", ja: "積雪情報" } as Record<Locale, string>,
  resortsTitle: {
    en: "Where the snow is still deep",
    fr: "Ou la neige est encore profonde",
    es: "Donde la nieve sigue siendo profunda",
    pt: "Onde a neve ainda e profunda",
    it: "Dove la neve e ancora abbondante",
    nl: "Waar de sneeuw nog diep ligt",
    ja: "積雪がまだ深いエリア",
  } as Record<Locale, string>,
  mapChile: { en: "Book a hotel in the Chilean Andes", fr: "Reserver un hotel dans les Andes chiliennes", es: "Reserva un hotel en los Andes chilenos", pt: "Reserve um hotel nos Andes chilenos", it: "Prenota un hotel sulle Ande cilene", nl: "Boek een hotel in de Chileense Andes", ja: "チリ側のアンデスでホテルを予約" } as Record<Locale, string>,
  mapArg: { en: "Book a hotel in the Argentine Andes", fr: "Reserver un hotel dans les Andes argentines", es: "Reserva un hotel en los Andes argentinos", pt: "Reserve um hotel nos Andes argentinos", it: "Prenota un hotel sulle Ande argentine", nl: "Boek een hotel in de Argentijnse Andes", ja: "アルゼンチン側のアンデスでホテルを予約" } as Record<Locale, string>,
  faqTitle: { en: "Late-season Andes skiing: questions", fr: "Ski de fin de saison dans les Andes", es: "Esqui de fin de temporada en los Andes", pt: "Esqui de fim de temporada nos Andes", it: "Sci di fine stagione sulle Ande", nl: "Laat-seizoen skien in de Andes: vragen", ja: "アンデスのシーズン終盤スキーに関するよくある質問" } as Record<Locale, string>,
  faq: [
    {
      q: { en: "When does the Andes ski season end in 2026?", fr: "Quand se termine la saison de ski dans les Andes en 2026 ?", es: "¿Cuando termina la temporada de esqui en los Andes en 2026?", pt: "Quando termina a temporada de esqui nos Andes em 2026?", it: "Quando finisce la stagione sciistica sulle Ande nel 2026?", nl: "Wanneer eindigt het skiseizoen in de Andes in 2026?", ja: "2026年、アンデスのスキーシーズンはいつ終わりますか？" },
      a: { en: "Roughly between late September and late October. Portillo and Las Leñas close first, while high resorts like Valle Nevado and Nevados de Chillan, plus Villarrica-Pucon, run into late October.", fr: "Grosso modo entre fin septembre et fin octobre. Portillo et Las Leñas ferment en premier, tandis que les stations d'altitude comme Valle Nevado et Nevados de Chillan, ainsi que Villarrica-Pucon, tiennent jusqu'a fin octobre.", es: "Aproximadamente entre finales de septiembre y finales de octubre. Portillo y Las Leñas cierran primero, mientras que estaciones de altura como Valle Nevado y Nevados de Chillan, y Villarrica-Pucon, llegan hasta finales de octubre.", pt: "Sensivelmente entre o fim de setembro e o fim de outubro. Portillo e Las Leñas fecham primeiro, enquanto estancias de altitude como Valle Nevado e Nevados de Chillan, e Villarrica-Pucon, chegam ao fim de outubro.", it: "All'incirca tra fine settembre e fine ottobre. Portillo e Las Leñas chiudono per prime, mentre le localita d'alta quota come Valle Nevado e Nevados de Chillan, e Villarrica-Pucon, arrivano a fine ottobre.", nl: "Ruwweg tussen eind september en eind oktober. Portillo en Las Leñas sluiten als eerste, terwijl hooggelegen skigebieden zoals Valle Nevado en Nevados de Chillan, en Villarrica-Pucon, tot eind oktober doorgaan.", ja: "だいたい9月下旬から10月下旬です。PortilloとLas Leñasが最初に閉まり、Valle NevadoやNevados de Chillanなどの標高の高いリゾート、それにVillarrica-Puconは10月下旬まで営業します。" },
    },
    {
      q: { en: "Is it worth skiing the Andes in September or October?", fr: "Skier les Andes en septembre ou octobre, ca vaut le coup ?", es: "¿Vale la pena esquiar los Andes en septiembre u octubre?", pt: "Vale a pena esquiar nos Andes em setembro ou outubro?", it: "Vale la pena sciare sulle Ande a settembre o ottobre?", nl: "Is het de moeite waard om in september of oktober in de Andes te skien?", ja: "9月や10月にアンデスでスキーをする価値はありますか？" },
      a: { en: "Yes. Late season means long sunny days, spring snow up high, fewer crowds and lower hotel prices. Stick to the high-altitude resorts and check the live snow report before you book.", fr: "Oui. La fin de saison, ce sont de longues journees ensoleillees, de la neige de printemps en altitude, moins de monde et des hotels moins chers. Visez les stations d'altitude et verifiez le bulletin neige avant de reserver.", es: "Si. El fin de temporada trae dias largos y soleados, nieve primaveral en altura, menos gente y hoteles mas baratos. Apunta a las estaciones de altura y mira el parte de nieve antes de reservar.", pt: "Sim. O fim de temporada traz dias longos e soalheiros, neve primaveril em altitude, menos gente e hoteis mais baratos. Aposte nas estancias de altitude e veja o boletim de neve antes de reservar.", it: "Si. La fine stagione porta giornate lunghe e soleggiate, neve primaverile in quota, meno folla e hotel piu economici. Punta sulle localita d'alta quota e controlla il bollettino neve prima di prenotare.", nl: "Ja. Het einde van het seizoen betekent lange zonnige dagen, lentesneeuw hoog in de bergen, minder drukte en goedkopere hotels. Kies de hooggelegen skigebieden en bekijk het sneeuwbericht voordat je boekt.", ja: "はい。シーズン終盤は日照時間が長く、標高の高いエリアには春の雪が残り、混雑が少なくホテルも安くなります。標高の高いリゾートを選び、予約前に最新の積雪情報を確認しましょう。" },
    },
    {
      q: { en: "Which Andes resort has the best snow right now?", fr: "Quelle station des Andes a la meilleure neige en ce moment ?", es: "¿Que estacion de los Andes tiene mejor nieve ahora mismo?", pt: "Que estancia dos Andes tem a melhor neve agora?", it: "Quale localita delle Ande ha la neve migliore in questo momento?", nl: "Welk skigebied in de Andes heeft nu de beste sneeuw?", ja: "今、アンデスで一番雪質が良いリゾートはどこですか？" },
      a: { en: "By our snow score, Corralco, Portillo and Nevados de Chillan lead, followed by Las Leñas, Valle Nevado and La Hoya. Check each resort's live snow report for today's conditions.", fr: "Selon notre score neige, Corralco, Portillo et Nevados de Chillan menent, devant Las Leñas, Valle Nevado et La Hoya. Consultez le bulletin neige de chaque station pour les conditions du jour.", es: "Segun nuestra puntuacion de nieve, encabezan Corralco, Portillo y Nevados de Chillan, seguidos de Las Leñas, Valle Nevado y La Hoya. Mira el parte de nieve de cada estacion para las condiciones de hoy.", pt: "Pela nossa pontuacao de neve, lideram Corralco, Portillo e Nevados de Chillan, seguidos de Las Leñas, Valle Nevado e La Hoya. Veja o boletim de neve de cada estancia para as condicoes de hoje.", it: "Secondo il nostro punteggio neve, in testa ci sono Corralco, Portillo e Nevados de Chillan, seguiti da Las Leñas, Valle Nevado e La Hoya. Controlla il bollettino neve di ogni localita per le condizioni di oggi.", nl: "Volgens onze sneeuwscore staan Corralco, Portillo en Nevados de Chillan bovenaan, gevolgd door Las Leñas, Valle Nevado en La Hoya. Bekijk het sneeuwbericht van elk skigebied voor de actuele omstandigheden.", ja: "当サイトの積雪スコアでは、Corralco、PortilloとNevados de Chillanが上位で、Las Leñas、Valle Nevado、La Hoyaが続きます。今日の状況は各リゾートの積雪情報でご確認ください。" },
    },
  ] as { q: Record<Locale, string>; a: Record<Locale, string> }[],
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  return {
    title: `${T.metaTitle[l]} | BestSnowHotels`,
    description: T.intro[l],
    alternates: { canonical: `${SITE_URL}/${l}/andes-2026`, languages: hreflangFor('/andes-2026') },
    openGraph: { title: T.metaTitle[l], description: T.intro[l], url: `${SITE_URL}/${l}/andes-2026`, images: [`${SITE_URL}/images/destinations/${HERO_SLUG}.jpg`] },
  }
}

export default async function Andes2026Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const featured: Destination[] = destinations
    .filter((d) => (d.countryCode === 'CL' || d.countryCode === 'AR') && d.snowScore >= 80)
    .sort((a, b) => b.snowScore - a.snowScore)
    .slice(0, 8)

  const chileHub = destinations.find((d) => d.slug === 'valle-nevado')
  const argHub = destinations.find((d) => d.slug === 'cerro-catedral')

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
      { '@type': 'ListItem', position: 2, name: T.title[l], item: `${SITE_URL}/${l}/andes-2026` },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: T.faq.map((f) => ({ '@type': 'Question', name: f.q[l], acceptedAnswer: { '@type': 'Answer', text: f.a[l] } })) },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[46vh] min-h-[340px] w-full overflow-hidden">
          <SafeImage src={`/images/destinations/${HERO_SLUG}.jpg`} alt={T.title[l]} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/95 via-slate-deep/55 to-slate-deep/25" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-9">
              <p className="text-sm font-semibold uppercase tracking-wide text-alpenglow-400 drop-shadow">{T.kicker[l]}</p>
              <h1 className="mt-2 text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow">{T.title[l]}</h1>
              <p className="mt-4 text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed drop-shadow">{T.intro[l]}</p>
              {chileHub && (
                <a href={buildAllezDestLink(chileHub.name, 'Chile', 'andes-2026', 7)} target="_blank" rel="noopener sponsored"
                  className="mt-5 inline-block bg-alpenglow-500 text-white font-bold px-7 py-3 rounded-full hover:bg-alpenglow-400 transition shadow-lg">
                  {T.book[l]} →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Urgency band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-2xl border border-alpenglow-400/40 bg-gradient-to-br from-alpenglow-400/10 to-white p-5 sm:p-6 shadow-sm flex items-start gap-3">
          <span className="text-2xl" aria-hidden>⏳</span>
          <p className="text-base sm:text-lg text-slate-deep font-medium leading-relaxed">{T.urgency[l]}</p>
        </div>
      </section>

      {/* Featured resorts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-2xl font-bold text-slate-deep">{T.resortsTitle[l]}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((d) => (
            <div key={d.slug} className="bg-white rounded-2xl border border-ice-100 overflow-hidden flex flex-col">
              <Link href={`/${l}/destinations/${d.slug}`} className="relative h-40 block overflow-hidden group">
                <SafeImage src={`/images/destinations/${d.slug}.jpg`} alt={d.name} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/70 to-transparent" />
                <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2.5 py-0.5 text-xs font-bold text-ice-800">❄ {d.snowScore}</div>
                <h3 className="absolute bottom-2 left-3 right-3 text-lg font-bold text-white drop-shadow">{d.flag} {d.name}</h3>
              </Link>
              <div className="p-4 flex flex-col gap-3 grow">
                <p className="text-sm text-ice-800/90 font-medium">{T.openUntil[l]} <span className="text-slate-deep font-bold">{formatSeasonDate(d.seasonEnd, l)}</span></p>
                <div className="mt-auto flex flex-col gap-2">
                  <a href={buildAllezDestLink(d.name, d.countryCode === 'CL' ? 'Chile' : 'Argentina', 'andes-2026', 7)} target="_blank" rel="noopener sponsored"
                    className="block text-center bg-ice-600 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-ice-500 transition text-sm">
                    {T.book[l]}
                  </a>
                  <Link href={`/${l}/weather/${d.slug}`} className="block text-center text-ice-700 font-semibold text-sm hover:text-slate-deep">{T.report[l]} →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking maps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chileHub && (
          <div>
            <h2 className="text-base font-bold text-slate-deep mb-3">🇨🇱 {T.mapChile[l]}</h2>
            <Stay22Map lat={chileHub.lat} lng={chileHub.lng} destName={chileHub.name} zoom={9} height={420} />
          </div>
        )}
        {argHub && (
          <div>
            <h2 className="text-base font-bold text-slate-deep mb-3">🇦🇷 {T.mapArg[l]}</h2>
            <Stay22Map lat={argHub.lat} lng={argHub.lng} destName={argHub.name} zoom={9} height={420} />
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <h2 className="text-2xl font-bold text-slate-deep">{T.faqTitle[l]}</h2>
        <div className="mt-6 space-y-4 max-w-4xl">
          {T.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-ice-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-slate-deep">
                {f.q[l]}
                <span className="text-ice-400 group-open:rotate-45 transition text-xl leading-none" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-base text-ice-800/85 leading-relaxed">{f.a[l]}</p>
            </details>
          ))}
        </div>
        <div className="mt-8">
          <Link href={`/${l}/southern-hemisphere`} className="text-ice-700 font-semibold hover:text-slate-deep">{T.kicker[l]} →</Link>
        </div>
      </section>
    </>
  )
}
