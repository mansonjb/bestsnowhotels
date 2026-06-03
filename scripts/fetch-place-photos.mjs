/**
 * Fetch hero photos for the 41 ski destinations via Google Places API (Places API v1).
 * Each query targets a photogenic ski-specific landmark (lift, peak, village skyline)
 * so we get snow / mountain content, not summer footage.
 *
 * Usage:  node scripts/fetch-place-photos.mjs
 * Requires GOOGLE_PLACES_API_KEY in env or .env.local.
 *
 * Output: public/images/destinations/[slug].jpg, 1600x900, mozjpeg q85.
 */
import sharp from 'sharp'
import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'destinations')

async function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  const env = await readFile(path.join(ROOT, '.env.local'), 'utf-8').catch(() => '')
  const match = env.match(/GOOGLE_PLACES_API_KEY=(.+)/)
  if (match) return match[1].trim()
  throw new Error('GOOGLE_PLACES_API_KEY not set')
}

// Targeted queries: each picks a ski-iconic landmark to avoid summer-only results.
const TARGETS = [
  { slug: 'val-thorens',          query: 'Val Thorens ski resort French Alps highest village panorama winter snow' },
  { slug: 'val-d-isere',          query: 'Val d\'Isere ski resort Espace Killy Bellevarde panorama winter snow Alps' },
  { slug: 'courchevel',           query: 'Courchevel ski village French Alps winter snow chalets' },
  { slug: 'meribel',              query: 'Meribel ski resort chalets Les 3 Vallees panorama winter snow Alps' },
  { slug: 'chamonix',             query: 'Chamonix Mont Blanc Aiguille du Midi ski resort panorama winter snow Alps' },
  { slug: 'les-arcs',             query: 'Les Arcs 2000 ski resort Paradiski panorama winter snow French Alps' },
  { slug: 'la-plagne',            query: 'La Plagne ski resort Bellecote glacier Paradiski panorama winter snow' },
  { slug: 'tignes',               query: 'Tignes ski resort Grande Motte glacier Espace Killy panorama winter snow' },
  { slug: 'alpe-d-huez',          query: 'Alpe d\'Huez ski resort Sarenne panorama winter snow French Alps' },
  { slug: 'serre-chevalier',      query: 'Serre Chevalier ski resort Briancon panorama winter snow French Alps' },
  { slug: 'zermatt',              query: 'Zermatt Matterhorn ski resort Switzerland panorama winter snow village' },
  { slug: 'verbier',              query: 'Verbier ski resort 4 Vallees Mont Fort Switzerland panorama winter snow' },
  { slug: 'st-moritz',            query: 'St. Moritz ski resort Engadine Corviglia Switzerland panorama winter snow' },
  { slug: 'crans-montana',        query: 'Crans-Montana ski resort plateau Switzerland panorama winter snow Alps' },
  { slug: 'saas-fee',             query: 'Saas-Fee ski resort glacier Switzerland panorama winter snow village' },
  { slug: 'davos',                query: 'Davos ski resort Parsenn Switzerland panorama winter snow village Alps' },
  { slug: 'andermatt',            query: 'Andermatt ski resort Gemsstock Switzerland panorama winter snow Alps' },
  { slug: 'st-anton',             query: 'St. Anton am Arlberg ski resort Austria panorama winter snow village' },
  { slug: 'ischgl',               query: 'Ischgl ski resort Silvretta Arena Austria panorama winter snow' },
  { slug: 'solden',               query: 'Solden ski resort glacier Tiefenbach Austria panorama winter snow' },
  { slug: 'mayrhofen',            query: 'Mayrhofen Zillertal ski resort Austria panorama winter snow village' },
  { slug: 'kitzbuhel',            query: 'Kitzbuhel ski resort Hahnenkamm Austria panorama winter snow village medieval' },
  { slug: 'saalbach',             query: 'Saalbach Hinterglemm Skicircus ski resort Austria panorama winter snow' },
  { slug: 'lech-zurs',            query: 'Lech am Arlberg ski resort Zurs Austria panorama winter snow village' },
  { slug: 'obergurgl',            query: 'Obergurgl Hochgurgl ski resort Otztal Austria panorama winter snow' },
  { slug: 'cortina-d-ampezzo',    query: 'Cortina d\'Ampezzo Dolomites ski resort Tofane Italy panorama winter snow' },
  { slug: 'livigno',              query: 'Livigno ski resort Carosello Mottolino Italy panorama winter snow village' },
  { slug: 'cervinia',             query: 'Cervinia Matterhorn Plateau Rosa ski resort Italy panorama winter snow' },
  { slug: 'madonna-di-campiglio', query: 'Madonna di Campiglio Brenta Dolomites ski resort Italy panorama winter snow' },
  { slug: 'sestriere',            query: 'Sestriere Via Lattea ski resort Italy panorama winter snow village' },
  { slug: 'selva-val-gardena',    query: 'Selva Val Gardena Sellaronda Dolomites ski resort Italy panorama winter snow' },
  { slug: 'baqueira-beret',       query: 'Baqueira Beret ski resort Val d\'Aran Pyrenees Spain panorama winter snow' },
  { slug: 'formigal',             query: 'Formigal ski resort Aragon Pyrenees Spain panorama winter snow' },
  { slug: 'cerler',               query: 'Cerler ski resort Aneto Pyrenees Spain panorama winter snow village' },
  { slug: 'grandvalira',          query: 'Grandvalira Soldeu ski resort Andorra Pyrenees panorama winter snow' },
  { slug: 'vallnord-pal-arinsal', query: 'Vallnord Pal Arinsal ski resort Andorra Pyrenees panorama winter snow' },
  { slug: 'saint-lary',           query: 'Saint-Lary Soulan Pla d\'Adet ski resort Pyrenees France panorama winter snow' },
  { slug: 'peyragudes',           query: 'Peyragudes ski resort Pyrenees France panorama winter snow plateau' },
  { slug: 'font-romeu',           query: 'Font-Romeu ski resort Cerdagne Pyrenees France panorama winter snow' },
  { slug: 'grand-tourmalet',      query: 'La Mongie Tourmalet Bareges ski resort Pyrenees France panorama winter snow' },
  { slug: 'cauterets',            query: 'Cauterets Cirque du Lys ski resort Pyrenees France panorama winter snow' },
  { slug: 'les-menuires',         query: 'Les Menuires ski resort Les 3 Vallees French Alps panorama winter snow' },
  { slug: 'avoriaz',              query: 'Avoriaz ski resort Portes du Soleil French Alps panorama winter snow village' },
  { slug: 'morzine',              query: 'Morzine ski resort Portes du Soleil French Alps panorama winter snow village' },
  { slug: 'les-gets',             query: 'Les Gets ski resort Portes du Soleil French Alps panorama winter snow village' },
  { slug: 'megeve',               query: 'Megeve ski resort Mont Blanc French Alps panorama winter snow village' },
  { slug: 'la-clusaz',            query: 'La Clusaz ski resort Aravis French Alps panorama winter snow village' },
  { slug: 'les-deux-alpes',       query: 'Les Deux Alpes ski resort glacier French Alps panorama winter snow' },
  { slug: 'la-rosiere',           query: 'La Rosiere ski resort Espace San Bernardo French Alps panorama winter snow' },
  { slug: 'flaine',               query: 'Flaine ski resort Grand Massif French Alps panorama winter snow' },
  { slug: 'samoens',              query: 'Samoens ski resort Grand Massif French Alps panorama winter snow village' },
  { slug: 'chatel',               query: 'Chatel ski resort Portes du Soleil French Alps panorama winter snow village' },
  { slug: 'valmorel',             query: 'Valmorel ski resort Grand Domaine French Alps panorama winter snow village' },
  { slug: 'montgenevre',          query: 'Montgenevre ski resort Via Lattea French Alps panorama winter snow' },
  { slug: 'les-saisies',          query: 'Les Saisies ski resort Beaufortain Mont Blanc French Alps panorama winter snow' },
  { slug: 'le-grand-bornand',     query: 'Le Grand-Bornand ski resort Aravis French Alps panorama winter snow village' },
  { slug: 'sainte-foy-tarentaise', query: 'Sainte-Foy-Tarentaise ski resort Tarentaise French Alps freeride panorama winter snow village' },
  { slug: 'val-cenis',            query: 'Val Cenis ski resort Haute-Maurienne French Alps panorama winter snow village' },
  { slug: 'vaujany',              query: 'Vaujany ski village Alpe d\'Huez Grand Domaine Oisans French Alps panorama winter snow' },
  { slug: 'risoul',               query: 'Risoul 1850 ski resort Foret Blanche Hautes-Alpes French Alps panorama winter snow' },
  { slug: 'vars',                 query: 'Vars Les Claux ski resort Foret Blanche Hautes-Alpes French Alps panorama winter snow' },
  { slug: 'pra-loup',             query: 'Pra-Loup ski resort Ubaye Barcelonnette southern French Alps panorama winter snow' },
  { slug: 'isola-2000',           query: 'Isola 2000 ski resort Mercantour Maritime Alps French Alps panorama winter snow' },
  { slug: 'saint-gervais',        query: 'Saint-Gervais Mont-Blanc ski resort Le Bettex French Alps panorama winter snow' },
  { slug: 'ax-3-domaines',        query: 'Ax 3 Domaines ski resort Ax-les-Thermes Ariege Pyrenees panorama winter snow' },
  { slug: 'les-angles',           query: 'Les Angles ski resort Capcir Catalan Pyrenees panorama winter snow village lake' },
  { slug: 'candanchu',            query: 'Candanchu ski resort Somport Aragon Pyrenees Spain panorama winter snow' },
  { slug: 'la-molina',            query: 'La Molina ski resort Cerdanya Catalan Pyrenees Spain panorama winter snow' },
  { slug: 'les-sybelles',         query: 'La Toussuire Les Sybelles ski resort Maurienne French Alps panorama winter snow' },
  { slug: 'valloire',             query: 'Valloire ski resort Galibier Maurienne French Alps panorama winter snow village' },
  { slug: 'orcieres-merlette',    query: 'Orcieres Merlette 1850 ski resort Champsaur southern French Alps panorama winter snow' },
  { slug: 'les-orres',            query: 'Les Orres ski resort Serre-Poncon lake Hautes-Alpes French Alps panorama winter snow' },
  { slug: 'auron',                query: 'Auron ski resort Mercantour Alpes-Maritimes French Alps panorama winter snow village' },
  { slug: 'les-contamines',       query: 'Les Contamines-Montjoie ski resort Mont-Blanc French Alps panorama winter snow village' },
  { slug: 'piau-engaly',          query: 'Piau-Engaly ski resort Hautes-Pyrenees high altitude panorama winter snow' },
  { slug: 'luz-ardiden',          query: 'Luz Ardiden ski resort Hautes-Pyrenees panorama winter snow' },
  { slug: 'gourette',             query: 'Gourette ski resort Aubisque Bearn Pyrenees panorama winter snow' },
  { slug: 'astun',                query: 'Astun ski resort Somport Aragon Pyrenees Spain panorama winter snow' },
  { slug: 'boi-taull',            query: 'Boi Taull ski resort highest Pyrenees Lleida Catalonia Spain panorama winter snow' },
  { slug: 'vallnord-ordino-arcalis', query: 'Ordino Arcalis ski resort Vallnord Andorra Pyrenees freeride panorama winter snow' },
  { slug: 'bonneval-sur-arc',      query: 'Bonneval-sur-Arc village ski resort Haute-Maurienne French Alps stone village winter snow' },
  { slug: 'superdevoluy',         query: 'SuperDevoluy ski resort Devoluy Obiou Hautes-Alpes French Alps panorama winter snow' },
  { slug: 'valberg',              query: 'Valberg ski resort Mercantour Alpes-Maritimes French Alps panorama winter snow village' },
  { slug: 'chamrousse',           query: 'Chamrousse ski resort Belledonne Grenoble French Alps panorama winter snow' },
  { slug: 'combloux',             query: 'Combloux ski resort Mont-Blanc view Evasion French Alps panorama winter snow village' },
  { slug: 'valfrejus',            query: 'Valfrejus ski resort Maurienne Modane Punta Bagna French Alps panorama winter snow' },
  { slug: 'la-pierre-saint-martin', query: 'La Pierre Saint-Martin ski resort Bearn Arette Pyrenees panorama winter snow' },
  { slug: 'guzet',                query: 'Guzet Neige ski resort Ariege Couserans Pyrenees forest winter snow' },
  { slug: 'porte-puymorens',      query: 'Porte-Puymorens ski resort Cerdagne Pyrenees-Orientales winter snow' },
  { slug: 'masella',              query: 'Masella ski resort Alp 2500 Cerdanya Catalan Pyrenees Spain forest winter snow' },
  { slug: 'panticosa',            query: 'Panticosa ski resort Tena valley Aragon Pyrenees Spain panorama winter snow' },
  { slug: 'port-aine',            query: 'Port Aine ski resort Pallars Rialp Catalan Pyrenees Spain forest winter snow' },
  { slug: 'les-7-laux',           query: 'Les 7 Laux ski resort Prapoutel Belledonne Grenoble French Alps panorama winter snow' },
  { slug: 'villard-de-lans',      query: 'Villard-de-Lans ski resort Vercors Cote 2000 French Alps panorama winter snow' },
  { slug: 'saint-francois-longchamp', query: 'Saint-Francois-Longchamp ski resort Col de la Madeleine Grand Domaine French Alps winter snow' },
  { slug: 'aussois',              query: 'Aussois ski resort Haute-Maurienne Vanoise stone village French Alps winter snow' },
  { slug: 'valmeinier',           query: 'Valmeinier 1800 ski resort Galibier-Thabor Maurienne French Alps panorama winter snow' },
  { slug: 'areches-beaufort',     query: 'Areches-Beaufort ski resort Beaufortain Savoie French Alps village winter snow' },
  { slug: 'la-norma',             query: 'La Norma ski resort Haute-Maurienne Modane French Alps panorama winter snow' },
  { slug: 'les-houches',          query: 'Les Houches ski resort Chamonix valley Mont-Blanc Kandahar French Alps winter snow' },
  { slug: 'luchon-superbagneres', query: 'Superbagneres Luchon ski resort cable car Pyrenees grand hotel panorama winter snow' },
  { slug: 'formigueres',          query: 'Formigueres ski resort Capcir Catalan Pyrenees forest winter snow' },
  { slug: 'val-louron',           query: 'Val Louron ski resort Loudenvielle Hautes-Pyrenees winter snow' },
  { slug: 'espot',                query: 'Espot Esqui ski resort Aiguestortes Pallars Catalan Pyrenees Spain winter snow' },
  { slug: 'vallter-2000',         query: 'Vallter 2000 ski resort Setcases Ripolles Catalan Pyrenees Spain glacial cirque winter snow' },
  { slug: 'port-del-comte',       query: 'Port del Comte ski resort Solsona pre-Pyrenees Catalonia Spain panorama winter snow' },
  { slug: 'grindelwald',          query: 'Grindelwald ski resort Eiger north face Jungfrau Switzerland panorama winter snow' },
  { slug: 'wengen',               query: 'Wengen car-free ski village Jungfrau Lauberhorn Switzerland panorama winter snow' },
  { slug: 'murren',               query: 'Murren ski village Schilthorn Piz Gloria cliff Switzerland panorama winter snow' },
  { slug: 'engelberg',            query: 'Engelberg Titlis glacier ski resort freeride Switzerland panorama winter snow' },
  { slug: 'laax',                 query: 'Laax Flims ski resort snowpark freestyle glacier Switzerland panorama winter snow' },
  { slug: 'arosa-lenzerheide',    query: 'Arosa Lenzerheide ski resort Graubunden Switzerland panorama winter snow' },
  { slug: 'nendaz',               query: 'Nendaz ski resort 4 Vallees Mont-Fort Valais Switzerland panorama winter snow' },
  { slug: 'veysonnaz',            query: 'Veysonnaz ski resort Piste de l Ours 4 Vallees Valais Switzerland winter snow' },
  { slug: 'villars-gryon',        query: 'Villars Switzerland ski resort mountains winter snow' },
  { slug: 'les-diablerets',       query: 'Les Diablerets Glacier 3000 ski resort Vaud Switzerland panorama winter snow' },
  { slug: 'adelboden',            query: 'Adelboden ski resort Chuenisbargli Bernese Oberland Switzerland chalet village winter snow' },
  { slug: 'gstaad',               query: 'Gstaad ski resort Saanenland chalet village Switzerland panorama winter snow' },
  { slug: 'champery',             query: 'Champery ski village Dents du Midi Portes du Soleil Switzerland panorama winter snow' },
  { slug: 'grimentz-zinal',       query: 'Grimentz Zinal ski resort Val d Anniviers Weisshorn Valais Switzerland winter snow' },
  { slug: 'obertauern',           query: 'Obertauern ski resort Tauern pass Salzburg Austria snow village winter' },
  { slug: 'schladming',           query: 'Schladming Planai ski resort night slalom Styria Austria winter snow' },
  { slug: 'bad-gastein',          query: 'Bad Gastein Belle Epoque spa town waterfall ski Austria winter snow' },
  { slug: 'bad-hofgastein',       query: 'Bad Hofgastein Schlossalm ski resort Gastein valley Austria winter snow' },
  { slug: 'zell-am-see',          query: 'Zell am See lake Schmittenhohe ski resort Austria winter snow panorama' },
  { slug: 'kaprun',               query: 'Kaprun Kitzsteinhorn glacier ski resort Austria winter snow' },
  { slug: 'hintertux',            query: 'Hintertux glacier ski resort Zillertal Austria winter snow' },
  { slug: 'serfaus-fiss-ladis',   query: 'Serfaus Fiss Ladis ski resort Tyrol Austria plateau winter snow' },
  { slug: 'nauders',              query: 'Nauders Bergkastel ski resort Reschen pass Tyrol Austria winter snow' },
  { slug: 'stubai',               query: 'Stubai Glacier ski resort Tyrol Austria Top of Tyrol winter snow' },
  { slug: 'kuhtai',               query: 'Kuhtai ski resort highest village Tyrol Austria winter snow' },
  { slug: 'soll',                 query: 'Soll SkiWelt Wilder Kaiser ski resort Tyrol Austria village winter snow' },
  { slug: 'alpbach',              query: 'Alpbach village ski resort Tyrol Austria wooden chalets winter snow' },
  { slug: 'fieberbrunn',          query: 'Fieberbrunn ski resort Skicircus freeride Tyrol Austria winter snow' },
  { slug: 'gerlos',               query: 'Gerlos Zillertal Arena ski resort Tyrol Austria winter snow' },
  { slug: 'flachau',              query: 'Flachau Snow Space Salzburg ski resort Austria night slalom winter snow' },
]

