/**
 * Scrape a handful of real, well-rated hotels for each ski destination using the
 * Google Places API (Places API v1), and download one photo for each.
 *
 * Usage:  node scripts/fetch-hotels.mjs
 * Requires GOOGLE_PLACES_API_KEY in env or .env.local.
 *
 * Output:
 *   data/hotels.json                         keyed by destination slug
 *   public/images/hotels/[dest]-[hotel].jpg  one 800x600 cover photo per hotel
 *
 * Notes:
 *   - We bias the search to lodging and keep only places with a real review base,
 *     then rank by a simple quality score (rating weighted by review volume).
 *   - We do NOT claim ski-in/ski-out per hotel (Places cannot verify that). The
 *     resort page already explains the ski-in/ski-out situation in its own note.
 */
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMG_DIR = path.join(ROOT, 'public', 'images', 'hotels')
const OUT = path.join(ROOT, 'data', 'hotels.json')
const HOTELS_PER_RESORT = 6
const MIN_REVIEWS = 25
// Hotels farther than this from the resort coordinates are dropped: they are
// almost always mis-located results or lodging in a different town, not a
// credible ski stay.
const MAX_DIST_M = 6000

async function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/GOOGLE_PLACES_API_KEY=(.+)/)
  if (m) return m[1].trim()
  throw new Error('GOOGLE_PLACES_API_KEY not set')
}

const PRICE_MAP = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

/** Haversine distance in metres between two lat/lng points. */
function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Replace em/en-dashes coming from Google data with commas (house style: no dashes). */
function cleanDashes(s) {
  // U+2014 (em dash) and U+2013 (en dash), built from escapes so the source
  // file itself stays free of literal dash characters.
  const DASHES = new RegExp('\\s*[\\u2014\\u2013]\\s*', 'g')
  return typeof s === 'string' ? s.replace(DASHES, ', ') : s
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

async function searchHotels(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.formattedAddress,places.location,places.photos',
    },
    body: JSON.stringify({
      textQuery: query,
      includedType: 'lodging',
      maxResultCount: 20,
      languageCode: 'en',
    }),
  })
  if (!res.ok) throw new Error(`searchText HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.places ?? []
}

async function downloadPhoto(photoName, apiKey, outPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo HTTP ${res.status}`)
  const { photoUri } = await res.json()
  const img = await fetch(photoUri)
  const buf = Buffer.from(await img.arrayBuffer())
  await sharp(buf)
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(outPath)
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true })
  const apiKey = await loadApiKey()
  const destinations = JSON.parse(
    await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'),
  )

  const out = {}
  let i = 0
  for (const dest of destinations) {
    i++
    const query = `hotels in ${dest.name}, ${dest.country} ski resort`
    try {
      const raw = await searchHotels(query, apiKey)
      const ranked = raw
        .filter((p) => {
          if (!p.rating || (p.userRatingCount ?? 0) < MIN_REVIEWS) return false
          if (!p.location) return false
          return (
            distanceM(p.location.latitude, p.location.longitude, dest.lat, dest.lng) <=
            MAX_DIST_M
          )
        })
        .sort(
          (a, b) =>
            b.rating * Math.log10((b.userRatingCount ?? 1) + 10) -
            a.rating * Math.log10((a.userRatingCount ?? 1) + 10),
        )
        .slice(0, HOTELS_PER_RESORT)

      const hotels = []
      for (const p of ranked) {
        const name = cleanDashes(p.displayName?.text ?? 'Hotel')
        const hSlug = slugify(name)
        const id = `${dest.slug}-${hSlug}`
        const imgPath = path.join(IMG_DIR, `${id}.jpg`)
        let hasPhoto = existsSync(imgPath)
        if (!hasPhoto && p.photos?.[0]?.name) {
          try {
            await downloadPhoto(p.photos[0].name, apiKey, imgPath)
            hasPhoto = true
            await new Promise((r) => setTimeout(r, 120))
          } catch (e) {
            console.error(`      photo fail ${id}: ${e.message}`)
          }
        }
        const hlat = p.location?.latitude ?? null
        const hlng = p.location?.longitude ?? null
        // Distance to the resort coordinates (village / main lift base) as an
        // indication of how close the hotel is to the slopes. Rounded to 50 m.
        // Dropped when absurdly far (likely a mis-located result in another town).
        let distToSlopes = null
        if (hlat != null && hlng != null) {
          const d = distanceM(hlat, hlng, dest.lat, dest.lng)
          if (d <= MAX_DIST_M) distToSlopes = Math.round(d / 50) * 50
        }
        hotels.push({
          id,
          name,
          slug: hSlug,
          rating: Math.round(p.rating * 10) / 10,
          reviewCount: p.userRatingCount ?? 0,
          priceLevel: p.priceLevel != null ? PRICE_MAP[p.priceLevel] ?? null : null,
          address: p.formattedAddress ?? '',
          lat: hlat,
          lng: hlng,
          distanceToSlopesM: distToSlopes,
          hasPhoto,
        })
      }
      out[dest.slug] = hotels
      console.log(`[${i}/${destinations.length}] ${dest.slug}: ${hotels.length} hotels`)
      await new Promise((r) => setTimeout(r, 200))
    } catch (e) {
      console.error(`[${i}/${destinations.length}] ${dest.slug}: ${e.message}`)
      out[dest.slug] = []
    }
  }

  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf-8')
  const total = Object.values(out).reduce((n, a) => n + a.length, 0)
  console.log(`\nDone: ${total} hotels across ${Object.keys(out).length} resorts`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
