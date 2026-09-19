# Non-production samples only

Files in this directory **must** set:

```json
{
  "nonProduction": true,
  "productionSafe": false
}
```

Loaders and `applyProductionGate` must refuse these for production rendering. They exist only to illustrate schema shape for testimonials and case studies.

Production case studies live in `locales/*/case-studies.json`. Migrated live testimonials are **qualitative drafts** there (CL-001) — never treat quote language as verified metrics.
