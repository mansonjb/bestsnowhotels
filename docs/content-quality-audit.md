# Content quality audit — bestsnowhotels

_Benchmark of the best-ranking ski-hotel content, and how we close the gap to rank again after the Sept 2026 spam-update demotion. Written 2026-10-24._

## TL;DR, the one strategic insight

The pages that outrank us win on one of two things: **exhaustive structured data** (skiresort.com) or **specific, expert hotel knowledge** (specialist agents, luxury editors). But **almost none of them have real E-E-A-T**: no named author, no visible "last reviewed" date, methodology (if any) buried off-page, affiliate disclosure hidden. That gap is wide open, and it is exactly what Google's helpful-content / E-E-A-T systems reward. Post spam-update, the fastest, most defensible way back is not "more words", it is: **real editorial identity + honest review dates + visible method + hotel-level information gain**, applied to the demand pages.

We already have a data spine (snow score, piste split, altitude, live weather) most editorial competitors lack. We are missing the trust layer and hotel-level depth. Those are cheaper to add than they look, and they compound across every page.

## Who we are up against (3 archetypes)

| Archetype | Example | Wins on | Weakness (our opening) |
|---|---|---|---|
| **Data authority** | skiresort.com | Normalized data across thousands of resorts: piste km split by difficulty %, lift breakdown, elevation, **16 sub-scored test categories**, live open-status + snow depth, 7-day weather, webcams, village distances, season dates, pass prices. Named evaluation method. Multilingual. | No author byline, no explicit "updated" date, boilerplate noise, duplicated copy. Data is impersonal, no hotel-level judgement. |
| **Specialist agent** | alpineanswers.co.uk | Real resort facts (altitude, snow window, history) + **hotel-level sensory/service detail** (spa lists, boot warmers, terrace over the nursery slope). ABTA/ATOL/Trustpilot trust infra. | No author/bio, no date, **no distance-to-lift**, only 3 hotels for a category query, claims unsourced ("highest 5-star in the Alps"), name spelled 3 ways. |
| **Luxury editorial** | theluxurytravelexpert.com | 10 hotels, concrete specifics (room counts, 14,000-bottle cellar), author's **own cross-linked reviews** (real experience), dense internal linking, aged high-authority domain. | No byline on page, **post dated 2022, no "updated"** (stale), no stated method, no price/distance data, affiliate links without visible disclosure, unanswered critical comments. |

Transactional SERP is otherwise owned by aggregators (Booking, Hotels.com, Travelocity, igluski, ski.com). We do not beat them on inventory; we beat them on **judgement + data + honesty** for the research-stage query.

## The quality bar, 5 pillars

### 1. Information gain (unique, verifiable facts a booking page lacks)
- **Best do:** skiresort.com's normalized metrics + 16 sub-scores; editors' per-hotel amenities, room counts, named designers, distance cues.
- **We have:** snow score /100, piste counts by colour, altitude, lifts, season, `snowByMonth`, the `directAnswer` data sentence, `resortFacts` (4 derived facts). Genuinely strong data spine.
- **Gap:** depth is at the **resort** level, thin at the **hotel** level. We show name / rating / price / photo. No amenities, no distance-to-lift, no "who each hotel suits". `data/hotelDetails.json` (stars/amenities) covers only ~10 curated resorts.

### 2. Experience & specificity (E-E-A-T "Experience")
- **Best do:** sensory, firsthand-sounding detail (the "ski-in living room", boot warmers on arrival), named runs/lifts, honest trade-offs.
- **We have:** the St-Moritz pilot prose is specific and honest (3 mountains, Dorf vs Bad, "no green runs, 54/84 red-black", the ski-in/ski-out reality). Right direction.
- **Gap:** still reads as well-researched-general, not lived. No original photography (scraped hotel photos). Few named specifics per hotel.

### 3. Trust & identity (the biggest competitor weakness = our biggest opening)
- **Best do:** mostly **don't**. skiresort.com has a method page + feedback form; agents show ABTA/ATOL. None show a credentialed author or a visible review date.
- **We have:** `/methodology` exists, "Researched by the BestSnowHotels team" line, Organization + WebPage schema (author/publisher = Org), affiliate disclosure page, deliberately **no fake per-page dates**.
- **Gap:** no real editorial identity (who, what expertise), no **honest** "last reviewed" dates on pages we actually review, claims not linked to sources. This is the highest-leverage, most-defensible fix.

### 4. Intent match & comprehensiveness
- **Best do:** cover the whole decision (open status, data, price, access, weather, nearby).
- **We have:** destination page is already comprehensive (data, hotels, snow, map, FAQ, related, plan-your-trip, ski-in/ski-out angle). Our **ski-in/ski-out** framing is a genuine differentiated intent.
- **Gap:** minor. Add decision support: price bands, "which hotel for whom", light comparison.

