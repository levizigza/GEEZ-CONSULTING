# Intake data flow — Fit Call form & service finder

**Stack context:** Production remains WordPress + WPForms Lite (form 1235) on Hostinger until a migration is approved. This redesign workspace implements a **portable intake contract** (validation, spam guards, thank-you copy, finder rules) that maps onto WPForms/custom PHP or a small Node handler for local/e2e tests.

## Actors & processors

| Processor | Role | PII access | Status |
|-----------|------|------------|--------|
| Browser (progressive enhancement) | Client validation UX, fetch to `/api/fit-call/` | Transient in memory only | Implemented in `site/intake/fit-form.js` |
| Static pages | Render labels/errors; no-JS POST/GET where server exists | Form fields in HTML responses only | `book-a-fit-call`, `thank-you`, `find-your-service` |
| Intake handler | Server-side validation, honeypot, rate limit | Receives PII; must not log it | `site/intake/submit-handler.mjs` |
| Delivery provider | Email/CRM sink (WPForms notification, SMTP, or memory stub) | Stores PII for staff response | **TODO_VERIFICATION** — map to WPForms / Hostinger SMTP |
| Staff inbox | Human follow-up | Full message | Existing inbox — **TODO_VERIFICATION** recipient list |
| Analytics | Must not receive message body, email, phone, or name | None (codes only if ever instrumented) | No analytics detected on live site; keep it that way |

## Data collected (Fit Call)

**Allowed:** name; email and/or phone; preferred contact method; preferred language; business stage; help category; short goal/problem; optional timeline, company/project name, referral source; response-purpose consent.

**Forbidden on this form:** SIN, banking passwords/account details, card numbers, immigration file numbers, payroll files, tax filings, full identity documents.

Sensitive-pattern rejection runs server-side (`fit-form-validate.mjs`).

## Transport & storage

1. User submits over **HTTPS** (required in production; documented `requireHttps` flag on handler).
2. No PII in **URLs** for the Fit Call (POST body / JSON only). Service finder no-JS GET uses **categorical codes only** (not names/emails).
3. Logs/analytics receive **`redactFitFormForLogs()`** only (booleans + enum codes + goal length).
4. Success redirects to locale thank-you page (`/thank-you/`, always `noindex`).
5. Retention: **TODO_VERIFICATION** — document WPForms entry retention, mailbox retention, and backup retention with the host.

## Spam / abuse controls

| Control | Mechanism | Notes |
|---------|-----------|-------|
| Honeypot | Hidden `company_website` field | Soft-success (no tip to bots); no provider call |
| Rate limit | Sliding window per client key (IP) | Compatible with WP rate plugins / host WAF later |
| reCAPTCHA | Optional WPForms setting observed live | Prefer accessible alternatives; do not block AT without testing |

## Failure handling

| Failure | User-visible behavior | Staff/ops |
|---------|----------------------|-----------|
| Validation | 400 + error summary + field errors + **input preserved** | Redacted validation_failed log |
| Rate limit | 429 + wait message | Redacted rate_limit log |
| Provider down / throw | 502 + retry message; no silent data loss claim | provider_failure log (no PII) |
| Honeypot | Fake 200 + thank-you redirect | spam/honeypot log |
| Insecure HTTP (when required) | 403 | reject/insecure_transport |

## Thank-you / email contract

See `site/intake/thank-you-contract.mjs`:

- Page states next steps **without** a timed response SLA (no “we reply in X minutes”).
- Auto-reply (when enabled) must confirm receipt, avoid outcome promises, and remind users not to send sensitive IDs.
- Staff notification outline uses language/help/stage **codes**; open the secure provider record for contact details.

## Privacy & marketing consent

See `docs/geez-redesign/privacy-review.md` (not legal advice). Fit Call requires response-purpose consent only; optional marketing consent is separate, unchecked, and recorded with timestamp/source/version. `referralSource` was removed as unnecessary for inquiry response.

## Service finder

- Five questions max: business stage, primary goal, current obstacle, preferred language, desired timing.
- Output: one primary service, why (plain language), link to details, Fit Call CTA.
- Explicitly **not** legal/tax/financial eligibility screening; **no** outcome promises.
- Progressive enhancement: ESM client uses the same `service-finder-model.mjs`. No-JS: GET codes on intake server **or** noscript links to services + Fit Call.

## WordPress mapping (when cutting over)

1. Replace WPForms 1235 field set with the Fit Call field contract (or mirror via hidden mapping).
2. Keep notifications on HTTPS; disable logging of entry bodies to third-party analytics.
3. Point success redirect to Polylang thank-you pages.
4. Localize all labels/errors in EN/AM/TI (intake i18n is the source until WP strings are updated).
5. Confirm SMTP/recipients — **TODO_VERIFICATION** (CL-008 related).

## Local e2e

```bash
npm run build
node --test tests/intake.e2e.test.mjs
```

Tests spin `createIntakeServer()` against `dist/` with a memory provider (and a failing provider for 502 paths).
