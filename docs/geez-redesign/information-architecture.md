# Information architecture — routes, nav, redirects

**Date:** 2026-09-18  
**Stack convention:** Polylang directory prefixes — EN unprefixed, AM `/am/`, TI `/ti/`  
**Source of truth (machine-readable):**

| File | Role |
|------|------|
| `content/data/shared/routes.json` | Route registry (status, indexability, parents, content refs) |
| `content/data/shared/redirects.json` | Explicit legacy → redesign redirect map |
| `content/data/shared/navigation.json` | Header, footer, breadcrumbs, labels |
| `content/lib/routes.mjs` | Path localization, indexability, breadcrumbs, header builder |

**Policy:** Do not create empty indexable pages. Every redesign route starts as `status: draft` + `indexable: false` (`robots: noindex, nofollow`) until approved content exists and status is flipped to `published` with a passing content gate.

---

## Localization

| Locale | Prefix | Home |
|--------|--------|------|
| `en` | _(none)_ | `/` |
| `am` | `/am` | `/am/` |
| `ti` | `/ti` | `/ti/` |

Helper: `localizePath(locale, path)` → e.g. `localizePath('am', '/services/')` = `/am/services/`.

Each static route exists in all three locales. Template routes (`:slug`) instantiate **only** when that locale has an approved entity (article or case study).

---

## Final route map

Paths below are EN; AM/TI prepend `/am` or `/ti`.

| Route ID | Path | Purpose | Status | Indexable now? |
|----------|------|---------|--------|----------------|
| `home` | `/` | Home | draft | **No** |
| `services` | `/services/` | Services overview | draft | **No** |
| `service-start-a-business` | `/services/start-a-business/` | Start a Business | draft | **No** |
| `service-business-plans-funding` | `/services/business-plans-funding-readiness/` | Business Plans & Funding Readiness | draft | **No** |
| `service-bookkeeping-payroll` | `/services/bookkeeping-payroll/` | Bookkeeping & Payroll | draft | **No** |
| `service-growth-operations` | `/services/growth-operations/` | Growth & Operations | draft | **No** |
| `technology-support` | `/technology-support/` | Technology Support | draft | **No** |
| `client-results` | `/client-results/` | Client Results hub | draft | **No** (also blocked until approved social proof) |
| `case-study` | `/client-results/:slug/` | Individual case study | draft template | **No** until approved slug |
| `resources` | `/resources/` | Resources hub | draft | **No** |
| `article` | `/resources/:slug/` | Individual article | draft template | **No** until approved locale article |
| `about-saba` | `/about-saba/` | About Saba | draft | **No** |
| `book-a-fit-call` | `/book-a-fit-call/` | Book a Fit Call / Contact | draft | **No** |
| `thank-you` | `/thank-you/` | Form confirmation | draft | **Always noindex** |
| `privacy` | `/privacy/` | Privacy | draft | **No** |
| `terms` | `/terms/` | Terms of use | draft | **No** |
| `disclaimers` | `/disclaimers/` | Scope / no-guarantee disclaimers | draft | **No** |

**Alias (not a separate page):** `/contact/` → redirects to `/book-a-fit-call/` (locale-aware).

### Service ID mapping (content model)

| Route | `content/data/shared/services.json` id |
|-------|----------------------------------------|
| Start a Business | `start-strong` |
| Business Plans & Funding Readiness | `plan-funding-readiness` |
| Bookkeeping & Payroll | `books-payroll` |
| Growth & Operations | `grow-with-a-system` |
| Technology Support | `technologyPartner` disclosure + page copy |

---

## Locale matrix (static pages)

| Page | EN | AM | TI |
|------|----|----|----|
| Home | `/` | `/am/` | `/ti/` |
| Services | `/services/` | `/am/services/` | `/ti/services/` |
| Start a Business | `/services/start-a-business/` | `/am/services/start-a-business/` | `/ti/services/start-a-business/` |
| Plans & Funding | `/services/business-plans-funding-readiness/` | `/am/services/business-plans-funding-readiness/` | `/ti/...` |
| Bookkeeping & Payroll | `/services/bookkeeping-payroll/` | `/am/services/bookkeeping-payroll/` | `/ti/...` |
| Growth & Operations | `/services/growth-operations/` | `/am/services/growth-operations/` | `/ti/...` |
| Technology Support | `/technology-support/` | `/am/technology-support/` | `/ti/technology-support/` |
| Client Results | `/client-results/` | `/am/client-results/` | `/ti/client-results/` |
| Resources | `/resources/` | `/am/resources/` | `/ti/resources/` |
| About Saba | `/about-saba/` | `/am/about-saba/` | `/ti/about-saba/` |
| Book a Fit Call | `/book-a-fit-call/` | `/am/book-a-fit-call/` | `/ti/book-a-fit-call/` |
| Thank You | `/thank-you/` | `/am/thank-you/` | `/ti/thank-you/` |
| Privacy | `/privacy/` | `/am/privacy/` | `/ti/privacy/` |
| Terms | `/terms/` | `/am/terms/` | `/ti/terms/` |
| Disclaimers | `/disclaimers/` | `/am/disclaimers/` | `/ti/disclaimers/` |

