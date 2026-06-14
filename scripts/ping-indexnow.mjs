/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver) to accelerate indexation.
 *
 * IndexNow is keyless-ish: you generate a random key, host it at the site root
 * (public/<key>.txt containing the key), then POST a list of URLs.
 *
 * Setup (one-time):
 *   1. Pick a random 32-char hex key (UUID v4 without dashes works).
 *   2. Save it to INDEXNOW_KEY env var or .env.local.
 *   3. Create public/<key>.txt with the key as its only content.
 *   4. Deploy (Vercel) so the key file is reachable at https://site.com/<key>.txt
 *   5. Run this script.
 *
 * Usage:
 *   node scripts/ping-indexnow.mjs                  # all sitemap URLs
 *   node scripts/ping-indexnow.mjs --new            # only routes added since last run
 *   node scripts/ping-indexnow.mjs --filter compare # URLs containing "compare"
 *
 * IndexNow uses a max of 10 000 URLs per submission, batched at 100 here.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SITE_HOST = 'bestsnowhotels.com'
const SITE_URL = `https://www.${SITE_HOST}`
const ENDPOINT = 'https://api.indexnow.org/IndexNow'
const BATCH = 100

async function loadKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim()
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const m = env.match(/INDEXNOW_KEY=(.+)/)
  if (m) return m[1].trim()
  throw new Error(
    'INDEXNOW_KEY not set. Generate a 32-char hex key, save it to .env.local as INDEXNOW_KEY=<key>, AND save it to public/<key>.txt.',
  )
}

async function listSitemapUrls() {
  // We import the sitemap module directly via dynamic import so we get the
  // same list Next.js publishes. Requires the Next.js dev build to be compiled.
  const candidates = [
    path.join(ROOT, '.next', 'server', 'app', 'sitemap.js'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const mod = await import(p)
        const fn = mod.default || mod.sitemap || mod
        if (typeof fn === 'function') {
          const out = await fn()
          if (Array.isArray(out)) return out.map((e) => e.url).filter(Boolean)
        }
      } catch (e) {
        console.error('Failed to import sitemap from', p, ':', e.message)
      }
    }
  }
  // Fallback: fetch live sitemap.xml
  const xml = await (await fetch(`${SITE_URL}/sitemap.xml`)).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function pingBatch(urls, key) {
  const body = {
    host: SITE_HOST,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls,
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })
  return { status: res.status, ok: res.ok, body: await res.text() }
}

async function main() {
  const args = process.argv.slice(2)
  const filter = args.find((a) => a.startsWith('--filter='))?.split('=')[1]
  const onlyNew = args.includes('--new')

  const key = await loadKey()
  console.log(`Using IndexNow key: ${key.slice(0, 6)}...${key.slice(-4)}`)

  let urls = await listSitemapUrls()
  console.log(`Sitemap URLs: ${urls.length}`)

  if (filter) {
    urls = urls.filter((u) => u.includes(filter))
    console.log(`Filtered to "${filter}": ${urls.length}`)
  }

  if (onlyNew) {
    const stateFile = path.join(ROOT, '.next', 'indexnow-state.json')
    let seen = []
    try {
      seen = JSON.parse(await readFile(stateFile, 'utf8'))
    } catch {}
    const seenSet = new Set(seen)
    const fresh = urls.filter((u) => !seenSet.has(u))
    console.log(`New since last run: ${fresh.length}`)
    await mkdir(path.dirname(stateFile), { recursive: true })
    await writeFile(stateFile, JSON.stringify(urls))
    urls = fresh
  }

  if (urls.length === 0) {
    console.log('Nothing to submit.')
    return
  }

  let ok = 0
  for (let i = 0; i < urls.length; i += BATCH) {
    const slice = urls.slice(i, i + BATCH)
    const r = await pingBatch(slice, key)
    if (r.ok) ok += slice.length
    console.log(
      `  batch ${i / BATCH + 1}: ${slice.length} URLs -> HTTP ${r.status}${r.body ? ' ' + r.body.slice(0, 80) : ''}`,
    )
    await new Promise((r) => setTimeout(r, 200))
  }
  console.log(`Done: ${ok}/${urls.length} accepted by IndexNow.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
