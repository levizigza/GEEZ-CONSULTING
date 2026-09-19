# Local SEO operations — Ge’ez Consulting

Evidence-based local SEO runbook. Aligns with the claims ledger (`CL-006`–`CL-013`, `CL-021`) and production claim gates. Do **not** invent NAP, ratings, or reviews.

## Principles

- Match **Name / Address / Phone (NAP)** across website, Google Business Profile (GBP), and citations — only after verification.
- Prefer clarity over keyword stuffing; one primary H1; unique title + meta description per indexable URL.
- JSON-LD emits only **approved** NAP and **visible** page facts. No `AggregateRating` / `Review` unless policy-eligible, on-page, and evidence-backed (not currently enabled).
- Sitemap lists **indexable** URLs only; drafts/`noindex` stay out. `robots.txt` blocks thank-you confirmation paths.

## Google Business Profile

### Category review

1. Primary category: likely **Business consultant** or **Management consultant** — confirm against how services are marketed (CL-014).
2. Secondary categories: add only if accurate (e.g. bookkeeping service **only** if that is a real offer under CL-014).
3. Re-review categories quarterly or after service catalog changes.
4. Service area: Calgary / Alberta (CL-013) — do not claim nationwide coverage until verified.

### Appointment URL (with UTM)

Use Fit Call as the booking destination (not a third-party scheduler until approved):

```
https://geezconsulting.com/book-a-fit-call/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

Locale variants:

```
https://geezconsulting.com/am/book-a-fit-call/?utm_source=google&utm_medium=organic&utm_campaign=gbp
https://geezconsulting.com/ti/book-a-fit-call/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

Helper: `appointmentUrlWithUtm(locale)` in `content/lib/seo.mjs`.

### Photo workflow

1. Prefer authentic Calgary/office/team photos with rights clearance (CL-025).
2. Every public image needs a **meaningful alt** or is treated as decorative / omitted — never invent alts.
3. Compress for web; set width/height; avoid oversized PNGs for logos.
4. Upload the same approved set to GBP and the site assets folder; document file name + rights date.

## NAP consistency

| Field | Source of truth | Ledger |
| --- | --- | --- |
| Brand / legal name | `content/data/shared/business.json` | CL-011 |
| Street, city, region, postal, country | same | CL-007 |
| Phone display + E.164 | same | CL-006 |
| Email | same | CL-008 |
| sameAs profiles | same | CL-012 |
| Service area | `service-area.json` | CL-013 |

**Rule:** Publish to footer / schema / GBP only when `approvalStatus === approved` with `lastReviewed` date. Live-observed values remain draft until signed off.

## Privacy-safe review requests & responses

- Ask for reviews only after a completed engagement and with client consent.
- Never incentivize reviews in ways that violate Google/policy rules.
- Do **not** add star ratings or review markup to the site unless quotes are approved **and** eligible (see case-study checklist) — current policy: **no Review/AggregateRating JSON-LD**.
- Response template: thank the client, stay factual, no confidential details, invite Fit Call for new work, no outcome guarantees.
- Never paste SIN, banking, or immigration details into public replies.

## Citation & link opportunities (verify before claiming)

| Opportunity | Notes | External verification |
| --- | --- | --- |
| Google Business Profile | Primary local listing | Confirm ownership + NAP |
| Alberta / Calgary business directories | Only accurate categories | Confirm eligibility |
| Community / newcomer org partners | Link only with relationship approval | CL-002 logos/partners |
| LinkedIn company page | Match `sameAs` when approved | CL-012 |
| Chamber / Black business networks | Membership confirmation required | — |
| Guest resources on partner sites | No paid link schemes | — |

Avoid spam directories and automated citation blasts.

## Monthly checks

- [ ] GBP: hours, phone, website/appointment URL, categories, photos
- [ ] Site NAP vs GBP vs citations (diff any drift)
- [ ] Search Console: coverage, sitemap (`/sitemap.xml`), hreflang issues
- [ ] Indexable pages: unique title/description, one H1, self-canonical, OG locale matches `html lang`
- [ ] `npm test` SEO suite; regenerate queue if copy changed (`npm run localize:queue`)
- [ ] Claims ledger: any new public fact gets a row + ClaimField
- [ ] Reviews: respond to new GBP reviews; no fabricated testimonials on-site

## Technical artifacts (this repo)

| Artifact | Path |
| --- | --- |
| SEO helpers | `content/lib/seo.mjs` |
| JSON-LD builders | `content/lib/jsonld.mjs` |
| Sitemap / robots | `content/lib/sitemap.mjs` → `dist/sitemap.xml`, `dist/robots.txt` |
| Automated tests | `tests/seo.test.mjs` |
| Localization QA | `docs/geez-redesign/localization-qa.md` |

## External verification still required

Documented for operators — cannot be completed in CI alone:

1. **GBP ownership** and category accuracy  
2. **NAP approval** (CL-006–008, CL-011) and postal code  
3. **Official social URLs** (CL-012)  
4. **Service area / remote** policy (CL-013)  
5. **Logo / OG image rights** (CL-021 / CL-025)  
6. **Rich Results / Schema Markup Validator** on a staging URL after first publish of indexable pages  
7. **Google Search Console** property + sitemap submit after go-live  
8. **Bing Webmaster** (optional)  

Until routes are `published` with approved content, the generated sitemap is intentionally **empty** (or near-empty) and pages remain `noindex`.
