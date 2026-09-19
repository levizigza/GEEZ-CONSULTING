# Ge’ez Consulting redesign — project rules

**Status:** Rules and stack discovery only. No redesign implementation yet.  
**Live reference:** https://geezconsulting.com/  
**Local workspace checked:** `GEEZ Consulting (Updated)` (2026-09-18) — **empty of application source**; stack below is inferred from the live production site and public WordPress APIs until a codebase, theme export, or hosting access is provided.

---

## Product objective

Make Ge’ez Consulting the clearest and most trusted Calgary/Alberta business-launch and growth website for newcomer and Black entrepreneurs, with complete English, Amharic, and Tigrinya journeys.

---

## Non-negotiables

1. **No invented proof points.** Never invent credentials, years of experience, client counts, revenue, funding outcomes, ratings, partner claims, prices, timelines, response SLAs, or testimonials.
2. **Unverified facts.** Mark any missing business fact as `TODO_VERIFICATION` and centralize it in `docs/geez-redesign/claims-ledger.md`.
3. **No outcome guarantees.** Do not imply guaranteed loan, grant, registration, immigration, tax, legal, or business outcomes.
4. **Privacy.** Keep sensitive data out of analytics and the public lead form.
5. **Quality targets.** Target WCAG 2.2 AA and Core Web Vitals at p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
6. **True multilingual product.** Treat English, Amharic, and Tigrinya as complete product experiences, not decorative translations.
7. **Lean engineering.** Prefer semantic HTML, server-rendered/static content where supported, progressive enhancement, responsive images, and minimal dependencies.
8. **No unproven chrome.** Do not add heavy animation, autoplay video, a chatbot, a portal, or a new UI library without proving the need.
9. **Preserve what works.** Preserve working content and integrations until their replacements are verified.
10. **Stack continuity.** Preserve the existing stack unless a migration is explicitly approved.

---

## Implementation workflow (every task)

1. State the plan and affected files first.
2. Make the smallest coherent change.
3. Run existing lint / type / test / build checks.
4. Add focused tests where the repo supports them.
5. Report: files changed, check results, unresolved risks, and `TODO_VERIFICATION` items.
6. **Do not commit or deploy unless asked.**

---

## Detected stack summary

### Repository / local conventions

| Area | Finding |
|------|---------|
| Local application source | **None found** in this workspace (0 project files at inspection). |
| Git / CI / package manifests | **Not present** locally. |
| Lint / type / test / build tooling | **Not detectable** until source lands. |
| Coding conventions | **Not detectable** from local code; live site follows WordPress + Elementor + Blocksy patterns. |

Until source is available, treat production behavior and the rules in this file as the binding conventions. Prefer a **WordPress child theme / Elementor-compatible** change path over a greenfield rewrite.

### Framework & runtime

- **CMS / framework:** WordPress **7.0**
- **Runtime:** **PHP 8.2.33** (`X-Powered-By`)
- **Theme:** **Blocksy** (~2.1.47) + **Blocksy Companion**
- **Page composition:** **Elementor** **4.1.4** (pages use `elementor_header_footer` template; kit id observed on home)
- **Elementor add-ons (observed):** Essential Addons for Elementor Lite (~6.6.9), HT Mega for Elementor (~3.1.2)
- **Other front-end plugins observed:** Preloader Plus; WPForms Lite; Polylang; Yoast SEO; WP Fastest Cache (minified asset paths under `wp-content/cache/wpfc-minified/`)

### Routing & information architecture (live)

- **English home:** `/` (page id **3028**, title “Home”)
- **Amharic home:** `/am/` (page id **3038**)
- **Tigrinya home:** `/ti/` (page id **3054**)
- **Blog index:** `/blog/` (page id **2307**)
- Primary English nav is largely **same-page anchors:** `#services`, `#about`, `#faq`, `#contact`, plus `/blog/`
- Skip link to content present (`#main` / main container)

Public REST sample showed **4 pages** total; blog content exists as posts (RSS feed active).

### CMS / content source

- **Primary content:** WordPress pages (Elementor-built) + WordPress posts (blog; Gutenberg block markup visible in feed)
- **Media:** `wp-content/uploads/` (e.g. logo mark, profile imagery)
- **REST:** `/wp-json/` available; Polylang languages via `/wp-json/pll/v1/languages`

### Styling system

