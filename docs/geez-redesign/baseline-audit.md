# Ge’ez Consulting — baseline audit

**Date:** 2026-09-18  
**Method:** Read-only inspection of public production routes (HTML fetch + live DOM via browser). Local workspace remains empty of WordPress source; no production UI changes were made.  
**Rules:** `docs/geez-redesign/project-rules.md`  
**Claims:** Unverified claim surfaces logged in `docs/geez-redesign/claims-ledger.md`

### Severity key

| Level | Meaning |
|-------|---------|
| **P0** | Breaks a primary EN/AM/TI journey, privacy expectation, or trust-critical contact path |
| **P1** | Significant WCAG 2.2 AA / SEO / Core Web Vitals / localization gap |
| **P2** | Polish, hygiene, or lower-impact debt |

### Checks run (safe / local-fit)

| Check | Result |
|-------|--------|
| Local lint / type / test / build | **N/A** — no app source, `package.json`, `composer.json`, or CI config in workspace |
| Yoast `robots.txt` + sitemap index + child sitemaps | Fetched |
| WP REST pages/posts + Polylang languages | Fetched |
| Per-route HTML audit (17 URLs): title, meta, canonical, hreflang, headings, forms, images, scripts, JSON-LD | Completed |
| Live DOM (EN home): forms, accordion semantics, preloader, contrast samples, image natural sizes, cookies | Completed |
| Probe `/am/blog/`, `/ti/blog/`, author locales, `/privacy-policy/` | Completed |

---

## 1. Route and locale matrix

Public URLs discovered from Yoast sitemaps + Polylang REST (all HTTP 200 unless noted).

| Journey / content | EN | AM | TI | Notes |
|-------------------|----|----|----|-------|
| Home | `/` | `/am/` | `/ti/` | Elementor single-page; in-page anchors for services/about/faq/contact |
| Blog index | `/blog/` | **Missing** (`/am/blog/` → `/blog/`) | **Missing** (`/ti/blog/` → `/blog/`) | AM/TI nav “Blog” points to EN blog |
| Post: How to Name Your Business | `/how-to-name-your-business/` | `/am/how-to-name-your-business-2/` | `/ti/how-to-name-your-business-3/` | AM/TI URLs exist; **body + title still English** |
| Post: Credit / financial steps | `/steps-to-improve-your-credit-and-financial-situation/` | `/am/...-2/` | `/ti/...-3/` | Same EN content under AM/TI `lang` |
| Post: Partnerships | `/unlocking-the-power-of-partnerships-for-your-small-business/` | `/am/...-2/` | `/ti/...-3/` | Same pattern |
| Category | `/category/general/` | `/am/category/uncategorized-am/` | `/ti/category/uncategorized-ti/` | Naming inconsistency |
| Author | `/author/admin/` | `/am/author/admin/` | `/ti/author/admin/` | Username `geez_admin` exposed; in sitemap |
| Privacy policy | `/privacy-policy/` → **404** | — | — | Form collects name/email/message with no linked policy found |
| Dedicated `/services/`, `/about/`, `/contact/` pages | Not in sitemap | — | — | Handled as home anchors (`#services`, `#about`, `#faq`, `#contact`) |

**Polylang config (REST):** `en` default (`en_US`), `am` (`am`), `ti` (`ti`); front pages 3028 / 3038 / 3054.

**Coverage verdict:** Home chrome is substantially localized for AM/TI, but blog index, lead form strings, several CTAs, and all three “translated” posts are **not** complete product experiences.

---

## 2. Headings, metadata, canonicals, hreflang, sitemap, robots, JSON-LD

### Cross-cutting observations

