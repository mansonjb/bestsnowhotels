/**
 * Resort hero photo via Apify (replaces the revoked Google Places photo script).
 *
 * For each target resort it searches Google Maps through the Apify actor
 * (compass/crawler-google-places) and writes public/images/destinations/<slug>.jpg
 * at 1600x900. Selection is content-aware:
 *   - it ranks Google places, strongly preferring the ski resort / mountain /
 *     cable-car / viewpoint itself and EXCLUDING shops, ski-rental, ski-school,
 *     restaurants, bars and hotels (whose photos are storefronts and interiors);
 *   - it dedupes against every other resort's hero, so neighbours in one ski area
 *     never share the same photo.
 * Content that a resort's own profile still gets wrong (a summer shot, an indoor
 * cable-car photo) is caught by a separate visual review, not this script.
 *
 * Needs APIFY_TOKEN in .env.local.
 *
 * Usage:
 *   node scripts/fetch-hero-apify.mjs --filter sugarbush[,foo]
 *   node scripts/fetch-hero-apify.mjs --missing        (resorts with no hero on disk)
 */
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import crypto from 'node:crypto'
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

const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex')

// Places whose photos are storefronts, interiors or logos, never a slope.
const BAD = /restaurant|rental|rent a|ski hire|hire|store|shop|sport|school|schule|hotel|hostel|apartment|chalet|lodge|guest|inn|b&b|bar|pub|club|cafe|café|bakery|boutique|museum|pharmacy|market|supermarket|bank|office|spa|wellness|garage|parking/i
// Places that ARE the mountain / slopes / lifts / village view.
const GOOD = /ski resort|ski area|ski station|ski lift|skigebiet|resort|cable car|gondola|funicular|aerial|mountain|glacier|peak|summit|tourist attraction|piste|slope|valley|viewpoint|panorama|village/i

function candidateUrls(items) {
  const scored = items.map((it) => {
    const hay = `${it.title || ''} ${it.categoryName || ''} ${(it.categories || []).join(' ')}`.toLowerCase()
    let score = 0
    if (GOOD.test(hay)) score += 2
    if (BAD.test(hay)) score -= 3
    const imgs = []
    if (it.imageUrl) imgs.push(it.imageUrl) // primary photo first
    if (it.imageUrls) imgs.push(...it.imageUrls)
    return { score, imgs }
  })
  scored.sort((a, b) => b.score - a.score)
  // Everything from acceptable places (score >= 0) first, bad places only as a
  // last resort. Dedupe URLs while preserving order.
  const ordered = [...scored.filter((s) => s.score >= 0), ...scored.filter((s) => s.score < 0)].flatMap((s) => s.imgs)
  return [...new Set(ordered)]
}

async function runActor(query, token) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`
  const input = { searchStringsArray: [query], maxCrawledPlacesPerSearch: 6, language: 'en', scrapePlaceDetailPage: true }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

const upscale = (u) =>
  u.replace(/=w\d+-h\d+[^/]*$/, '=w1600-h1066-k-no').replace(/=s\d+[^/]*$/, '=s1600')

// A rough "winter-ness" score from the mean colour: snow is bright and neutral,
// sky is blue, summer meadows are green. Reward brightness and blue, punish a
// green cast. Lets us prefer a snowy candidate over a resort's summer photo
// without a human looking at every image.
async function winterScore(resized) {
  const st = await sharp(resized).stats()
  const [r, g, b] = st.channels.map((c) => c.mean)
  const brightness = (r + g + b) / 3
  const greenExcess = g - (r + b) / 2
  const blueness = b - r
  return brightness - Math.max(0, greenExcess) * 2.6 + Math.max(0, blueness) * 0.5
}

async function saveHero(slug, query, token, usedHashes) {
  const items = await runActor(query, token)
  const urls = candidateUrls(items)
  const out = path.join(IMG_DIR, `${slug}.jpg`)
  const cands = []
  for (const u of urls.slice(0, 24)) {
    if (cands.length >= 12) break
    try {
      const buf = Buffer.from(await (await fetch(upscale(u))).arrayBuffer())
      const meta = await sharp(buf).metadata()
      // Want a real wide landscape, not a square logo or a portrait.
      if ((meta.width || 0) < 1000 || (meta.width || 0) < (meta.height || 0) * 1.2) continue
      const resized = await sharp(buf).resize(1600, 900, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer()
      const h = md5(resized)
      if (usedHashes.has(h)) continue // identical to another resort's hero, skip
      cands.push({ resized, h, winter: await winterScore(resized) })
    } catch { /* try next candidate */ }
  }
  if (!cands.length) {
    console.error(`! ${slug}: no suitable distinct landscape hero found`)
    return false
  }
  cands.sort((a, b) => b.winter - a.winter) // most wintry first
  const best = cands[0]
  await writeFile(out, best.resized)
  usedHashes.add(best.h)
  console.log(`${slug}: hero saved (winter ${best.winter.toFixed(0)}, of ${cands.length} candidates)`)
  return true
}

async function main() {
  const token = await loadToken()
  const destinations = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  let slugs
  if (filterArg) slugs = filterArg
  else if (MISSING) slugs = destinations.filter((d) => !existsSync(path.join(IMG_DIR, `${d.slug}.jpg`))).map((d) => d.slug)
  else { console.log('Pass --filter <slug> or --missing'); return }

  // Dedupe target: hashes of every existing hero EXCEPT the ones we are redoing,
  // so a re-scrape can reuse its own slot but never clone a neighbour.
  const targetSet = new Set(slugs.map((s) => `${s}.jpg`))
  const usedHashes = new Set()
  for (const f of readdirSync(IMG_DIR)) {
    if (!f.endsWith('.jpg') || f.includes('-') || targetSet.has(f)) continue // skip galleries (-2/-3) and targets
    try { usedHashes.add(md5(readFileSync(path.join(IMG_DIR, f)))) } catch { /* ignore */ }
  }

  for (const slug of slugs) {
    const d = destinations.find((x) => x.slug === slug)
    if (!d) { console.error(`! ${slug}: not in destinations.json`); continue }
    const query = `${d.name} ${d.region} ${d.country} ski resort`
    try { await saveHero(slug, query, token, usedHashes) }
    catch (e) { console.error(`! ${slug}: ${e.message}`) }
  }
}

async function loadToken() {
  if (process.env.APIFY_TOKEN) return process.env.APIFY_TOKEN.trim()
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/APIFY_TOKEN=(.+)/)
  if (m) return m[1].trim()
  throw new Error('APIFY_TOKEN not set (see header).')
}

main().catch((e) => { console.error(e); process.exit(1) })
