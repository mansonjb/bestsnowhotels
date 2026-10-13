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

// Must match the host of the submitted URLs (they are all www.*). IndexNow
// rejects (422) a submission whose `host` differs from the URLs' host.
const SITE_HOST = 'www.bestsnowhotels.com'
const SITE_URL = `https://${SITE_HOST}`
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
  // Next 16 renders the sitemap route to a static body file at build time.
  // Parse that. NEVER fetch the live sitemap.xml as a fallback: the production
  // WAF 403s automated requests and can ban the origin IP. Run `next build`
  // first if the file is missing.
  const candidates = [
    path.join(ROOT, '.next', 'server', 'app', 'sitemap.xml.body'),
    path.join(ROOT, '.next', 'server', 'app', 'sitemap.xml'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      const xml = await readFile(p, 'utf8')
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
        m[1].replace(/&amp;/g, '&'),
      )
      if (urls.length) return urls
    }
  }
  throw new Error(
    'Built sitemap not found (.next/server/app/sitemap.xml.body). Run `next build` first. ' +
      'Refusing to fetch the live sitemap: the WAF 403s bots and may ban the IP.',
  )
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
  // Accept both `--filter=foo` and `--filter foo` (space-separated, as the
  // usage docstring shows).
  const filterEq = args.find((a) => a.startsWith('--filter='))?.split('=')[1]
  const filterIdx = args.indexOf('--filter')
  const filterSpace = filterIdx >= 0 && filterIdx < args.length - 1 ? args[filterIdx + 1] : undefined
  const filter = filterEq ?? filterSpace
  const onlyNew = args.includes('--new')

  const key = await loadKey()
  console.log(`Using IndexNow key: ${key.slice(0, 6)}...${key.slice(-4)}`)

  let urls = await listSitemapUrls()
  console.log(`Sitemap URLs: ${urls.length}`)

  // Persist the FULL sitemap as the seen set BEFORE filtering; otherwise a
  // run with `--new --filter=compare` would record only compare URLs and the
  // next `--new` (no filter) would re-submit every non-compare URL as "new".
  if (onlyNew) {
    const stateFile = path.join(ROOT, '.next', 'indexnow-state.json')
    let seen = []
    try {
      seen = JSON.parse(await readFile(stateFile, 'utf8'))
    } catch {}
    const seenSet = new Set(seen)
    await mkdir(path.dirname(stateFile), { recursive: true })
    await writeFile(stateFile, JSON.stringify(urls))
    urls = urls.filter((u) => !seenSet.has(u))
    console.log(`New since last run: ${urls.length}`)
  }

  if (filter) {
    urls = urls.filter((u) => u.includes(filter))
    console.log(`Filtered to "${filter}": ${urls.length}`)
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
