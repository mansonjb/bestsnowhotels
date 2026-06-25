/**
 * Google Search Console CLI (dependency-free).
 *
 * Uses a Google service account to talk to the Search Console API with no npm
 * dependencies: it signs an RS256 JWT with Node's built-in crypto, exchanges it
 * for an access token, then calls the REST endpoints with fetch.
 *
 * One-time setup (see GSC-SETUP.md for the click-by-click version):
 *   1. In Google Cloud, create a project and enable "Google Search Console API".
 *   2. Create a service account, add a JSON key, download it.
 *   3. In Search Console > Settings > Users and permissions, add the service
 *      account's client_email as an Owner (or Full user).
 *   4. Point this script at the key:
 *        export GSC_SERVICE_ACCOUNT=/absolute/path/to/key.json
 *      (or drop it at ./.gsc-service-account.json, which is gitignored)
 *
 * Usage:
 *   node scripts/gsc.mjs status                 list submitted sitemaps + counts
 *   node scripts/gsc.mjs submit-sitemap         (re)submit /sitemap.xml
 *   node scripts/gsc.mjs inspect <url>          index status of one URL
 *   node scripts/gsc.mjs coverage [n]           inspect n priority URLs (default 12)
 *   node scripts/gsc.mjs analytics [days]       top pages + queries (default 28 days)
 *
 * Site is the URL-prefix property by default; override with GSC_SITE_URL, e.g.
 *   export GSC_SITE_URL="sc-domain:bestsnowhotels.com"   # domain property
 */
import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SITE = process.env.GSC_SITE_URL || 'https://www.bestsnowhotels.com/'
const SITEMAP = 'https://www.bestsnowhotels.com/sitemap.xml'

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function loadKey() {
  const envPath = process.env.GSC_SERVICE_ACCOUNT
  const candidates = [
    envPath,
    path.join(ROOT, '.gsc-service-account.json'),
    path.join(ROOT, 'gsc-service-account.json'),
  ].filter(Boolean)
  for (const p of candidates) {
    if (p && existsSync(p)) return JSON.parse(await readFile(p, 'utf-8'))
  }
  throw new Error(
    'No service account key found. Set GSC_SERVICE_ACCOUNT=/path/to/key.json ' +
      'or drop it at ./.gsc-service-account.json (see GSC-SETUP.md).',
  )
}

// Mint an OAuth access token via the JWT-bearer flow. No googleapis dependency.
async function getToken(key) {
  const iat = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters',
      aud: 'https://oauth2.googleapis.com/token',
      iat,
      exp: iat + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = b64url(signer.sign(key.private_key))
  const assertion = `${header}.${claims}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`token error: ${JSON.stringify(json)}`)
  return json.access_token
}

async function api(token, url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text}`)
  return json
}

const enc = (s) => encodeURIComponent(s)
const SC = 'https://searchconsole.googleapis.com'
const WM = `${SC}/webmasters/v3/sites/${enc(SITE)}`

async function cmdStatus(token) {
  const list = await api(token, `${WM}/sitemaps`)
  const maps = list.sitemap || []
  if (!maps.length) {
    console.log('No sitemaps submitted yet. Run: node scripts/gsc.mjs submit-sitemap')
    return
  }
  for (const m of maps) {
    const c = (m.contents || []).reduce((a, x) => a + Number(x.submitted || 0), 0)
    console.log(
      `${m.path}\n  submitted URLs: ${c}  | lastDownloaded: ${m.lastDownloaded || 'never'}  | errors: ${m.errors || 0}  warnings: ${m.warnings || 0}`,
    )
  }
}

async function cmdSubmit(token) {
  await api(token, `${WM}/sitemaps/${enc(SITEMAP)}`, 'PUT')
  console.log(`Submitted ${SITEMAP} for ${SITE}`)
  await cmdStatus(token)
}

