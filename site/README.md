# Static homepage build

Renders EN/AM/TI homepages into `dist/` using design tokens and **safe UI copy** only.

```bash
npm run build
```

- Unverified claims (trust logos, case studies, testimonials, founder photo, “20-minute” CTA) are omitted.
- Output is `noindex` until routes are published with approved content.
- No client-side JS for homepage content.
- Classical-column Elementor hero is not in this build; remove it on WordPress cutover when this homepage replaces the live home.
