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
  // R2 has no on-the-fly resize: width is forwarded only to satisfy
  // next/image's loader contract, otherwise ignored by the CDN.
  return `${url}?w=${width}`;
};
module.exports.toCdnUrl = toCdnUrl;
