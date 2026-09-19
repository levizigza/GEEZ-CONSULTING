# Content inventory — live site → redesign model

**Date:** 2026-09-18  
**Sources:** Production https://geezconsulting.com/ (baseline audit) + new `content/` model  
**Disposition:** `keep` | `rewrite` | `verify` | `retire`

Legend: map existing live surfaces into the locale-ready content model. Nothing unverified should ship in production redesign builds (`content/lib/production-gate.mjs`).

---

## Global / NAP / languages

| Existing surface | Live evidence | Model target | Disposition | Notes |
|------------------|---------------|--------------|-------------|-------|
| Brand “Ge'ez Consulting” | Homes EN/AM/TI | `shared/business.json` → `brandName` / `legalName` | verify | Confirm legal name (CL-011) |
| Address 5235 28 Ave SE, Calgary, AB | Footer/contact | `streetAddress`, locality, region | verify | CL-007; add postal if public |
| Email info@geezconsulting.com | Footer/contact | `email` | verify | CL-008 |
| Phone 1(403) 700-2065 | Footer/contact | `telephoneDisplay` + `telephoneE164` | rewrite + verify | Fix bad `tel:+403…` (CL-006) |
| Social LinkedIn/FB/IG/YT | Header/footer | `sameAs` | verify | CL-012 |
| Polylang EN/AM/TI | Switcher + `/am/` `/ti/` | `shared/languages.json` | keep | URL prefixes already correct |
| Design credit Negat Creative | Footer | (optional credit field later) | verify | CL-010 |

---

## Navigation & CTAs

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| EN nav Home/Services/About/FAQ/Blog/Contact | `locales/*/ui.json` nav | rewrite | Rename Blog → Resources in EN model; keep AM/TI observed labels pending review |
| Hash anchors `#services` `#about` `#faq` `#contact` | CTA `href`s | keep (pattern) | Preserve progressive single-page IA unless IA changes approved |
| AM/TI Contact → EN `/#contact` | `locales/am|ti/ctas.json` | rewrite | Must stay in-locale (P0-01) |
| “Reach Out” / Contact / አግኙን | primary/secondary CTAs | rewrite + verify | No SLA claims in labels |
| WPForms Name/Email/Message (EN on all locales) | `ui.form` | rewrite | Full AM/TI form chrome required (P0-04) |

---

## Services

| Existing live services | Redesign model ID | Disposition | Notes |
|------------------------|-------------------|-------------|-------|
| Business Strategy | `start-strong` (partial conceptual overlap) | retire → replace | CL-005 / CL-014 |
| Strategic Advisory | `plan-funding-readiness` / `grow-with-a-system` | retire → replace | Do not invent continuity |
| Operations Consulting | `books-payroll` / `grow-with-a-system` | retire → replace | |
| Enterprise Consulting | `grow-with-a-system` | retire → replace | |
| — | **Start Strong** | verify (new) | `shared/services.json` |
| — | **Plan & Funding Readiness** | verify (new) | |
| — | **Books & Payroll** | verify (new) | |
| — | **Grow with a System** | verify (new) | |

Legacy icon tiles/images (Business-Strategy.png, etc.): **retire** or replace with approved assets.

---

## Process / approach

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| “Our Approach” + EAEL accordion (Need Assessment, Change Management, …) | `shared/process.json` steps | rewrite | New Discover→Plan→Build→Steady draft; verify (CL-017) |
| Tagline “Transforming Visions Into Reality Through Insight” | hero/UI (not yet modeled as claim) | verify | Decide keep vs rewrite in brand pass |

---

## Founder / about

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| Saba Teklu | `locales/*/founder.json` displayName | verify | CL-004 |
| Founder and Director / AM/TI titles | `roleTitle` | verify | |
| About body / expertise copy | `bio`, credentials | rewrite + verify | No invented bio/credentials (CL-019) |
| Profile photo | `photo.src/alt` | verify | Empty alt on live — fix when approved |

---

