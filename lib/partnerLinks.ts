import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Cross-links to our sibling travel sites, shown only on the resorts those
 * sites genuinely cover (verified against each site's real destination data and
 * URL pattern, so no broken links). Contextual and useful, not a blanket footer.
 *
 * - HotelsWithPets (hotelswithpets.com): pet-friendly hotels, locales en/fr/es,
 *   URL /<loc>/destinations/<slug>. Matches resorts that are also its cities.
 * - ScreenToTrip (screentotrip.com): film/TV set-jetting, locales en/fr/de/es/it,
 *   URL /<loc>/destinations/<slug>. Only interlaken overlaps its locations.
 * - MyHoneymoonHotel (myhoneymoonhotel.com): honeymoon hotels by region, no
 *   locale prefix, URL /destinations/<region>. Maps Dolomites, Lapland and
 *   Banff resorts to that region's page.
 * - RaceWeekStays (raceweekstays.com): accommodation for F1/MotoGP race
 *   weekends, locales en/fr/nl/de/it/es, URL /<loc>/<circuit>. Only Schladming
 *   has a credible nearby circuit (the Red Bull Ring at Spielberg, ~1h, same
 *   Styria region), and RaceWeekStays already links the other way.
 * - StaysInSwitzerland (staysinswitzerland.com): where-to-stay guides for Swiss
 *   resorts, locales en/de/fr, URL /<loc>/<slug> (en at root). Shown only on the
 *   Swiss resorts it has a published guide for; a few resort areas map to a
 *   different slug there (verified live) so no link breaks.
 */
export interface PartnerLink {
  id: string
  name: string
  href: string
  blurb: string
}

const HWP_SLUGS = new Set(['zermatt', 'st-moritz', 'grindelwald', 'innsbruck', 'interlaken'])
const STT_SLUGS = new Set(['interlaken'])
const HONEYMOON_REGION: Record<string, string> = {
  'cortina-d-ampezzo': 'dolomites', corvara: 'dolomites', 'san-cassiano': 'dolomites',
  'alta-badia': 'dolomites', 'selva-val-gardena': 'dolomites', ortisei: 'dolomites',
  'madonna-di-campiglio': 'dolomites', canazei: 'dolomites', arabba: 'dolomites',
  levi: 'lapland', yllas: 'lapland', ruka: 'lapland', saariselka: 'lapland',
  'pyha-luosto': 'lapland', 'iso-syote': 'lapland', salla: 'lapland',
  'lake-louise': 'banff', 'banff-sunshine': 'banff',
}
// Full prepositional phrase per locale, so each blurb reads naturally.
const REGION_LABEL: Record<string, Record<Locale, string>> = {
  dolomites: { en: 'in the Dolomites', fr: 'dans les Dolomites', es: 'en los Dolomitas', pt: 'nas Dolomitas', it: 'nelle Dolomiti', ja: 'ドロミテ', nl: 'in de Dolomieten', 'zh-hk': '多洛米蒂' },
  lapland: { en: 'in Lapland', fr: 'en Laponie', es: 'en Laponia', pt: 'na Lapónia', it: 'in Lapponia', ja: 'ラップランド', nl: 'in Lapland', 'zh-hk': '拉普蘭' },
  banff: { en: 'in Banff', fr: 'à Banff', es: 'en Banff', pt: 'em Banff', it: 'a Banff', ja: 'バンフ', nl: 'in Banff', 'zh-hk': '班夫' },
}

// RaceWeekStays slug is the circuit, not the resort. Schladming is a known base
// for a weekend at the Red Bull Ring (Austrian F1 + MotoGP GP) in the same region.
const RWS_CIRCUIT: Record<string, string> = { schladming: 'spielberg' }

