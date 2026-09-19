# Design system — Ge’ez Consulting

**Status:** Foundation only. No full pages composed. Not wired to live WordPress yet.  
**Code:** `design/` (CSS custom properties + semantic HTML primitives). No new UI library.  
**Showcase:** The repo has no Storybook / Vite app. Fixtures live in `design/lib/markup.mjs` for tests, not a public indexable route.

---

## Brand assets kept

| Keep | Why |
|------|-----|
| Logo mark / wordmark from WP media | Existing identity; replace only if rights/crop fail |
| Warm gold as **accent**, not body text | Live `#DAA727`-class gold fails AA on white (~2.4:1) |
| Skip-to-content pattern | Already on production |

| Change | Why |
|--------|-----|
| Burgundy `#4C1420` as brand surface/text | Requested primary; AA on cream and as `on-brand` text |
| Charcoal `#1C1917` body text | Replaces low-contrast white-on-white footer |
| Noto Sans + Noto Sans Ethiopic | Libre Baskerville / Work Sans lack Ethiopic coverage (baseline P1-08) |
| Weights 400 and 700 only | Fewer files, less CLS |

---

## Tokens

Source of truth: `design/tokens.json` (mirrored in `design/css/tokens.css`).

### Color (semantic)

| Token | Hex | Use |
|-------|-----|-----|
| `burgundy` | `#4C1420` | Brand, links, primary buttons, header/footer |
| `burgundy-strong` | `#3A0F18` | Hover/pressed brand |
| `gold-accent` | `#C9A227` | 4px rules, kickers **on burgundy only** |
| `gold-ink` | `#8A5A0A` | Gold **text** on light surfaces (AA) |
| `charcoal` | `#1C1917` | Body text |
| `ink-muted` | `#524A45` | Secondary text |
| `surface` | `#F7F1E8` | Page |
| `surface-raised` | `#FFFCFA` | Cards, inputs |
| `surface-sunken` | `#EFE6D8` | Subtle wells |
| `on-brand` | `#FFF8F4` | Text/icons on burgundy |
| `border` | `#D9CFC2` | Hairlines |
| `focus` | `#175CD3` | `:focus-visible` ring (not color-only state) |

**Status:** success `#067647` / `#ECFDF3`; warning `#854D0E` / `#FEF6E7`; danger `#B42318` / `#FEF3F2`; info `#175CD3` / `#EFF8FF`. Text + icon or text + weight; never color alone.

Documented pairs in `tokens.json` → `pairs` are tested to WCAG **2.2 AA** (4.5:1 text, 3.0:1 large/UI). Forbidden: `gold-accent` as text on cream/white.

### Typography

- Stack: `"Noto Sans", "Noto Sans Ethiopic", system-ui, sans-serif`
- Responsive: `clamp()` for `xs`–`display`
- Body ~1–1.125rem, line-height 1.6
- Headings burgundy, line-height 1.25
- Load with `display=swap`; production should **self-host** and subset by `unicode-range` (Latin vs Ethiopic) to limit CLS

### Spacing, radius, shadow, layout

- Space scale: 0.25–4rem (`--geez-space-1` … `8`)
- Radius: sm/md/lg
- Shadow: sm/md, burgundy-tinted, not theatrical
- Containers: 40rem / 45rem / 72rem
- Breakpoints: 32 / 48 / 64rem
- Touch: `--geez-touch: 2.75rem` (~44px) on buttons, nav, summary, inputs

### Motion

- Default: 150ms ease on color/background only
- `prefers-reduced-motion: reduce` zeroes animation/transition (tokens + base)

### Focus

- `:focus-visible` 2px solid `focus` + 2px offset
- Skip link visible on focus

---

## Primitives

All in `design/css/primitives.css`. Markup contracts in `design/lib/markup.mjs`.

| Primitive | Element | Rules |
|-----------|---------|--------|
| Button / Link | `button.geez-btn` / `a.geez-btn-link` | Same visual; do not nest. Disabled via `disabled` / `aria-disabled`. |
| Header | `header.geez-header` | Skip link, brand, 4 nav items, language nav, one CTA |
| Footer | `footer` + labelled `nav` | Services / company / legal |
| LanguageSelector | `nav.geez-lang` | Links + `hreflang`/`lang`; current via `aria-current="true"` **and** outline/weight |
| Card | `article.geez-card` | Heading contains the **one** link; whole card is not a button |
| Accordion | `details`/`summary` | Native keyboard; no inner buttons |
| FormField | label `for` + hint/error ids | `aria-describedby`; `aria-invalid` on error |
| ErrorSummary | `role="alert"` | Links to field ids; receive focus on failed submit (`design/js/primitives.js`) |
| Testimonial | `figure` > `blockquote` + `figcaption` | Do not render until claims approved |
| CaseStudyPreview | `article` + heading link | Same as card |
| Breadcrumbs | `nav[aria-label=Breadcrumb]` + `ol` | Current is `span[aria-current=page]` |
| Section | `section[aria-labelledby]` | Optional gold-ink kicker (not gold-accent on cream) |

**Do not:** nest links/buttons; use gold-accent for small text on light; index empty fixtures.

---

## WordPress mapping (later)

Copy CSS into a Blocksy **child theme**. Enqueue:

1. `fonts.css` (or `wp_enqueue_style` Google/self-host with `display=swap`)
2. `tokens.css`
3. `base.css`
4. `primitives.css`
5. `primitives.js` (defer)

Map Elementor kit colors to the same hex values. Do not add Elementor/HT Mega widgets for accordion if `details` suffices.

---

## Checks

```bash
npm test
```

Includes `tests/design-system.test.mjs` (contrast pairs + markup contracts).
