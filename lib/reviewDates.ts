import reviewData from '@/data/reviewDates.json'
import type { Locale } from '@/app/[locale]/dictionaries'

const dates = reviewData as Record<string, string>

// Honest E-E-A-T: a page carries a "last reviewed" date ONLY when it has been
// genuinely editorially reviewed/enriched. No build-time stamping, no faked
// freshness. Add a slug here the day its content is actually reviewed.
const BCP47: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
  nl: 'nl-NL',
  ja: 'ja-JP',
  'zh-hk': 'zh-HK',
}

/** ISO date (YYYY-MM-DD) a resort page was last editorially reviewed, or null. */
export function getReviewDate(slug: string): string | null {
  return dates[slug] ?? null
}

/** Localised long date, e.g. "24 October 2026" / "24 octobre 2026" / "2026年10月24日". */
export function formatReviewDate(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(BCP47[locale] ?? 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso + 'T00:00:00Z'))
  } catch {
    return iso
  }
}
