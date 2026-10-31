import sourcesData from '@/data/destinationSources.json'

export interface SourceRef {
  label: string
  url: string
}

const store = sourcesData as Record<string, SourceRef[]>

/**
 * Authoritative, verified sources cited on a resort page (E-E-A-T: facts are
 * sourced, not asserted). Returns null when a resort has no sources yet, so the
 * Sources section simply does not render. Only real, checked URLs belong here.
 */
export function getDestinationSources(slug: string): SourceRef[] | null {
  const s = store[slug]
  return s && s.length > 0 ? s : null
}
