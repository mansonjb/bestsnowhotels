import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: `About BestSnowHotels`,
    alternates: { canonical: `${SITE_URL}/${locale}/about` },
  }
}

const COPY: Record<Locale, { title: string; paragraphs: string[]; methodologyCta: string }> = {
  en: {
    title: 'About BestSnowHotels',
    paragraphs: [
      'BestSnowHotels is a small, independent editorial project with one job: helping skiers find truly ski-in/ski-out hotels across the Alps and Pyrenees, without wading through generic booking sites.',
      'We are independent and data-driven. Rather than claim to have stayed in every hotel, we compile and cross-check the hard numbers for each resort, altitude, piste kilometres, lift counts and season windows, and turn them into a comparable Snow Score from 0 to 100. We also classify every resort\'s ski-in/ski-out reality into three honest tiers, against the marketing spin, because a resort sold as slopeside often is not.',
      'We cover 455 resorts in France, Switzerland, Austria, Italy, Spain, Andorra, Germany, Norway, Sweden, Finland, Japan, the United States, Morocco, Algeria, Lesotho, South Africa, Egypt, Canada, South Korea, Australia, New Zealand and Chile. For each one, we list verified altitudes, piste kilometres, season dates and a transparent ski-in/ski-out note. The interactive map on every destination page is powered by Stay22. It compares Booking, Expedia and Hotels.com in real time so you always see the best price.',
      'We earn a small commission when you book through our links, at no extra cost to you. It funds the site, and it never changes which resorts score well or which hotels we show. The ranking is the data, not the deal.',
    ],
    methodologyCta: 'Read our full methodology',
  },
  fr: {
    title: 'À propos de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels est un petit projet éditorial indépendant avec une mission unique : aider les skieurs à trouver de vrais hôtels ski-in/ski-out dans les Alpes et les Pyrénées, sans passer des heures sur des sites de réservation génériques.',
      'Nous sommes indépendants et guidés par la donnée. Plutôt que de prétendre avoir dormi dans chaque hôtel, nous compilons et recoupons les chiffres concrets de chaque station, altitude, kilomètres de pistes, nombre de remontées et dates de saison, et nous en tirons un Snow Score comparable de 0 à 100. Nous classons aussi la réalité ski-in/ski-out de chaque station en trois niveaux honnêtes, à rebours du discours marketing, car une station vendue comme au pied des pistes ne l\'est souvent pas.',
      'Nous couvrons 455 stations en France, en Suisse, en Autriche, en Italie, en Espagne, en Andorre, en Allemagne, en Norvège, en Suède, en Finlande, au Japon, aux États-Unis, au Maroc, en Algérie, au Lesotho, en Afrique du Sud, en Égypte, au Canada, en Corée du Sud, en Australie, en Nouvelle-Zélande et au Chili. Pour chacune, nous indiquons les altitudes vérifiées, les kilomètres de pistes, les dates de saison et une note ski-in/ski-out transparente. La carte interactive de chaque destination est fournie par Stay22. Elle compare Booking, Expedia et Hotels.com en temps réel, vous voyez donc toujours le meilleur prix.',
      'Nous percevons une petite commission lorsque vous réservez via nos liens, sans surcoût pour vous. Elle finance le site, et elle ne change jamais quelles stations obtiennent un bon score ni quels hôtels nous montrons. Le classement, c\'est la donnée, pas le partenariat.',
    ],
    methodologyCta: 'Lire notre méthodologie complète',
  },
  es: {
    title: 'Acerca de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels es un pequeño proyecto editorial independiente con una sola misión : ayudar a los esquiadores a encontrar hoteles realmente ski-in/ski-out en los Alpes y los Pirineos, sin perderse en sitios de reserva genéricos.',
      'Somos independientes y guiados por los datos. En lugar de afirmar que nos hemos alojado en cada hotel, recopilamos y contrastamos las cifras concretas de cada estación, altitud, kilómetros de pistas, número de remontes y fechas de temporada, y las convertimos en un Snow Score comparable de 0 a 100. También clasificamos la realidad ski-in/ski-out de cada estación en tres niveles honestos, frente al discurso del marketing, porque una estación vendida como a pie de pista a menudo no lo es.',
      'Cubrimos 455 estaciones en Francia, Suiza, Austria, Italia, España, Andorra, Alemania, Noruega, Suecia, Finlandia, Japón, Estados Unidos, Marruecos, Argelia, Lesoto, Sudáfrica, Egipto, Canadá, Corea del Sur, Australia, Nueva Zelanda y Chile. Para cada una indicamos las altitudes verificadas, los kilómetros de pistas, las fechas de temporada y una nota ski-in/ski-out transparente. El mapa interactivo de cada destino lo proporciona Stay22. Compara Booking, Expedia y Hotels.com en tiempo real, así que siempre ves el mejor precio.',
      'Recibimos una pequeña comisión cuando reservas a través de nuestros enlaces, sin coste adicional para ti. Financia el sitio, y nunca cambia qué estaciones puntúan bien ni qué hoteles mostramos. La clasificación es el dato, no el acuerdo.',
    ],
    methodologyCta: 'Leer nuestra metodología completa',
  },
  pt: {
    title: 'Sobre o BestSnowHotels',
    paragraphs: [
      'O BestSnowHotels é um pequeno projeto editorial independente com uma missão única: ajudar os esquiadores a encontrar hotéis verdadeiramente ski-in/ski-out nos Alpes e nos Pirenéus, sem se perderem em sites de reserva genéricos.',
      'Somos independentes e guiados pelos dados. Em vez de afirmar que ficámos em cada hotel, compilamos e cruzamos os números concretos de cada estância, altitude, quilómetros de pistas, número de teleféricos e datas da época, e transformamo-los num Snow Score comparável de 0 a 100. Também classificamos a realidade ski-in/ski-out de cada estância em três níveis honestos, ao contrário do discurso de marketing, porque uma estância vendida como à beira das pistas muitas vezes não o é.',
      'Cobrimos 455 estâncias em França, na Suíça, na Áustria, em Itália, em Espanha, em Andorra, na Alemanha, na Noruega, na Suécia, na Finlândia, no Japão, nos Estados Unidos, em Marrocos, na Argélia, no Lesoto, na África do Sul, no Egito, no Canadá, na Coreia do Sul, na Austrália, na Nova Zelândia e no Chile. Para cada uma indicamos as altitudes verificadas, os quilómetros de pistas, as datas da época e uma nota ski-in/ski-out transparente. O mapa interativo de cada destino é fornecido pelo Stay22. Compara Booking, Expedia e Hotels.com em tempo real, por isso vê sempre o melhor preço.',
      'Recebemos uma pequena comissão quando reserva através das nossas ligações, sem custo adicional para si. Financia o site, e nunca altera que estâncias pontuam bem nem que hotéis mostramos. A classificação é o dado, não o acordo.',
    ],
    methodologyCta: 'Ler a nossa metodologia completa',
  },
  it: {
    title: 'Chi è BestSnowHotels',
    paragraphs: [
      'BestSnowHotels è un piccolo progetto editoriale indipendente con un\'unica missione: aiutare gli sciatori a trovare hotel davvero ski-in/ski-out sulle Alpi e sui Pirenei, senza perdersi tra siti di prenotazione generici.',
      'Siamo indipendenti e guidati dai dati. Invece di sostenere di aver soggiornato in ogni hotel, raccogliamo e incrociamo i numeri concreti di ogni località, quota, chilometri di piste, numero di impianti e date di stagione, e li trasformiamo in uno Snow Score comparabile da 0 a 100. Classifichiamo anche la realtà ski-in/ski-out di ogni località in tre livelli onesti, contro il racconto del marketing, perché una località venduta come ai piedi delle piste spesso non lo è.',
      'Copriamo 455 località in Francia, Svizzera, Austria, Italia, Spagna, Andorra, Germania, Norvegia, Svezia, Finlandia, Giappone, Stati Uniti, Marocco, Algeria, Lesotho, Sudafrica, Egitto, Canada, Corea del Sud, Australia, Nuova Zelanda e Cile. Per ognuna indichiamo quote verificate, chilometri di piste, date di stagione e una nota ski-in/ski-out trasparente. La mappa interattiva di ogni destinazione è fornita da Stay22. Confronta Booking, Expedia e Hotels.com in tempo reale, così vedi sempre il miglior prezzo.',
      'Riceviamo una piccola commissione quando prenoti tramite i nostri link, senza alcun costo aggiuntivo per te. Finanzia il sito, e non cambia mai quali località ottengono un buon punteggio né quali hotel mostriamo. La classifica è il dato, non l\'accordo.',
    ],
    methodologyCta: 'Leggi la nostra metodologia completa',
  },
  nl: {
    title: 'Over BestSnowHotels',
    paragraphs: [
      'BestSnowHotels is een klein, onafhankelijk redactioneel project met een doel: skiërs helpen om echte ski-in/ski-out hotels in de Alpen en de Pyreneeën te vinden, zonder eindeloos te zoeken op algemene boekingssites.',
      'We zijn onafhankelijk en datagedreven. In plaats van te beweren dat we in elk hotel hebben geslapen, verzamelen en controleren we de harde cijfers van elk skigebied, hoogte, pistekilometers, aantal liften en seizoensdata, en zetten die om in een vergelijkbare Snow Score van 0 tot 100. We delen ook de ski-in/ski-out realiteit van elk gebied in drie eerlijke niveaus in, tegen de marketingpraat in, want een gebied dat als slopeside wordt verkocht, is dat vaak niet.',
      'We bestrijken 455 skigebieden in Frankrijk, Zwitserland, Oostenrijk, Italië, Spanje, Andorra, Duitsland, Noorwegen, Zweden, Finland, Japan, de Verenigde Staten, Marokko, Algerije, Lesotho, Zuid-Afrika, Egypte, Canada, Zuid-Korea, Australië, Nieuw-Zeeland en Chili. Voor elk gebied vermelden we geverifieerde hoogtes, pistekilometers, seizoensdata en een transparante ski-in/ski-out notitie. De interactieve kaart op elke bestemmingspagina draait op Stay22. Die vergelijkt Booking, Expedia en Hotels.com in realtime, zodat je altijd de beste prijs ziet.',
      'We ontvangen een kleine commissie wanneer je via onze links boekt, zonder extra kosten voor jou. Ze financiert de site en verandert nooit welke gebieden goed scoren of welke hotels we tonen. De rangschikking is de data, niet de deal.',
    ],
    methodologyCta: 'Lees onze volledige methodologie',
  },
  ja: {
    title: 'BestSnowHotelsについて',
    paragraphs: [
      'BestSnowHotelsは、目的がひとつだけの小さく独立した編集プロジェクトです。一般的な予約サイトを延々と探し回らなくても、アルプスとピレネーで本当にski-in/ski-outなホテルをスキーヤーが見つけられるよう手伝います。',
      '私たちは独立した、データに基づく立場です。すべてのホテルに泊まったと主張するのではなく、各リゾートの確かな数値、標高、コースの総距離、リフトの数、シーズン期間を集めて照合し、0から100までの比較可能なSnow Scoreにまとめています。さらに各リゾートのski-in/ski-outの実態を、マーケティングの誇張に流されず、3段階の正直な区分で分類しています。ゲレンデ直結とうたわれていても、実際はそうでないことが多いからです。',
      '対象は、フランス、スイス、オーストリア、イタリア、スペイン、アンドラ、ドイツ、ノルウェー、スウェーデン、フィンランド、日本、アメリカ、モロッコ、アルジェリア、レソト、南アフリカ、エジプト、カナダ、韓国、オーストラリア、ニュージーランド、チリの455リゾートです。各リゾートについて、確認済みの標高、コースの総距離、シーズン期間、そしてski-in/ski-outかどうかを正直に記載しています。各目的地ページのインタラクティブマップはStay22が提供しており、Booking、Expedia、Hotels.comの料金をリアルタイムで比較するので、常に最安値がわかります。',
      'リンク経由でご予約いただくと、当サイトはわずかな手数料を得ています。お客様に追加費用は発生しません。これはサイトの運営費に充てるもので、どのリゾートが高いスコアになるか、どのホテルを掲載するかを左右することは一切ありません。順位を決めるのはデータであって、取引ではありません。',
    ],
    methodologyCta: '詳しい採点・分類方法を見る',
  },
  'zh-hk': {
    title: '關於BestSnowHotels',
    paragraphs: [
      'BestSnowHotels是一項小型而獨立的編輯計劃，只有一個目標：幫助滑雪人士在阿爾卑斯山脈及比利牛斯山脈找到真正的ski-in/ski-out酒店，毋須在一般預訂網站中反覆搜尋。',
      '我們獨立運作，以數據為本。我們不會聲稱自己住過每一間酒店，而是收集並交叉核實每個雪場的硬數據，包括海拔、雪道公里數、纜車數目與雪季日期，再化成0至100、可作比較的Snow Score。我們也把每個雪場ski-in/ski-out的真實情況分成三個誠實等級，不隨營銷說法起舞，因為標榜「雪道旁」的雪場，往往名不副實。',
      '我們涵蓋法國、瑞士、奧地利、意大利、西班牙、安道爾、德國、挪威、瑞典、芬蘭、日本、美國、摩洛哥、阿爾及利亞、萊索托、南非、埃及、加拿大、南韓、澳洲、紐西蘭及智利共455個滑雪勝地。針對每個滑雪勝地，我們列出經核實的海拔高度、雪道公里數、雪季日期，以及清晰透明的ski-in/ski-out備註。每個目的地頁面上的互動地圖由Stay22提供技術支援，即時比較Booking、Expedia及Hotels.com的價格，讓您隨時看到最優惠價格。',
      '當您透過我們的連結預訂時，我們會賺取少量佣金，您無需支付任何額外費用。佣金用作維持網站營運，但絕不會影響哪些雪場得分較高、我們展示哪些酒店。決定排名的是數據，而非交易。',
    ],
    methodologyCta: '閱讀我們完整的評分方法',
  },
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)
  const copy = COPY[l]

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-8">
        {copy.title}
      </h1>
      <div className="prose prose-lg max-w-none space-y-5 text-ice-800/90 leading-relaxed">
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${l}/methodology`}
          className="rounded-full bg-slate-deep text-white font-semibold px-5 py-2.5 text-sm hover:bg-ice-800 transition"
        >
          {copy.methodologyCta} →
        </Link>
        <Link
          href={`/${l}/destinations`}
          prefetch={false}
          className="rounded-full bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 text-sm hover:border-ice-400 transition"
        >
          {dict.destinations.title} →
        </Link>
        <Link
          href={`/${l}/weather`}
          className="rounded-full bg-white border border-ice-200 text-slate-deep font-semibold px-5 py-2.5 text-sm hover:border-ice-400 transition"
        >
          {dict.nav.weather} →
        </Link>
      </div>
    </article>
  )
}
