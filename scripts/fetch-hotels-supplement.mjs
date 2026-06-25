/**
 * Town-aware hotel top-up for resorts where the main scraper came up thin.
 *
 * The main fetch-hotels.mjs searches within 6 km of the ski base with a 15-review
 * floor. That starves resorts whose lodging is not at the lift base but in a
 * nearby town (exactly what those resorts' own ski-in/ski-out notes say): you
 * stay in Bariloche, Ushuaia, Villa La Angostura, etc., and drive up. This
 * script re-fetches just those resorts with a town-aware query and a wider
 * radius, still measuring the honest distance to the ski base, and merges the
 * results into data/hotels.json (replacing only the targeted slugs).
 *
 * Usage:  node scripts/fetch-hotels-supplement.mjs [--dry]
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
const HOTELS_PER_RESORT = 12
const MIN_RATING = 3.8
const DRY = process.argv.includes('--dry')

// Per-resort top-up config. maxDist is generous enough to reach the town where
// people actually stay; minReviews is relaxed for small/remote places but kept
// high enough to stay credible.
const TARGETS = [
  { slug: 'panorama',       query: 'lodging in Panorama Mountain Village BC',                    maxDist: 9000,  minReviews: 10 },
  { slug: 'silver-star',    query: 'Silver Star Mountain Vernon BC hotels lodge accommodation',   maxDist: 8000,  minReviews: 40 },
  { slug: 'copper-mountain', query: 'Copper Mountain Colorado resort village lodging hotel',       maxDist: 8000,  minReviews: 30 },
  { slug: 'sugarloaf',      query: 'Sugarloaf Maine ski resort village lodging hotel inn',         maxDist: 9000,  minReviews: 20 },
  { slug: 'snowbasin',      query: 'hotels Ogden Utah near Snowbasin',                             maxDist: 35000, minReviews: 200 },
  { slug: 'mt-bachelor',    query: 'hotels Bend Oregon',                                           maxDist: 35000, minReviews: 300 },
  { slug: 'innsbruck',      query: 'hotels Innsbruck Austria old town',                            maxDist: 6000,  minReviews: 150 },
  { slug: 'arapahoe-basin', query: 'hotels Keystone Dillon Silverthorne Colorado',                 maxDist: 24000, minReviews: 80 },
  { slug: 'grand-targhee',  query: 'hotels lodging Driggs Victor Idaho near Grand Targhee',        maxDist: 28000, minReviews: 18 },
  { slug: 'powder-mountain', query: 'hotels lodging Eden Huntsville Ogden Valley Utah',            maxDist: 32000, minReviews: 50 },
  { slug: 'crystal-mountain', query: 'lodging hotels Crystal Mountain Washington Greenwater',      maxDist: 22000, minReviews: 18 },
  { slug: 'cerro-catedral', query: 'hotels San Carlos de Bariloche Argentina',                  maxDist: 26000, minReviews: 30 },
  { slug: 'chapelco',       query: 'hotels San Martin de los Andes Argentina',                  maxDist: 28000, minReviews: 25 },
  { slug: 'cerro-bayo',     query: 'hotels Villa La Angostura Argentina',                       maxDist: 16000, minReviews: 15 },
  { slug: 'cerro-castor',   query: 'hotels Ushuaia Argentina',                                  maxDist: 32000, minReviews: 40 },
]

async function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/GOOGLE_PLACES_API_KEY=(.+)/)
  if (m) return m[1].trim()
  throw new Error('GOOGLE_PLACES_API_KEY not set')
}

const PRICE_MAP = {
  PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4,
}
const COUNTRY_INDEX = { CH: 1.5, FR: 1.0, IT: 0.9, AT: 1.05, ES: 0.75, AD: 0.75, DE: 1.0, NO: 1.3, SE: 1.15, FI: 1.1, JP: 1.2, US: 1.4, MA: 0.6, DZ: 0.5, LS: 0.7, ZA: 0.7, EG: 0.5, CA: 1.25, KR: 1.0, AU: 1.15, NZ: 1.05, CL: 0.85, AR: 0.8 }
const LUXURY_VIBES = ['luxury', 'old-money', 'discreet', 'elegance', 'luxury-iberian', 'royal']
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
function estimatePrice(rating, countryCode, resortLuxury, id) {
  const base = 110
  const idx = COUNTRY_INDEX[countryCode] ?? 1.0
  const luxF = resortLuxury ? 1.5 : 1.0
  const ratingBoost = 1 + Math.max(0, (rating - 4.2)) * 0.6
  const v = 0.85 + (hashStr(id) % 25) / 100
  return Math.round((base * idx * luxF * ratingBoost * v) / 5) * 5
}
function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000, toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
function cleanDashes(s) {
  const DASHES = new RegExp('\\s*[\\u2014\\u2013]\\s*', 'g')
  return typeof s === 'string' ? s.replace(DASHES, ', ') : s
}
function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50)
}
async function searchHotels(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.formattedAddress,places.location,places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
  })
  if (!res.ok) throw new Error(`searchText HTTP ${res.status}: ${await res.text()}`)
  return (await res.json()).places ?? []
}
async function downloadPhoto(photoName, apiKey, outPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo HTTP ${res.status}`)
  const { photoUri } = await res.json()
  const img = await fetch(photoUri)
  const buf = Buffer.from(await img.arrayBuffer())
  await sharp(buf).resize(800, 600, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(outPath)
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true })
  const apiKey = await loadApiKey()
  const destinations = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  const hotels = JSON.parse(await readFile(OUT, 'utf-8'))

  for (const cfg of TARGETS) {
    const dest = destinations.find((d) => d.slug === cfg.slug)
    if (!dest) { console.error(`! ${cfg.slug}: not in destinations.json`); continue }
    const resortLuxury = (dest.vibes ?? []).some((v) => LUXURY_VIBES.includes(v))
    const raw = await searchHotels(cfg.query, apiKey)
    const ranked = raw
      .filter((p) => p.rating >= MIN_RATING && (p.userRatingCount ?? 0) >= cfg.minReviews && p.location &&
        distanceM(p.location.latitude, p.location.longitude, dest.lat, dest.lng) <= cfg.maxDist)
      .sort((a, b) => b.rating * Math.log10((b.userRatingCount ?? 1) + 10) - a.rating * Math.log10((a.userRatingCount ?? 1) + 10))
      .slice(0, HOTELS_PER_RESORT)

    console.log(`\n${cfg.slug}: ${ranked.length} candidates (was ${(hotels[cfg.slug] || []).length})`)
    const out = []
    for (const p of ranked) {
      const name = cleanDashes(p.displayName?.text ?? 'Hotel')
      const hSlug = slugify(name)
      const id = `${dest.slug}-${hSlug}`
      const d = distanceM(p.location.latitude, p.location.longitude, dest.lat, dest.lng)
      const rating = Math.round(p.rating * 10) / 10
      console.log(`   ${rating}  ${String(p.userRatingCount).padStart(5)} rev  ${(d/1000).toFixed(1)}km  ${name}`)
      if (DRY) continue
      const imgPath = path.join(IMG_DIR, `${id}.jpg`)
      let hasPhoto = existsSync(imgPath)
      if (!hasPhoto && p.photos?.[0]?.name) {
        try { await downloadPhoto(p.photos[0].name, apiKey, imgPath); hasPhoto = true; await new Promise((r) => setTimeout(r, 120)) }
        catch (e) { console.error(`      photo fail ${id}: ${e.message}`) }
      }
      out.push({
        id, name, slug: hSlug, rating, reviewCount: p.userRatingCount ?? 0,
        priceLevel: p.priceLevel != null ? PRICE_MAP[p.priceLevel] ?? null : null,
        priceFrom: estimatePrice(rating, dest.countryCode, resortLuxury, id),
        address: p.formattedAddress ?? '', lat: p.location.latitude, lng: p.location.longitude,
        distanceToSlopesM: Math.round(d / 50) * 50, hasPhoto,
      })
    }
    if (!DRY && out.length) hotels[cfg.slug] = out
    await new Promise((r) => setTimeout(r, 200))
  }

  if (!DRY) { await writeFile(OUT, JSON.stringify(hotels, null, 2) + '\n'); console.log('\nwrote data/hotels.json') }
  else console.log('\n[dry run] nothing written')
}
main().catch((e) => { console.error(e); process.exit(1) })
