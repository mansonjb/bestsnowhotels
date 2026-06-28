/**
 * Resort hero photo via Apify (replaces the revoked Google Places photo script).
 *
 * For each target resort it searches Google Maps through the Apify actor
 * (compass/crawler-google-places), takes the best landscape image of the
 * resort itself, and writes public/images/destinations/<slug>.jpg at 1600x900,
 * the same size and path as the old heroes, so the site is unchanged.
 *
 * Needs APIFY_TOKEN in .env.local.
 *
 * Usage:
 *   node scripts/fetch-hero-apify.mjs --filter sugarbush
 *   node scripts/fetch-hero-apify.mjs --filter sugarbush,foo   (several)
 *   node scripts/fetch-hero-apify.mjs --missing                (resorts with no hero on disk)
 */
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMG_DIR = path.join(ROOT, 'public', 'images', 'destinations')
const ACTOR = (process.env.APIFY_ACTOR || 'compass~crawler-google-places').replace('/', '~')

const argv = process.argv.slice(2)
const MISSING = argv.includes('--missing')
const filterArg = (() => {
  const i = argv.indexOf('--filter')
  return i >= 0 && argv[i + 1] ? argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null
})()

async function loadToken() {
  if (process.env.APIFY_TOKEN) return process.env.APIFY_TOKEN.trim()
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/APIFY_TOKEN=(.+)/)
  if (m) return m[1].trim()
  throw new Error('APIFY_TOKEN not set (see header).')
}

async function runActor(query, token) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`
  const input = {
    searchStringsArray: [query],
    maxCrawledPlacesPerSearch: 5,
    language: 'en',
    scrapePlaceDetailPage: true, // detail page yields more imageUrls to pick from
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

async function saveHero(slug, query, token) {
  const items = await runActor(query, token)
  // Prefer images from the resort/mountain place itself.
  const imgs = []
  for (const it of items) {
    if (/ski|resort|mountain|mont|berg|glacier/i.test((it.title || '') + ' ' + (it.categoryName || ''))) {
      if (it.imageUrls) imgs.push(...it.imageUrls)
      if (it.imageUrl) imgs.push(it.imageUrl)
    }
  }
  if (!imgs.length) for (const it of items) { if (it.imageUrl) imgs.push(it.imageUrl); if (it.imageUrls) imgs.push(...it.imageUrls) }
  const out = path.join(IMG_DIR, `${slug}.jpg`)
  // Google image URLs come size-capped (e.g. =w408-h272-k-no). Rewrite the
  // suffix to request a large landscape from the same CDN before downloading.
  const upscale = (u) =>
    u.replace(/=w\d+-h\d+[^/]*$/, '=w1600-h1066-k-no').replace(/=s\d+[^/]*$/, '=s1600')
  for (const u of imgs.slice(0, 12)) {
    try {
      const buf = Buffer.from(await (await fetch(upscale(u))).arrayBuffer())
      const meta = await sharp(buf).metadata()
      if ((meta.width || 0) < 800 || (meta.width || 0) < (meta.height || 0)) continue // want a wide landscape
      await sharp(buf).resize(1600, 900, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(out)
      console.log(`${slug}: hero saved (source ${meta.width}x${meta.height})`)
      return true
    } catch { /* try next */ }
  }
  console.error(`! ${slug}: no suitable landscape hero found`)
  return false
}

async function main() {
  const token = await loadToken()
  const destinations = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  let slugs
  if (filterArg) slugs = filterArg
  else if (MISSING) slugs = destinations.filter((d) => !existsSync(path.join(IMG_DIR, `${d.slug}.jpg`))).map((d) => d.slug)
  else { console.log('Pass --filter <slug> or --missing'); return }

  for (const slug of slugs) {
    const d = destinations.find((x) => x.slug === slug)
    if (!d) { console.error(`! ${slug}: not in destinations.json`); continue }
    const query = `${d.name} ${d.region} ${d.country} ski resort`
    try { await saveHero(slug, query, token) }
    catch (e) { console.error(`! ${slug}: ${e.message}`) }
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