| Item | Evidence |
|------|----------|
| robots.txt | Yoast allow-all; `Sitemap: https://geezconsulting.com/sitemap_index.xml` |
| Sitemaps | post, page, category, author indexes present |
| JSON-LD (homes) | Yoast `@graph`: `WebPage`, `WebSite`(+`SearchAction`), `Organization`, `BreadcrumbList`, `ImageObject` |
| JSON-LD (posts) | Adds `Article`, `Person` |
| `x-default` hreflang | **Absent** on audited pages |
| Home H1 | **0** on `/`, `/am/`, `/ti/`, `/blog/` — hero uses **H2** |

### Per-route SEO snapshot (selected)

| Route | `lang` | Title | Meta description | Canonical | hreflang set | Notable issue |
|-------|--------|-------|------------------|-----------|--------------|---------------|
| `/` | `en-US` | Ge'ez Consulting | Present (generic consulting copy) | Self | en, am, ti | No H1; OG alts include empty TI string |
| `/am/` | `am` | Ge'ez Consulting (EN) | **Empty** | Self | en, am, ti | Title/OG not localized; `og:locale` still `en_US` |
| `/ti/` | `ti` | Ge'ez Consulting (EN) | **Empty** | Self | en, am, ti | Same; TI OG locale incomplete elsewhere |
| `/blog/` | `en-US` | Blog \| Ge'ez Consulting | **Empty** | Self | **None** | No locale alternates; no H1 |
| EN posts | `en-US` | Post title \| site | Often empty | Self | en/am/ti post URLs | OK structure |
| AM/TI posts | `am` / `ti` | **English** title | Empty | Self | Linked across locales | Content still English |
| `/author/admin/` | `en-US` | geez_admin, Author at… | Empty | Self | en/am/ti author | Indexes WP username |

---

## 3. Navigation and conversion paths

**EN home nav:** Home, Services (`#services`), About (`#about`), FAQ (`#faq`), Blog (`/blog/`), Contact (`#contact`), language switcher.

**AM/TI home nav:** Localized labels and hash IDs (e.g. `/am/#አገልግሎቶች`), but:

| Path | Issue |
|------|-------|
| AM/TI “Blog” | Links to EN `/blog/` |
| AM/TI header Contact / “አግኙን” | Observed href `https://geezconsulting.com/#contact` (**drops locale**) |
| Language switcher on `/blog/` | AM/TI options go to locale **homes**, not blog equivalents (none exist) |
| `aria-current="page"` | Applied to Home **and** Services/About/FAQ anchors simultaneously on home — incorrect current-page semantics |
| Social / mailto / tel icon links | Several lack accessible names |

Primary conversion: in-page contact form `#contact` + mailto/tel. No booking portal/chatbot (good per rules).

---

## 4. Forms, validation, spam, delivery, states, destinations

| Aspect | Finding |
|--------|---------|
| Plugin | WPForms Lite form **1235** on EN/AM/TI homes |
| Fields | Name, Email, Message — all required; English labels/placeholders on **all** locales |
| Submit | Visible text “Send Message”; `data-submit-text` / `data-alt-text="Sending..."` |
| Client validation | `wpforms-validate` + jQuery Validate present |
| Spam | Config hint `recaptcha` v2 in WPForms Elementor vars; **no reCAPTCHA widget or honeypot in live DOM** |
| Delivery | Public destination **unknown** (SMTP/inbox) — `TODO_VERIFICATION` |
| Success/error UI | Containers exist in plugin markup patterns; **not exercised** (no submit — avoid mutating production data) |
| Privacy | No privacy policy page (404); form collects personal data |
| Autocomplete | Not set on name/email fields |
| Analytics leakage | No GA/pixel observed on homepage (see §7) |

---

## 5. Images

| Issue | Evidence |
|-------|----------|
| Empty `alt` | ~13 on home (service icons, portraits, logos, about imagery); decorative vs informative not distinguished |
| Missing `alt` attribute | ≥1 per page (e.g. preloader mark / logo variants) |
| Formats | PNG/JPG dominant; no AVIF/WebP observed in sampled `src` |
| Dimensions | Many `width`/`height` attrs present but **natural size ≫ display** (examples: logo ~8×, profile JPG ~3×, avatar ~18×) |
| Loading | Mix of eager LCP candidates and `lazy`; preloader image eager |
| Filename | Typo `Geez-Consuting*.png` in production assets |
| Responsive | Logos have `srcset`; several content images serve full-resolution file at small CSS size |

