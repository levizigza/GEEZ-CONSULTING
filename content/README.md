# Content model (locale-ready)

This folder is the **source of truth for redesign copy and claim governance** while production remains WordPress + Polylang + Elementor.

## Why JSON here (not inventing a new CMS)

- No local WP theme/plugin source exists in this repo yet.
- JSON + tiny Node validators are the lightest typed layer that can later map to:
  - Polylang string groups / translated posts
  - Custom fields / CPT payloads
  - Elementor dynamic tags or a child-theme data bridge

**Do not render `approvalStatus !== "approved"` claim fields in production.** Use `content/lib/production-gate.mjs`.

## Layout

| Path | Role |
|------|------|
| `schema/` | JSON Schema for claim fields, case studies, + site bundle |
| `types/` | TypeScript declarations mirroring the schema |
| `lib/` | Load, validate, production gate (zero npm deps) |
| `data/shared/` | Locale-agnostic IDs, NAP, services, process, disclaimers, **routes**, **redirects**, **navigation** |
| `data/locales/{en,am,ti}/` | Locale strings and locale-bound entities |
| `data/_samples/` | **Non-production** placeholders only |

## Claim metadata (required on claim-bearing fields)

Every claim field is a `ClaimField`:

```json
{
  "value": "…",
  "source": "TODO_VERIFICATION",
  "approvalStatus": "todo_verification",
  "lastReviewed": null,
  "ledgerId": "CL-006",
  "notes": "optional"
}
```

`approvalStatus`: `todo_verification` | `draft` | `pending_review` | `approved` | `rejected` | `remove`

Production gate allows a claim only when:

1. `approvalStatus === "approved"`
2. `source` is present and **not** `TODO_VERIFICATION`
3. `lastReviewed` is an ISO date `YYYY-MM-DD`

## Commands

```bash
npm test
npm run validate
npm run validate:content
npm run validate:routes
npm run content:production
```
