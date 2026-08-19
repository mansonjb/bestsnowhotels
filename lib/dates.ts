import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Season dates are stored in data/destinations.json in a short English form
 * ("Nov 23", "May 4", "Sep 26") or the sentinel "All year". This helper renders
 * them the way a local reader expects: "23 nov." in French, "23 nov." in Spanish,
 * "23 de nov." in Portuguese, "Nov 23" in English, "23 nov." in Italian.
 */
const MONTHS: Record<string, Record<Locale, string>> = {
  Jan: { en: 'Jan', fr: 'janv.', es: 'ene.', pt: 'jan.', it: 'gen.', ja: '1月', nl: 'jan.', 'zh-hk': '1月' },
  Feb: { en: 'Feb', fr: 'févr.', es: 'feb.', pt: 'fev.', it: 'feb.', ja: '2月', nl: 'feb.', 'zh-hk': '2月' },
  Mar: { en: 'Mar', fr: 'mars', es: 'mar.', pt: 'mar.', it: 'mar.', ja: '3月', nl: 'mrt.', 'zh-hk': '3月' },
  Apr: { en: 'Apr', fr: 'avr.', es: 'abr.', pt: 'abr.', it: 'apr.', ja: '4月', nl: 'apr.', 'zh-hk': '4月' },
  May: { en: 'May', fr: 'mai', es: 'may.', pt: 'mai.', it: 'mag.', ja: '5月', nl: 'mei', 'zh-hk': '5月' },
  Jun: { en: 'Jun', fr: 'juin', es: 'jun.', pt: 'jun.', it: 'giu.', ja: '6月', nl: 'jun.', 'zh-hk': '6月' },
  Jul: { en: 'Jul', fr: 'juil.', es: 'jul.', pt: 'jul.', it: 'lug.', ja: '7月', nl: 'jul.', 'zh-hk': '7月' },
  Aug: { en: 'Aug', fr: 'août', es: 'ago.', pt: 'ago.', it: 'ago.', ja: '8月', nl: 'aug.', 'zh-hk': '8月' },
  Sep: { en: 'Sep', fr: 'sept.', es: 'sep.', pt: 'set.', it: 'set.', ja: '9月', nl: 'sep.', 'zh-hk': '9月' },
  Oct: { en: 'Oct', fr: 'oct.', es: 'oct.', pt: 'out.', it: 'ott.', ja: '10月', nl: 'okt.', 'zh-hk': '10月' },
  Nov: { en: 'Nov', fr: 'nov.', es: 'nov.', pt: 'nov.', it: 'nov.', ja: '11月', nl: 'nov.', 'zh-hk': '11月' },
  Dec: { en: 'Dec', fr: 'déc.', es: 'dic.', pt: 'dez.', it: 'dic.', ja: '12月', nl: 'dec.', 'zh-hk': '12月' },
}

const ALL_YEAR: Record<Locale, string> = {
  en: 'All year',
  fr: 'Toute l\'année',
  es: 'Todo el año',
  pt: 'Todo o ano',
  it: 'Tutto l\'anno',
  ja: '通年',
  nl: 'Het hele jaar',
  'zh-hk': '全年',
}

/** Short month label, e.g. monthLabel('Jan', 'fr') => 'janv.' */
export function monthLabel(mon: string, locale: Locale): string {
  return MONTHS[mon]?.[locale] ?? mon
}

export function formatSeasonDate(value: string, locale: Locale): string {
  if (value === 'All year') return ALL_YEAR[locale]

  const match = value.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!match) return value

  const [, mon, day] = match
  const month = MONTHS[mon]?.[locale] ?? mon

  // English keeps "Mon DD"; the romance locales put the day first.
  if (locale === 'en') return `${month} ${day}`
  if (locale === 'pt') return `${day} de ${month}`
  return `${day} ${month}`
}

/** Render a full season range, e.g. "23 nov. → 4 mai" or "Toute l'année". */
export function formatSeasonRange(start: string, end: string, locale: Locale): string {
  if (start === 'All year' || end === 'All year') return ALL_YEAR[locale]
  return `${formatSeasonDate(start, locale)} → ${formatSeasonDate(end, locale)}`
}