async function searchPhoto(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.photos,places.displayName',
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'en' }),
  })
  if (!res.ok) throw new Error(`searchText HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const photo = data.places?.[0]?.photos?.[0]?.name
  if (!photo) throw new Error('No photo in results')
  return photo
}

async function fetchPhotoUri(photoName, apiKey) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1600&skipHttpRedirect=true&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`media HTTP ${res.status}`)
  const data = await res.json()
  return data.photoUri
}

async function downloadAndCompress(uri, outPath) {
  const res = await fetch(uri)
  const buf = Buffer.from(await res.arrayBuffer())
  await sharp(buf)
    .resize(1600, 900, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, progressive: true, mozjpeg: true })
    .toFile(outPath)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const apiKey = await loadApiKey()
  const results = []
  let i = 0
  for (const { slug, query } of TARGETS) {
    i++
    const outPath = path.join(OUT_DIR, `${slug}.jpg`)
    if (existsSync(outPath)) {
      console.log(`[${i}/${TARGETS.length}] ⏩ ${slug}: exists, skip`)
      continue
    }
    try {
      console.log(`[${i}/${TARGETS.length}] 🔍 ${slug}`)
      const photoName = await searchPhoto(query, apiKey)
      const uri = await fetchPhotoUri(photoName, apiKey)
      await downloadAndCompress(uri, outPath)
      const kb = Math.round((await readFile(outPath)).length / 1024)
      console.log(`              ✅ ${slug}.jpg (${kb} KB)`)
      results.push({ slug, ok: true, kb })
      await new Promise((r) => setTimeout(r, 300))
    } catch (e) {
      console.error(`              ❌ ${slug}: ${e.message}`)
      results.push({ slug, ok: false, err: e.message })
    }
  }
  const ok = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok)
  console.log(`\nDone: ${ok}/${results.length} succeeded`)
  if (failed.length) {
    console.log('\nFailed:')
    for (const f of failed) console.log(`  - ${f.slug}: ${f.err}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
