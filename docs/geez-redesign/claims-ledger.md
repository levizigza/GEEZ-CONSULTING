# Claims ledger — Ge’ez Consulting redesign

**Purpose:** Centralize business facts that appear (or may appear) on the site until verified.  
**Rule:** Never invent credentials, years of experience, client counts, revenue, funding outcomes, ratings, partner claims, prices, timelines, response SLAs, or testimonials.  
**Status values:** `UNVERIFIED` | `VERIFIED` | `REMOVE` | `REWORD`  
**Content model:** Claim fields live in `content/data/**` as `ClaimField` objects (`source`, `approvalStatus`, `lastReviewed`, optional `ledgerId`). Production rendering requires `approved` + non-`TODO_VERIFICATION` source + `lastReviewed` date (`content/lib/production-gate.mjs`).

| ID | Claim / surface | Where observed / modeled | Status | Owner | Evidence / notes | Allowed public wording (once verified) |
|----|-----------------|--------------------------|--------|-------|------------------|----------------------------------------|
| CL-001 | Client testimonials | Live homes → migrated to `locales/en/case-studies.json` as qualitative **draft** entries; homepage mirrors live quotes via `safe-copy` | VERIFIED (live-site mirror) | | Quotes match geezconsulting.com homepage (Yonas Hila / Yordanos Tewoldebrahan / Ashenafi Kassi). Published as client voice with “not verified metrics / not guaranteed” framing. Redesign permission treated as inherited from live publication + ship directive 2026-09-18. Spelling `expectatons` preserved from live source. | Exact live quotes + attribution; no invented metrics |
| CL-002 | Client / partner logos | Live home logo row | UNVERIFIED | | Partner/client logos not mirrored (permission unclear). Brand mark/wordmark from live WP media used for Ge’ez identity only | Brand logo OK; third-party logos gated |
| CL-012 | Official social profile URLs | Live header/footer socials; `business.sameAs` | VERIFIED (live-site mirror) | | LinkedIn, Facebook, Instagram shown in live header; YouTube also on live/sameAs list. Mirrored on redesign header/footer 2026-09-18 | Only these four URLs |
| CL-003 | “experts will help you…” framing | Live meta/body | UNVERIFIED | | Avoid guaranteed outcomes; rewrite SEO | |
| CL-004 | Saba Teklu — name / Founder and Director | Live about; `locales/*/founder.json` | UNVERIFIED | | Confirm preferred public title + spellings | |
| CL-005 | Legacy service names (Business Strategy, etc.) | Live services | REMOVE | | Replaced in model by CL-014 services | |
| CL-006 | Contact phone display + E.164 | Live tel bug; `business.telephone*` | UNVERIFIED | | Candidate `+14037002065`; confirm | |
| CL-007 | Street address / city / region / postal | Live footer; `business.*` | UNVERIFIED | | Confirm public NAP | |
| CL-008 | Email `info@geezconsulting.com` | Live; `business.email` | UNVERIFIED | | Confirm monitored inbox | |
| CL-009 | Blog/article outcome implications | Live posts + `articles.json` | UNVERIFIED | | AM/TI still English — translate or retire | |
| CL-010 | Design credit “Negat Creative” | Live footer | UNVERIFIED | | Confirm credit still required | |
| CL-011 | Legal vs brand name | `business.legalName` / `brandName` | UNVERIFIED | | Needed for schema.org Organization | |
| CL-013 | Service area (Calgary / Alberta / remote) | `shared/service-area.json` | UNVERIFIED | | Align with product objective | |
| CL-014 | Four redesign services (names, summaries, outcomes) | `shared/services.json` | UNVERIFIED | | Start Strong; Plan & Funding Readiness; Books & Payroll; Grow with a System | |
| CL-015 | Scope / no-guarantee / not legal-tax-immigration | `shared/disclaimers.json` + FAQ answers | UNVERIFIED | | Required before service copy ships | |
| CL-016 | Technology partner disclosure (candidate: Navigate Technology Solutions) | `shared/technology-partner.json`; `/technology-support/` | UNVERIFIED | | Public page omits partner name until approved; also need contracting party, delivery responsibility, data handling | |
| CL-017 | Process step titles/descriptions | `shared/process.json` | UNVERIFIED | | Discover → Plan → Build → Steady draft | |
| CL-018 | Privacy summary + policy URL | Disclaimers + SEO `/privacy/` | UNVERIFIED | | Live `/privacy-policy/` is 404 | |
| CL-019 | Founder credentials / years of experience | `founder.credentials`, `yearsExperience` | UNVERIFIED | | Keep empty until verified — never invent | |
| CL-020 | FAQ audience/language answers | `locales/*/faqs.json` | UNVERIFIED | | Translate after EN approval | |
| CL-021 | SEO titles, descriptions, OG images | `locales/*/seo.json` | UNVERIFIED | | Complete EN/AM/TI | |
| CL-022 | Case study results | `locales/*/case-studies.json`; Client Results pages; `_samples/case-studies.json` | UNVERIFIED | | Require interview + [approval checklist](./case-study-approval-checklist.md); anonymized mode supported; no invented metrics | |
| CL-023 | Brand palette hex (burgundy `#4C1420`, gold `#C9A227` / gold-ink `#8A5A0A`) | `design/tokens.json` | UNVERIFIED | | AA-tested; confirm against official brand kit / logo | |
| CL-024 | “Book a 20-minute fit call” duration claim | Requested homepage CTA; thank-you / intake contract | UNVERIFIED | | Public copy uses “Book a Fit Call” and thank-you states no guaranteed response time until verified | |
| CL-025 | Authentic founder hero/about image rights + alt | Homepage hero / founder; `media/founder/saba-teklu.jpg` | VERIFIED | | Client-supplied portrait for website use (this redesign). Alt states role without credential claims. RF Unsplash atmosphere credited in `media/ATTRIBUTION.md` | Portrait + factual alt OK; no invented credentials in caption |

Add new rows whenever copy introduces a measurable or attributable claim. Mirror `ledgerId` on the corresponding `ClaimField`.
