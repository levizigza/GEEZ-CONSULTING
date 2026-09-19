/**
 * Case-study governance: validation, production readiness, anonymized display,
 * locale fallback, and JSON-LD limited to visible approved facts.
 */

import {
  collectClaimFields,
  isProductionRenderableClaim,
  validateClaimFieldShape,
} from './claim.mjs';

export const PERMISSION_STATUSES = new Set([
  'none',
  'pending',
  'story_anonymized',
  'named_public',
]);

export const OUTCOME_KINDS = new Set(['qualitative', 'quantitative']);

export const RELATED_SERVICE_PATHS = {
  'start-strong': '/services/start-a-business/',
  'plan-funding-readiness': '/services/business-plans-funding-readiness/',
  'books-payroll': '/services/bookkeeping-payroll/',
  'grow-with-a-system': '/services/growth-operations/',
};

/** Required ClaimField keys on a case-study record. */
export const REQUIRED_CASE_STUDY_CLAIM_KEYS = [
  'title',
  'summary',
  'clientSector',
  'permissionStatus',
  'businessStage',
  'situation',
  'constraint',
  'goal',
  'workPerformed',
  'deliverables',
  'scopeCaveat',
];

/**
 * @param {unknown} field
 */
function claimHasPublicValue(field) {
  if (!isProductionRenderableClaim(/** @type {any} */ (field))) return false;
  const v = /** @type {any} */ (field).value;
  if (v == null) return false;
  if (typeof v === 'string' && !v.trim()) return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

/**
 * Structural validation for one case-study entity.
 * @param {unknown} entity
 * @param {string} [path]
 * @returns {string[]}
 */
export function validateCaseStudyShape(entity, path = 'caseStudy') {
  /** @type {string[]} */
  const errors = [];
  if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
    return [`${path}: expected object`];
  }
  const cs = /** @type {Record<string, unknown>} */ (entity);

  for (const key of ['id', 'slug', 'locale', 'recordStatus', 'relatedServiceId']) {
    if (typeof cs[key] !== 'string' || !String(cs[key]).trim()) {
      errors.push(`${path}.${key}: non-empty string required`);
    }
  }
  if (cs.locale && !['en', 'am', 'ti'].includes(/** @type {string} */ (cs.locale))) {
    errors.push(`${path}.locale: must be en|am|ti`);
  }
  if (
    cs.recordStatus &&
    !['draft', 'pending_review', 'approved', 'rejected', 'remove'].includes(
      /** @type {string} */ (cs.recordStatus),
    )
  ) {
    errors.push(`${path}.recordStatus: invalid`);
  }
  if (
    cs.relatedServiceId &&
    !RELATED_SERVICE_PATHS[/** @type {string} */ (cs.relatedServiceId)]
  ) {
    errors.push(`${path}.relatedServiceId: unknown service id`);
  }

  for (const key of REQUIRED_CASE_STUDY_CLAIM_KEYS) {
    errors.push(...validateClaimFieldShape(cs[key], `${path}.${key}`));
  }

  for (const key of [
    'clientName',
    'anonymizedLabel',
    'timeline',
    'quote',
    'quoteApproverName',
    'quoteApproverRole',
  ]) {
    if (cs[key] !== undefined) {
      errors.push(...validateClaimFieldShape(cs[key], `${path}.${key}`));
    }
  }

  if (!Array.isArray(cs.outcomes) || cs.outcomes.length < 1) {
    errors.push(`${path}.outcomes: at least one outcome required`);
  } else {
    cs.outcomes.forEach((outcome, i) => {
      errors.push(...validateOutcomeShape(outcome, `${path}.outcomes[${i}]`));
    });
  }

  if (!cs.cta || typeof cs.cta !== 'object' || Array.isArray(cs.cta)) {
    errors.push(`${path}.cta: object required`);
  } else {
    const cta = /** @type {Record<string, unknown>} */ (cs.cta);
    if (typeof cta.label !== 'string' || !cta.label.trim()) {
      errors.push(`${path}.cta.label: non-empty string required`);
    }
    if (typeof cta.href !== 'string' || !cta.href.startsWith('/')) {
      errors.push(`${path}.cta.href: root-relative path required`);
    }
  }

  if (cs.image !== undefined && cs.image !== null) {
    if (typeof cs.image !== 'object' || Array.isArray(cs.image)) {
      errors.push(`${path}.image: object or null`);
    } else {
      const img = /** @type {Record<string, unknown>} */ (cs.image);
      errors.push(...validateClaimFieldShape(img.src, `${path}.image.src`));
      errors.push(...validateClaimFieldShape(img.alt, `${path}.image.alt`));
    }
  }

  for (const { path: p, field } of collectClaimFields(cs, path)) {
    errors.push(...validateClaimFieldShape(field, p));
  }

  return [...new Set(errors)];
}

/**
 * @param {unknown} outcome
 * @param {string} path
 */