---

## 6. Fonts and Ethiopic-script coverage

| Item | Finding |
|------|---------|
| Loaded families | Google Fonts: **Libre Baskerville** (400/700), **Work Sans** (400–700), `display=swap` |
| Ethiopic support | Neither family is an Ethiopic webfont; AM/TI pages rely on **system fallback** glyphs |
| Measure hint | Canvas widths for Ethiopic sample under Work Sans ≈ monospace/fallback — no dedicated Noto Ethiopic (or similar) loaded |
| Extra fonts | Font Awesome / FA5 registered (icon fonts) |
| Risk | Inconsistent Ethiopic rendering, FOIT/FOUT, and uneven metrics across OS — undermines “complete” AM/TI product |

---

## 7. Analytics and personal-data leakage

| Item | Finding |
|------|---------|
| Marketing tags | No `gtag` / GTM / Meta Pixel / Clarity / Hotjar / Matomo / Plausible detected on EN home |
| Cookies | `pll_language` only (Polylang preference) |
| Storage | No `localStorage` / `sessionStorage` keys observed |
| Form vs analytics | No evidence of message-body analytics leakage **today**; keep this constraint when adding measurement |
| Public PII surfaces | Phone, email, street address in footer/contact; author username `geez_admin` |
| Privacy policy | **404** while lead form collects name/email/free-text |

---

## 8. Accessibility risks

| Area | Risk | Severity |
|------|------|----------|
| Heading hierarchy | No H1 on homes/blog; long paragraph-like copy in an H2 on home | P1 |
| Keyboard / accordion | EAEL accordion headers are `div tabindex="0"` with `aria-controls` but **no `aria-expanded` / explicit `role="button"`** in sampled markup | P1 |
| Focus / current page | Multiple `aria-current="page"` on hash nav items | P1 |
| Labels | Form labels present (EN only on AM/TI) | P0 (i18n) / P1 (a11y language of page) |
| Icon links | mailto/tel/social/icon buttons without names | P1 |
| Dialogs | No modal dialogs observed | — |
| Carousels | None detected on audited homes | — |
| Errors | Not live-tested; plugin supports assertive live region on submit button | P2 until verified |
| Language attributes | `html[lang]` correct per locale on homes; **content language mismatches** on AM/TI posts (English prose) | P0 |
| Contrast | Footer copyright ~**1.1:1** (light text on white `ct-footer`); contact line measured white-on-white when ancestors lack opaque bg (section may use bg image — verify visually) | P1 |
| Preloader | Content under `#main-container` starts at opacity 0; preloader ~2s delay — delayed perception / AT exposure | P1 |
| Skip link | Present → `#main` | OK |

---

## 9. Performance risks and third-party scripts

| Risk | Evidence |
|------|----------|
| Preloader Plus | ~2s animation delay config; full-viewport loader image before content reveal — **LCP / INP** risk |
| Script weight | Large first-party plugin surface: Elementor, EAEL, HT Mega (popper, bootstrap bundle, waypoints, magnifier), Blocksy, WPForms (+ validate, mailcheck, punycode, address field), jQuery UI | P1 |
| CSS | Multiple WP Fastest Cache minified CSS + Elementor per-page CSS + Google Fonts CSS | P1 |
| Images | Oversized PNG/JPG payloads vs display size | P1 |
| Fonts | Google Fonts stylesheet third-party | P2–P1 |
| Third-party runtime | Primarily `fonts.googleapis.com` on home; social destinations are navigations not embeds | — |
| Caching / host | Hostinger `hcdn` + WP Fastest Cache — helpful but does not remove JS weight | Info |
| CWV targets | LCP ≤2.5s / INP ≤200ms / CLS ≤0.1 at p75 **not measured in lab CrUX here** — treat as unverified | `TODO_VERIFICATION` |

