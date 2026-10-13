import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../../dictionaries'
import type { Locale } from '../../dictionaries'
import { getDestination } from '@/lib/destinations'
import { getHotels } from '@/lib/hotels'
import { BEST_HOTELS_SLUGS, hotelPicks, pickCards, priceRange, type PickAxis } from '@/lib/bestHotels'
import { hotelDistanceLabel } from '@/lib/hotelContent'
import { getHotelDetail, amenityChips, AMENITY } from '@/lib/hotelDetails'
import { introParagraphs, hotelProse } from '@/lib/bestHotelsContent'
import SafeImage from '@/components/SafeImage'
import Stay22Map from '@/components/Stay22Map'
import { localizeCountry } from '@/lib/countryNames'
import { localizeRegion } from '@/lib/regions'
import { SITE_URL, hreflangFor, jsonLdGraph, buildAllezHotelLink, buildAllezDestLink } from '@/lib/site'

// ---------------------------------------------------------------------------
// Localised copy. Typed as Record<Locale, string> (a real annotation, NOT an
// `as` cast) so tsc fails the build if any of the 8 locales is missing a key.
// {slots} are filled at render from the resort's own hotel data.
// ---------------------------------------------------------------------------
const fill = (s: string, v: Record<string, string | number>): string =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

const META_TITLE: Record<Locale, string> = {
  en: 'Best hotels in {name}: the top picks compared | BestSnowHotels',
  fr: 'Meilleurs hôtels à {name} : le comparatif des meilleurs choix | BestSnowHotels',
  es: 'Mejores hoteles en {name}: comparativa de los mejores | BestSnowHotels',
  pt: 'Melhores hotéis em {name}: comparativo das melhores opções | BestSnowHotels',
  it: 'Migliori hotel a {name}: il confronto delle scelte top | BestSnowHotels',
  nl: 'Beste hotels in {name}: de topkeuzes vergeleken | BestSnowHotels',
  ja: '{name}のおすすめホテル徹底比較 | BestSnowHotels',
  'zh-hk': '{name}最佳酒店比較：精選推介 | BestSnowHotels',
}
const META_DESC: Record<Locale, string> = {
  en: 'Which hotel to book in {name}? We compare the top hotels point by point: best overall, best luxury, best value and more, with live prices.',
  fr: 'Quel hôtel réserver à {name} ? On compare les meilleurs hôtels point par point : meilleur choix global, luxe, rapport qualité-prix et plus, avec les prix en direct.',
  es: '¿Qué hotel reservar en {name}? Comparamos los mejores hoteles punto por punto: mejor en general, de lujo, calidad-precio y más, con precios en directo.',
  pt: 'Que hotel reservar em {name}? Comparamos os melhores hotéis ponto por ponto: melhor no geral, de luxo, custo-benefício e mais, com preços em direto.',
  it: 'Quale hotel prenotare a {name}? Confrontiamo i migliori hotel punto per punto: migliore in assoluto, lusso, qualità-prezzo e altro, con prezzi in tempo reale.',
  nl: 'Welk hotel boeken in {name}? We vergelijken de beste hotels punt voor punt: beste algemeen, luxe, prijs-kwaliteit en meer, met actuele prijzen.',
  ja: '{name}でどのホテルを予約すべき？総合、ラグジュアリー、コスパなど観点別にトップホテルを比較。リアルタイム料金付き。',
  'zh-hk': '在{name}該訂哪間酒店？我們逐項比較頂級酒店：綜合、豪華、性價比等，附即時價格。',
}
const H1: Record<Locale, string> = {
  en: 'Best hotels in {name}',
  fr: 'Meilleurs hôtels à {name}',
  es: 'Mejores hoteles en {name}',
  pt: 'Melhores hotéis em {name}',
  it: 'Migliori hotel a {name}',
  nl: 'Beste hotels in {name}',
  ja: '{name}のおすすめホテル',
  'zh-hk': '{name}最佳酒店',
}
const BC: Record<Locale, string> = {
  en: 'Best hotels', fr: 'Meilleurs hôtels', es: 'Mejores hoteles', pt: 'Melhores hotéis', it: 'Migliori hotel', nl: 'Beste hotels', ja: 'おすすめホテル', 'zh-hk': '最佳酒店',
}
const SUBTITLE: Record<Locale, string> = {
  en: 'The best places to stay, compared point by point so you can pick the right one for your trip.',
  fr: 'Les meilleures adresses, comparées point par point pour choisir la bonne selon votre séjour.',
  es: 'Los mejores alojamientos, comparados punto por punto para elegir el adecuado para tu viaje.',
  pt: 'Os melhores alojamentos, comparados ponto por ponto para escolher o certo para a sua viagem.',
  it: 'I migliori indirizzi, confrontati punto per punto per scegliere quello giusto per il tuo viaggio.',
  nl: 'De beste adressen, punt voor punt vergeleken zodat je de juiste kiest voor jouw trip.',
  ja: 'ベストな宿を観点別に比較。あなたの旅にぴったりの一軒が選べます。',
  'zh-hk': '逐項比較最佳住宿，助你揀選最適合這趟旅程的一間。',
}
// Direct answer (GEO): one extractable summary, entities named.
const DIRECT: Record<Locale, string> = {
  en: 'In {name}, our top pick overall is {overall} ({rating}/5). For a luxury stay we rate {luxury} highest; for value, {value}. Nightly rates run from about €{min} to €{max}.',
  fr: 'À {name}, notre meilleur choix global est {overall} ({rating}/5). Pour le luxe, nous plaçons {luxury} en tête ; pour le rapport qualité-prix, {value}. Les tarifs vont d\'environ {min} € à {max} € la nuit.',
  es: 'En {name}, nuestra mejor opción general es {overall} ({rating}/5). Para el lujo destacamos {luxury}; para calidad-precio, {value}. Las tarifas van de unos {min} € a {max} € por noche.',
  pt: 'Em {name}, a nossa melhor opção geral é {overall} ({rating}/5). Para o luxo destacamos {luxury}; para custo-benefício, {value}. As tarifas vão de cerca de {min} € a {max} € por noite.',
  it: 'A {name}, la nostra scelta migliore in assoluto è {overall} ({rating}/5). Per il lusso mettiamo {luxury} in testa; per il rapporto qualità-prezzo, {value}. Le tariffe vanno da circa {min} € a {max} € a notte.',
  nl: 'In {name} is onze beste algemene keuze {overall} ({rating}/5). Voor luxe kiezen we {luxury}; voor prijs-kwaliteit {value}. Prijzen lopen van ongeveer € {min} tot € {max} per nacht.',
  ja: '{name}での総合ベストは{overall}（{rating}/5）。ラグジュアリーなら{luxury}、コスパなら{value}が一番です。料金は1泊およそ{min}〜{max}ユーロ。',
  'zh-hk': '在{name}，我們的綜合首選是{overall}（{rating}/5）。豪華之選推{luxury}，性價比則推{value}。每晚房價約{min}至{max}歐元。',
}
const AXIS_LABEL: Record<PickAxis, Record<Locale, string>> = {
  overall: { en: 'Best overall', fr: 'Meilleur choix global', es: 'Mejor en general', pt: 'Melhor no geral', it: 'Migliore in assoluto', nl: 'Beste algemeen', ja: '総合ベスト', 'zh-hk': '綜合首選' },
  luxury: { en: 'Best luxury', fr: 'Meilleur luxe', es: 'Mejor de lujo', pt: 'Melhor de luxo', it: 'Miglior lusso', nl: 'Beste luxe', ja: 'ベストラグジュアリー', 'zh-hk': '最佳豪華' },
  value: { en: 'Best value', fr: 'Meilleur rapport qualité-prix', es: 'Mejor calidad-precio', pt: 'Melhor custo-benefício', it: 'Miglior qualità-prezzo', nl: 'Beste prijs-kwaliteit', ja: 'ベストコスパ', 'zh-hk': '最佳性價比' },
  popular: { en: 'Most popular', fr: 'Le plus prisé', es: 'El más popular', pt: 'O mais popular', it: 'Il più gettonato', nl: 'Populairst', ja: '一番人気', 'zh-hk': '最受歡迎' },
  budget: { en: 'Best on a budget', fr: 'Meilleur petit budget', es: 'Mejor económico', pt: 'Melhor económico', it: 'Miglior economico', nl: 'Beste budget', ja: 'ベスト格安', 'zh-hk': '最佳經濟之選' },
}
// Concrete, metric-based reason per axis (slots {resort} {rating} {reviews} {price}).
const REASON: Record<PickAxis, Record<Locale, string>> = {
  overall: {
    en: 'Our top all-round pick in {resort}: {rating}/5 from {reviews} reviews.',
    fr: 'Notre choix n°1 à {resort} : {rating}/5 sur {reviews} avis.',
    es: 'Nuestra opción n.º 1 en {resort}: {rating}/5 con {reviews} opiniones.',
    pt: 'A nossa opção n.º 1 em {resort}: {rating}/5 em {reviews} avaliações.',
    it: 'La nostra scelta n.1 a {resort}: {rating}/5 su {reviews} recensioni.',
    nl: 'Onze nummer 1 in {resort}: {rating}/5 op basis van {reviews} reviews.',
    ja: '{resort}での総合1位。{reviews}件のレビューで{rating}/5。',
    'zh-hk': '{resort}綜合首選：{reviews}則評論獲{rating}/5。',
  },
  luxury: {
    en: 'The most upscale stay in {resort}, from €{price} a night.',
    fr: "L'adresse la plus haut de gamme à {resort}, dès {price} € la nuit.",
    es: 'El alojamiento más exclusivo de {resort}, desde {price} € por noche.',
    pt: 'O alojamento mais exclusivo de {resort}, desde {price} € por noite.',
    it: "L'indirizzo più esclusivo a {resort}, da {price} € a notte.",
    nl: 'Het meest luxueuze verblijf in {resort}, vanaf € {price} per nacht.',
    ja: '{resort}で最も高級な滞在先。1泊{price}ユーロから。',
    'zh-hk': '{resort}最高檔之選，每晚{price}歐元起。',
  },
  value: {
    en: 'The best rating for the price here: {rating}/5 from about €{price}.',
    fr: 'Le meilleur rapport note/prix : {rating}/5 pour environ {price} €.',
    es: 'La mejor nota por su precio: {rating}/5 desde unos {price} €.',
    pt: 'A melhor nota pelo preço: {rating}/5 por cerca de {price} €.',
    it: 'Il miglior voto per il prezzo: {rating}/5 da circa {price} €.',
    nl: 'De beste beoordeling voor de prijs: {rating}/5 vanaf ongeveer € {price}.',
    ja: '価格に対して最高評価。約{price}ユーロで{rating}/5。',
    'zh-hk': '同價位評分最高：約{price}歐元享{rating}/5。',
  },
  popular: {
    en: 'The most reviewed hotel in {resort}, with {reviews} guest reviews.',
    fr: "L'hôtel le plus commenté à {resort}, avec {reviews} avis voyageurs.",
    es: 'El hotel más reseñado de {resort}, con {reviews} opiniones.',
    pt: 'O hotel com mais avaliações em {resort}, com {reviews} opiniões.',
    it: "L'hotel più recensito a {resort}, con {reviews} recensioni.",
    nl: 'Het meest beoordeelde hotel in {resort}, met {reviews} reviews.',
    ja: '{resort}で最もレビューが多いホテル（{reviews}件）。',
    'zh-hk': '{resort}評論最多的酒店，共{reviews}則評論。',
  },
  budget: {
    en: 'The lowest nightly price in {resort} that still holds a {rating}/5 rating.',
    fr: 'Le prix le plus bas à {resort} en gardant une note de {rating}/5.',
    es: 'El precio más bajo de {resort} manteniendo un {rating}/5.',
    pt: 'O preço mais baixo de {resort} mantendo um {rating}/5.',
    it: 'Il prezzo più basso a {resort} mantenendo un {rating}/5.',
    nl: 'De laagste prijs in {resort} met nog altijd een {rating}/5.',
    ja: '{resort}で最安ながら{rating}/5を維持。',
    'zh-hk': '{resort}最低價，仍保持{rating}/5評分。',
  },
}
const STARS_PHRASE: Record<Locale, string> = {
  en: '{n}-star hotel', fr: 'Hôtel {n} étoiles', es: 'Hotel de {n} estrellas', pt: 'Hotel de {n} estrelas', it: 'Hotel {n} stelle', nl: '{n}-sterrenhotel', ja: '{n}つ星ホテル', 'zh-hk': '{n}星級酒店',
}
const DIST_LABEL: Record<Locale, string> = {
  en: '{d} from the resort centre', fr: '{d} du centre station', es: '{d} del centro de la estación', pt: '{d} do centro da estância', it: '{d} dal centro della località', nl: '{d} van het centrum', ja: '中心部から{d}', 'zh-hk': '距雪場中心{d}',
}
const HEAD_VERDICTS: Record<Locale, string> = {
  en: 'Which hotel should you book?', fr: 'Quel hôtel réserver ?', es: '¿Qué hotel reservar?', pt: 'Que hotel reservar?', it: 'Quale hotel prenotare?', nl: 'Welk hotel boeken?', ja: 'どのホテルを予約する？', 'zh-hk': '該訂哪間酒店？',
}
const TLDR: Record<Locale, string> = {
  en: 'In short', fr: 'En bref', es: 'En resumen', pt: 'Em resumo', it: 'In breve', nl: 'Kort samengevat', ja: 'ひとことで', 'zh-hk': '一句話總結',
}
const HEAD_DETAIL: Record<Locale, string> = {
  en: 'The hotels in depth', fr: 'Les hôtels en détail', es: 'Los hoteles en detalle', pt: 'Os hotéis em detalhe', it: 'Gli hotel nel dettaglio', nl: 'De hotels in detail', ja: 'ホテル詳細解説', 'zh-hk': '酒店詳細解說',
}
const HEAD_TABLE: Record<Locale, string> = {
  en: 'Side-by-side comparison', fr: 'Comparatif côte à côte', es: 'Comparativa lado a lado', pt: 'Comparativo lado a lado', it: 'Confronto affiancato', nl: 'Vergelijking naast elkaar', ja: '一覧比較', 'zh-hk': '並排比較',
}
const HEAD_FAQ: Record<Locale, string> = {
  en: 'Frequently asked questions', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes', it: 'Domande frequenti', nl: 'Veelgestelde vragen', ja: 'よくある質問', 'zh-hk': '常見問題',
}
const TH_HOTEL: Record<Locale, string> = { en: 'Hotel', fr: 'Hôtel', es: 'Hotel', pt: 'Hotel', it: 'Hotel', nl: 'Hotel', ja: 'ホテル', 'zh-hk': '酒店' }
const TH_STARS: Record<Locale, string> = { en: 'Stars', fr: 'Étoiles', es: 'Estrellas', pt: 'Estrelas', it: 'Stelle', nl: 'Sterren', ja: '星', 'zh-hk': '星級' }
const TH_RATING: Record<Locale, string> = { en: 'Rating', fr: 'Note', es: 'Valoración', pt: 'Avaliação', it: 'Voto', nl: 'Beoordeling', ja: '評価', 'zh-hk': '評分' }
const TH_PRICE: Record<Locale, string> = { en: 'From / night', fr: 'Dès / nuit', es: 'Desde / noche', pt: 'Desde / noite', it: 'Da / notte', nl: 'Vanaf / nacht', ja: '1泊〜', 'zh-hk': '每晚起' }
const TH_BESTFOR: Record<Locale, string> = { en: 'Best for', fr: 'Idéal pour', es: 'Ideal para', pt: 'Ideal para', it: 'Ideale per', nl: 'Ideaal voor', ja: 'おすすめ用途', 'zh-hk': '最適合' }
const NEUTRAL_TAG: Record<Locale, string> = { en: 'Solid all-rounder', fr: 'Valeur sûre', es: 'Opción sólida', pt: 'Opção sólida', it: 'Scelta solida', nl: 'Betrouwbare keuze', ja: 'バランス型', 'zh-hk': '穩健之選' }
const REVIEWS_WORD: Record<Locale, string> = { en: 'reviews', fr: 'avis', es: 'opiniones', pt: 'avaliações', it: 'recensioni', nl: 'reviews', ja: '件', 'zh-hk': '則評論' }
const FULL_GUIDE: Record<Locale, string> = {
  en: 'Full {name} resort guide', fr: 'Guide complet de {name}', es: 'Guía completa de {name}', pt: 'Guia completo de {name}', it: 'Guida completa di {name}', nl: 'Volledige gids van {name}', ja: '{name}の完全ガイド', 'zh-hk': '{name}完整指南',
}
const SNOW_LINK: Record<Locale, string> = {
  en: 'Live snow report', fr: 'Bulletin neige en direct', es: 'Parte de nieve en directo', pt: 'Boletim de neve em direto', it: 'Bollettino neve in tempo reale', nl: 'Actueel sneeuwbericht', ja: 'ライブ積雪情報', 'zh-hk': '即時積雪報告',
}
const RATINGS_NOTE: Record<Locale, string> = {
  en: 'Ratings and review counts from Google. Prices are indicative; we may earn a commission on bookings.',
  fr: 'Notes et nombre d\'avis via Google. Prix indicatifs ; nous pouvons percevoir une commission sur les réservations.',
  es: 'Valoraciones y número de opiniones de Google. Precios indicativos; podemos ganar una comisión por las reservas.',
  pt: 'Avaliações e número de opiniões do Google. Preços indicativos; podemos ganhar uma comissão nas reservas.',
  it: 'Valutazioni e numero di recensioni da Google. Prezzi indicativi; potremmo guadagnare una commissione sulle prenotazioni.',
  nl: 'Beoordelingen en aantal reviews via Google. Prijzen zijn indicatief; we kunnen een commissie verdienen op boekingen.',
  ja: '評価とレビュー数はGoogleのデータに基づきます。価格は目安で、予約により手数料を得る場合があります。',
  'zh-hk': '評分及評論數量來自Google。價格僅供參考，我們可能從預訂中賺取佣金。',
}
// FAQ (GEO): question + answer templates with slots.
const FAQ_QBEST: Record<Locale, string> = {
  en: 'Which is the best hotel in {name}?', fr: 'Quel est le meilleur hôtel à {name} ?', es: '¿Cuál es el mejor hotel en {name}?', pt: 'Qual é o melhor hotel em {name}?', it: 'Qual è il miglior hotel a {name}?', nl: 'Wat is het beste hotel in {name}?', ja: '{name}で一番良いホテルは？', 'zh-hk': '{name}最好的酒店是哪間？',
}
const FAQ_ABEST: Record<Locale, string> = {
  en: 'Overall, {overall} is our top pick, rated {rating}/5 from {reviews} guest reviews.',
  fr: 'Globalement, {overall} est notre meilleur choix, noté {rating}/5 sur {reviews} avis voyageurs.',
  es: 'En general, {overall} es nuestra mejor opción, con {rating}/5 sobre {reviews} opiniones.',
  pt: 'No geral, {overall} é a nossa melhor opção, com {rating}/5 em {reviews} avaliações.',
  it: 'In generale, {overall} è la nostra scelta migliore, con {rating}/5 su {reviews} recensioni.',
  nl: 'Al met al is {overall} onze topkeuze, met {rating}/5 op basis van {reviews} reviews.',
  ja: '総合的には{overall}が一番のおすすめで、{reviews}件のレビューで{rating}/5の評価です。',
  'zh-hk': '綜合而言，{overall}是我們的首選，於{reviews}則評論中獲{rating}/5評分。',
}
const FAQ_QLUX: Record<Locale, string> = {
  en: 'What is the best luxury hotel in {name}?', fr: 'Quel est le meilleur hôtel de luxe à {name} ?', es: '¿Cuál es el mejor hotel de lujo en {name}?', pt: 'Qual é o melhor hotel de luxo em {name}?', it: 'Qual è il miglior hotel di lusso a {name}?', nl: 'Wat is het beste luxehotel in {name}?', ja: '{name}で最高級のホテルは？', 'zh-hk': '{name}最佳豪華酒店是哪間？',
}
const FAQ_ALUX: Record<Locale, string> = {
  en: '{luxury} is the most upscale choice in {name}, from about €{price} per night.',
  fr: '{luxury} est l\'adresse la plus haut de gamme à {name}, dès environ {price} € la nuit.',
  es: '{luxury} es la opción más exclusiva en {name}, desde unos {price} € por noche.',
  pt: '{luxury} é a opção mais exclusiva em {name}, desde cerca de {price} € por noite.',
  it: '{luxury} è la scelta più esclusiva a {name}, da circa {price} € a notte.',
  nl: '{luxury} is de meest luxueuze keuze in {name}, vanaf ongeveer € {price} per nacht.',
  ja: '{name}で最も高級なのは{luxury}で、1泊およそ{price}ユーロからです。',
  'zh-hk': '{name}最高檔的是{luxury}，每晚約{price}歐元起。',
}
const FAQ_QCOST: Record<Locale, string> = {
  en: 'How much does a hotel in {name} cost?', fr: 'Combien coûte un hôtel à {name} ?', es: '¿Cuánto cuesta un hotel en {name}?', pt: 'Quanto custa um hotel em {name}?', it: 'Quanto costa un hotel a {name}?', nl: 'Wat kost een hotel in {name}?', ja: '{name}のホテルの料金は？', 'zh-hk': '{name}的酒店價錢大概多少？',
}
const FAQ_ACOST: Record<Locale, string> = {
  en: 'Nightly rates range from about €{min} to €{max}, depending on the hotel, season and dates.',
  fr: 'Les tarifs vont d\'environ {min} € à {max} € la nuit, selon l\'hôtel, la saison et les dates.',
  es: 'Las tarifas van de unos {min} € a {max} € por noche, según el hotel, la temporada y las fechas.',
  pt: 'As tarifas vão de cerca de {min} € a {max} € por noite, consoante o hotel, a época e as datas.',
  it: 'Le tariffe vanno da circa {min} € a {max} € a notte, a seconda di hotel, stagione e date.',
  nl: 'Prijzen lopen van ongeveer € {min} tot € {max} per nacht, afhankelijk van hotel, seizoen en data.',
  ja: '料金はホテル、シーズン、日程により1泊およそ{min}〜{max}ユーロです。',
  'zh-hk': '房價視乎酒店、季節及日期，每晚約{min}至{max}歐元。',
}
const FAQ_QCHEAP: Record<Locale, string> = {
  en: 'What is the cheapest hotel in {name}?', fr: "Quel est l'hôtel le moins cher à {name} ?", es: '¿Cuál es el hotel más barato en {name}?', pt: 'Qual é o hotel mais barato em {name}?', it: "Qual è l'hotel più economico a {name}?", nl: 'Wat is het goedkoopste hotel in {name}?', ja: '{name}で最も安いホテルは？', 'zh-hk': '{name}最平的酒店是哪間？',
}
const FAQ_ACHEAP: Record<Locale, string> = {
  en: 'The lowest nightly price in {name} is {budget}, from about €{price}.',
  fr: "Le prix le plus bas à {name} est {budget}, dès environ {price} €.",
  es: 'El precio más bajo en {name} es {budget}, desde unos {price} €.',
  pt: 'O preço mais baixo em {name} é {budget}, desde cerca de {price} €.',
  it: 'Il prezzo più basso a {name} è {budget}, da circa {price} €.',
  nl: 'De laagste prijs in {name} is {budget}, vanaf ongeveer € {price}.',
  ja: '{name}で最も安いのは{budget}で、約{price}ユーロからです。',
  'zh-hk': '{name}最低價的是{budget}，約{price}歐元起。',
}
const FAQ_QSKI: Record<Locale, string> = {
  en: 'Which hotels in {name} are ski-in/ski-out?', fr: 'Quels hôtels sont ski aux pieds à {name} ?', es: '¿Qué hoteles en {name} son ski-in/ski-out?', pt: 'Que hotéis em {name} são ski-in/ski-out?', it: 'Quali hotel a {name} sono ski-in/ski-out?', nl: 'Welke hotels in {name} zijn ski-in/ski-out?', ja: '{name}でスキーイン・アウトのホテルは？', 'zh-hk': '{name}有哪些酒店可雪道直達？',
}
const FAQ_ASKI: Record<Locale, string> = {
  en: 'At {name}, {list} are listed as ski-in/ski-out, so you can ski to and from the door.',
  fr: 'À {name}, {list} sont classés ski aux pieds, on rentre donc skis aux pieds.',
  es: 'En {name}, {list} figuran como ski-in/ski-out, así que puedes esquiar hasta la puerta.',
  pt: 'Em {name}, {list} constam como ski-in/ski-out, por isso pode esquiar até à porta.',
  it: 'A {name}, {list} risultano ski-in/ski-out, così si rientra sci ai piedi.',
  nl: 'In {name} staan {list} te boek als ski-in/ski-out, dus je skiet tot aan de deur.',
  ja: '{name}では{list}がスキーイン・アウトとされ、玄関までスキーで移動できます。',
  'zh-hk': '在{name}，{list}標示為雪道直達，可滑雪直達門口。',
}
const FAQ_QSPA: Record<Locale, string> = {
  en: 'Which hotels in {name} have a spa?', fr: 'Quels hôtels ont un spa à {name} ?', es: '¿Qué hoteles en {name} tienen spa?', pt: 'Que hotéis em {name} têm spa?', it: 'Quali hotel a {name} hanno una spa?', nl: 'Welke hotels in {name} hebben een spa?', ja: '{name}でスパのあるホテルは？', 'zh-hk': '{name}有哪些酒店設有水療？',
}
const FAQ_ASPA: Record<Locale, string> = {
  en: 'For a spa in {name}, {list} all have one.',
  fr: 'Pour un spa à {name}, {list} en proposent un.',
  es: 'Para un spa en {name}, {list} tienen uno.',
  pt: 'Para um spa em {name}, {list} têm um.',
  it: 'Per una spa a {name}, {list} ne hanno una.',
  nl: 'Voor een spa in {name} hebben {list} er een.',
  ja: '{name}でスパをお探しなら、{list}にあります。',
  'zh-hk': '在{name}想找水療，{list}都設有。',
}
const LIST_SEP: Record<Locale, string> = { en: ', ', fr: ', ', es: ', ', pt: ', ', it: ', ', nl: ', ', ja: '、', 'zh-hk': '、' }
const LIST_AND: Record<Locale, string> = { en: ' and ', fr: ' et ', es: ' y ', pt: ' e ', it: ' e ', nl: ' en ', ja: '、', 'zh-hk': '、' }
function joinNames(names: string[], l: Locale): string {
  if (names.length <= 1) return names[0] ?? ''
  if (l === 'ja' || l === 'zh-hk') return names.join('、')
  return names.slice(0, -1).join(LIST_SEP[l]) + LIST_AND[l] + names[names.length - 1]
}
// The content (editorial write-ups) was authored on this date. Bump it whenever
// the per-resort prose is regenerated; used for the freshness signal only.
const CONTENT_DATE = '2026-09-12'
const UPDATED_LABEL: Record<Locale, string> = { en: 'Updated', fr: 'Mis à jour', es: 'Actualizado', pt: 'Atualizado', it: 'Aggiornato', nl: 'Bijgewerkt', ja: '更新', 'zh-hk': '更新' }

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) for (const slug of BEST_HOTELS_SLUGS) params.push({ locale, slug })
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const d = getDestination(slug)
  if (!d || !(BEST_HOTELS_SLUGS as readonly string[]).includes(slug)) return {}
  return {
    title: fill(META_TITLE[l], { name: d.name }),
    description: fill(META_DESC[l], { name: d.name }),
    openGraph: {
      title: fill(META_TITLE[l], { name: d.name }),
      description: fill(META_DESC[l], { name: d.name }),
      type: 'website',
      url: `${SITE_URL}/${l}/best-hotels/${slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/${l}/best-hotels/${slug}`,
      languages: hreflangFor(`/best-hotels/${slug}`),
    },
  }
}

