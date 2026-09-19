/** @typedef {import('../types/index.d.ts').ClaimField} ClaimField */
/** @typedef {import('../types/index.d.ts').ApprovalStatus} ApprovalStatus */

export const TODO_VERIFICATION = 'TODO_VERIFICATION';

export const APPROVAL_STATUSES = new Set([
  'todo_verification',
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'remove',
]);

/**
 * @param {unknown} value
 * @param {object} [opts]
 * @param {string} [opts.source]
 * @param {ApprovalStatus} [opts.approvalStatus]
 * @param {string|null} [opts.lastReviewed]
 * @param {string|null} [opts.ledgerId]
 * @param {string} [opts.notes]
 * @returns {ClaimField}
 */
export function claimField(
  value,
  {
    source = TODO_VERIFICATION,
    approvalStatus = 'todo_verification',
    lastReviewed = null,
    ledgerId = null,
    notes = undefined,
  } = {},
) {
  /** @type {ClaimField} */
  const field = {
    value,
    source,
    approvalStatus,
    lastReviewed,
    ledgerId,
  };
  if (notes !== undefined) field.notes = notes;
  return field;
}

/**
 * A claim may render in production only when fully approved and sourced.
 * @param {ClaimField | null | undefined} field
 */
export function isProductionRenderableClaim(field) {
  if (!field || typeof field !== 'object') return false;
  if (field.approvalStatus !== 'approved') return false;
  if (!field.source || field.source === TODO_VERIFICATION) return false;
  if (!field.lastReviewed || !/^\d{4}-\d{2}-\d{2}$/.test(field.lastReviewed)) {
    return false;
  }
  return true;
}

/**
 * @param {unknown} field
 * @param {string} path
 * @returns {string[]}
 */
export function validateClaimFieldShape(field, path) {
  /** @type {string[]} */
  const errors = [];
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    errors.push(`${path}: expected ClaimField object`);
    return errors;
  }
  const f = /** @type {Record<string, unknown>} */ (field);
  if (!('value' in f)) errors.push(`${path}.value: required`);
  if (typeof f.source !== 'string' || !f.source.trim()) {
    errors.push(`${path}.source: non-empty string required`);
  }
  if (!APPROVAL_STATUSES.has(/** @type {string} */ (f.approvalStatus))) {
    errors.push(`${path}.approvalStatus: invalid`);
  }
  if (
    f.lastReviewed !== null &&
    (typeof f.lastReviewed !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(f.lastReviewed))
  ) {
    errors.push(`${path}.lastReviewed: null or YYYY-MM-DD required`);
  }
  if (
    f.ledgerId != null &&
    (typeof f.ledgerId !== 'string' || !/^CL-\d{3,}$/.test(f.ledgerId))
  ) {
    errors.push(`${path}.ledgerId: expected CL-### or null`);
  }
  return errors;
}

/**
 * Walk a value and collect ClaimField-like objects (objects with approvalStatus + source).
 * @param {unknown} node
 * @param {string} path
 * @returns {{ path: string, field: ClaimField }[]}
 */
export function collectClaimFields(node, path = '$') {
  /** @type {{ path: string, field: ClaimField }[]} */
  const found = [];
  if (!node || typeof node !== 'object') return found;
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      found.push(...collectClaimFields(item, `${path}[${i}]`));
    });
    return found;
  }
  const obj = /** @type {Record<string, unknown>} */ (node);
  const looksLikeClaim =
    'approvalStatus' in obj && 'source' in obj && 'value' in obj;
  if (looksLikeClaim) {
    found.push({ path, field: /** @type {ClaimField} */ (obj) });
  }
  for (const [key, val] of Object.entries(obj)) {
    if (looksLikeClaim && ['value', 'source', 'approvalStatus', 'lastReviewed', 'ledgerId', 'notes'].includes(key)) {
      continue;
    }
    found.push(...collectClaimFields(val, `${path}.${key}`));
  }
  return found;
}