---

## 10. Tests, CI, build, deployment assumptions

| Area | Finding |
|------|---------|
| Local repository | Empty of theme/plugin source |
| Automated tests | None |
| CI | None (no `.github` / pipelines in workspace) |
| Build | WordPress runtime on host; front-end “build” = WP/Elementor publish + WPFC minify |
| Deployment assumption | Hostinger WordPress (`platform: hostinger`, PHP 8.2.33); changes expected via WP admin / SFTP / host backup — **not** via this empty repo |
| Safe local checks possible today | Public HTTP audits only (as done) |

---

## Findings register

### P0

| ID | Finding | Evidence | Affected path / component | Acceptance criteria |
|----|---------|----------|---------------------------|---------------------|
| P0-01 | AM/TI contact CTAs send users to **English** `#contact` | AM/TI CTA href `https://geezconsulting.com/#contact` | Header/CTA Elementor links on `/am/`, `/ti/` | Locale CTAs resolve to `/am/#…` and `/ti/#…` (or localized contact section) and keep `lang` journey intact |
| P0-02 | AM/TI “translated” posts are still English | Title + body preview English on `/am/how-to-name-your-business-2/` and `/ti/...-3/` while `html[lang]` is am/ti | All 6 AM/TI post URLs | Each locale post has human-reviewed Amharic/Tigrinya title, body, metadata; or is not published as that locale |
| P0-03 | No AM/TI blog index; locale blog URLs redirect to EN | `/am/blog/` and `/ti/blog/` → `/blog/` | Polylang + Blog page + nav | `/am/` and `/ti/` have equivalent blog listing or nav omits Blog until ready |
| P0-04 | Lead form UI not localized on AM/TI | Labels/placeholders/button remain “Name/Email/Message/Send Message” on `/am/`, `/ti/` | WPForms 1235 | Form strings match page language; errors/success likewise |
| P0-05 | Click-to-call uses wrong country code | `tel:+4037002065` (+403 = Romania); visible copy `1(403) 700-2065` | Contact feature list / tel links | `tel:+14037002065` (or verified E.164) matches published number |
| P0-06 | Personal data collected with **no** privacy policy page | `/privacy-policy/` → 404; form fields name/email/message | Legal page + form footer link | Published privacy page in EN/AM/TI (or linked equivalent) before relying on public lead form |

### P1

| ID | Finding | Evidence | Affected path / component | Acceptance criteria |
|----|---------|----------|---------------------------|---------------------|
| P1-01 | Missing H1 on primary pages | `h1Count=0` on `/`, `/am/`, `/ti/`, `/blog/` | Elementor heading widgets | Exactly one descriptive H1 per page; hierarchy logical |
| P1-02 | Empty / non-localized metadata | Empty meta description on AM/TI homes, blog, most posts; shared EN title on locale homes | Yoast + Polylang | Unique title + description per locale URL |
| P1-03 | Broken/incomplete hreflang & OG locales | Blog has **no** hreflang; empty `og:locale:alternate`; AM home `og:locale=en_US` | Yoast / Polylang SEO | Reciprocal hreflang (+ `x-default`); OG locale matches page language including TI |
| P1-04 | Accordion semantics incomplete | EAEL headers: `div tabindex=0` + `aria-controls`, no `aria-expanded`/`role` | Home FAQ / approach accordions | WAI-ARIA accordion pattern; keyboard + SR announce expand/collapse |
| P1-05 | Incorrect `aria-current` on hash nav | Services/About/FAQ marked `aria-current=page` with Home | Main + mobile menus | Only the true current page (or none for pure hashes) |
| P1-06 | Unnamed interactive icons | mailto/tel links with empty accessible name | Contact + social icon links | Accessible name on every control |
| P1-07 | Image text alternatives weak | ~13 empty `alt` on home; 1 missing alt | Home media | Informative alts or empty alt only when decorative |
| P1-08 | No Ethiopic webfont | Only Libre Baskerville + Work Sans | Global typography | Load vetted Ethiopic-capable face(s) for AM/TI (and shared UI) |
| P1-09 | Preloader + heavy JS hurt CWV budget | Preloader Plus delay; Elementor+EAEL+HTMega+WPForms stack | Global front-end | Meet LCP/INP/CLS p75 targets without blocking main content unnecessarily |
| P1-10 | Oversized raster images | Natural/display ratios often 3×–18×; PNG-heavy | Uploads + Elementor widgets | Right-sized responsive images; modern formats where supported |
| P1-11 | Author archive exposes `geez_admin` | Title/H1 `geez_admin`; in author sitemap | `/author/admin/` (+ locales) | Public display name; noindex author if not needed |
| P1-12 | Mixed language on TI home | TI page includes Amharic heading string `የምንሰጣቸው አገልግሎቶች` | `/ti/` Elementor content | TI strings are Tigrinya throughout |
| P1-13 | Footer contrast failure (sampled) | Copyright ~1.11:1 on white footer | `.ct-footer` | Text/background ≥ 4.5:1 (normal) / 3:1 (large) |
| P1-14 | Spam protection not evident in DOM | No recaptcha/honeypot nodes on live form | WPForms 1235 | Documented anti-spam in place without blocking assistive tech |

