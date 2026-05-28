/**
 * Fetch two extra photos per destination for an editorial gallery: one of the
 * slopes, one of the village. Saved alongside the hero image as [slug]-2.jpg
 * and [slug]-3.jpg, and recorded in data/galleries.json.
 *
 * Usage:  node scripts/fetch-galleries.mjs
 * Requires GOOGLE_PLACES_API_KEY in env or .env.local.
 */
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'destinations')
const GAL = path.join(ROOT, 'data', 'galleries.json')

async function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/GOOGLE_PLACES_API_KEY=(.+)/)
  if (m) return m[1].trim()
  throw new Error('GOOGLE_PLACES_API_KEY not set')
}

async function searchPhoto(query, apiKey) {
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
  return data.places?.[0]?.photos?.[0]?.name ?? null
}

async function downloadPhoto(photoName, apiKey, outPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo HTTP ${res.status}`)
  const { photoUri } = await res.json()
  const img = await fetch(photoUri)
  const buf = Buffer.from(await img.arrayBuffer())
  await sharp(buf)
    .resize(1200, 800, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(outPath)
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
    const variants = [
      { suffix: '2', query: `${d.name} ${d.country} ski slopes winter snow` },
      { suffix: '3', query: `${d.name} ${d.country} ski village winter snow panorama` },
    ]
    const saved = []
    for (const v of variants) {
      const file = `${d.slug}-${v.suffix}.jpg`
      const outPath = path.join(OUT_DIR, file)
      if (existsSync(outPath)) {
        saved.push(file)
        continue
      }
      try {
        const photoName = await searchPhoto(v.query, apiKey)
        if (!photoName) continue
        await downloadPhoto(photoName, apiKey, outPath)
        saved.push(file)
        await new Promise((r) => setTimeout(r, 150))
      } catch (e) {
        console.error(`   ${file}: ${e.message}`)
      }
    }
    galleries[d.slug] = saved
    console.log(`[${i}/${destinations.length}] ${d.slug}: ${saved.length} gallery images`)
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
