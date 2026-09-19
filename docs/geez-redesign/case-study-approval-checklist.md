# Case-study approval checklist

A case study may appear in production HTML **or** JSON-LD only when **all** boxes are checked. Partial approval is not enough.

Related: [client-interview-template.md](./client-interview-template.md) · claims ledger CL-001 / CL-022 · `content/lib/case-studies.mjs` (`isCaseStudyProductionReady`)

## Record gate

- [ ] `recordStatus` is `approved`
- [ ] Every required claim has `approvalStatus: approved`, non-`TODO_VERIFICATION` `source`, and `lastReviewed` (YYYY-MM-DD)
- [ ] Required fields present with public values: title, summary, clientSector, permissionStatus, businessStage, situation, constraint, goal, workPerformed, deliverables, scopeCaveat

## Permission & identity

- [ ] `permissionStatus` is `named_public` **or** `story_anonymized` (not `pending` / `none`)
- [ ] If `named_public`: `clientName` approved and shown
- [ ] If `story_anonymized`: `anonymizedLabel` approved; legal name **not** shown
- [ ] Client (or delegated approver) confirmed in writing

## Outcomes

- [ ] At least one production-ready outcome
- [ ] Qualitative outcomes have an approved statement only — metric fields null or unused
- [ ] Quantitative outcomes include approved metric definition, baseline, result, window, and source
- [ ] No inferred financing, revenue, profitability, or operational numbers from quotes alone

## Quote (optional)

- [ ] If a quote is published: quote text **and** `quoteApproverName` are approved
- [ ] Quote wording matches client-approved text (edits re-approved)

## Timeline & media (optional)

- [ ] Timeline published only if that claim is approved; otherwise omitted
- [ ] Image published only if `src` and `alt` are both approved; otherwise placeholder (no broken image)

## Service & CTA

- [ ] `relatedServiceId` maps to a real redesign service
- [ ] CTA label/href are correct (`/book-a-fit-call/` or approved alternate)
- [ ] Scope caveat approved and visible on the page

## Locale

- [ ] Locale file contains the approved record **or** EN fallback is explicitly allowed with visible fallback note
- [ ] AM/TI do not publish EN drafts via fallback

## Final publish

- [ ] Production gate / tests pass (`npm test`)
- [ ] Index lists the story; detail page has Article JSON-LD only from visible facts (no Review / AggregateRating / offers)
- [ ] Claims ledger updated (CL-001 / CL-022 status)

**Sign-off:** _______________  **Date:** _______________
