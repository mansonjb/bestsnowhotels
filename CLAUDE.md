# BestSnowHotels — Claude Code project guide

You're working on **bestsnowhotels.com**, a SEO + affiliate site for ski-in/ski-out hotels across the Alps and Pyrenees.

## Stack
- **Next.js 16.2** (App Router) — note breaking changes from Next.js 14/15, check `node_modules/next/dist/docs/` if unsure
- **TypeScript** strict mode
- **Tailwind CSS 4** (no `tailwind.config.js`, uses `@theme` in `app/globals.css`)
- **next-intl**-style locale routing via middleware (custom, no `next-intl` package — see `middleware.ts`)
- **4 languages**: en / fr / es / pt
- **Stay22 LetMeAllez** for affiliate (lmaID `6a172a3725eb5f0f8532400c`)
- **No DB** — 41 destinations in `data/destinations.json`

## Routing
- All pages live under `app/[locale]/...`
- `middleware.ts` redirects bare `/path` to `/en/path` etc.
- Available locales: `en`, `fr`, `es`, `pt` — see `app/[locale]/dictionaries.ts`

## Affiliate
- Stay22 lmaID is in `lib/site.ts` as `STAY22_ID`
- The letmeallez script is injected in `app/[locale]/layout.tsx` (auto-upgrades Booking.com links across the site)
- Maps use `<Stay22Map />` (iframe embed)
- Direct CTAs use `buildAllezDestLink()` from `lib/site.ts`

## Style guide
- Snow / alpine palette in `app/globals.css` — `ice-*` (cold blue) + `alpenglow-*` (warm accent) + `slate-deep` (near-black)
- Generous whitespace, rounded-2xl cards, subtle shadows
- Fonts: Inter (loaded via `next/font/google`)
- Backgrounds: `bg-powder` (off-white), `bg-snow-grain` (subtle texture)

## Adding a destination
1. Add an entry to `data/destinations.json` with the full schema (see `lib/destinations.ts` for the `Destination` type)
2. Provide `intro` in all 4 languages
3. Rebuild — pages, sitemap and OG images regenerate automatically

## SEO
- Every page has `generateMetadata` with hreflang to all 4 locales
- JSON-LD on home (`WebSite`), destinations index (`ItemList`), destination detail (`TouristAttraction` + `BreadcrumbList` + `FAQPage`)
- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- `/llms.txt` lists priority pages for AI crawlers

## DO NOT
- Do not introduce a database — keep `data/destinations.json` as source of truth
- Do not add tracking pixels other than what's in the locale layout
- Do not break the 4-locale parity (every page must exist in en/fr/es/pt or fall back gracefully)
