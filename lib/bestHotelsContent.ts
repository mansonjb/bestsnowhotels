import content from '@/data/bestHotelsContent.json'
import type { Locale } from '@/app/[locale]/dictionaries'

/** Long-form editorial copy for the best-hotels comparison pages, written per
 *  resort from the real hotel data (see scripts + scratchpad content-*.json). */
export interface ResortContent {
  intro: Record<Locale, string>
  hotels: Record<string, Record<Locale, string>>
}

const DB = content as Record<string, ResortContent>

const paras = (t: string | undefined): string[] =>
  t ? t.split(/\n\n+/).map((s) => s.trim()).filter(Boolean) : []

/** The resort intro, split into paragraphs (empty if not written yet). */
export function introParagraphs(slug: string, l: Locale): string[] {
  return paras(DB[slug]?.intro?.[l])
}

/** The in-depth "why book this one" block for a hotel, split into paragraphs. */
export function hotelProse(slug: string, hotelId: string, l: Locale): string[] {
  return paras(DB[slug]?.hotels?.[hotelId]?.[l])
}
