import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { destinations } from '@/lib/destinations'
import { fetchManyWeather, freshSnowScore } from '@/lib/weather'
import { localizeCountry } from '@/lib/countryNames'
import WeatherCard from '@/components/WeatherCard'
import { SITE_URL, jsonLdGraph } from '@/lib/site'

export const revalidate = 1800

// Question-framed page targeting "where is it snowing right now" / "ou neige-t-il
// en ce moment" (we already rank ~#5 for these with tangential pages).
const T = {
  title: {
    en: 'Where is it snowing right now?',
    fr: 'Où neige-t-il en ce moment dans le monde ?',
    es: '¿Dónde está nevando ahora mismo?',
    pt: 'Onde está a nevar neste momento?',
    it: 'Dove sta nevicando in questo momento?',
    nl: 'Waar sneeuwt het nu?',
    ja: '今、世界のどこで雪が降っている？',
  } as Record<Locale, string>,
  subtitle: {
    en: 'A live look at which ski resorts in the world have the most fresh snow on the slopes right now, ranked from real conditions and updated every 30 minutes.',
    fr: "Un aperçu en direct des stations de ski du monde qui ont le plus de neige fraîche sur les pistes en ce moment, classées d'après les conditions réelles et mises à jour toutes les 30 minutes.",
    es: 'Una mirada en directo a las estaciones de esquí del mundo con más nieve fresca en las pistas ahora mismo, ordenadas según las condiciones reales y actualizadas cada 30 minutos.',
    pt: 'Uma vista em direto das estâncias de esqui do mundo com mais neve fresca nas pistas neste momento, ordenadas pelas condições reais e atualizadas a cada 30 minutos.',
    it: 'Uno sguardo in tempo reale alle località sciistiche del mondo con più neve fresca sulle piste in questo momento, ordinate in base alle condizioni reali e aggiornate ogni 30 minuti.',
    nl: 'Een actueel overzicht van welke skigebieden ter wereld nu de meeste verse sneeuw op de piste hebben, gerangschikt op basis van actuele omstandigheden en elke 30 minuten bijgewerkt.',
    ja: '世界中のスキーリゾートの中から、今いちばん新雪が積もっているゲレンデをライブでランキング。実際のコンディションをもとに30分ごとに更新しています。',
  } as Record<Locale, string>,
  answerSnowing: {
    en: 'Right now, the most fresh snow is falling at',
    fr: 'En ce moment, c\'est à',
    es: 'Ahora mismo, la mayor nevada cae en',
    pt: 'Neste momento, a maior queda de neve fresca é em',
    it: 'In questo momento, la maggiore nevicata fresca è a',
    nl: 'Op dit moment valt de meeste verse sneeuw bij',
    ja: '今、最も新雪が積もっているのは',
  } as Record<Locale, string>,
  answerSnowingTail: {
    en: '',
    fr: ' qu\'il neige le plus',
    es: '',
    pt: '',
    it: '',
    nl: '',
    ja: 'です',
  } as Record<Locale, string>,
  answerCalm: {
    en: 'No major snowfall worldwide right now. The deepest snow currently on the slopes is at',
    fr: "Pas de grosse chute de neige dans le monde en ce moment. La neige la plus profonde actuellement sur les pistes est à",
    es: 'Sin grandes nevadas en el mundo ahora mismo. La nieve más profunda actualmente en las pistas está en',
    pt: 'Sem grandes quedas de neve no mundo neste momento. A neve mais profunda atualmente nas pistas é em',
    it: 'Nessuna grande nevicata nel mondo in questo momento. La neve più profonda attualmente sulle piste è a',
    nl: 'Nergens ter wereld valt nu veel sneeuw. De diepste sneeuw op de piste ligt op dit moment bij',
    ja: '現在、世界的に大きな降雪はありません。今いちばん積雪が深いのは',
  } as Record<Locale, string>,
  // Secondary phrasings people search, surfaced in the meta description and FAQ
  // so the page matches "which country", "where in the world", etc.
  metaExtra: {
    en: "See which country and which ski resort is getting snow this minute, ranked live.",
    es: "Descubre en qué país y en qué estación de esquí está nevando ahora mismo, en un ranking en directo.",
    fr: "Voyez dans quel pays et dans quelle station il neige en ce moment, dans un classement en direct.",
    pt: "Veja em que país e em que estância está a nevar neste momento, num ranking em direto.",
    it: "Scopri in quale paese e in quale località sta nevicando in questo momento, in una classifica dal vivo.",
    nl: "Ontdek in welk land en in welk skigebied het nu sneeuwt, in een live ranglijst.",
    ja: "今どの国のどのスキーリゾートに雪が降っているか、ライブランキングで確認できます。",
  } as Record<Locale, string>,
  freshLabel: {
    en: "fresh in 24h", es: "de nieve en 24 h", fr: "de neige fraîche en 24 h", pt: "de neve em 24 h", it: "di neve fresca in 24 h", nl: "verse sneeuw in 24 u", ja: "新雪（24時間）",
  } as Record<Locale, string>,
  faqWhichCountryQ: {
    en: "Which country is it snowing in right now?",
    es: "¿En qué país está nevando ahora mismo?",
    fr: "Dans quel pays neige-t-il en ce moment ?",
    pt: "Em que país está a nevar neste momento?",
    it: "In quale paese sta nevicando in questo momento?",
    nl: "In welk land sneeuwt het nu?",
    ja: "今、どの国で雪が降っている？",
  } as Record<Locale, string>,
  faqWhereWorldQ: {
    en: "Where in the world is it snowing right now?",
    es: "¿Dónde está nevando en el mundo ahora mismo?",
    fr: "Où neige-t-il dans le monde en ce moment ?",
    pt: "Onde está a nevar no mundo neste momento?",
    it: "Dove sta nevicando nel mondo in questo momento?",
    nl: "Waar ter wereld sneeuwt het nu?",
    ja: "世界のどこで、今雪が降っている？",
  } as Record<Locale, string>,
  faqAnywhereQ: {
    en: "Is it snowing anywhere in the world right now?",
    es: "¿Está nevando en algún lugar del mundo ahora mismo?",
    fr: "Neige-t-il quelque part dans le monde en ce moment ?",
    pt: "Está a nevar em algum lugar do mundo neste momento?",
    it: "Sta nevicando da qualche parte nel mondo in questo momento?",
    nl: "Sneeuwt het nu ergens ter wereld?",
    ja: "今、世界のどこかで雪は降っている？",
  } as Record<Locale, string>,
  faqAnywhereA: {
    en: "Almost always, yes. In the northern winter (roughly November to May) it is usually snowing somewhere in the Alps, the Rockies or Japan, and from June to October the snow flips to the Andes, New Zealand and Australia. This page ranks the resorts with the most fresh snow on the slopes right now, updated every 30 minutes.",
    es: "Casi siempre, sí. En el invierno del norte (de noviembre a mayo aproximadamente) suele estar nevando en algún punto de los Alpes, las Rocosas o Japón, y de junio a octubre la nieve pasa a los Andes, Nueva Zelanda y Australia. Esta página ordena las estaciones con más nieve fresca en las pistas ahora mismo, actualizada cada 30 minutos.",
    fr: "Presque toujours, oui. En hiver dans le nord (de novembre à mai environ), il neige d'ordinaire quelque part dans les Alpes, les Rocheuses ou au Japon, et de juin à octobre la neige bascule vers les Andes, la Nouvelle-Zélande et l'Australie. Cette page classe les stations avec le plus de neige fraîche sur les pistes en ce moment, mise à jour toutes les 30 minutes.",
    pt: "Quase sempre, sim. No inverno do norte (de novembro a maio, aproximadamente) costuma estar a nevar algures nos Alpes, nas Montanhas Rochosas ou no Japão, e de junho a outubro a neve passa para os Andes, a Nova Zelândia e a Austrália. Esta página ordena as estâncias com mais neve fresca nas pistas neste momento, atualizada a cada 30 minutos.",
    it: "Quasi sempre, sì. Nell'inverno del nord (all'incirca da novembre a maggio) di solito nevica da qualche parte sulle Alpi, sulle Montagne Rocciose o in Giappone, e da giugno a ottobre la neve si sposta sulle Ande, in Nuova Zelanda e in Australia. Questa pagina ordina le località con più neve fresca sulle piste in questo momento, aggiornata ogni 30 minuti.",
    nl: "Bijna altijd wel, ja. In de winter op het noordelijk halfrond (ruwweg november tot mei) sneeuwt het meestal ergens in de Alpen, de Rocky Mountains of Japan, en van juni tot oktober verschuift de sneeuw naar de Andes, Nieuw-Zeeland en Australië. Deze pagina rangschikt de skigebieden met nu de meeste verse sneeuw op de piste, elke 30 minuten bijgewerkt.",
    ja: "ほぼ常に、どこかで降っています。北半球の冬（おおむね11月から5月）はアルプス、ロッキー山脈、日本のいずれかで雪が降っていることが多く、6月から10月にかけてはアンデス、ニュージーランド、オーストラリアへと舞台が移ります。このページは今いちばん新雪が積もっているゲレンデをランキングし、30分ごとに更新しています。",
  } as Record<Locale, string>,
} as const

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
    title: `${T.title[l]} | BestSnowHotels`,
    description: `${T.subtitle[l]} ${T.metaExtra[l]}`,
    alternates: {
      canonical: `${SITE_URL}/${l}/weather/snowing-now`,
      languages: Object.fromEntries([
        ...locales.map((x) => [x, `${SITE_URL}/${x}/weather/snowing-now`]),
        ['x-default', `${SITE_URL}/en/weather/snowing-now`],
      ]),
    },
  }
}