export function validateOutcomeShape(outcome, path) {
  /** @type {string[]} */
  const errors = [];
  if (!outcome || typeof outcome !== 'object' || Array.isArray(outcome)) {
    return [`${path}: expected object`];
  }
  const o = /** @type {Record<string, unknown>} */ (outcome);
  if (!OUTCOME_KINDS.has(/** @type {string} */ (o.kind))) {
    errors.push(`${path}.kind: qualitative|quantitative required`);
  }
  for (const key of [
    'statement',
    'metricDefinition',
    'baseline',
    'resultValue',
    'window',
    'metricSource',
  ]) {
    errors.push(...validateClaimFieldShape(o[key], `${path}.${key}`));
  }
  return errors;
}

/**
 * @param {Record<string, unknown>} outcome
 */
export function isOutcomeProductionReady(outcome) {
  if (!outcome || typeof outcome !== 'object') return false;
  if (!claimHasPublicValue(outcome.statement)) return false;
  if (outcome.kind === 'qualitative') return true;
  if (outcome.kind === 'quantitative') {
    return [
      'metricDefinition',
      'baseline',
      'resultValue',
      'window',
      'metricSource',
    ].every((key) => claimHasPublicValue(outcome[key]));
  }
  return false;
}

/**
 * Permission + identity rules for public display.
 * @param {Record<string, unknown>} cs
 */
export function resolveIdentityDisplay(cs) {
  const permission = /** @type {any} */ (cs.permissionStatus)?.value;
  const namedOk =
    permission === 'named_public' &&
    isProductionRenderableClaim(/** @type {any} */ (cs.clientName)) &&
    /** @type {any} */ (cs.clientName).value;
  const anonOk =
    permission === 'story_anonymized' &&
    isProductionRenderableClaim(/** @type {any} */ (cs.anonymizedLabel)) &&
    /** @type {any} */ (cs.anonymizedLabel).value;

  if (namedOk) {
    return {
      mode: 'named',
      label: String(/** @type {any} */ (cs.clientName).value),
      showIdentity: true,
    };
  }
  if (anonOk) {
    return {
      mode: 'anonymized',
      label: String(/** @type {any} */ (cs.anonymizedLabel).value),
      showIdentity: false,
    };
  }
  return { mode: 'blocked', label: null, showIdentity: false };
}

/**
 * Full production gate for a case-study record.
 * @param {Record<string, unknown>} cs
 */
export function isCaseStudyProductionReady(cs) {
  if (!cs || typeof cs !== 'object') return false;
  if (cs.recordStatus !== 'approved') return false;

  for (const key of REQUIRED_CASE_STUDY_CLAIM_KEYS) {
    if (!claimHasPublicValue(cs[key])) return false;
  }

  const permission = /** @type {any} */ (cs.permissionStatus)?.value;
  if (permission !== 'named_public' && permission !== 'story_anonymized') {
    return false;
  }
  if (resolveIdentityDisplay(cs).mode === 'blocked') return false;

  if (!Array.isArray(cs.outcomes) || !cs.outcomes.some(isOutcomeProductionReady)) {
    return false;
  }

  const quote = /** @type {any} */ (cs.quote);
  if (isProductionRenderableClaim(quote) && quote.value) {
    if (!claimHasPublicValue(cs.quoteApproverName)) return false;
  }

  if (cs.image && typeof cs.image === 'object') {
    const img = /** @type {Record<string, unknown>} */ (cs.image);
    if (claimHasPublicValue(img.src) && !claimHasPublicValue(img.alt)) return false;
  }

  if (!cs.cta || typeof /** @type {any} */ (cs.cta).href !== 'string') return false;
  if (!RELATED_SERVICE_PATHS[/** @type {string} */ (cs.relatedServiceId)]) return false;

  return true;
}

/**
 * @param {unknown[]} items
 */
export function filterProductionCaseStudies(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) =>
      item &&
      typeof item === 'object' &&
      isCaseStudyProductionReady(/** @type {Record<string, unknown>} */ (item)),
  );
}

/**
 * Resolve case studies for a locale with EN fallback for missing translations.
 * @param {string} locale
 * @param {unknown[]} localeItems
 * @param {unknown[]} enItems
 * @param {{ productionOnly?: boolean }} [opts]
 */
export function resolveCaseStudiesForLocale(
  locale,
  localeItems,
  enItems,
  { productionOnly = true, allowEnglishFallback = false } = {},
) {
  const local = Array.isArray(localeItems) ? localeItems : [];
  const en = Array.isArray(enItems) ? enItems : [];
  const pick = productionOnly
    ? (list) => filterProductionCaseStudies(list)
    : (list) => list.filter((x) => x && typeof x === 'object');

  if (locale === 'en') {
    return pick(local).map((item) => ({
      item: /** @type {Record<string, unknown>} */ (item),
      usedFallback: false,
      sourceLocale: 'en',
    }));
  }

  const localPicked = pick(local);
  if (!allowEnglishFallback) {
    return localPicked.map((item) => ({
      item: /** @type {Record<string, unknown>} */ (item),
      usedFallback: false,
      sourceLocale: locale,
    }));
  }

  const localSlugs = new Set(
    localPicked.map((i) => /** @type {any} */ (i).slug).filter(Boolean),
  );
  const fallbacks = pick(en)
    .filter((i) => !localSlugs.has(/** @type {any} */ (i).slug))
    .map((item) => ({
      item: /** @type {Record<string, unknown>} */ (item),
      usedFallback: true,
      sourceLocale: 'en',
    }));

  return [
    ...localPicked.map((item) => ({
      item: /** @type {Record<string, unknown>} */ (item),
      usedFallback: false,
      sourceLocale: locale,
    })),
    ...fallbacks,
  ];
}