### P2

| ID | Finding | Evidence | Affected path / component | Acceptance criteria |
|----|---------|----------|---------------------------|---------------------|
| P2-01 | Asset filename typo | `Geez-Consuting*.png` | Media library | Corrected filenames on next asset pass (no broken refs) |
| P2-02 | Category slug/label inconsistency | `uncategorized-am` / `uncategorized-ti` vs EN `general` | Categories | Consistent taxonomy naming per locale |
| P2-03 | Twitter meta title/description null | Home twitter tags incomplete | Yoast social | Cards resolve with explicit title/description |
| P2-04 | Unused/extra WPForms scripts | Address-field script on home form without address field | WPForms assets | Load only needed field scripts |
| P2-05 | No repo tests/CI | Empty workspace | Engineering workflow | When source exists: smoke + axe checks for EN/AM/TI critical paths |
| P2-06 | Testimonials / expertise copy present | Home sections “What Our Clients say”, “Testimonial”, expertise claims | Home content | All claims verified or removed — see claims ledger |

---

## Unresolved risks

1. Form email/SMTP destination and notification contents unknown without WP admin.  
2. Field-level success/error and reCAPTCHA behavior not exercised (avoided production submits).  
3. CrUX / Lab CWV not collected in this pass.  
4. Background-image sections may mask true contrast (contact block needs visual confirmation).  
5. Live DOM briefly hides main content during preloader — worth confirming on real devices/throttling.  
6. Full plugin/mu-plugin list and child-theme overrides unknown without hosting access.

---

## TODO_VERIFICATION

| Item | Why |
|------|-----|
| WPForms notification recipients / SMTP | Delivery path opaque from public site |
| Intended analytics stack (none vs pending) | No tags found; confirm intentional |
| Testimonial quotes, client logos, outcomes | Must not invent; verify or remove — `claims-ledger.md` |
| Founder title/credentials wording | “Founder and Director” / expertise statements |
| Phone E.164 canonical value | Confirm +1 403 700-2065 |
| Privacy policy legal text availability | Page 404 |
| Core Web Vitals p75 (CrUX) | Performance targets unverified |
| Whether reCAPTCHA keys are configured but not rendered | Config hint vs DOM mismatch |

---

## Files changed

- `docs/geez-redesign/baseline-audit.md` (this file)  
- `docs/geez-redesign/claims-ledger.md` (new; claim surfaces from this audit)

**Not changed:** production UI, theme, plugins, content.  
**Not committed / not deployed.**
