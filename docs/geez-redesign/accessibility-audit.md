# Accessibility audit — WCAG 2.2 AA hardening

**Date:** 2026-09-18 / 2026-09-19  
**Owner (remediation):** Engineering (redesign workspace) — product owner sign-off pending  
**Target:** WCAG **2.2 Level AA**  
**Scope:** Public redesign routes under `dist/` for **en / am / ti**  
**Important:** Automated zero-error results are **not** conformance. Manual and AT verification remain required.

Tooling: `npm run a11y` → `scripts/a11y-audit.mjs` + `design/lib/a11y-audit.mjs` (axe-core in JSDOM + structural checks). Evidence JSON: `docs/geez-redesign/a11y-evidence/`.

---

## Evidence summary

| Check | Result |
| --- | --- |
| Sample-page axe + structural audit (20 URLs) | **0** critical/serious after fixes (`High issues: 0`, 2026-09-19) |
| Design-token contrast pairs (`tests/design-system.test.mjs`) | Pass (documented AA pairs) |
| Regression suite (`tests/a11y.test.mjs`) | Covers fixed systemic defects |
| Browser Chrome inspection (EN home, Fit Call) | Landmarks, skip, lang nav, form naming OK |
| Keyboard-only | Exercised via focusable controls in Chrome accessibility tree; full matrix pending |
| NVDA + Chrome / VoiceOver + Safari | **Exception** — not completed in this pass (see below) |
| Widths 320 / 360 / 390 / 768 / 1024 / 1440 | CSS reflow rules added; spot-check at desktop + Fit Call; full matrix pending |
| Zoom 200% / 400% | Token/`clamp` typography + `overflow-wrap`; full zoom matrix pending |

Sample locales included in automated run: EN (home, services, fit call, finder, resources, privacy…), AM (home, service, fit call, finder, resources), TI (home, fit call, finder, privacy).

---

## Critical / high findings fixed this pass

| ID | Issue | Fix | Owner | Done |
| --- | --- | --- | --- | --- |
| A11Y-01 | Fit Call contact radios lacked `id` / `for` (error-link target weak) | Unique `preferredContactMethod-{email\|phone}` ids + label `for` | Eng | 2026-09-19 |
| A11Y-02 | Footer note used `opacity: 0.9` (reduces effective contrast) | Solid `on-brand` color; note styles moved to `primitives.css` | Eng | 2026-09-19 |
| A11Y-03 | Footer `h2` used `gold-accent` at small text size | Switched to `on-brand` (≥4.5:1 on burgundy-strong) | Eng | 2026-09-19 |
| A11Y-04 | Skip link lacked explicit `:focus-visible` ring when revealed | `:focus` + `:focus-visible` show + focus ring | Eng | 2026-09-19 |
| A11Y-05 | Header crowded at ≤32rem | Stack nav/CTA/lang via order rules | Eng | 2026-09-19 |
| A11Y-06 | Consent UI used `role="dialog"` without modal focus management | Changed to `role="region"` | Eng | 2026-09-19 |
| A11Y-07 | Choice inputs under WCAG 2.2 target-size spirit | 20×20px (`1.25rem`) controls inside 44px labels | Eng | 2026-09-19 |
| A11Y-08 | Body reflow / Ethiopic overflow | `overflow-wrap: break-word` on `body` | Eng | 2026-09-19 |
| A11Y-09 | AM/TI breadcrumb aria strings were `TODO_VERIFICATION` | Localized breadcrumb names in `navigation.json` | Eng | 2026-09-19 |
| A11Y-10 | Honeypot exposed “Company website” to AT | Removed visible label; `aria-hidden` on field | Eng | 2026-09-19 |

---

## Manual checklist (spot-check notes)

| Area | EN | AM | TI | Notes |
| --- | --- | --- | --- | --- |
| Landmarks (header / main / footer / named navs) | OK | OK | OK | Primary + Language nav named |
| Single H1 + title | OK | OK | OK | Structural gate |
| Skip link → `#main` | OK | OK | OK | Present first in tab order |
| Language selector | OK | OK | OK | `aria-current` + outline/weight |
| Accordions (`details`/`summary`) | OK | — | — | Native keyboard |
| Fit Call labels / errors / live region | OK | Structure OK | Structure OK | Marketing optional, unchecked |
| Service finder | OK | OK | OK | Selects labelled |
| Confirmation / thank-you | Structure OK | Structure OK | Structure OK | `noindex` |
| Contrast (token states) | OK | OK | OK | Visual contrast in browser not fully automated |
| Reduced motion | CSS OK | CSS OK | CSS OK | `prefers-reduced-motion` zeroes motion |
| Touch / keyboard equivalence | Mostly OK | — | — | No pointer-only essential actions |

---

## Remaining exceptions (not conformance blockers for this engineering pass, but required before claiming AA)

| ID | Exception | Owner | Target date |
| --- | --- | --- | --- |
| EX-01 | Full **NVDA + Chrome** documented pass on EN Fit Call, finder, home | Product + Eng | 2026-10-03 |
| EX-02 | Full **VoiceOver + Safari** pass on EN + one Ethiopic locale page | Product + Eng | 2026-10-03 |
| EX-03 | Complete viewport matrix screenshots at **320/360/390/768/1024/1440** and **200%/400% zoom** | Eng | 2026-10-03 |
| EX-04 | axe `color-contrast` disabled in JSDOM (no layout); rely on token tests + visual | Eng | Ongoing until Playwright/browser axe |
| EX-05 | AM/TI interim English copy on some surfaces — language of page vs content (i18n queue) | Localization | Per translation roadmap |
| EX-06 | Live WordPress/reCAPTCHA not in redesign scope — verify before cutover | Eng | Cutover |
| EX-07 | Third-party embeds (none today) must use `data-geez-consent` gate | Eng | When added |

---

## How to re-run

```bash
npm run build
npm run a11y          # fails CI if critical/serious remain
npm test              # includes tests/a11y.test.mjs
```

---

## Sign-off

| Role | Status |
| --- | --- |
| Engineering hardening pass | Complete for in-scope critical/high code defects |
| Formal WCAG 2.2 AA claim | **Not signed** until EX-01–EX-03 close |
