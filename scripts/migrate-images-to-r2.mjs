/**
 * One-off migration: upload every local image (public/images/**) to the
 * Cloudflare R2 bucket, preserving the "images/hotels/..." /
 * "images/destinations/..." key so lib/image-loader.js keeps working once we
 * drop public/images from the repo.
 *
 *   node scripts/migrate-images-to-r2.mjs           # upload only what's missing in R2
 *   node scripts/migrate-images-to-r2.mjs --all     # re-upload everything
 *   node scripts/migrate-images-to-r2.mjs --verify  # just count R2 vs local files
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONCURRENCY = 16;

function env(k) {
  if (process.env[k]) return process.env[k];
  const txt = existsSync(path.join(ROOT, ".env.local"))
    ? readFileSync(path.join(ROOT, ".env.local"), "utf8")
    : "";
  const m = txt.match(new RegExp(`^${k}=(.+)$`, "m"));
  if (!m) throw new Error(`Missing ${k} in env or .env.local`);
  return m[1].trim();
}

const BUCKET = env("R2_BUCKET");
const s3 = new S3Client({
  region: "auto",
  endpoint: env("R2_ENDPOINT"),
  credentials: {
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  },
});

const ALL = process.argv.includes("--all");
const VERIFY = process.argv.includes("--verify");

const IMAGES_DIR = path.join(ROOT, "public", "images");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(IMAGES_DIR); // absolute paths
const keyFor = (f) => "images/" + path.relative(IMAGES_DIR, f).split(path.sep).join("/");

async function countR2() {
  let token,
    n = 0;
  do {
    const r = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "images/", ContinuationToken: token })
    );
    n += r.KeyCount || 0;
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return n;
}

if (VERIFY) {
  console.log(`local files: ${files.length}`);
  console.log(`R2 objects:  ${await countR2()}`);
  process.exit(0);
}

async function existsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function copyOne(f) {
  const key = keyFor(f);
  if (!ALL && (await existsInR2(key))) return "skip";
  const body = readFileSync(f);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: mime.lookup(key) || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return "copied";
}

let copied = 0,
  skipped = 0,
  failed = 0;
const errors = [];
let i = 0;
async function worker() {
  while (i < files.length) {
    const f = files[i++];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await copyOne(f);
        r === "copied" ? copied++ : skipped++;
        break;
      } catch (e) {
        if (attempt === 3) {
          failed++;
          errors.push(`${keyFor(f)}: ${e.message}`);
        } else await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
    const done = copied + skipped + failed;
    if (done % 250 === 0)
      console.log(`  ${done}/${files.length} (copied ${copied}, skipped ${skipped}, failed ${failed})`);
  }
}

console.log(`Uploading ${files.length} images -> R2 (${BUCKET})...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nDONE. copied ${copied}, skipped ${skipped}, failed ${failed}`);
if (errors.length) {
  console.log("First errors:");
  errors.slice(0, 15).forEach((e) => console.log("  " + e));
}
console.log(`R2 now holds ${await countR2()} objects (local expects ${files.length}).`);
