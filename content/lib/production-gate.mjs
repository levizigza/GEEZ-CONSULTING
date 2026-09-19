import {
  collectClaimFields,
  isProductionRenderableClaim,
} from './claim.mjs';
import { filterProductionCaseStudies } from './case-studies.mjs';

/**
 * Deep-clone helper.
 * @param {unknown} value
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Strip or null-out claim fields that are not production-renderable.
 * Case studies use a stricter record-level gate (permission, outcomes, identity).
 * Testimonials still require at least one approved claim field.
 *
 * @param {Record<string, unknown>} bundle
 * @param {{ dropEmptyEntities?: boolean }} [opts]
 */
export function applyProductionGate(bundle, { dropEmptyEntities = true } = {}) {
  if (bundle?.meta && bundle.meta.productionSafe === false) {
    throw new Error(
      'Refusing to gate a non-production bundle (meta.productionSafe === false)',
    );
  }

  const out = clone(bundle);

  const visit = (node, path) => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
      return node.map((item, i) => visit(item, `${path}[${i}]`));
    }

    const obj = /** @type {Record<string, unknown>} */ (node);
    const isClaim =
      'approvalStatus' in obj && 'source' in obj && 'value' in obj;

    if (isClaim) {
      if (isProductionRenderableClaim(/** @type {any} */ (obj))) {
        return obj;
      }
      return {
        ...obj,
        value: null,
        approvalStatus: obj.approvalStatus,
        source: obj.source,
        lastReviewed: obj.lastReviewed,
        _blockedFromProduction: true,
      };
    }

    /** @type {Record<string, unknown>} */
    const next = {};
    for (const [key, val] of Object.entries(obj)) {
      next[key] = visit(val, `${path}.${key}`);
    }
    return next;
  };

  const gated = /** @type {Record<string, unknown>} */ (visit(out, '$'));

  if (dropEmptyEntities) {
    if (Array.isArray(gated.caseStudies)) {
      // Readiness uses original (pre-null) entities; gated list keeps only ready IDs.
      const original = Array.isArray(bundle.caseStudies)
        ? bundle.caseStudies
        : [];
      const readyIds = new Set(
        filterProductionCaseStudies(original).map((c) => /** @type {any} */ (c).id),
      );
      gated.caseStudies = original
        .filter((c) => c && readyIds.has(/** @type {any} */ (c).id))
        .map((c) => visit(clone(c), '$.caseStudies'));
    }
    if (Array.isArray(gated.testimonials)) {
      gated.testimonials = gated.testimonials.filter((entity) => {
        const claims = collectClaimFields(entity);
        return claims.some(({ field }) => isProductionRenderableClaim(field));
      });
    }
  }

  gated.meta = {
    ...(typeof gated.meta === 'object' && gated.meta ? gated.meta : {}),
    productionSafe: true,
    gatedAt: new Date().toISOString(),
  };

  return gated;
}

/**
 * @param {Record<string, unknown>} gatedBundle
 * @returns {{ path: string, ledgerId: string|null, approvalStatus: string }[]}
 */
export function listBlockedClaims(gatedBundle) {
  return collectClaimFields(gatedBundle)
    .filter(({ field }) => field && field._blockedFromProduction)
    .map(({ path, field }) => ({
      path,
      ledgerId: field.ledgerId ?? null,
      approvalStatus: field.approvalStatus,
    }));
}
