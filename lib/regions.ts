import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised mountain-range names. Source of truth uses the English label
 * stored in data/destinations.json (e.g. "French Alps"). This avoids showing
 * "French Alps" inside a French or Portuguese page.
 */
const REGIONS: Record<string, Record<Locale, string>> = {
  'French Alps': {
    en: 'French Alps',
    fr: 'Alpes françaises',
    es: 'Alpes franceses',
    pt: 'Alpes franceses',
    it: 'Alpi francesi',
  },
  'Swiss Alps': {
    en: 'Swiss Alps',
    fr: 'Alpes suisses',
    es: 'Alpes suizos',
    pt: 'Alpes suíços',
    it: 'Alpi svizzere',
  },
  'Austrian Alps': {
    en: 'Austrian Alps',
    fr: 'Alpes autrichiennes',
    es: 'Alpes austriacos',
    pt: 'Alpes austríacos',
    it: 'Alpi austriache',
  },
  'Italian Alps': {
    en: 'Italian Alps',
    fr: 'Alpes italiennes',
    es: 'Alpes italianos',
    pt: 'Alpes italianos',
    it: 'Alpi italiane',
  },
  'Spanish Pyrenees': {
    en: 'Spanish Pyrenees',
    fr: 'Pyrénées espagnoles',
    es: 'Pirineos españoles',
    pt: 'Pirenéus espanhóis',
    it: 'Pirenei spagnoli',
  },
  'French Pyrenees': {
    en: 'French Pyrenees',
    fr: 'Pyrénées françaises',
    es: 'Pirineos franceses',
    pt: 'Pirenéus franceses',
    it: 'Pirenei francesi',
  },
  'Andorran Pyrenees': {
    en: 'Andorran Pyrenees',
    fr: 'Pyrénées andorranes',
    es: 'Pirineos andorranos',
    pt: 'Pirenéus andorranos',
    it: 'Pirenei andorrani',
  },
  'Bavarian Alps': {
    en: 'Bavarian Alps',
    fr: 'Alpes bavaroises',
    es: 'Alpes bávaros',
    pt: 'Alpes bávaros',
    it: 'Alpi bavaresi',
  },
  'Black Forest': {
    en: 'Black Forest',
    fr: 'Forêt-Noire',
    es: 'Selva Negra',
    pt: 'Floresta Negra',
    it: 'Foresta Nera',
  },
  'Bavarian Forest': {
    en: 'Bavarian Forest',
    fr: 'Forêt bavaroise',
    es: 'Selva Bávara',
    pt: 'Floresta Bávara',
    it: 'Foresta Bavarese',
  },
  'Norwegian Mountains': {
    en: 'Norwegian Mountains',
    fr: 'Montagnes norvégiennes',
    es: 'Montañas noruegas',
    pt: 'Montanhas norueguesas',
    it: 'Montagne norvegesi',
  },
  'Swedish Mountains': {
    en: 'Swedish Mountains',
    fr: 'Montagnes suédoises',
    es: 'Montañas suecas',
    pt: 'Montanhas suecas',
    it: 'Montagne svedesi',
  },
  'Finnish Lapland': {
    en: 'Finnish Lapland',
    fr: 'Laponie finlandaise',
    es: 'Laponia finlandesa',
    pt: 'Lapónia finlandesa',
    it: 'Lapponia finlandese',
  },
  'Hokkaido': {
    en: 'Hokkaido',
    fr: 'Hokkaidō',
    es: 'Hokkaidō',
    pt: 'Hokkaidō',
    it: 'Hokkaidō',
  },
  'Japanese Alps': {
    en: 'Japanese Alps',
    fr: 'Alpes japonaises',
    es: 'Alpes japoneses',
    pt: 'Alpes japoneses',
    it: 'Alpi giapponesi',
  },
  'Tohoku Mountains': {
    en: 'Tohoku Mountains',
    fr: 'Montagnes du Tōhoku',
    es: 'Montañas de Tōhoku',
    pt: 'Montanhas de Tōhoku',
    it: 'Monti del Tōhoku',
  },
}

export function localizeRegion(englishName: string, locale: Locale): string {
  return REGIONS[englishName]?.[locale] ?? englishName
}