## Social proof

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| “What Our Clients say” / Testimonial section | `locales/*/testimonials.json` | retire until verified | Production arrays **empty**; samples only in `_samples/` (CL-001) |
| Client/partner logos row | future `logos` or case-study media | verify / retire | CL-002 — permission unknown |
| Case studies | `case-studies.json` | keep structure empty | Samples non-production (CL-022) |

---

## FAQs

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| Live FAQ accordion content | `locales/*/faqs.json` | rewrite + verify | Replace with scoped FAQs incl. no-guarantee answers (CL-015, CL-020) |
| Mixed AM string on TI home | TI FAQ/services copy | rewrite | Baseline P1-12 |

---

## Articles / resources

| Existing URL | Model id | Disposition | Notes |
|--------------|----------|-------------|-------|
| `/how-to-name-your-business/` | `article-how-to-name-your-business` | verify + rewrite | Disclaimer required (CL-009) |
| `/steps-to-improve-your-credit-and-financial-situation/` | `article-credit-financial-situation` | verify + rewrite | Outcome-language risk |
| `/unlocking-the-power-of-partnerships-for-your-small-business/` | `article-partnerships` | verify + rewrite | |
| `/am/...-2/` and `/ti/...-3/` EN bodies | `*-am` / `*-ti` articles | retire or fully translate | P0-02 — not locale-ready |
| `/blog/` only EN | `seo` + future blog index per locale | rewrite | Add `/am/blog/`, `/ti/blog/` (P0-03) |
| Author `/author/admin/` (`geez_admin`) | — | retire from public IA | noindex / display name (P1-11) |

---

## Technology partner disclosure

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| None clear on live home | `shared/technology-partner.json` | verify (new) | All null until confirmed (CL-016) |

---

## Privacy & scope disclaimers

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| `/privacy-policy/` 404 | `disclaimers.privacy*` + `/privacy/` SEO entries | rewrite (create) | P0-06 / CL-018 |
| Implied expertise in meta description | `disclaimers` + new SEO | rewrite | Remove guaranteed-outcome tone (CL-003, CL-015) |
| Blog financial/credit advice tone | article disclaimers | verify | `disclaimerRequired: true` |

---

## SEO & social images

| Existing surface | Model target | Disposition | Notes |
|------------------|--------------|-------------|-------|
| EN home title/description (generic) | `locales/en/seo.json` | rewrite + verify | CL-021 |
| AM/TI empty descriptions; EN titles | `locales/am|ti/seo.json` | rewrite | Complete locale SEO |
| Blog missing hreflang | SEO publish checklist | rewrite | |
| OG image profile PNG | `ogImage` claim fields | verify | Rights + redesign crop |
| Yoast JSON-LD Organization | derived from approved NAP | keep tooling | Only emit approved NAP fields |

---

## Forms & integrations (content-adjacent)

| Existing surface | Disposition | Notes |
|------------------|-------------|-------|
| WPForms 1235 | keep integration; rewrite strings | Map labels from `ui.form` per locale |
| reCAPTCHA config hint / no DOM widget | verify | Spam vs a11y (baseline P1-14) |
| SMTP destination | verify | Not a content field; ops TODO |

---

## Production rendering rule

| Content state | Allowed in production redesign output? |
|---------------|----------------------------------------|
| `approvalStatus: approved` + real `source` + `lastReviewed` | Yes |
| `todo_verification` / `draft` / `pending_review` / `rejected` / `remove` | **No** (gate nulls value) |
| `data/_samples/*` | **Never** (`productionSafe: false`) |
| Empty testimonials/caseStudies arrays | Yes (section omitted) |

---

## Priority backlog (content)

1. Approve NAP + phone E.164 (CL-006–008, CL-011)  
2. Approve four services + scope disclaimers (CL-014–015)  
3. Write/approve EN FAQs + SEO; then AM/TI translations  
4. Retire or translate AM/TI articles; add locale blog indexes  
5. Privacy pages EN/AM/TI  
6. Testimonials/logos only after permission (or keep retired)
