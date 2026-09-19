# Localization QA — EN / AM / TI

Native-review checklist for Ge’ez Consulting redesign locales. Incomplete AM/TI pages stay **draft / `noindex`** until every applicable item below is approved.

## Policy

- Do **not** machine-fill production translations.
- Do **not** silently fall back to English on indexable translated pages.
- Interim English on AM/TI must use `lang="en"` (or an explicit translation note) and remain `noindex`.
- Founder biography: one short placeholder on the homepage; full bio only in `locales/*/founder.json` after approval — **never** paste EN bio into AM/TI.
- Slugs: shared Latin segments per `content/data/shared/slug-map.json` until Ethiopic slugs are native-approved.

## Before marking a locale surface indexable

### Document head

- [ ] `html lang` is `en` / `am` / `ti` (BCP 47) for the page locale
- [ ] Self-canonical matches the localized URL (`https://geezconsulting.com` + locale path)
- [ ] Reciprocal `hreflang` for `en`, `am`, `ti`, plus `x-default` → English URL
- [ ] Incomplete surfaces keep `robots: noindex, nofollow` and/or `geez:translation-status=pending`
- [ ] Meta title and description are native-approved (≤ ~60 / ~155 chars where constrained)

### Chrome and navigation

- [ ] Header, footer, CTA, language selector, breadcrumbs use approved locale labels
- [ ] Language preference is remembered but **never** auto-redirects away from the landed URL
- [ ] Language switcher links to the equivalent bare path in the target locale

### Content surfaces

- [ ] Nav labels, FAQs, alt text, form labels, validation errors, consent, confirmations
- [ ] Auto-reply / notification email subjects and bodies (when enabled) are localized or EN-only with explicit staff process
- [ ] No duplicate or stale founder biography across homepage / about / locale files
- [ ] Service and Technology Support bodies are native — not EN wrapped for indexable publish

### Ethiopic layout

- [ ] Noto Sans Ethiopic loads; Fidel glyphs render without tofu
- [ ] Line-height comfortable for AM/TI (see `.geez-locale-am` / `.geez-locale-ti` in `design/css/base.css`)
- [ ] Buttons, nav, accordions: no clipping; wrap/overflow checked at 320px and 1280px
- [ ] Spot-check: homepage, services overview, Fit Call form, thank-you

### Slugs and parity

- [ ] Paths match slug map (or documented Ethiopic slug + redirect)
- [ ] Priority routes exist for EN/AM/TI with matching IA (see `PRIORITY_ROUTE_IDS` in `content/lib/locale-completeness.mjs`)
- [ ] Translation queue row for the surface is `approved` with `lastReviewed` date (YYYY-MM-DD)

## Automated checks

```bash
npm run localize:queue   # regenerates translation-queue.json + translation-work-queue.md
npm test                 # includes locale-completeness + hreflang tests
```

Queue artifacts:

- `content/data/shared/translation-queue.json`
- `docs/geez-redesign/translation-work-queue.md`

## Reviewer sign-off

| Surface | Locale | Reviewer | Date | Notes |
| --- | --- | --- | --- | --- |
| | am | | | |
| | ti | | | |
