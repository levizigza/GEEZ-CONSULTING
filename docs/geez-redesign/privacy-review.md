# Privacy & consent review (implementation)

**Status:** Engineering inventory and controls for the redesign workspace.  
**Not legal advice.** Alberta **PIPA** and federal **CASL** are used as design references only. Qualified counsel must review before publishing the privacy notice, marketing program, or processor list.

Related: `intake-data-flow.md`, `content/data/shared/privacy-policy.json`, `content/lib/privacy.mjs`, `site/privacy/`.

---

## Chosen consent approach

| Category | Approach | Mechanism |
| --- | --- | --- |
| Essential / functional | Allowed without banner | Locale preference `localStorage`; Fit Call / finder scripts; form POST |
| Analytics / marketing pixels / third-party embeds | **Opt-in** before load | Scripts must ship as `type="text/plain" data-geez-consent="analytics\|marketing\|embedded"`; `consent.js` activates only after stored opt-in |
| Fit Call response use | Required checkbox | `consentResponsePurpose` |
| Commercial electronic messages (CASL-informed) | **Optional**, unchecked, specific | `consentMarketing` → recorded `{ granted, timestamp, source, version }`; unsubscribe at `/unsubscribe/` |

Default for non-essential scripts: **off**. Banner appears only on pages that include gated scripts.

---

## Inventory (codebase + documented live stack)

### Cookies

| Name / source | Purpose | Essential? | Notes |
| --- | --- | --- | --- |
| WordPress / Polylang `pll_language` (live WP) | Language | Functional | Live CMS; redesign uses localStorage instead |
| Host / CDN cookies | Security / cache | TBD | **TODO_VERIFICATION** — Hostinger / any CDN |
| Session cookies for WP admin | Staff only | N/A public | Out of public marketing scope |

**Redesign static site:** no first-party cookies set by application JS today.

### localStorage / sessionStorage

| Key | Purpose | Essential? | PII? |
| --- | --- | --- | --- |
| `geez_lang_pref` | Last explicit language choice | Yes (UX) | No (locale code only) |
| `geez_script_consent_v1` | Opt-in flags for analytics/marketing/embedded + version/timestamp | Consent record | No |
| `geez_measure_sid_v1` / `geez_measure_attr_v1` / `geez_measure_dedupe_v1` | Anonymous session, UTM/referrer host, event dedupe (analytics consent only) | Analytics | No PII by design — see `measurement-plan.md` |
| `geez_analytics_debug` | Dev debug flag for console sink | Dev only | No |

### Fit Call form fields (allowed)

| Field | Required? | Purpose | Destination |
| --- | --- | --- | --- |
| `name` | Yes | Identify requester | Intake provider / staff inbox |
| `email` and/or `phone` | One required | Contact | Same |
| `preferredContactMethod` | Yes | Routing | Same |
| `preferredLanguage` | Yes | Response language | Same |
| `businessStage` | Yes | Scoping | Same |
| `helpCategory` | Yes | Service routing | Same |
| `goalProblem` | Yes (≤500 chars) | Context | Same |
| `timeline` | Optional | Scheduling context | Same |
| `company` | Optional | Context | Same |
| `consentResponsePurpose` | Yes | Response-purpose authorization | Same + audit |
| `consentMarketing` | **No** | Optional CEM | Same + marketingConsent record |
| `locale` | Hidden | Thank-you path | Same |
| `company_website` | Honeypot | Spam | Never to provider if filled |

**Removed as unnecessary for inquiry response:** `referralSource` (optional “how did you hear” field).

**Forbidden on this form:** SIN, banking passwords/accounts, card numbers, immigration file numbers, payroll files (server-side pattern reject).

### Service finder fields

Categorical codes only (`businessStage`, `primaryGoal`, `currentObstacle`, `preferredLanguage`, `desiredTiming`). No names/emails. Safe for GET fallback.

### Server logs / analytics events