Article / case-study examples (when approved):

- EN: `/resources/how-to-name-your-business/`
- AM: `/am/resources/how-to-name-your-business/`
- TI: `/ti/resources/how-to-name-your-business/`

---

## Shallow task-based navigation

### Header (essential only)

1. Home  
2. Services → overview (`/services/`); child services linked from that page / footer, **not** the main header  
3. Resources  
4. About Saba  
5. **Primary CTA:** Book a Fit Call  
6. **Language selector:** accessible name, keyboard operable, current language announced; prefers equivalent route in target locale

### Footer

- Services group (overview + four services + Technology Support)  
- Company (About, Client Results, Resources, Book a Fit Call)  
- Legal (Privacy, Terms, Disclaimers)

### Breadcrumbs

- Enabled on all non-home pages  
- Pattern: `Home / Services / Start a Business`  
- `Home / Resources / {Article title}`  
- `Home / Client Results / {Case study title}`  
- Builder: `buildBreadcrumbs()` in `content/lib/routes.mjs`

---

## Publish / indexability checklist

A locale URL may be advertised in nav/sitemap only when **all** are true:

1. Route `status === "published"`  
2. Required `contentRefs` claims pass `isProductionRenderableClaim`  
3. For `client-results`: ≥1 approved testimonial or case study  
4. For `article` / `case-study`: that slug exists and is approved **in that locale**  
5. `thank-you` never indexes  

Until then: WP page unpublished **or** published with `noindex,nofollow` — never an empty indexable shell.

---

## Legacy redirect map (explicit)

Full machine list: `content/data/shared/redirects.json`. Summary:

| From (legacy) | To (redesign) | Code |
|---------------|---------------|------|
| `/blog/`, `/blog` | `/resources/` | 301 |
| `/am/blog/` | `/am/resources/` | 301 |
| `/ti/blog/` | `/ti/resources/` | 301 |
| `/how-to-name-your-business/` | `/resources/how-to-name-your-business/` | 301 |
| `/steps-to-improve-your-credit-and-financial-situation/` | `/resources/steps-to-improve-your-credit-and-financial-situation/` | 301 |
| `/unlocking-the-power-of-partnerships-for-your-small-business/` | `/resources/unlocking-the-power-of-partnerships-for-your-small-business/` | 301 |
| `/am/how-to-name-your-business-2/` (and sibling `-2` posts) | `/am/resources/{normalized-slug}/` | 301 |
| `/ti/how-to-name-your-business-3/` (and sibling `-3` posts) | `/ti/resources/{normalized-slug}/` | 301 |
| `/privacy-policy/` | `/privacy/` | 301 |
| `/contact/` (all locales) | `/{locale}/book-a-fit-call/` | 301 |
| `/#contact` | `/book-a-fit-call/` | 301 (edge/JS as needed) |
| `/#services` | `/services/` | 301 (retain hash until cutover) |
| `/#about` | `/about-saba/` | 301 |
| `/#faq` | passthrough on home until FAQ IA final | 200 |
| `/category/general/` | `/resources/` | 301 |
| `/am/category/uncategorized-am/` | `/am/resources/` | 301 |
| `/ti/category/uncategorized-ti/` | `/ti/resources/` | 301 |
| `/author/admin/` (+ am/ti) | `/about-saba/` (locale) | 301 |

**Rule:** Never remove a listed legacy URL without a redirect. Implement via WordPress Redirection (or Hostinger) using this file as the checklist; do not rely on silent Polylang fallbacks that send AM/TI users to EN.

---

## Cutover notes (WordPress)

1. Create Polylang-translated pages for each static route as **draft**.  
2. Apply Yoast noindex while draft/unapproved.  
3. Load redirect plugin rules from `redirects.json` **before** changing permalinks.  
4. Keep live Elementor home working until redesign home content is approved.  
5. Point header menu at shallow IA; move service children to Services page + footer.

---

## Validation

```bash
npm test
npm run validate
```

Route tests: `tests/routes.test.mjs`.
