/**
 * Hotel scraper via Apify (NOT the Google Places API).
 *
 * The Google Places API key was revoked after a surprise bill, so this is the
 * supported path: it runs the Apify "Google Maps Scraper" actor
 * (compass/crawler-google-places) which scrapes Google Maps and is billed
 * through Apify, then writes the SAME data/hotels.json schema and the same
 * 800x600 cover photos as the old scripts, so the site is unchanged.
 *
 * Setup (one-time):
 *   1. Create an Apify account, copy your API token.
 *   2. Add it to .env.local:   APIFY_TOKEN=apify_api_xxx
 *      (optional) override the actor: APIFY_ACTOR=compass~crawler-google-places
 *
 * Usage:
 *   node scripts/fetch-hotels-apify.mjs --filter stubai          one resort
 *   node scripts/fetch-hotels-apify.mjs --filter stubai,kaprun   several
 *   node scripts/fetch-hotels-apify.mjs --missing                all resorts with < 2 hotels
 *   node scripts/fetch-hotels-apify.mjs                          the TARGETS list below
 *   add --dry to preview without writing.
 *
 * Per-resort tuning lives in TARGETS (query / maxDist / minReviews); resorts
 * not listed there fall back to a generic "hotels in <name>, <country>" query.
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
const MIN_RATING = 3.6
const DEFAULT_MAX_DIST = 15000
const DEFAULT_MIN_REVIEWS = 10
const ACTOR = (process.env.APIFY_ACTOR || 'compass~crawler-google-places').replace('/', '~')

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const MISSING = argv.includes('--missing')
const filterArg = (() => {
  const i = argv.indexOf('--filter')
  return i >= 0 && argv[i + 1] ? argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null
})()

// Per-resort config. maxDist reaches the town where people actually stay;
// minReviews stays high enough to stay credible. country is filled per resort.
// Most resorts work with the default locationQuery ("<name>, <country>", which
// the actor geocodes). List here only the ones whose short name geocodes badly
// and need a full search string (query) or wider radius.
const TARGETS = [
  { slug: 'stubai', query: 'hotels Neustift im Stubaital Fulpmes Stubaital Austria', maxDist: 18000, minReviews: 20 },
  { slug: 'saint-lary', query: 'hotels Saint-Lary-Soulan France', maxDist: 12000, minReviews: 12 },
]

async function loadToken() {
  if (process.env.APIFY_TOKEN) return process.env.APIFY_TOKEN.trim()
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/APIFY_TOKEN=(.+)/)
  if (m) return m[1].trim()
  throw new Error('APIFY_TOKEN not set. Add APIFY_TOKEN=apify_api_xxx to .env.local (see header).')
}

const COUNTRY_INDEX = { CH: 1.5, FR: 1.0, IT: 0.9, AT: 1.05, ES: 0.75, AD: 0.75, DE: 1.0, NO: 1.3, SE: 1.15, FI: 1.1, JP: 1.2, US: 1.4, MA: 0.6, DZ: 0.5, LS: 0.7, ZA: 0.7, EG: 0.5, CA: 1.25, KR: 1.0, AU: 1.15, NZ: 1.05, CL: 0.85, AR: 0.8, BG: 0.6 }
const LUXURY_VIBES = ['luxury', 'old-money', 'discreet', 'elegance', 'luxury-iberian', 'royal']
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
function estimatePrice(rating, countryCode, resortLuxury, id) {
  const base = 110
  const idx = COUNTRY_INDEX[countryCode] ?? 1.0
  const luxF = resortLuxury ? 1.5 : 1.0
  const ratingBoost = 1 + Math.max(0, rating - 4.2) * 0.6
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
// Apify price strings look like "$$", "EUR 120 to 200" etc. Count currency
// symbols into a 1 to 4 level when we can; otherwise null.
function priceLevelFrom(price) {
  if (!price || typeof price !== 'string') return null
  const t = price.trim()
  if (/\d/.test(t)) return null // a real price or range (e.g. "$370"), not a $/$$ level
  const sym = (t.match(/[$€£¥]/g) || []).length
  return sym >= 1 && sym <= 4 ? sym : null
}

async function runActor({ searchString, locationQuery }, token) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`
  const input = {
    searchStringsArray: [searchString || 'hotel'],
    maxCrawledPlacesPerSearch: 25,
    language: 'en',
    skipClosedPlaces: true,
    scrapePlaceDetailPage: false,
  }
  // Letting the actor geocode the resort via locationQuery is far more reliable
  // than putting the (often partial) resort name inside the search string.
  if (locationQuery) input.locationQuery = locationQuery
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

// Normalise an Apify Google Maps item to the fields we use. Field names follow
// the compass/crawler-google-places output (title, totalScore, reviewsCount,
// location {lat,lng}, address, price, imageUrls).
function normalize(item) {
  const lat = item.location?.lat ?? item.lat
  const lng = item.location?.lng ?? item.lng
  return {
    name: item.title || item.name,
    rating: typeof item.totalScore === 'number' ? item.totalScore : null,
    reviewCount: item.reviewsCount ?? item.reviewsCountText ?? 0,
    lat, lng,
    address: item.address || item.street || '',
    price: item.price || null,
    imageUrl: (item.imageUrls && item.imageUrls[0]) || item.imageUrl || null,
    categories: [item.categoryName, ...(item.categories || [])].filter(Boolean).map((c) => String(c).toLowerCase()),
  }
}

const LODGING_RE = /hotel|lodge|resort|inn|guest|chalet|apart|b&b|bed|hostel|spa/i
function looksLikeLodging(h) {
  if (h.categories.some((c) => LODGING_RE.test(c))) return true
  return LODGING_RE.test(h.name || '')
}

async function downloadPhoto(imageUrl, outPath) {
  const img = await fetch(imageUrl)
  if (!img.ok) throw new Error(`photo HTTP ${img.status}`)
  const buf = Buffer.from(await img.arrayBuffer())
  await sharp(buf).resize(800, 600, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(outPath)
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true })
  const token = await loadToken()
  const destinations = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  const hotels = JSON.parse(await readFile(OUT, 'utf-8'))

  // Build the work list.
  let work = TARGETS
  if (filterArg) {
    work = filterArg.map((slug) => TARGETS.find((t) => t.slug === slug) || { slug })
  } else if (MISSING) {
    const bySlug = Object.fromEntries(TARGETS.map((t) => [t.slug, t]))
    work = destinations
      .filter((d) => (hotels[d.slug] || []).length < 2)
      .map((d) => bySlug[d.slug] || { slug: d.slug })
    console.log(`--missing: ${work.length} resorts with < 2 hotels`)
  }

  for (const cfg of work) {
    const dest = destinations.find((d) => d.slug === cfg.slug)
    if (!dest) { console.error(`! ${cfg.slug}: not in destinations.json`); continue }
    const country = dest.country
    const maxDist = cfg.maxDist ?? DEFAULT_MAX_DIST
    const minReviews = cfg.minReviews ?? DEFAULT_MIN_REVIEWS
    const resortLuxury = (dest.vibes ?? []).some((v) => LUXURY_VIBES.includes(v))
    const runArgs = cfg.query
      ? { searchString: cfg.query }
      : { searchString: 'hotel', locationQuery: `${dest.name}, ${country}` }
    const queryLabel = cfg.query || `hotel @ ${dest.name}, ${country}`

    let raw
    try { raw = await runActor(runArgs, token) }
    catch (e) { console.error(`! ${cfg.slug}: ${e.message}`); continue }

    const ranked = raw
      .map(normalize)
      .filter((h) => h.rating && h.rating >= MIN_RATING && Number(h.reviewCount) >= minReviews && h.lat && h.lng &&
        looksLikeLodging(h) &&
        distanceM(h.lat, h.lng, dest.lat, dest.lng) <= maxDist)
      .sort((a, b) => b.rating * Math.log10(Number(b.reviewCount) + 10) - a.rating * Math.log10(Number(a.reviewCount) + 10))
      .slice(0, HOTELS_PER_RESORT)

    console.log(`\n${cfg.slug}: ${ranked.length} candidates (was ${(hotels[cfg.slug] || []).length}) via "${queryLabel}"`)
    const out = []
    const seen = new Set()
    for (const h of ranked) {
      const name = cleanDashes(h.name || 'Hotel')
      const hSlug = slugify(name)
      if (!hSlug || seen.has(hSlug)) continue
      seen.add(hSlug)
      const id = `${dest.slug}-${hSlug}`
      const d = distanceM(h.lat, h.lng, dest.lat, dest.lng)
      const rating = Math.round(h.rating * 10) / 10
      console.log(`   ${rating}  ${String(h.reviewCount).padStart(5)} rev  ${(d / 1000).toFixed(1)}km  ${name}`)
      if (DRY) continue
      const imgPath = path.join(IMG_DIR, `${id}.jpg`)
      let hasPhoto = existsSync(imgPath)
      if (!hasPhoto && h.imageUrl) {
        try { await downloadPhoto(h.imageUrl, imgPath); hasPhoto = true; await new Promise((r) => setTimeout(r, 100)) }
        catch (e) { console.error(`      photo fail ${id}: ${e.message}`) }
      }
      out.push({
        id, name, slug: hSlug, rating, reviewCount: Number(h.reviewCount) || 0,
        priceLevel: priceLevelFrom(h.price),
        priceFrom: estimatePrice(rating, dest.countryCode, resortLuxury, id),
        address: h.address || '', lat: h.lat, lng: h.lng,
        distanceToSlopesM: Math.round(d / 50) * 50, hasPhoto,
      })
    }
    if (!DRY && out.length) {
      hotels[cfg.slug] = out
      // Persist after every resort so a long background run never loses work.
      await writeFile(OUT, JSON.stringify(hotels, null, 2) + '\n')
    }
  }

  if (!DRY) { await writeFile(OUT, JSON.stringify(hotels, null, 2) + '\n'); console.log('\nwrote data/hotels.json') }
  else console.log('\n[dry run] nothing written')
}
main().catch((e) => { console.error(e); process.exit(1) })
