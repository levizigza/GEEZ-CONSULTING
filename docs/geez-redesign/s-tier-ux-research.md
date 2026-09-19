# S-tier consulting UX research — Ge’ez / Calgary

**Date:** 2026-09-19  
**Purpose:** Ground the visual + conversion redesign in proven consulting-site patterns and Calgary market reality.  
**Not legal advice. Not a promise of conversion lift** until post-launch measurement (see `measurement-plan.md`).

---

## 1. Patterns shared by high-performing consulting sites

Synthesized from McKinsey/Bain/Deloitte Digital case write-ups and 2025–2026 consulting UX practice guides:

| Pattern | Why it converts | Ge’ez application |
| --- | --- | --- |
| **Clarity in ≤5 seconds** | Reduces risk before a call | Hero states audience + offer + honest scope limit |
| **Person / expert presence** | Trust for boutique firms | Saba portrait as LCP hero (client-supplied) |
| **Intent pathways** | Filters unqualified traffic | Stage-based pathways with imagery |
| **Proof without hype** | Decision-makers distrust vague claims | FAQ + process; testimonials remain gated until approved |
| **Repeated CTAs** | Header / mid / end | Fit Call at hero, after pathways, final band |
| **Simplified nav** | Bain careers: busy home hurt conversion | Keep shallow header; elevate FAQ |
| **Modular design system** | Deloitte Digital unified brand | Tokens + cultural motif CSS, not template soup |
| **Mobile-first** | Majority of discovery traffic | Full-bleed hero that stacks; 44px targets |

**Anti-patterns to avoid:** generic stock “handshakes only,” invented metrics, purple SaaS gradients, card-heavy dashboards, missing human face for a founder-led practice.

---

## 2. Calgary / Alberta market validation

Practical takeaways from Calgary immigrant entrepreneurship research and Black entrepreneurship reporting (BDC, Startupcourt Calgary, UCalgary case work, K-Hub settlement knowledge):

- **Capital readiness & trust** matter more than glossy “growth hacking” language.
- **Culturally informed guidance** (language, newcomer systems literacy) is a differentiator — not ethnic-enclave-only marketing; Black-owned firms also serve the wider market.
- **Information quality** is scarce; unreliable advice is common — clear FAQ and no-guarantee posture builds credibility.
- Messaging should emphasize **planning, sequencing, books, funding conversations, operations** — aligned with existing service IA.

---

## 3. Tigrinya / Eritrean cultural blend (respectful)

- Prefer **authentic warmth**: Fidäl-capable type (Noto Sans Ethiopic), earth + burgundy + ochre (from Saba’s portrait), subtle woven/mesh motif — **not** generic “African pattern” kitsch or sacred symbols.
- Treat EN / AM / TI as **equal product journeys** (already policy).
- Asmara Art Deco / diaspora storytelling inform **geometry and light**, not costume.

---

## 4. Additional insights after review of live geezconsulting.com

The live site already has: service depth, founder narrative, named testimonials, FAQ-style answers, NAP, partner mention. The prior redesign correctly removed unverified proof but over-corrected into a **sparse, imagery-free shell** — which feels inferior.

**Upgrade thesis:** Restore **presence** (portrait, atmosphere photography, FAQ prominence, cultural atmosphere) while keeping **claim discipline** (no invented ratings/SLA; testimonials stay gated until ledger approval).

---

## 5. Implementation checklist (this pass)

- [x] Client portrait → `media/founder/saba-teklu.jpg`
- [x] Royalty-free Unsplash atmosphere → `media/atmosphere/*` + `media/ATTRIBUTION.md`
- [x] Full-bleed hero + founder section with portrait
- [x] Elevated FAQ (accordion, original-style practical Qs without fake prices)
- [x] Pathway imagery + cultural motif CSS
- [x] Display typography + ochre accent token (AA-safe)
- [x] Build copies media into `dist/`
- [x] EN / AM / TI safe-copy parity for hero, audience, founder, FAQ