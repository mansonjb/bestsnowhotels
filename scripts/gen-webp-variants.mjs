// Generate responsive WebP variants for every R2 image and upload them back to
// R2, so next/image (via lib/image-loader.js) can serve a right-sized WebP per
// device width instead of one full-size JPEG for everyone.
//
// For each original images/<path>.<jpg|jpeg|png>, produces:
//   images/<path>-640.webp, images/<path>-1080.webp, images/<path>-1600.webp
// (never upscales beyond the source width). Additive: originals are untouched.
//
// Usage:
//   node scripts/gen-webp-variants.mjs --list         # count originals, no writes
//   node scripts/gen-webp-variants.mjs --one <key>    # process a single key
//   node scripts/gen-webp-variants.mjs --all [--force] # full batch
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// load .env.local
const envFile = readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
const ENV = Object.fromEntries(envFile.split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
const BUCKET = ENV.R2_BUCKET
const WIDTHS = [640, 1080, 1600]
const QUALITY = 74

const s3 = new S3Client({
  region: 'auto',
  endpoint: ENV.R2_ENDPOINT,
  credentials: { accessKeyId: ENV.R2_ACCESS_KEY_ID, secretAccessKey: ENV.R2_SECRET_ACCESS_KEY },
})

const isOriginal = (k) => /\.(jpe?g|png)$/i.test(k) && !/-\d+\.webp$/i.test(k)

async function listOriginals() {
  const out = []
  let token
  do {
    const r = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'images/', ContinuationToken: token }))
    for (const o of r.Contents || []) if (isOriginal(o.Key)) out.push(o.Key)
    token = r.IsTruncated ? r.NextContinuationToken : undefined
  } while (token)
  return out
}

const buf = async (stream) => { const c = []; for await (const x of stream) c.push(x); return Buffer.concat(c) }
const exists = async (key) => { try { await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key })); return true } catch { return false } }

async function processKey(key, force) {
  const base = key.replace(/\.(jpe?g|png)$/i, '')
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const input = await buf(obj.Body)
  const meta = await sharp(input).metadata()
  const srcW = meta.width || 1600
  const made = []
  for (const w of WIDTHS) {
    if (w > srcW && w !== WIDTHS[0]) continue // never upscale (keep at least the smallest)
    const outKey = `${base}-${Math.min(w, srcW)}.webp`
    if (!force && (await exists(outKey))) { made.push(outKey + ' (skip)'); continue }
    const webp = await sharp(input).resize({ width: Math.min(w, srcW), withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: outKey, Body: webp, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))
    made.push(`${outKey} ${Math.round(webp.length / 1024)}KB`)
  }
  return { key, srcW, made }
}

const args = process.argv.slice(2)
if (args.includes('--list')) {
  const o = await listOriginals()
  const byDir = {}
  for (const k of o) { const d = k.split('/').slice(0, 2).join('/'); byDir[d] = (byDir[d] || 0) + 1 }
  console.log('originals:', o.length)
  console.log('by dir:', JSON.stringify(byDir, null, 1))
} else if (args.includes('--one')) {
  const key = args[args.indexOf('--one') + 1]
  console.log(JSON.stringify(await processKey(key, true), null, 1))
} else if (args.includes('--all')) {
  const force = args.includes('--force')
  const all = await listOriginals()
  console.log(`processing ${all.length} originals x up to ${WIDTHS.length} widths...`)
  let done = 0, failed = 0
  const CONC = 6
  for (let i = 0; i < all.length; i += CONC) {
    const slice = all.slice(i, i + CONC)
    await Promise.all(slice.map((k) => processKey(k, force).then(() => { done++ }).catch((e) => { failed++; console.error('ERR', k, e.message) })))
    if (done % 60 === 0 || i + CONC >= all.length) console.log(`  ${done}/${all.length} (failed ${failed})`)
  }
  console.log(`DONE: ${done} ok, ${failed} failed`)
} else {
  console.log('use --list | --one <key> | --all [--force]')
}
