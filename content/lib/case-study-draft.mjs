/**
 * Factory helpers for draft case-study ClaimFields (migration / interview stubs).
 * @param {unknown} value
 * @param {object} [opts]
 */
import { claimField, TODO_VERIFICATION } from '../lib/claim.mjs';

/**
 * @param {unknown} value
 * @param {{ ledgerId?: string, notes?: string, approvalStatus?: string, source?: string }} [opts]
 */
export function draftClaim(
  value,
  {
    ledgerId = 'CL-022',
    notes,
    approvalStatus = 'draft',
    source = TODO_VERIFICATION,
  } = {},
) {
  return claimField(value, {
    source,
    approvalStatus: /** @type {any} */ (approvalStatus),
    lastReviewed: null,
    ledgerId,
    notes,
  });
}

/**
 * Empty qualitative outcome shell — metric fields stay null (no invented numbers).
 * @param {string|null} statement
 * @param {object} [opts]
 */
export function qualitativeOutcomeDraft(statement, opts = {}) {
  return {
    kind: 'qualitative',
    statement: draftClaim(statement, opts),
    metricDefinition: draftClaim(null, {
      ...opts,
      notes: 'Not applicable for qualitative outcome',
    }),
    baseline: draftClaim(null, {
      ...opts,
      notes: 'Not applicable for qualitative outcome',
    }),
    resultValue: draftClaim(null, {
      ...opts,
      notes: 'Not applicable for qualitative outcome — never infer financing/revenue/profit figures',
    }),
    window: draftClaim(null, {
      ...opts,
      notes: 'Not applicable for qualitative outcome',
    }),
    metricSource: draftClaim(null, {
      ...opts,
      notes: 'Not applicable for qualitative outcome',
    }),
  };
}
