# BestSnowHotels

SEO + affiliate site for ski-in/ski-out hotels across the Alps and Pyrenees. 41 hand-picked ski destinations in France, Switzerland, Austria, Italy, Spain and Andorra. Available in English, French, Spanish and Portuguese.

> The best snow hotels, where the lift starts at your door.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Custom i18n proxy (en/fr/es/pt)
- Stay22 LetMeAllez for affiliate (Booking, Expedia, Hotels.com)
- No DB, destinations live in `data/destinations.json`

## Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Project structure

```
app/
  [locale]/
    layout.tsx           # Locale layout + Stay22 script
    page.tsx             # Home
    destinations/
      page.tsx           # All destinations
      [slug]/page.tsx    # Destination detail with Stay22 map + FAQ
    about/, disclosure/, privacy/
  sitemap.ts             # Dynamic sitemap (4 langs × 41 destinations)
  robots.ts              # Allows AI crawlers (GPTBot, ClaudeBot, etc.)
components/
  Hero.tsx, DestinationCard.tsx, Stay22Map.tsx, SnowScoreBar.tsx
  layout/Header.tsx, layout/Footer.tsx
data/
  destinations.json      # 41 resorts with altitudes, season, intros
dictionaries/
  en.json, fr.json, es.json, pt.json
lib/
  destinations.ts, site.ts
proxy.ts                 # Locale routing (Next.js 16, replaces deprecated middleware.ts)
```

## Affiliate

Stay22 LetMeAllez script is injected globally. Every Booking.com link auto-upgrades to a multi-platform affiliate link comparing Booking, Expedia and Hotels.com prices. The lmaID is `6a172a3725eb5f0f8532400c` and lives in `lib/site.ts`.

## License

Proprietary.
