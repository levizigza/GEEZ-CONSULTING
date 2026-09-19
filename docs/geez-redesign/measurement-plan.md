# Measurement plan — Ge’ez redesign

**Status:** Engineering plan for the **first-party** `GeezAnalytics` layer already approved in this repository (`content/lib/privacy.mjs` sanitizers + `consent.js` analytics category).  
**Do not add** Google Analytics, GTM, Meta Pixel, Plausible, Matomo, Hotjar, or other vendors without an explicit product + privacy approval.  
**Do not claim conversion improvement** until a documented post-launch baseline period has elapsed and field data supports the claim.

Related: `privacy-review.md`, `intake-data-flow.md`, `content/lib/measurement.mjs`, `site/privacy/analytics.js`.

---

## Platform

| Item | Choice |
| --- | --- |
| Platform | First-party `GeezAnalytics` (consent-gated `analytics.js`) |
| Consent | Opt-in via `GeezConsent` / `data-geez-consent="analytics"` |
| Sink | `POST` / `sendBeacon` to `/api/analytics/` (host must implement; payloads fail closed on PII) |
| Debug | `?geez_debug_analytics=1` or `localStorage.geez_analytics_debug=1` → console + in-memory log |
| Test hook | `window.__GEEZ_ANALYTICS_TRANSPORT__` |

Anonymous session id (`geez_measure_sid_v1`) is stored only after analytics consent activates the script. No names, emails, phones, free-text messages, or financial details in any event.

---

## Event definitions

Shared envelope (`schema_version: 1.0.0`):

| Field | Description |
| --- | --- |
| `event` | Typed name (below) |
| `ts` | ISO-8601 |
| `page.path` | Pathname only (no query) |
| `page.page_type` | Allowlisted type |
| `locale` | `en` \| `am` \| `ti` |
| `service` | Service id code or null |
| `cta_location` | Allowlisted CTA token or null |
| `session.sid` | Anonymous id (consent only) |
| `attribution` | `utm_*` + `referrer_host` (host only) |
| `props` | Allowlisted categorical codes only |

| Event | When | Key props / notes | Owner |
| --- | --- | --- | --- |
| `service_page_view` | Service detail load (once/path) | `service` | Eng |
| `article_view` | Article load (once/path) | `article_slug` | Eng / Content |
| `case_study_view` | Case study load (once/path) | `case_study_slug` | Eng / Content |
| `language_select` | Lang nav click | `from_locale`, `to_locale` | Eng |
| `service_finder_start` | First focus in finder | once/page | Eng |
| `service_finder_complete` | Successful recommendation | `recommended_service`, stage/goal codes | Eng |
| `cta_click` | `a[data-geez-cta]` | `cta_location` | Eng |
| `fit_form_start` | First focus on Fit Call form | once/page | Eng |
| `fit_form_submit` | Successful submit (before redirect) | `help_category`, `business_stage`, `submit_ok` — **never** name/email/phone/goal text | Eng |
| `booking_complete` | Thank-you page view | once/session path | Eng |
| `phone_click` | `a[href^="tel:"]` | **No number in payload** | Eng |
| `outbound_partner_click` | `a[data-geez-outbound="partner"]` | `partner_id`, `outbound_host` | Eng |

Duplicate prevention: sessionStorage dedupe keys + in-memory map; Fit Call also locks double-submit in `fit-form.js`.

---

## Formulas (lab + field)

Use only after the baseline period. Do **not** publish uplift claims from lab traffic.

| Metric | Formula | Notes |
| --- | --- | --- |
| CTA CTR | `cta_click` / page_views (same path/locale) | Segment by `cta_location` |
| Fit Call start rate | `fit_form_start` / `fit_form` page views | Requires consent sample |
| Fit Call submit rate | `fit_form_submit` / `fit_form_start` | Codes only |
| Booking completion | `booking_complete` / `fit_form_submit` | Approx.; thank-you may be revisited |
| Finder completion | `service_finder_complete` / `service_finder_start` | |
| Language switch rate | `language_select` / sessions | |
| Service interest | `service_page_view` by `service` | Not a conversion |

Consent bias: rates only among opted-in analytics users until a larger first-party sample exists.

---

## CRM stage handoff

Staff/CRM systems (not browser analytics) should record stages with `buildCrmStageHandoff()`:

| Stage | Meaning |
| --- | --- |
| `contacted` | Staff replied / first touch logged |
| `booked` | Call/meeting scheduled |
| `qualified` | Fit confirmed for a service scope |
| `proposal_sent` | Written scope/proposal shared |
| `won` | Engagement started |
| `lost` | Closed lost — require `loss_reason` code |

Required dimensions: `service`, `language`, `source` (campaign/utm or `fit_form` / `referral` code), `inquiry_id` (opaque).  
`loss_reason` allowlist: `timing`, `budget`, `scope_mismatch`, `chose_other_provider`, `unresponsive`, `not_a_fit`, `other`.  
Free-text loss notes stay inside the CRM only — never in analytics events.

---

## Dashboard specification (v1)

Single privacy-safe dashboard (spreadsheet or first-party store):

1. **Volume** — events/day by `event` + `locale`  
2. **Funnel** — finder start → complete → CTA → fit start → submit → booking_complete  
3. **Services** — `service_page_view` + submit `help_category`  
4. **Attribution** — `utm_source` / `utm_medium` / `referrer_host` (no raw URLs)  
5. **CRM** — stage counts + loss reason breakdown (from CRM export, not browser)

Exclude any panel that requires PII fields.

---

## Baseline period

| Item | Value |
| --- | --- |
| Start | First production day with consent + `/api/analytics/` receiving events |
| Duration | **28 calendar days** minimum before trend claims |
| Sample floor | Prefer ≥100 analytics-consented sessions before rate comparisons |
| Exclusions | Internal QA (`geez_debug_analytics`), staff IPs if filtered at sink |

Until baseline completes, reporting language is “instrumented / collecting,” not “improved.”

---

## QA steps

1. Build site; confirm `dist/assets/analytics.js` and `type="text/plain" data-geez-consent="analytics"` on pages.  
2. Enable debug: `?geez_debug_analytics=1` on localhost; allow analytics in banner.  
3. Walk: service page → article → case study → language switch → finder → Fit Call → thank-you.  
4. Confirm console payloads match envelope; no email/phone/name/goal text.  
5. Reload page: view events dedupe; second Fit submit blocked.  
6. Run `npm test` (includes `tests/measurement.test.mjs`).  
7. Reject any PR that adds a third-party analytics vendor tag.

---

## Owners

| Area | Owner |
| --- | --- |
| Event schema / client | Engineering |
| Consent + privacy copy | Engineering + counsel (counsel approves public notice) |
| CRM stage discipline | Founder / ops |
| Dashboard | Engineering (v1) |
| Claim language (“improved conversions”) | Founder — blocked until baseline |

---

## Out of scope / remaining constraints

- `/api/analytics/` storage, retention, and access controls are **TODO** on Hostinger/WP cutover (fail closed: beacon may 404; client still dedupes/debugs).  
- RUM (`web-vitals-rum.js`) remains separately gated and off until approved.  
- No third-party tags without a new approval recorded in `privacy-review.md`.