export default async function BestHotelsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const d = getDestination(slug)
  if (!d || !(BEST_HOTELS_SLUGS as readonly string[]).includes(slug)) notFound()

  const dict = await getDictionary(l)
  const hotels = getHotels(slug)
  const picks = hotelPicks(hotels)
  if (picks.length === 0) notFound()

  // One verdict card per hotel (a place winning two axes shows two badges).
  const cards = pickCards(picks)
  // Table "Best for" tag = each hotel's highest-priority axis (first occurrence).
  const primaryAxis = new Map<string, PickAxis>()
  for (const { axis, hotel } of picks) if (!primaryAxis.has(hotel.id)) primaryAxis.set(hotel.id, axis)

  const overall = picks.find((p) => p.axis === 'overall')?.hotel ?? hotels[0]
  const luxury = picks.find((p) => p.axis === 'luxury')?.hotel ?? overall
  const value = picks.find((p) => p.axis === 'value')?.hotel ?? overall
  const { min, max } = priceRange(hotels)
  const intro = introParagraphs(slug, l)

  const directAnswer = fill(DIRECT[l], {
    name: d.name,
    overall: overall.name,
    rating: overall.rating.toFixed(1),
    luxury: luxury.name,
    value: value.name,
    min,
    max,
  })

  // Table sorted by our composite ranking (picks first, in order, then the rest
  // by rating x reviews) so the strongest options sit at the top.
  const rankScore = (h: (typeof hotels)[number]) => h.rating * Math.log10((h.reviewCount || 0) + 10)
  const tableRows = [...hotels].sort((a, b) => {
    const ra = primaryAxis.has(a.id) ? 1 : 0
    const rb = primaryAxis.has(b.id) ? 1 : 0
    if (ra !== rb) return rb - ra
    return rankScore(b) - rankScore(a)
  })

  const num = (n: number) => n.toLocaleString(l === 'en' ? 'en-US' : l)

  const budget = picks.find((p) => p.axis === 'budget')?.hotel ?? tableRows[tableRows.length - 1]
  const skiInOutNames = hotels.filter((h) => getHotelDetail(h.id)?.amenities.includes('skiinout')).map((h) => h.name)
  const spaNames = hotels.filter((h) => getHotelDetail(h.id)?.amenities.includes('spa')).map((h) => h.name).slice(0, 5)

  const faqItems = [
    {
      q: fill(FAQ_QBEST[l], { name: d.name }),
      a: fill(FAQ_ABEST[l], { overall: overall.name, rating: overall.rating.toFixed(1), reviews: num(overall.reviewCount) }),
    },
    {
      q: fill(FAQ_QLUX[l], { name: d.name }),
      a: fill(FAQ_ALUX[l], { luxury: luxury.name, name: d.name, price: luxury.priceFrom }),
    },
    {
      q: fill(FAQ_QCHEAP[l], { name: d.name }),
      a: fill(FAQ_ACHEAP[l], { name: d.name, budget: budget.name, price: budget.priceFrom }),
    },
    ...(skiInOutNames.length
      ? [{ q: fill(FAQ_QSKI[l], { name: d.name }), a: fill(FAQ_ASKI[l], { name: d.name, list: joinNames(skiInOutNames, l) }) }]
      : []),
    ...(spaNames.length
      ? [{ q: fill(FAQ_QSPA[l], { name: d.name }), a: fill(FAQ_ASPA[l], { name: d.name, list: joinNames(spaNames, l) }) }]
      : []),
    {
      q: fill(FAQ_QCOST[l], { name: d.name }),
      a: fill(FAQ_ACOST[l], { min, max }),
    },
  ]

  const IMG_CDN = process.env.NEXT_PUBLIC_IMAGE_CDN || 'https://snow.samnogroup.com'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: fill(META_TITLE[l], { name: d.name }).split(' | ')[0],
      numberOfItems: hotels.length,
      itemListElement: tableRows.map((h, i) => {
        const det = getHotelDetail(h.id)
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Hotel',
            name: h.name,
            address: { '@type': 'PostalAddress', addressLocality: d.name, addressCountry: d.countryCode },
            ...(h.lat != null && h.lng != null ? { geo: { '@type': 'GeoCoordinates', latitude: h.lat, longitude: h.lng } } : {}),
            ...(h.priceLevel ? { priceRange: '€'.repeat(h.priceLevel) } : {}),
            ...(h.hasPhoto ? { image: `${IMG_CDN}/images/hotels/${h.id}.jpg` } : {}),
            ...(det?.stars ? { starRating: { '@type': 'Rating', ratingValue: det.stars, bestRating: 5 } } : {}),
            ...(det?.amenities?.length
              ? { amenityFeature: det.amenities.filter((a) => AMENITY[a]).map((a) => ({ '@type': 'LocationFeatureSpecification', name: AMENITY[a].label.en, value: true })) }
              : {}),
          },
        }
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: dict.nav.home, item: `${SITE_URL}/${l}` },
        { '@type': 'ListItem', position: 2, name: d.name, item: `${SITE_URL}/${l}/destinations/${slug}` },
        { '@type': 'ListItem', position: 3, name: fill(H1[l], { name: d.name }), item: `${SITE_URL}/${l}/best-hotels/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${l}/best-hotels/${slug}#webpage`,
      url: `${SITE_URL}/${l}/best-hotels/${slug}`,
      name: fill(H1[l], { name: d.name }),
      datePublished: CONTENT_DATE,
      dateModified: CONTENT_DATE,
      inLanguage: l === 'zh-hk' ? 'zh-HK' : l,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      primaryImageOfPage: `${IMG_CDN}/images/destinations/${slug}.jpg`,
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraph(jsonLd) }} />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <SafeImage src={`/images/destinations/${slug}.jpg`} alt={`${d.name}, ${localizeRegion(d.region, l)}`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-slate-deep/45 to-slate-deep/25" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <nav className="text-xs text-white/80 mb-3 flex items-center gap-2 flex-wrap">
            <Link href={`/${l}`} className="hover:text-white">{dict.nav.home}</Link>
            <span aria-hidden>/</span>
            <Link href={`/${l}/destinations/${slug}`} className="hover:text-white">{d.name}</Link>
            <span aria-hidden>/</span>
            <span>{BC[l]}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">{fill(H1[l], { name: d.name })}</h1>
          <p className="mt-2 text-white/85 text-sm max-w-2xl">{SUBTITLE[l]}</p>
        </div>
      </section>

      {/* Answer-first (GEO): the extractable summary sits above the long intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-2xl border border-ice-200 bg-ice-50/70 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ice-600">{TLDR[l]}</div>
            <div className="text-[11px] text-ice-500">
              {UPDATED_LABEL[l]} {new Date(CONTENT_DATE).toLocaleDateString(l === 'zh-hk' ? 'zh-HK' : l, { year: 'numeric', month: 'long' })}
            </div>
          </div>
          <p className="text-lg text-slate-deep leading-relaxed font-medium">{directAnswer}</p>
        </div>
      </section>

      {/* Editorial intro: why this comparison, the resort's lodging landscape */}
      {intro.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="space-y-4 text-[17px] text-ice-800/90 leading-relaxed">
            {intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* In-depth verdicts: one rich, text-led block per shortlisted hotel */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-slate-deep mb-6">{HEAD_DETAIL[l]}</h2>
        <div className="space-y-8">
          {cards.map(({ axes, hotel }) => {
            const det = getHotelDetail(hotel.id)
            const chips = amenityChips(det?.amenities, 8)
            const dist = hotelDistanceLabel(hotel.distanceToSlopesM)
            const prose = hotelProse(slug, hotel.id, l)
            const primary = axes[0]
            return (
              <article key={hotel.id} className="grid grid-cols-1 sm:grid-cols-5 bg-white rounded-2xl border border-ice-100 overflow-hidden card-hover">
                <div className="relative sm:col-span-2 h-56 sm:h-auto sm:min-h-[300px]">
                  {hotel.hasPhoto ? (
                    <SafeImage src={`/images/hotels/${hotel.id}.jpg`} alt={hotel.name} fill sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-ice-100 via-ice-200 to-ice-400"><div className="absolute inset-0 bg-snow-grain opacity-50" /></div>
                  )}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 p-3 flex flex-wrap gap-1.5">
                    {axes.map((axis) => (
                      <span key={axis} className="inline-block text-[11px] font-bold uppercase tracking-wide text-white bg-ice-600 rounded-full px-2.5 py-1 shadow-sm">{AXIS_LABEL[axis][l]}</span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-3 p-5 sm:p-6 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-deep leading-snug">{hotel.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ice-700">
                    {det?.stars ? (
                      <span className="flex items-center gap-1"><span className="text-amber-400 tracking-tight" aria-hidden>{'★'.repeat(det.stars)}</span>{fill(STARS_PHRASE[l], { n: det.stars })}</span>
                    ) : null}
                    <span><b className="text-slate-deep tabular-nums">{hotel.rating.toFixed(1)}</b>/5 · {num(hotel.reviewCount)} {REVIEWS_WORD[l]}</span>
                    <span className="text-slate-deep font-semibold tabular-nums">€{hotel.priceFrom} {dict.destination.perNight}</span>
                    {dist && <span>📍 {fill(DIST_LABEL[l], { d: dist })}</span>}
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm text-ice-800/90 leading-relaxed">
                    {prose.length > 0
                      ? prose.map((p, i) => <p key={i}>{p}</p>)
                      : <p>{fill(REASON[primary][l], { resort: d.name, rating: hotel.rating.toFixed(1), reviews: num(hotel.reviewCount), price: hotel.priceFrom })}</p>}
                  </div>
                  {chips.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {chips.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-[11px] font-medium text-ice-700 bg-ice-50 border border-ice-200 rounded-full px-2 py-0.5"><span aria-hidden>{AMENITY[a].icon}</span>{AMENITY[a].label[l]}</span>
                      ))}
                    </div>
                  )}
                  <a href={buildAllezHotelLink(hotel.name, d.name, d.country, 'best-hotels', 7)} target="_blank" rel="noopener sponsored" className="mt-5 self-start inline-flex items-center bg-ice-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-ice-500 transition">
                    {dict.destination.checkAvailability} →
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-5">{HEAD_TABLE[l]}</h2>
        <div className="overflow-x-auto rounded-2xl border border-ice-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ice-50 text-left text-ice-700">
                <th className="px-4 py-3 font-semibold">{TH_HOTEL[l]}</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">{TH_STARS[l]}</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">{TH_RATING[l]}</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">{TH_PRICE[l]}</th>
                <th className="px-4 py-3 font-semibold">{TH_BESTFOR[l]}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((h) => {
                const axis = primaryAxis.get(h.id)
                const stars = getHotelDetail(h.id)?.stars
                return (
                  <tr key={h.id} className="border-t border-ice-100">
                    <td className="px-4 py-3 font-semibold text-slate-deep">{h.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-amber-400" aria-label={stars ? `${stars} stars` : undefined}>{stars ? '★'.repeat(stars) : <span className="text-ice-300">—</span>}</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">{h.rating.toFixed(1)} <span className="text-ice-500">({num(h.reviewCount)})</span></td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">€{h.priceFrom}</td>
                    <td className="px-4 py-3">
                      <span className={axis ? 'font-semibold text-ice-700' : 'text-ice-500'}>{axis ? AXIS_LABEL[axis][l] : NEUTRAL_TAG[l]}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ice-500">{RATINGS_NOTE[l]}</p>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-slate-deep mb-5">{HEAD_FAQ[l]}</h2>
        <dl className="space-y-4">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-ice-50 rounded-2xl p-5">
              <dt className="font-semibold text-slate-deep">{f.q}</dt>
              <dd className="mt-1.5 text-ice-800/85 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Map + book */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stay22Map lat={d.lat} lng={d.lng} destName={d.name} height={460} />
        <div className="mt-6 text-center">
          <a href={buildAllezDestLink(d.name, d.country, 'best-hotels')} target="_blank" rel="noopener sponsored" className="inline-block bg-slate-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20">
            {dict.destination.bookCta} →
          </a>
        </div>
      </section>

      {/* Cross-links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-wrap gap-3 text-sm">
        <Link href={`/${l}/destinations/${slug}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition font-medium">
          {fill(FULL_GUIDE[l], { name: d.name })} →
        </Link>
        <Link href={`/${l}/weather/${slug}`} className="rounded-full border border-ice-200 px-4 py-2 hover:bg-ice-50 transition">
          {SNOW_LINK[l]} →
        </Link>
      </section>
    </>
  )
}