// BestSnowHotels resort slug -> Stays in Switzerland guide slug. Only the Swiss
// resorts that site has a live guide for (checked against publishedGuides()).
// Most are identical; the last four are the same resort area under a different
// slug there, mapped explicitly so the deep link never 404s.
const SIS_GUIDE: Record<string, string> = {
  zermatt: 'zermatt', verbier: 'verbier', 'st-moritz': 'st-moritz',
  'crans-montana': 'crans-montana', 'saas-fee': 'saas-fee', davos: 'davos',
  andermatt: 'andermatt', grindelwald: 'grindelwald', wengen: 'wengen',
  murren: 'murren', engelberg: 'engelberg', laax: 'laax',
  'les-diablerets': 'les-diablerets', adelboden: 'adelboden', gstaad: 'gstaad',
  champery: 'champery', klosters: 'klosters', bettmeralp: 'bettmeralp',
  lenk: 'lenk', scuol: 'scuol', riederalp: 'riederalp', pontresina: 'pontresina',
  wildhaus: 'wildhaus', leukerbad: 'leukerbad', interlaken: 'interlaken',
  grachen: 'grachen', stoos: 'stoos',
  'arosa-lenzerheide': 'arosa', 'villars-gryon': 'villars',
  'grimentz-zinal': 'zinal', grimentz: 'zinal',
}
// staysinswitzerland has only en/de/fr; map our fr to fr, everything else to en.
const sisHref = (slug: string, l: Locale) =>
  l === 'fr'
    ? `https://www.staysinswitzerland.com/fr/${slug}`
    : `https://www.staysinswitzerland.com/${slug}`

const hwpLoc = (l: Locale) => (['en', 'fr', 'es'] as string[]).includes(l) ? l : 'en'
const sttLoc = (l: Locale) => (['en', 'fr', 'es', 'it'] as string[]).includes(l) ? l : 'en'
const rwsLoc = (l: Locale) => (['en', 'fr', 'es', 'it'] as string[]).includes(l) ? l : 'en'

function hwpBlurb(name: string, l: Locale): string {
  return {
    en: `Travelling with your dog? HotelsWithPets lists the pet-friendly hotels in ${name}.`,
    fr: `Vous voyagez avec votre chien ? HotelsWithPets référence les hôtels qui acceptent les animaux à ${name}.`,
    es: `¿Viajas con tu perro? HotelsWithPets recopila los hoteles que admiten mascotas en ${name}.`,
    pt: `Viaja com o seu cão? O HotelsWithPets reúne os hotéis que aceitam animais em ${name}.`,
    it: `Viaggi con il cane? HotelsWithPets raccoglie gli hotel che accettano animali a ${name}.`,
    ja: `愛犬と一緒に旅行しますか。HotelsWithPetsが${name}のペット可ホテルを紹介しています。`,
    nl: `Reis je met je hond? HotelsWithPets verzamelt de huisdiervriendelijke hotels in ${name}.`,
    'zh-hk': `與愛犬同行旅遊？HotelsWithPets為你整理${name}的寵物友善酒店。`,
  }[l]
}
function sttBlurb(name: string, l: Locale): string {
  return {
    en: `${name} has appeared on screen. ScreenToTrip maps the film and TV locations to visit.`,
    fr: `${name} a servi de décor au cinéma. ScreenToTrip répertorie les lieux de tournage à visiter.`,
    es: `${name} ha aparecido en la pantalla. ScreenToTrip recopila las localizaciones de cine y series para visitar.`,
    pt: `${name} já apareceu no ecrã. O ScreenToTrip mapeia os locais de filmagens para visitar.`,
    it: `${name} è apparsa sullo schermo. ScreenToTrip mappa i luoghi delle riprese da visitare.`,
    ja: `${name}は映画やドラマに登場したことがあります。ScreenToTripが、訪れたいロケ地を紹介しています。`,
    nl: `${name} was te zien op het scherm. ScreenToTrip brengt de film- en serielocaties in kaart die je kunt bezoeken.`,
    'zh-hk': `${name}曾在電影或劇集中登場。ScreenToTrip整理了值得一遊的取景地點。`,
  }[l]
}
function mhhBlurb(regionPhrase: string, l: Locale): string {
  return {
    en: `Planning a honeymoon? MyHoneymoonHotel curates the most romantic hotels ${regionPhrase}.`,
    fr: `Vous préparez une lune de miel ? MyHoneymoonHotel sélectionne les hôtels les plus romantiques ${regionPhrase}.`,
    es: `¿Preparas una luna de miel? MyHoneymoonHotel selecciona los hoteles más románticos ${regionPhrase}.`,
    pt: `Está a planear uma lua de mel? O MyHoneymoonHotel seleciona os hotéis mais românticos ${regionPhrase}.`,
    it: `Stai organizzando una luna di miele? MyHoneymoonHotel seleziona gli hotel più romantici ${regionPhrase}.`,
    ja: `新婚旅行を計画中ですか。MyHoneymoonHotelが${regionPhrase}で最もロマンチックなホテルを厳選しています。`,
    nl: `Plan je een huwelijksreis? MyHoneymoonHotel selecteert de meest romantische hotels ${regionPhrase}.`,
    'zh-hk': `正在計劃蜜月旅行？MyHoneymoonHotel精選${regionPhrase}內最浪漫的酒店。`,
  }[l]
}