- Theme: **Blocksy** base styles + Elementor kit / per-page CSS (`wp-content/uploads/elementor/css/`)
- Fonts: **Google Fonts** — Libre Baskerville (400/700) + Work Sans (400–700), `display=swap`
- Caching layer rewrites many CSS/JS into WP Fastest Cache minified bundles
- No separate design-token / CSS-in-JS / utility-first framework detected in production HTML

### Form delivery

- **Plugin:** WPForms Lite (`wpforms-form-1235`)
- **Fields observed:** Name, Email, Message (all required)
- **Submission:** AJAX post to site origin; hidden context fields include page title/url/referer/page id
- **Spam config hint:** WPForms Elementor integration exposes `captcha_provider: recaptcha` / `recaptcha_type: v2` in script config (widget not necessarily rendered on every paint)
- **Delivery backend (SMTP / inbox routing):** not visible from the public front end — treat as **TODO_VERIFICATION** when touching forms

### Analytics

- **Homepage scan:** no `gtag` / `dataLayer` / GA / Meta Pixel / Clarity / Hotjar / Plausible / Matomo globals detected
- Do not introduce tracking that captures message-body or other sensitive lead fields

### Localization approach

- **Plugin:** **Polylang** (confirmed via `pll_language` cookie script and `/wp-json/pll/v1/languages`)
- **Languages:**
  - `en` — English — `en_US` — default — `/`
  - `am` — አማርኛ — locale `am` — `/am/`
  - `ti` — ትግርኛ — locale `ti` — `/ti/`
- **URL strategy:** directory prefixes for non-default languages
- **hreflang / alternates:** present on home (`en`, `am`, `ti`)
- **Open Graph locales observed:** `en_US`, `am_ET` (Tigrinya OG alternate incomplete/empty in meta — note for later SEO work)

### SEO

- **Plugin:** **Yoast SEO** (`wordpress-seo`)
- **robots.txt:** Yoast-managed; allows all; points to `https://geezconsulting.com/sitemap_index.xml`
- **Sitemaps:** Yoast index → post / page / category / author sitemaps
- **On-page:** meta description, robots, Open Graph, Twitter `summary_large_image`, JSON-LD `@graph` (WebPage / Organization pattern)
- Canonical present on home

### Testing tools

- **Local / CI automated tests:** none found (empty repo)
- Future work should add the lightest checks the stack supports (e.g. theme/plugin lint, Playwright or axe against key EN/AM/TI URLs) without adding heavy frameworks unless needed

### Deployment target

- **Host:** **Hostinger** (response headers: `platform: hostinger`, `panel: hpanel`, `server: hcdn`)
- **CDN / edge:** Hostinger CDN (`x-hcdn-cache-status`)
- **TLS / HTTP3:** `alt-svc: h3=":443"`
- Deploy path for redesign is expected to remain **Hostinger-managed WordPress** unless a migration is approved

### Design / brand signals (live, not redesign)

- Site name: Ge’ez Consulting
- Tagline observed: “Transforming Visions Into Reality Through Insight”
- Contact shown publicly: Calgary address, `info@geezconsulting.com`, phone
- Footer credit: Design by Negat Creative
- Social: LinkedIn, Facebook, Instagram, YouTube

---

## Stack preservation policy

Default change surface (in priority order once source/access exists):

1. Content and Elementor structures already in WordPress  
2. Blocksy child theme / theme options / Elementor kit tokens  
3. Minimal custom CSS/JS in child theme  
4. Existing plugins already in production (Polylang, Yoast, WPForms, WP Fastest Cache)

**Do not** migrate off WordPress/Elementor/Blocksy/Polylang/Yoast/WPForms/Hostinger without explicit approval.

---

## Open discovery gaps (blockers for implementation)

| Gap | Impact |
|-----|--------|
| Empty local repository | Cannot run lint/type/test/build; cannot inspect theme PHP, child theme, or custom code |
| No WP admin / SFTP / Git export | Cannot confirm mu-plugins, SMTP, exact cache settings, or unpublished content |
| Form email/SMTP destination | Unknown from public site |
| Analytics property IDs | None observed; confirm intentional absence before adding |
| Claims ledger | Create `docs/geez-redesign/claims-ledger.md` when first unverified claim is encountered |

---

## Document control

- Created for redesign kickoff; update the **Detected stack summary** when local source or hosting access changes the picture.
- Related: `docs/geez-redesign/claims-ledger.md`, `docs/geez-redesign/content-inventory.md`, `docs/geez-redesign/information-architecture.md`, `docs/geez-redesign/design-system.md`, locale-ready content model under `content/`, design tokens under `design/`
)
