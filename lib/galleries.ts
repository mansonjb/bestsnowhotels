import galleriesData from '@/data/galleries.json'

const galleries = galleriesData as Record<string, string[]>

/**
 * Editorial gallery image filenames for a destination (slopes + village shots),
 * stored under public/images/destinations/. Empty array if none were fetched.
 */
export function getGallery(slug: string): string[] {
  return galleries[slug] ?? []
}