| Sink | Contents | PII policy |
| --- | --- | --- |
| Intake `onLog` | `redactFitFormForLogs()` — enums, booleans, goal length | No name/email/phone/goal text |
| Staff notification outline | Language / help / stage codes | Contact details stay in provider record |
| Analytics (GeezAnalytics first-party) | Must pass `sanitizeAnalyticsEvent` / `analyticsPiiViolations`; consent-gated | Fail closed on denylist keys; see `measurement-plan.md` |

### Embedded vendors / booking / email

| Vendor | Role | Status |
| --- | --- | --- |
| Hostinger hosting (live) | Hosting | **TODO_VERIFICATION** DPA / location |
| WPForms Lite form 1235 (live) | Form capture | Map to Fit Call contract on cutover |
| SMTP / mailbox | Staff delivery | **TODO_VERIFICATION** recipients + retention |
| Calendly / other booking embeds | — | **Not present** in redesign; if added, gate as `embedded` |
| Google Analytics / Meta / ads / Plausible / Matomo | — | **Not approved**; do not add without product + privacy sign-off. First-party `GeezAnalytics` only (`measurement-plan.md`) |
| Appointment URL UTMs (`seo.mjs`) | Campaign tags on outbound booking links | Query params only — no personal data |

### Data destinations (summary)

Browser → HTTPS → Intake handler → Delivery provider (memory stub locally; WPForms/SMTP in production TBD) → Staff inbox. Optional marketing list only if `marketingConsent.granted === true`.

---

## Privacy-policy content structure

Source of truth: `content/data/shared/privacy-policy.json`  
Rendered at `/privacy/` (draft, **noindex**). Unverified ClaimFields display as “Pending verification” (never the literal `TODO_VERIFICATION` string).

Sections: notice (not legal advice), controller, contact, purposes, processors, locations, retention, access/correction, safeguards, breaches, deletion, marketing (CASL), cookies/storage.

---

## Just-in-time notices & service disclaimers

- Fit Call: page-level privacy hint + contact/goal JIT hints + Privacy/Disclaimers links.
- Marketing: separate unchecked control + hint that inquiry does not depend on it.
- Disclaimers page + service exclusions distinguish **consulting/preparation** from legal, tax, accounting, immigration, **registry/licensing**, and **funding/lender** decisions.
- Footer legal note and finder disclaimer updated to match.

---

## Unresolved counsel questions

1. Confirm **controller** legal name vs brand “Ge’ez Consulting” (CL-011 / CL-018).  
2. Confirm **privacy contact** channel and complaint path under Alberta PIPA.  
3. Confirm whether Alberta PIPA (private-sector) is the primary statute for this practice, and any federal PIPEDA overlap.  
4. Approve **purposes** wording for inquiry response vs optional marketing.  
5. Name all **processors** (host, form plugin, SMTP, CRM, backups) and **cross-border** locations.  
6. Set **retention** periods for form entries, mailbox, backups, and marketing lists.  
7. Confirm **access / correction / deletion** process and timelines.  
8. Confirm **breach** assessment and notification approach under PIPA.  
9. CASL: confirm express-consent language, sender identification, and unsubscribe mechanics for any CEM program.  
10. Whether functional `localStorage` language preference needs disclosure-only treatment vs consent UI (implementation treats it as essential).  
11. Live WP **reCAPTCHA** / third-party scripts: keep, replace, or remove for accessibility + consent alignment.  
12. Map WPForms entry export/deletion to the redesign retention policy before cutover.

---

## Implementation checklist

- [x] Inventory documented here  
- [x] Remove `referralSource` from Fit Call  
- [x] Optional marketing consent recorded with timestamp/source/version  
- [x] Unsubscribe page stub  
- [x] Consent gate for non-essential scripts  
- [x] Privacy policy structure + disclaimers expansion  
- [x] JIT notices on Fit Call  
- [x] Tests: no PII in analytics helper; marketing not required for inquiry  
- [ ] Counsel sign-off before indexable privacy publish  
- [ ] Wire real CEM unsubscribe to ESP when marketing starts  

---

*Last inventory pass: 2026-09-18. Update this file when adding vendors, cookies, or fields.*