function rwsBlurb(l: Locale): string {
  return {
    en: `Here for a race weekend at the nearby Red Bull Ring? RaceWeekStays finds accommodation for the Austrian Grand Prix.`,
    fr: `Vous venez pour un week-end de course au Red Bull Ring tout proche ? RaceWeekStays trouve un hébergement pour le Grand Prix d'Autriche.`,
    es: `¿Vienes por un fin de semana de carreras en el cercano Red Bull Ring? RaceWeekStays encuentra alojamiento para el Gran Premio de Austria.`,
    pt: `Vem para um fim de semana de corridas no Red Bull Ring, ali perto? O RaceWeekStays encontra alojamento para o Grande Prémio da Áustria.`,
    it: `Sei qui per un weekend di gara al vicino Red Bull Ring? RaceWeekStays trova alloggi per il Gran Premio d'Austria.`,
    ja: `近くのRed Bull Ringでのレース観戦が目的ですか。RaceWeekStaysがオーストリアグランプリの宿泊先を探してくれます。`,
    nl: `Hier voor een raceweekend bij de nabijgelegen Red Bull Ring? RaceWeekStays vindt accommodatie voor de Grand Prix van Oostenrijk.`,
    'zh-hk': `專程來附近的Red Bull Ring觀賽？RaceWeekStays為奧地利大獎賽提供住宿搜尋服務。`,
  }[l]
}

function sisBlurb(name: string, l: Locale): string {
  return {
    en: `Staying on in ${name} beyond the ski? Stays in Switzerland has a full where-to-stay guide for the resort.`,
    fr: `Vous prolongez le séjour à ${name} au-delà du ski ? Stays in Switzerland propose un guide complet des hébergements sur place.`,
    es: `¿Alargas tu estancia en ${name} más allá del esquí? Stays in Switzerland ofrece una guía completa de alojamiento.`,
    pt: `Vai ficar em ${name} para além do esqui? O Stays in Switzerland tem um guia completo de alojamento.`,
    it: `Ti fermi a ${name} oltre lo sci? Stays in Switzerland propone una guida completa su dove alloggiare.`,
    ja: `${name}でスキー以外の滞在も楽しみますか。Stays in Switzerlandが現地の宿泊ガイドを詳しく紹介しています。`,
    nl: `Blijf je in ${name} langer dan alleen om te skiën? Stays in Switzerland heeft een volledige verblijfsgids.`,
    'zh-hk': `打算在${name}滑雪以外多留幾天？Stays in Switzerland提供當地住宿的完整指南。`,
  }[l]
}

export function partnerLinksFor(slug: string, name: string, l: Locale): PartnerLink[] {
  const out: PartnerLink[] = []
  if (HWP_SLUGS.has(slug)) {
    out.push({ id: 'hotelswithpets', name: 'HotelsWithPets', href: `https://www.hotelswithpets.com/${hwpLoc(l)}/destinations/${slug}`, blurb: hwpBlurb(name, l) })
  }
  if (STT_SLUGS.has(slug)) {
    out.push({ id: 'screentotrip', name: 'ScreenToTrip', href: `https://screentotrip.com/${sttLoc(l)}/destinations/${slug}`, blurb: sttBlurb(name, l) })
  }
  const region = HONEYMOON_REGION[slug]
  if (region) {
    out.push({ id: 'myhoneymoonhotel', name: 'MyHoneymoonHotel', href: `https://myhoneymoonhotel.com/destinations/${region}`, blurb: mhhBlurb(REGION_LABEL[region][l], l) })
  }
  const circuit = RWS_CIRCUIT[slug]
  if (circuit) {
    out.push({ id: 'raceweekstays', name: 'RaceWeekStays', href: `https://raceweekstays.com/${rwsLoc(l)}/${circuit}`, blurb: rwsBlurb(l) })
  }
  const sisSlug = SIS_GUIDE[slug]
  if (sisSlug) {
    out.push({ id: 'staysinswitzerland', name: 'Stays in Switzerland', href: sisHref(sisSlug, l), blurb: sisBlurb(name, l) })
  }
  return out
}
