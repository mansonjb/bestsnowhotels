/**
 * Enrich the hotels of the best-hotels comparison resorts with Google detail
 * data (star rating + amenities), so the comparison pages can show concrete,
 * localisable substance instead of just rating/price. Writes data/hotelDetails.json
 * keyed by hotel id: { stars: number|null, amenities: string[] (canonical slugs) }.
 *
 * One detail search per resort (scrapePlaceDetailPage: true), matched back to the
 * hotels already in data/hotels.json by name + geo. Additive: never touches
 * hotels.json. Usage: node scripts/enrich-hotels-apify.mjs [--filter slug,slug]
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ACTOR = (process.env.APIFY_ACTOR || 'compass~crawler-google-places').replace('/', '~')
// Lower --max reduces detail-scrape load (big resorts like Zermatt otherwise
// time out the 300s sync endpoint).
const MAX = (() => { const i = process.argv.indexOf('--max'); return i >= 0 && process.argv[i + 1] ? Number(process.argv[i + 1]) : 25 })()

// Curated resorts (kept in sync with lib/bestHotels.ts BEST_HOTELS_SLUGS).
const SLUGS = ['courchevel', 'val-thorens', 'val-d-isere', 'chamonix', 'megeve', 'tignes', 'alpe-d-huez', 'zermatt', 'verbier', 'saas-fee']

async function token() {
  if (process.env.APIFY_TOKEN) return process.env.APIFY_TOKEN.trim()
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/APIFY_TOKEN=(.+)/)
  if (m) return m[1].trim()
  throw new Error('APIFY_TOKEN not set')
}

// Google amenity/highlight label -> our canonical slug. Substring match, lower-cased.
const AMENITY_MAP = [
  ['ski-in', 'skiinout'], ['ski in', 'skiinout'], ['ski-out', 'skiinout'],
  ['ski storage', 'skistorage'], ['ski room', 'skistorage'],
  ['spa', 'spa'], ['hot tub', 'hottub'], ['jacuzzi', 'hottub'],
  ['indoor pool', 'pool'], ['outdoor pool', 'pool'], ['swimming pool', 'pool'], ['pool', 'pool'],
  ['fitness', 'fitness'], ['gym', 'fitness'],
  ['restaurant', 'restaurant'], ['bar', 'bar'],
  ['free breakfast', 'breakfast'], ['breakfast', 'breakfast'],
  ['free parking', 'parking'], ['parking', 'parking'],
  ['wi-fi', 'wifi'], ['wifi', 'wifi'],
  ['room service', 'roomservice'],
  ['pet-friendly', 'pets'], ['pets welcome', 'pets'], ['dog', 'pets'],
  ['kid-friendly', 'family'], ['child', 'family'],
  ['airport shuttle', 'shuttle'], ['shuttle', 'shuttle'],
  ['air-condition', 'aircon'],
  ['laundry', 'laundry'],
  ['electric vehicle', 'ev'], ['ev charg', 'ev'],
  ['wheelchair', 'accessible'],
  ['sauna', 'sauna'],
]

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function parseStars(hotelStars) {
  if (!hotelStars) return null
  const m = String(hotelStars).match(/([1-5])\s*-?\s*star/i) || String(hotelStars).match(/^([1-5])$/)
  return m ? Number(m[1]) : null
}

function extractAmenities(item) {
  const found = new Set()
  const info = item.additionalInfo || {}
  for (const group of Object.values(info)) {
    if (!Array.isArray(group)) continue
    for (const entry of group) {
      if (!entry || typeof entry !== 'object') continue
      for (const [label, val] of Object.entries(entry)) {
        if (val !== true) continue
        const ln = label.toLowerCase()
        for (const [needle, slug] of AMENITY_MAP) if (ln.includes(needle)) { found.add(slug); break }
      }
    }
  }
  // Some ski flags live in categories/description too.
  const hay = norm([item.categoryName, ...(item.categories || []), item.description, item.hotelDescription].join(' '))
  if (/\bski in ski out\b|\bski in\b.*\bski out\b/.test(hay)) found.add('skiinout')
  return [...found]
}

function distM(a, b, c, d) {
  const R = 6371000, r = (x) => (x * Math.PI) / 180
  const dLat = r(c - a), dLng = r(d - b)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function runActor(searchString, tok) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${tok}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchStringsArray: [searchString], maxCrawledPlacesPerSearch: MAX, language: 'en', scrapePlaceDetailPage: true, skipClosedPlaces: true }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

async function main() {
  const tok = await token()
  const dests = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  const hotels = JSON.parse(await readFile(path.join(ROOT, 'data', 'hotels.json'), 'utf-8'))
  const outFile = path.join(ROOT, 'data', 'hotelDetails.json')
  const out = JSON.parse(await readFile(outFile, 'utf-8').catch(() => '{}'))

  const filterArg = (() => { const i = process.argv.indexOf('--filter'); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1].split(',') : null })()
  const work = filterArg || SLUGS

  for (const slug of work) {
    const d = dests.find((x) => x.slug === slug)
    const ours = hotels[slug] || []
    if (!d || !ours.length) { console.error(`! ${slug}: skip`); continue }
    let scraped
    try { scraped = await runActor(`hotels ${d.name} ${d.country}`, tok) } catch (e) { console.error(`! ${slug}: ${e.message}`); continue }
    const cand = scraped.map((it) => ({ name: norm(it.title || it.name), lat: it.location?.lat ?? it.lat, lng: it.location?.lng ?? it.lng, stars: parseStars(it.hotelStars), amenities: extractAmenities(it) }))
    let matched = 0
    for (const h of ours) {
      const hn = norm(h.name)
      let best = cand.find((c) => c.name && (c.name === hn || c.name.includes(hn) || hn.includes(c.name)))
      if (!best && h.lat && h.lng) best = cand.filter((c) => c.lat && c.lng).map((c) => ({ c, dd: distM(h.lat, h.lng, c.lat, c.lng) })).filter((x) => x.dd < 250).sort((a, b) => a.dd - b.dd)[0]?.c
      if (best && (best.stars || best.amenities.length)) { out[h.id] = { stars: best.stars, amenities: best.amenities }; matched++ }
    }
    console.log(`${slug}: matched ${matched}/${ours.length} (scraped ${cand.length})`)
    await writeFile(outFile, JSON.stringify(out, null, 2) + '\n')
    await new Promise((r) => setTimeout(r, 300))
  }
  const withStars = Object.values(out).filter((x) => x.stars).length
  console.log(`\nDONE. ${Object.keys(out).length} hotels enriched, ${withStars} with a star rating. wrote data/hotelDetails.json`)
}
main().catch((e) => { console.error(e); process.exit(1) })
