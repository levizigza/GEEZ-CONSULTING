# Content roadmap — Resources & articles

Editorial plan for usefulness over volume. Outlines are **not** final expert advice. Legal, tax, payroll, financing, registration, immigration, credit, and program facts stay flagged until a qualified reviewer and dated primary sources are attached.

## Article model (implemented)

Each article record includes:

| Field | Purpose |
| --- | --- |
| `author` / `reviewer` | Named credits (ClaimFields) |
| `datePublished` / `dateModified` | ISO dates when approved |
| `citations` | Sources with `planned` / `needs_verification` / `verified` / `outdated` |
| `localeStatus` | `outline` \| `draft` \| `pending_translation` \| `pending_review` \| `approved` \| `retired` |
| `disclaimerCategory` | Drives on-page disclaimer framing |
| `relatedServiceId` | Links to one redesign service |
| `cta` | Fit Call or other path |
| `sections` + `reviewFlags` | Outline items; flags for qualified review |
| `downloads` | Accessible file metadata (tagged PDF or text alternative) |

Schema: `content/schema/article.schema.json`  
Logic: `content/lib/articles.mjs`  
UI: `site/resources/` (index + article template with TOC, update notice, related resources, downloads)

Production gate: `Article` JSON-LD and `index,follow` only when `isArticleProductionReady` (approved locale + claims). Outlines stay **noindex**.

---

## New outlines (EN)

| Slug | Related service | Primary flags | Status |
| --- | --- | --- | --- |
| `starting-a-business-in-alberta-newcomer-checklist` | Start Strong | registration, legal, tax, immigration, program | outline |
| `sole-proprietorship-vs-corporation-in-alberta-questions` | Start Strong | legal, tax, registration, immigration | outline |
| `what-a-lender-ready-business-plan-needs` | Plan & Funding | financing, credit, tax, program | outline |
| `bookkeeping-setup-for-the-first-year` | Books & Payroll | tax, payroll, legal | outline |
| `preparing-for-a-bdc-or-bank-conversation` | Plan & Funding | financing, credit, registration, program | outline |
| `calgary-alberta-newcomer-entrepreneur-resource-map` | Start Strong | program, immigration, registration, tax | outline |

**Before publish for each:** assign author + reviewer; verify every citation URL with `accessed` date; clear or retain flags only with evidence; AM/TI native translation (no English body on indexable locale pages).

---

## Audit: three 2024 WordPress posts

Evidence: live URLs inventoried 2026-09-18 (`content-inventory.md`, baseline audit). Bodies were not re-fetched as verified advice for this redesign; treat WP copy as **unverified** (CL-009).

### 1. How to Name Your Business

| | |
| --- | --- |
| **Legacy URL** | `/how-to-name-your-business/` (+ AM/TI `-2`/`-3` English shells) |
| **Redesign path** | `/resources/how-to-name-your-business/` (redirect already in `redirects.json`) |
| **Action** | **Update** (keep) |
| **Rationale** | Topic remains useful and maps to Start Strong / newcomer checklist. Generic naming tips need Alberta-specific questions and dated Corporate Registry / NUANS sources. |
| **Work** | Rewrite as checklist; remove trademark/registration outcome implications; cross-link new outlines; confirm author credit; translate or retire AM/TI shells (P0-02). |

### 2. Steps to Improve Your Credit and Financial Situation

| | |
| --- | --- |
| **Legacy URL** | `/steps-to-improve-your-credit-and-financial-situation/` |
| **Redesign path** | Temporarily `/resources/steps-to-improve-your-credit-and-financial-situation/` (draft/noindex) |
| **Action** | **Merge → redirect** |
| **Rationale** | High risk of implied credit/financial outcomes. Does not meet “no invented outcomes” / disclaimer policy without a full rewrite. Preparedness themes belong in lender conversation outline. |
| **Work** | Extract non-promissory checklist ideas into `preparing-for-a-bdc-or-bank-conversation`; 301 legacy URL (and `/resources/…` draft) to that article when the outline is approved; do not keep credit-repair framing; AM/TI stubs redirect with EN target only after locale translation or stay noindex. |

### 3. Unlocking the Power of Partnerships for Your Small Business

| | |
| --- | --- |
| **Legacy URL** | `/unlocking-the-power-of-partnerships-for-your-small-business/` |
| **Redesign path** | `/resources/unlocking-the-power-of-partnerships-for-your-small-business/` |
| **Action** | **Update** (keep URL; retitle) |
| **Rationale** | Partnership due diligence is useful for Growth & Operations. Motivational framing should become questions (roles, money, IP, exit) with lawyer review flagged. |
| **Work** | Retitle (e.g. “Questions to Ask Before a Business Partnership”); legal review of agreement topics; optional later merge into a broader growth guide; translate or retire AM/TI English shells. |

---

## Redirect summary (proposed)

| From | To | When |
| --- | --- | --- |
| Existing blog → resources redirects | Already in `redirects.json` | Now |
| Credit post (legacy + resources draft) | `/resources/preparing-for-a-bdc-or-bank-conversation/` | After lender-prep article approved |
| AM/TI numeric legacy article URLs | Locale `/resources/{shared-latin-slug}/` | Only when that locale is approved; else keep noindex targets |

---

## Publishing sequence (recommended)

1. Verify NAP + disclaimers (CL-015/018) so footers and article disclaimers are consistent.  
2. Complete **newcomer checklist** + **sole prop vs corp** outlines with dated Alberta/CRA sources + lawyer/CPA reviewer.  
3. Complete **lender-ready plan** + **BDC/bank conversation**; then merge/redirect the credit post.  
4. Complete **bookkeeping first year** with CPA reviewer.  
5. Complete **resource map** with permissioned partner names only (CL-002).  
6. Update/retitle **naming** and **partnerships** legacy articles.  
7. Native AM/TI translations after EN approval — never machine-fill production.  
8. Optional downloads: tagged PDF **or** HTML/text alternative before marking `available`.

---

## Monthly editorial checks

- [ ] Any outline still showing `sourceNeeded` / review flags without owner  
- [ ] Citation `accessed` dates older than 12 months → re-verify  
- [ ] No Article JSON-LD on outline/draft pages  
- [ ] AM/TI pages not silently English if indexable  
- [ ] Roadmap actions above still accurate after publish
