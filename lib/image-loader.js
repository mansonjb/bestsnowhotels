// Custom next/image loader: rewrites local /images/... paths to the
// Cloudflare R2 public CDN (NEXT_PUBLIC_IMAGE_CDN, custom domain on the
// bestsnowhotels R2 bucket). Bypasses Vercel image optimization entirely
// (the CDN serves the pre-compressed files directly) so public/images can be
// dropped from the deploy. External absolute URLs (Unsplash) pass through
// untouched. Also used directly by components/SafeImage.tsx for its raw
// <img> fallback path, so both must agree on the same rewrite.
function toCdnUrl(src) {
  if (/^https?:\/\//.test(src)) return src;
  // Hardcoded fallback so images keep resolving even if NEXT_PUBLIC_IMAGE_CDN
  // is not set on a build (the domain is public, not a secret). Env var wins.
  const CDN = process.env.NEXT_PUBLIC_IMAGE_CDN || "https://snow.samnogroup.com";
  if (CDN && src.startsWith("/images/")) return `${CDN}${src}`;
  return src;
}

module.exports = function imageLoader({ src, width }) {
  const url = toCdnUrl(src);
  if (url === src) return src;
  // Serve the pre-generated responsive WebP variant nearest the requested width
  // (scripts/gen-webp-variants.mjs uploads -640/-1080/-1600.webp to R2 for every
  // jpg/png original). Mobile gets ~40KB instead of a 228KB full-size JPEG.
  // If a variant is ever missing, SafeImage degrades to the original file.
  if (!/\.(jpe?g|png)$/i.test(url)) return url;
  const w = width <= 640 ? 640 : width <= 1080 ? 1080 : 1600;
  return url.replace(/\.(jpe?g|png)$/i, `-${w}.webp`);
};
module.exports.toCdnUrl = toCdnUrl;
