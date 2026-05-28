/**
 * Fetch two distinct extra photos per destination for an editorial gallery
 * (a slopes shot and a village shot). Saved alongside the hero image as
 * [slug]-2.jpg and [slug]-3.jpg, and recorded in data/galleries.json.
 *
 * Distinctness is enforced two ways: candidate photo references are de-duplicated
 * by name, and downloaded images are de-duplicated by SHA-256 of their bytes, so
 * the two gallery images are never the same picture.
 *
 * Usage:  node scripts/fetch-galleries.mjs
 * Requires GOOGLE_PLACES_API_KEY in env or .env.local.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'destinations')
const GAL = path.join(ROOT, 'data', 'galleries.json')
const WANTED = 2

async function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/GOOGLE_PLACES_API_KEY=(.+)/)
  if (m) return m[1].trim()
  throw new Error('GOOGLE_PLACES_API_KEY not set')
}

async function searchPhotos(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.photos',
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'en' }),
  })
  if (!res.ok) throw new Error(`searchText HTTP ${res.status}`)
  const data = await res.json()
  // Flatten photo names from the top few places for more variety.
  const names = []
  for (const place of (data.places ?? []).slice(0, 3)) {
    for (const ph of place.photos ?? []) names.push(ph.name)
  }
  return names
}

async function fetchBytes(photoName, apiKey) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo HTTP ${res.status}`)
  const { photoUri } = await res.json()
  const img = await fetch(photoUri)
  return Buffer.from(await img.arrayBuffer())
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const apiKey = await loadApiKey()
  const destinations = JSON.parse(
    await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'),
  )

  const galleries = {}
  let i = 0
  for (const d of destinations) {
    i++
    // Two angles, interleaved so the slopes and village shots both get a chance.
    const slopes = await searchPhotos(`${d.name} ${d.country} ski slopes winter snow`, apiKey).catch(() => [])
    const village = await searchPhotos(`${d.name} ${d.country} ski village winter snow panorama`, apiKey).catch(() => [])
    const candidates = []
    const seenName = new Set()
    const maxLen = Math.max(slopes.length, village.length)
    for (let k = 0; k < maxLen; k++) {
      for (const arr of [slopes, village]) {
        const nm = arr[k]
        if (nm && !seenName.has(nm)) {
          seenName.add(nm)
          candidates.push(nm)
        }
      }
    }

    const saved = []
    const seenHash = new Set()
    let suffix = 2
    for (const nm of candidates) {
      if (saved.length >= WANTED) break
      try {
        const raw = await fetchBytes(nm, apiKey)
        const out = await sharp(raw)
          .resize(1200, 800, { fit: 'cover', position: 'centre' })
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toBuffer()
        const hash = createHash('sha256').update(out).digest('hex')
        if (seenHash.has(hash)) continue
        seenHash.add(hash)
        const file = `${d.slug}-${suffix}.jpg`
        await writeFile(path.join(OUT_DIR, file), out)
        saved.push(file)
        suffix++
        await new Promise((r) => setTimeout(r, 120))
      } catch (e) {
        console.error(`   ${d.slug} (${nm.slice(-12)}): ${e.message}`)
      }
    }
    galleries[d.slug] = saved
    console.log(`[${i}/${destinations.length}] ${d.slug}: ${saved.length} distinct gallery images`)
    await new Promise((r) => setTimeout(r, 150))
  }

  await writeFile(GAL, JSON.stringify(galleries, null, 2) + '\n', 'utf-8')
  const total = Object.values(galleries).reduce((n, a) => n + a.length, 0)
  console.log(`\nDone: ${total} gallery images across ${Object.keys(galleries).length} resorts`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
