import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Season dates are stored in data/destinations.json in a short English form
 * ("Nov 23", "May 4", "Sep 26") or the sentinel "All year". This helper renders
 * them the way a local reader expects: "23 nov." in French, "23 nov." in Spanish,
 * "23 de nov." in Portuguese, "Nov 23" in English, "23 nov." in Italian.
 */
const MONTHS: Record<string, Record<Locale, string>> = {
  Jan: { en: 'Jan', fr: 'janv.', es: 'ene.', pt: 'jan.', it: 'gen.' },
  Feb: { en: 'Feb', fr: 'févr.', es: 'feb.', pt: 'fev.', it: 'feb.' },
  Mar: { en: 'Mar', fr: 'mars', es: 'mar.', pt: 'mar.', it: 'mar.' },
  Apr: { en: 'Apr', fr: 'avr.', es: 'abr.', pt: 'abr.', it: 'apr.' },
  May: { en: 'May', fr: 'mai', es: 'may.', pt: 'mai.', it: 'mag.' },
  Jun: { en: 'Jun', fr: 'juin', es: 'jun.', pt: 'jun.', it: 'giu.' },
  Jul: { en: 'Jul', fr: 'juil.', es: 'jul.', pt: 'jul.', it: 'lug.' },
  Aug: { en: 'Aug', fr: 'août', es: 'ago.', pt: 'ago.', it: 'ago.' },
  Sep: { en: 'Sep', fr: 'sept.', es: 'sep.', pt: 'set.', it: 'set.' },
  Oct: { en: 'Oct', fr: 'oct.', es: 'oct.', pt: 'out.', it: 'ott.' },
  Nov: { en: 'Nov', fr: 'nov.', es: 'nov.', pt: 'nov.', it: 'nov.' },
  Dec: { en: 'Dec', fr: 'déc.', es: 'dic.', pt: 'dez.', it: 'dic.' },
}

const ALL_YEAR: Record<Locale, string> = {
  en: 'All year',
  fr: 'Toute l\'année',
  es: 'Todo el año',
  pt: 'Todo o ano',
  it: 'Tutto l\'anno',
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