### 5. Freshness & the live engine
- **Best do:** skiresort.com's live open-status + snow depth + 7-day forecast = reason to return, freshness signal.
- **We have:** the **weather / snow-report engine** is our one asset that still ranks (pos 4-5), converts, and gets cited by AI. `snowByMonth` on every resort.
- **Gap:** surface real review dates; make the weather engine more prominent and cross-linked from money pages. Protect and feed this asset.

## Gap scorecard

| Pillar | The bar | bestsnowhotels today | Priority |
|---|---|---|---|
| 1 Information gain | High (resort + hotel) | Strong resort / **weak hotel** | **High** |
| 2 Experience & specificity | Medium-high | Improving (St-Moritz bar) | Medium |
| 3 Trust & identity | **Low across the board** | Partial, no author/dates | **Highest (cheap, sitewide)** |
| 4 Intent & comprehensiveness | High | Strong | Low |
| 5 Freshness / live engine | High (data leaders) | Strong engine, under-surfaced | Medium |

## Action plan, highest-leverage first

### Wave A — Trust & E-E-A-T layer (sitewide, cheap, competitors weak) — DO FIRST
The one thing every competitor skips and Google rewards. **Honest only, no invented personas or fake dates.**
1. **Real editorial identity**: a proper `/about` + method-forward `/methodology`, "how we research", the team/entity as it truly is, what the snow score measures and its limits. Link it from every page (we already have the "Researched by" line, point it at a real page).
2. **Honest "last reviewed" dates**: stamp a real review date on a page only when we genuinely review/enrich it (St-Moritz = 2026-10-24). Store per-slug in data, render it, add `dateModified` to the `WebPage` schema **only** where real. This replaces the current deliberate no-date with an honest, earned date.
3. **Source the claims**: where prose states a fact (Olympics, UNESCO railway, resort history), link an authoritative source. Information + citations beats unsourced confidence.
4. **Disclosure in view**: keep affiliate disclosure visible near the hotel list, not only in the footer.

### Wave B — Hotel-level information gain (the content gap vs booking pages)
5. Extend `data/hotelDetails.json` beyond the ~10 curated: per hotel, add **distance-to-lift** (get it right where competitors omit it), key **amenities**, star rating, and a one-line **"who it suits"**. This is the specific, verifiable detail that beats generic listings.
6. Add light **decision support** to the hotel block: price band (we already estimate), a "best for families / couples / budget" tag, so the page answers "which one".

### Wave C — Scale the St-Moritz editorial bar, by GSC demand
7. Roll out the deep prose + real per-resort FAQ (the St-Moritz pattern) in **demand-prioritized waves**: Andorra/Grandvalira + ski-in-ski-out FR/IT first. Keep the anti-scaled-content discipline (unique, zero repetition with `directAnswer`/`resortFacts`, honest).
8. **Fix `fetch-hotels-apify.mjs` to merge, not overwrite**, before scaling hotel re-scrapes (St-Moritz lost its 3 palaces to a blind overwrite; see the recovery memo).

### Wave D — Lean on the surviving asset
9. Make the **weather/snow engine** more prominent from money pages and keep it fresh; it is the one thing ranking, converting and getting AI-cited. Deepen it rather than diluting attention across new programmatic pages.

## Applying it per page type

- **`/destinations/[slug]`** (money page): Waves A+B+C. Review date, sourced prose, hotel-level detail, deep editorial, real FAQ. St-Moritz is the template.
- **`/ski-in-ski-out/[country]`** (our differentiated angle): make it the definitive honest answer to "which resorts/hotels are genuinely ski-in/ski-out in X", with the distance data from Wave B as the proof. This is where we can out-specific everyone.
- **`/best/[category]` + `/best-hotels/[slug]`** (hubs): add the method ("how we picked"), review dates, and real comparison. Beats the undated, method-less listicles directly.
- **`/weather/*`** (the asset): protect, surface, deepen.

## What NOT to do
- No new programmatic page families (reinforces the scaled-content signal we are recovering from).
- No invented author personas, no fabricated dates, no borrowed hotel ratings in our schema. Fake E-E-A-T backfires harder than none.
- No mass AI prose across 455×8 at once. Depth by demand, to the St-Moritz bar.

## Sources (SERP teardown, 2026-10-24)
- Data authority: [skiresort.com Grandvalira](https://www.skiresort.com/en/ski-resort/grandvalira-pas-de-la-casa-grau-roig-soldeu-el-tarter-canillo-encamp/)
- Specialist agent: [Alpine Answers, ski-in/ski-out Val Thorens](https://www.alpineanswers.co.uk/ski-in-ski-out-hotels-Val-Thorens)
- Luxury editorial: [The Luxury Travel Expert, best ski hotels in the Alps](https://theluxurytravelexpert.com/2022/10/03/best-ski-hotels-resorts-alps/)