/**
 * @param {Record<string, unknown>} cs
 * @param {{ usedFallback?: boolean }} [meta]
 */
export function buildPublicCaseStudyView(cs, meta = {}) {
  const identity = resolveIdentityDisplay(cs);
  const timelineField = /** @type {any} */ (cs.timeline);
  const timeline =
    isProductionRenderableClaim(timelineField) && timelineField.value
      ? String(timelineField.value)
      : null;

  const imageSrc = /** @type {any} */ (cs.image)?.src;
  const imageAlt = /** @type {any} */ (cs.image)?.alt;
  const hasImage =
    isProductionRenderableClaim(imageSrc) &&
    imageSrc.value &&
    isProductionRenderableClaim(imageAlt) &&
    imageAlt.value;

  const outcomes = (Array.isArray(cs.outcomes) ? cs.outcomes : [])
    .filter(isOutcomeProductionReady)
    .map((o) => {
      const out = /** @type {Record<string, unknown>} */ (o);
      /** @type {Record<string, unknown>} */
      const view = {
        kind: out.kind,
        statement: String(/** @type {any} */ (out.statement).value),
      };
      if (out.kind === 'quantitative') {
        view.metricDefinition = String(/** @type {any} */ (out.metricDefinition).value);
        view.baseline = String(/** @type {any} */ (out.baseline).value);
        view.resultValue = String(/** @type {any} */ (out.resultValue).value);
        view.window = String(/** @type {any} */ (out.window).value);
        view.metricSource = String(/** @type {any} */ (out.metricSource).value);
      }
      return view;
    });

  const quoteField = /** @type {any} */ (cs.quote);
  const quote =
    isProductionRenderableClaim(quoteField) && quoteField.value
      ? {
          text: String(quoteField.value),
          approverName: String(/** @type {any} */ (cs.quoteApproverName).value),
          approverRole: isProductionRenderableClaim(/** @type {any} */ (cs.quoteApproverRole))
            ? String(/** @type {any} */ (cs.quoteApproverRole).value || '')
            : '',
        }
      : null;

  return {
    id: cs.id,
    slug: cs.slug,
    locale: cs.locale,
    title: String(/** @type {any} */ (cs.title).value),
    summary: String(/** @type {any} */ (cs.summary).value),
    sector: String(/** @type {any} */ (cs.clientSector).value),
    identity,
    businessStage: String(/** @type {any} */ (cs.businessStage).value),
    situation: String(/** @type {any} */ (cs.situation).value),
    constraint: String(/** @type {any} */ (cs.constraint).value),
    goal: String(/** @type {any} */ (cs.goal).value),
    workPerformed: String(/** @type {any} */ (cs.workPerformed).value),
    deliverables: /** @type {any} */ (cs.deliverables).value,
    timeline,
    outcomes,
    quote,
    scopeCaveat: String(/** @type {any} */ (cs.scopeCaveat).value),
    relatedServiceId: cs.relatedServiceId,
    relatedServicePath:
      RELATED_SERVICE_PATHS[/** @type {string} */ (cs.relatedServiceId)],
    cta: cs.cta,
    image: hasImage
      ? { src: String(imageSrc.value), alt: String(imageAlt.value) }
      : null,
    usedFallback: Boolean(meta.usedFallback),
    productionReady: isCaseStudyProductionReady(cs),
  };
}

/**
 * Article JSON-LD from visible approved facts only. No Review/AggregateRating/offers.
 * @param {ReturnType<typeof buildPublicCaseStudyView>} view
 * @param {string} absoluteUrl
 * @param {string} brand
 */
export function buildCaseStudyJsonLd(view, absoluteUrl, brand) {
  if (!view?.productionReady) return null;
  /** @type {Record<string, unknown>} */
  const data = {
    '@type': 'Article',
    headline: view.title,
    description: view.summary,
    url: absoluteUrl,
    author: { '@type': 'Organization', name: brand, url: 'https://geezconsulting.com' },
    publisher: { '@type': 'Organization', name: brand, url: 'https://geezconsulting.com' },
    about: {
      '@type': 'Service',
      name: String(view.relatedServiceId),
      url: `https://geezconsulting.com${view.relatedServicePath}`,
    },
  };
  if (view.identity.mode === 'named') {
    data.mentions = {
      '@type': 'Organization',
      name: view.identity.label,
    };
  }
  // Never AggregateRating / Review
  return data;
}
