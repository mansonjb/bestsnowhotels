import hotelsData from '@/data/hotels.json'

export interface Hotel {
  id: string
  name: string
  slug: string
  /** Google rating, 0 to 5. */
  rating: number
  reviewCount: number
  /** 1 (inexpensive) to 4 (very expensive), or null when Google has no price level. */
  priceLevel: number | null
  address: string
  lat: number | null
  lng: number | null
  /** Approx. straight-line distance to the resort centre / lift base, in metres. */
  distanceToSlopesM: number | null
  hasPhoto: boolean
}

const hotels = hotelsData as Record<string, Hotel[]>

export function getHotels(destSlug: string): Hotel[] {
  return hotels[destSlug] ?? []
}