async function cmdInspect(token, url) {
  if (!url) throw new Error('usage: node scripts/gsc.mjs inspect <url>')
  const r = await api(token, `${SC}/v1/urlInspection/index:inspect`, 'POST', {
    inspectionUrl: url,
    siteUrl: SITE,
    languageCode: 'en',
  })
  const i = r.inspectionResult?.indexStatusResult || {}
  console.log(url)
  console.log(`  coverage: ${i.coverageState || '?'}`)
  console.log(`  verdict: ${i.verdict || '?'}  | indexing: ${i.indexingState || '?'}`)
  console.log(`  lastCrawl: ${i.lastCrawlTime || 'never'}  | robots: ${i.robotsTxtState || '?'}`)
  if (i.googleCanonical) console.log(`  googleCanonical: ${i.googleCanonical}`)
  if (i.referringUrls?.length) console.log(`  referringUrls: ${i.referringUrls.length}`)
}

// A representative slice of high-value URLs to spot-check indexing health.
async function cmdCoverage(token, n) {
  const dest = JSON.parse(await readFile(path.join(ROOT, 'data', 'destinations.json'), 'utf-8'))
  const top = dest
    .slice()
    .sort((a, b) => (b.snowScore || 0) - (a.snowScore || 0))
    .slice(0, Number(n) || 12)
  const base = 'https://www.bestsnowhotels.com/en'
  const urls = [
    'https://www.bestsnowhotels.com/en',
    `${base}/destinations`,
    ...top.map((d) => `${base}/destinations/${d.slug}`),
  ]
  const tally = {}
  for (const u of urls) {
    try {
      const r = await api(token, `${SC}/v1/urlInspection/index:inspect`, 'POST', {
        inspectionUrl: u,
        siteUrl: SITE,
        languageCode: 'en',
      })
      const state = r.inspectionResult?.indexStatusResult?.coverageState || 'unknown'
      tally[state] = (tally[state] || 0) + 1
      console.log(`${state.padEnd(34)} ${u}`)
    } catch (e) {
      console.log(`ERROR ${u}: ${String(e.message).slice(0, 80)}`)
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  console.log('\nsummary:', JSON.stringify(tally))
}

async function cmdAnalytics(token, days) {
  const d = Number(days) || 28
  const end = new Date()
  const start = new Date(end.getTime() - d * 86400000)
  const iso = (x) => x.toISOString().slice(0, 10)
  for (const dim of ['page', 'query']) {
    const r = await api(token, `${WM}/searchAnalytics/query`, 'POST', {
      startDate: iso(start),
      endDate: iso(end),
      dimensions: [dim],
      rowLimit: 15,
    })
    const rows = r.rows || []
    console.log(`\nTop ${dim}s (last ${d} days):`)
    if (!rows.length) {
      console.log('  (no data yet, this is normal for a young or just-verified property)')
      continue
    }
    for (const row of rows) {
      console.log(
        `  ${String(row.keys[0]).slice(0, 70).padEnd(70)} clicks ${row.clicks}  impr ${row.impressions}  pos ${row.position.toFixed(1)}`,
      )
    }
  }
}

async function main() {
  const [cmd, arg] = process.argv.slice(2)
  if (!cmd || cmd === 'help') {
    console.log(
      'commands: status | submit-sitemap | inspect <url> | coverage [n] | analytics [days]',
    )
    return
  }
  const key = await loadKey()
  const token = await getToken(key)
  console.log(`# site: ${SITE}\n`)
  if (cmd === 'status') return cmdStatus(token)
  if (cmd === 'submit-sitemap') return cmdSubmit(token)
  if (cmd === 'inspect') return cmdInspect(token, arg)
  if (cmd === 'coverage') return cmdCoverage(token, arg)
  if (cmd === 'analytics') return cmdAnalytics(token, arg)
  throw new Error(`unknown command: ${cmd}`)
}

main().catch((e) => {
  console.error(String(e.message || e))
  process.exit(1)
})
