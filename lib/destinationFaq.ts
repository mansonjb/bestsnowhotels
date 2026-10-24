import faqData from '@/data/destinationFaq.json'
import type { Locale } from '@/app/[locale]/dictionaries'

export interface FaqItem {
  q: string
  a: string
}

type FaqStore = Record<string, Partial<Record<Locale, FaqItem[]>>>

const store = faqData as FaqStore

/**
 * Hand-written, per-resort FAQ that replaces the templated dictionary FAQ on
 * resorts we have editorially enriched (spam-update recovery: real, unique
 * answers instead of the same five fill-in-the-blank questions on 455 pages).
 *
 * Returns null when a resort has no custom FAQ, or none for the requested
 * locale, so the page falls back to the templated set and 8-locale parity is
 * never broken.
 */
export function getDestinationFaq(slug: string, locale: Locale): FaqItem[] | null {
  const byLocale = store[slug]
  if (!byLocale) return null
  const items = byLocale[locale]
  return items && items.length > 0 ? items : null
}
