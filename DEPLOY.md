# Deploy BestSnowHotels → Vercel + DNS

Step-by-step deployment. Should take about 10 minutes end-to-end, then ~30 minutes for DNS to propagate.

---

## 1. Buy the domain (skip if already done)

Recommended registrar: **Cloudflare Registrar** (no markup, free WHOIS privacy) or **Namecheap**.

Domain: `bestsnowhotels.com`.

If you don't own it yet, buy it now — the next steps assume you do.

---

## 2. Connect the GitHub repo to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Authorise the GitHub app on your account if asked
4. Find `mansonjb/bestsnowhotels` in the list → **Import**

## 3. Configure the project

Vercel auto-detects Next.js. The defaults are right, but verify:

| Field | Value |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` (default — `next build` works too) |
| **Output Directory** | `.next` (default, do NOT change) |
| **Install Command** | `npm install` |
| **Node.js Version** | 22.x |

### Environment variables

Open the **Environment Variables** dropdown and add:

```
GOOGLE_PLACES_API_KEY = AIzaSyCHpcUJIIyFUvDdC4QAm7UXpJy3DDklcFU
```

(Only needed if you want to re-run the photo fetch script in CI later. The site itself ships static images, so this is not strictly required for the build.)

Click **Deploy**. First build takes 2-3 minutes.

After it finishes, Vercel gives you a URL like `bestsnowhotels-xxx.vercel.app`. Open it to verify the site works. ✅

---

## 4. Attach the custom domain

1. In the Vercel project, go to **Settings → Domains**
2. Enter `bestsnowhotels.com` → **Add**
3. Vercel will also offer to add `www.bestsnowhotels.com` — accept it (with the apex redirecting to `www` or vice versa, your call; recommendation = redirect apex → www)
4. Vercel now shows you DNS records to add at your registrar. They look like this:

### Records to create

For the apex (`bestsnowhotels.com`):

| Type | Name | Value | TTL |
|---|---|---|---|
| **A** | `@` (or empty) | `76.76.21.21` | Auto / 3600 |

For `www`:

| Type | Name | Value | TTL |
|---|---|---|---|
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto / 3600 |

> Vercel's exact instructions can shift over time. Always use the values Vercel shows you in the dashboard — they're the source of truth. The values above are what they show as of 2026.

---

## 5. Add records at your registrar

### If you bought from Cloudflare

1. Cloudflare Dashboard → select the domain
2. Sidebar → **DNS → Records**
3. Click **+ Add record**
4. Add the A record from step 4 (Proxy status: **DNS only**, grey cloud — important, Vercel needs direct DNS for SSL)
5. Add the CNAME record (same: **DNS only**)

### If you bought from Namecheap

1. Namecheap Dashboard → Domain List → **Manage** next to `bestsnowhotels.com`
2. Tab **Advanced DNS**
3. **Add New Record** for each entry from step 4
4. Save. Namecheap propagation can take up to 30 min

### If you bought elsewhere (GoDaddy, OVH, Gandi, etc.)

Same idea: find the DNS management section, add the A and CNAME records exactly as Vercel showed.

---

## 6. Wait for propagation + SSL

- Vercel checks the DNS every minute. When it sees your records, it provisions a Let's Encrypt SSL cert automatically. Usually 5-15 minutes after the records are in.
- You can check propagation manually: `dig bestsnowhotels.com` should return `76.76.21.21`.
- Once Vercel marks the domain as **Valid** with the green checkmark, open https://bestsnowhotels.com — it should serve the site under HTTPS.

---

## 7. Verify the live site

Check these URLs:

- https://bestsnowhotels.com (should redirect to `/en` or your default locale)
- https://bestsnowhotels.com/en/destinations
- https://bestsnowhotels.com/en/destinations/val-thorens
- https://bestsnowhotels.com/en/countries/france
- https://bestsnowhotels.com/fr (French homepage)
- https://bestsnowhotels.com/robots.txt
- https://bestsnowhotels.com/sitemap.xml

Quick sanity checks:

- [ ] All 4 locales render (en/fr/es/pt switcher in header)
- [ ] Destination page Stay22 map iframe loads with hotels
- [ ] Booking links redirect through Stay22 (URL should contain `stay22.com` for a flash before reaching Booking)
- [ ] Filters on `/destinations` work and update count live
- [ ] OG image renders (paste any URL into Twitter, LinkedIn or X to test)

---

## 8. Post-deploy SEO

Once live:

1. **Submit sitemap** to Google Search Console: https://search.google.com/search-console → Add property → `bestsnowhotels.com` → after verification, **Sitemaps → Add new sitemap** → `sitemap.xml`
2. **Submit to Bing Webmaster Tools**: https://www.bing.com/webmasters → import from Google Search Console
3. **IndexNow ping** (instant indexing on Bing + Yandex): you can run `curl "https://api.indexnow.org/indexnow?url=https://bestsnowhotels.com&key=YOUR_INDEXNOW_KEY"` once a key file is published in `/public`

---

## Troubleshooting

| Symptom | Likely cause / Fix |
|---|---|
| Vercel build fails with "Module not found" | Run `npm install` locally first to update `package-lock.json`, commit and push |
| Site loads but images are missing | The `public/images/destinations/*.jpg` weren't committed. Run `git add public/images/destinations && git commit -m "add images" && git push` |
| `/robots.txt` shows 404 | The custom route handler is fine; Vercel sometimes caches. Wait 60s or trigger a redeploy |
| Stay22 map shows "no results" | Lat/lng might be slightly off; the resort area has no hotel inventory at that exact point. Either widen the zoom, or move lat/lng to the village center |
| `bestsnowhotels.com` resolves but shows "DEPLOYMENT_NOT_FOUND" | The A record value is wrong. Re-check what Vercel shows in Domains panel |