export default async function SnowingNowPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const t = dict.weather
  const snapshots = await fetchManyWeather(destinations)

  const ranked = [...destinations].sort(
    (a, b) => freshSnowScore(snapshots.get(b.slug)) - freshSnowScore(snapshots.get(a.slug)),
  )
  const top = ranked.slice(0, 24)
  const top3 = top.slice(0, 3)
  const isSnowing = freshSnowScore(snapshots.get(top[0]?.slug)) > 0
  const namesList = top3.map((d) => `${d.name} (${localizeCountry(d.country, l)})`).join(', ')
  const answer = isSnowing
    ? `${T.answerSnowing[l]} ${namesList}${T.answerSnowingTail[l]}.`
    : `${T.answerCalm[l]} ${namesList}.`

  // Live numbered ranking (featured-snippet friendly) and country-first answer.
  const top5 = top.slice(0, 5)
  const freshCm = (slug: string) => Math.round(Math.max(0, snapshots.get(slug)?.past24h?.snowfallCm ?? 0))
  const countryPrefix: Record<Locale, string> = {
    en: 'Right now, fresh snow is falling in',
    es: 'Ahora mismo está nevando sobre todo en',
    fr: 'En ce moment, il neige surtout en',
    pt: 'Neste momento, está a nevar sobretudo em',
    it: 'In questo momento sta nevicando soprattutto in',
    nl: 'Op dit moment valt er vooral sneeuw in',
    ja: '今、主に雪が降っているのは',
  }
  const topCountries = [...new Set(top3.map((d) => localizeCountry(d.country, l)))].join(', ')
  const faq = [
    { q: T.faqWhichCountryQ[l], a: isSnowing ? `${countryPrefix[l]} ${topCountries}.` : `${T.answerCalm[l]} ${namesList}.` },
    { q: T.faqWhereWorldQ[l], a: answer },
    { q: T.faqAnywhereQ[l], a: T.faqAnywhereA[l] },
  ]

  const cardLabels = {
    snowDepth: t.snowDepth,
    freshSnow24h: t.freshSnow24h,
    snowfall7d: t.snowfall7d,
    livePill: t.livePill,
    noWeatherData: t.noWeatherData,
    viewFullForecast: t.viewFullForecast,
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: dict.nav.weather, item: `${SITE_URL}/${l}/weather` },
        { '@type': 'ListItem', position: 3, name: T.title[l], item: `${SITE_URL}/${l}/weather/snowing-now` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: T.title[l],
      description: T.subtitle[l],
      itemListElement: top.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${l}/weather/${d.slug}`,
        name: d.name,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <nav className="text-sm text-ice-700 mb-4">
          <Link href={`/${l}/weather`} className="hover:text-slate-deep">
            {dict.nav.weather}
          </Link>
          <span className="mx-2 text-ice-400">/</span>
          <span className="text-slate-deep">{T.title[l]}</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-ice-600 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" aria-hidden />
            {t.livePill}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {T.title[l]}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{T.subtitle[l]}</p>
        {/* Direct answer (GEO snippet), computed live from the top 3 */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-ice-50 to-white border border-ice-200 p-5 shadow-sm max-w-3xl">
          <p className="text-lg text-slate-deep leading-relaxed">{answer}</p>
          {/* Live numbered ranking, liftable as a featured snippet */}
          <ol className="mt-4 space-y-1.5">
            {top5.map((d, i) => (
              <li key={d.slug} className="flex items-baseline gap-2 text-slate-deep">
                <span className="font-bold text-ice-700 tabular-nums w-5 shrink-0">{i + 1}.</span>
                <Link href={`/${l}/weather/${d.slug}`} className="font-semibold hover:text-ice-700 transition">
                  {d.name}
                </Link>
                <span className="text-ice-700/70 text-sm">{localizeCountry(d.country, l)}</span>
                {freshCm(d.slug) > 0 && (
                  <span className="ml-auto text-sm font-semibold text-ice-700 tabular-nums whitespace-nowrap">
                    +{freshCm(d.slug)} cm {T.freshLabel[l]}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {top.map((d) => (
            <WeatherCard
              key={d.slug}
              destination={d}
              snapshot={snapshots.get(d.slug) ?? null}
              locale={l}
              labels={cardLabels}
              highlight="fresh24h"
            />
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-deep mb-4">FAQ</h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-ice-200 bg-white p-4 open:shadow-sm"
            >
              <summary className="cursor-pointer font-semibold text-slate-deep list-none flex items-center justify-between gap-3">
                {f.q}
                <span className="text-ice-500 group-open:rotate-180 transition shrink-0" aria-hidden>
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-ice-800/90 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-ice-50 border-t border-ice-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap gap-3">
          <Link
            href={`/${l}/weather`}
            className="inline-flex items-center gap-2 bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 rounded-full hover:border-ice-400 transition text-sm"
          >
            ← {dict.nav.weather}
          </Link>
          <Link
            href={`/${l}/weather/fresh-powder`}
            className="inline-flex items-center gap-2 bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 rounded-full hover:border-ice-400 transition text-sm"
          >
            🌨️ {t.freshPowderTitle} →
          </Link>
          <Link
            href={`/${l}/weather/best-snow`}
            className="inline-flex items-center gap-2 bg-slate-deep text-white font-semibold px-5 py-2.5 rounded-full hover:bg-ice-800 transition text-sm"
          >
            ❄️ {t.bestSnowTitle} →
          </Link>
        </div>
      </section>
    </>
  )
}
