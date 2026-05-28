/**
 * Official resort websites, keyed by destination slug.
 *
 * Best-effort official tourism / ski-area domains, correct as of the 2026 season.
 * Verify before launch: a handful of resorts occasionally migrate domains.
 *
 * Ski-rental and lift-pass links are generated dynamically from the resort name
 * and coordinates (Google Maps searches), so they never go stale, see lib below.
 */
const RESORT_SITES: Record<string, string> = {
  'val-thorens': 'https://www.valthorens.com',
  'val-d-isere': 'https://www.valdisere.com',
  courchevel: 'https://www.courchevel.com',
  meribel: 'https://www.meribel.net',
  chamonix: 'https://www.chamonix.com',
  'les-arcs': 'https://www.lesarcs.com',
  'la-plagne': 'https://www.la-plagne.com',
  tignes: 'https://www.tignes.net',
  'alpe-d-huez': 'https://www.alpedhuez.com',
  'serre-chevalier': 'https://www.serre-chevalier.com',
  zermatt: 'https://www.zermatt.ch',
  verbier: 'https://www.verbier.ch',
  'st-moritz': 'https://www.stmoritz.com',
  'crans-montana': 'https://www.crans-montana.ch',
  'saas-fee': 'https://www.saas-fee.ch',
  davos: 'https://www.davos.ch',
  andermatt: 'https://www.andermatt.ch',
  'st-anton': 'https://www.stantonamarlberg.com',
  ischgl: 'https://www.ischgl.com',
  solden: 'https://www.soelden.com',
  mayrhofen: 'https://www.mayrhofen.at',
  kitzbuhel: 'https://www.kitzbuehel.com',
  saalbach: 'https://www.saalbach.com',
  'lech-zurs': 'https://www.lechzuers.com',
  obergurgl: 'https://www.obergurgl.com',
  'cortina-d-ampezzo': 'https://www.cortinadolomiti.eu',
  livigno: 'https://www.livigno.eu',
  cervinia: 'https://www.cervinia.it',
  'madonna-di-campiglio': 'https://www.campigliodolomiti.it',
  sestriere: 'https://www.vialattea.it',
  'selva-val-gardena': 'https://www.valgardena.it',
  'baqueira-beret': 'https://www.baqueira.es',
  formigal: 'https://www.formigal-panticosa.com',
  cerler: 'https://www.cerler.com',
  grandvalira: 'https://www.grandvalira.com',
  'vallnord-pal-arinsal': 'https://www.pal-arinsal.com',
  'saint-lary': 'https://www.saintlary.com',
  peyragudes: 'https://www.peyragudes.com',
  'font-romeu': 'https://www.font-romeu.fr',
  'grand-tourmalet': 'https://www.grand-tourmalet.com',
  cauterets: 'https://www.cauterets.com',
}

export function resortSite(slug: string): string | null {
  return RESORT_SITES[slug] ?? null
}

/** Google Maps search for ski-rental shops in and around the resort. */
export function skiRentalMapsUrl(name: string, country: string): string {
  const q = encodeURIComponent(`ski rental ${name} ${country}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

/** Google Maps search for lift-pass / ticket offices in the resort. */
export function liftPassMapsUrl(name: string, country: string): string {
  const q = encodeURIComponent(`ski lift pass office ${name} ${country}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
