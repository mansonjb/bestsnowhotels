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
  dolomites: { en: 'in the Dolomites', fr: 'dans les Dolomites', es: 'en los Dolomitas', pt: 'nas Dolomitas', it: 'nelle Dolomiti' },
  lapland: { en: 'in Lapland', fr: 'en Laponie', es: 'en Laponia', pt: 'na Lapónia', it: 'in Lapponia' },
  banff: { en: 'in Banff', fr: 'à Banff', es: 'en Banff', pt: 'em Banff', it: 'a Banff' },
}

const hwpLoc = (l: Locale) => (['en', 'fr', 'es'] as string[]).includes(l) ? l : 'en'
const sttLoc = (l: Locale) => (['en', 'fr', 'es', 'it'] as string[]).includes(l) ? l : 'en'

function hwpBlurb(name: string, l: Locale): string {
  return {
    en: `Travelling with your dog? HotelsWithPets lists the pet-friendly hotels in ${name}.`,
    fr: `Vous voyagez avec votre chien ? HotelsWithPets référence les hôtels qui acceptent les animaux à ${name}.`,
    es: `¿Viajas con tu perro? HotelsWithPets recopila los hoteles que admiten mascotas en ${name}.`,
    pt: `Viaja com o seu cão? O HotelsWithPets reúne os hotéis que aceitam animais em ${name}.`,
    it: `Viaggi con il cane? HotelsWithPets raccoglie gli hotel che accettano animali a ${name}.`,
  }[l]
}
function sttBlurb(name: string, l: Locale): string {
  return {
    en: `${name} has appeared on screen. ScreenToTrip maps the film and TV locations to visit.`,
    fr: `${name} a servi de décor au cinéma. ScreenToTrip répertorie les lieux de tournage à visiter.`,
    es: `${name} ha aparecido en la pantalla. ScreenToTrip recopila las localizaciones de cine y series para visitar.`,
    pt: `${name} já apareceu no ecrã. O ScreenToTrip mapeia os locais de filmagens para visitar.`,
    it: `${name} è apparsa sullo schermo. ScreenToTrip mappa i luoghi delle riprese da visitare.`,
  }[l]
}
function mhhBlurb(regionPhrase: string, l: Locale): string {
  return {
    en: `Planning a honeymoon? MyHoneymoonHotel curates the most romantic hotels ${regionPhrase}.`,
    fr: `Vous préparez une lune de miel ? MyHoneymoonHotel sélectionne les hôtels les plus romantiques ${regionPhrase}.`,
    es: `¿Preparas una luna de miel? MyHoneymoonHotel selecciona los hoteles más románticos ${regionPhrase}.`,
    pt: `Está a planear uma lua de mel? O MyHoneymoonHotel seleciona os hotéis mais românticos ${regionPhrase}.`,
    it: `Stai organizzando una luna di miele? MyHoneymoonHotel seleziona gli hotel più romantici ${regionPhrase}.`,
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
  return out
}
