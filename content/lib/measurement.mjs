/**
 * First-party measurement schema (privacy-conscious).
 * Approved platform: this repository's GeezAnalytics + sanitizeAnalyticsEvent —
 * not a third-party vendor. Do not add GA/GTM/Meta/Plausible/etc. without approval.
 */

import {
  analyticsPiiViolations,
  sanitizeAnalyticsEvent,
} from './privacy.mjs';

/** @typedef {'en'|'am'|'ti'} LocaleCode */

export const MEASUREMENT_SCHEMA_VERSION = '1.0.0';

/** Storage keys for attribution + anonymous session (analytics consent only). */
export const MEASUREMENT_STORAGE_KEYS = {
  sessionId: 'geez_measure_sid_v1',
  attribution: 'geez_measure_attr_v1',
  dedupe: 'geez_measure_dedupe_v1',
  debug: 'geez_analytics_debug',
};

/**
 * Typed browser / funnel events (no PII properties).
 * @type {ReadonlyArray<string>}
 */
export const MEASUREMENT_EVENTS = Object.freeze([
  'service_page_view',
  'article_view',
  'language_select',
  'case_study_view',
  'service_finder_start',
  'service_finder_complete',
  'cta_click',
  'fit_form_start',
  'fit_form_submit',
  'booking_complete',
  'phone_click',
  'outbound_partner_click',
]);

/**
 * CRM pipeline stages (staff / CRM handoff — not browser analytics).
 * @type {ReadonlyArray<string>}
 */
export const CRM_STAGES = Object.freeze([
  'contacted',
  'booked',
  'qualified',
  'proposal_sent',
  'won',
  'lost',
]);

/** Allowlisted loss reasons for CRM `lost` stage (codes only). */
export const CRM_LOSS_REASONS = Object.freeze([
  'timing',
  'budget',
  'scope_mismatch',
  'chose_other_provider',
  'unresponsive',
  'not_a_fit',
  'other',
]);

/** Allowlisted page types for the shared event schema. */
export const PAGE_TYPES = Object.freeze([
  'home',
  'service',
  'services_overview',
  'article',
  'resources_index',
  'case_study',
  'client_results_index',
  'fit_form',
  'service_finder',
  'thank_you',
  'technology',
  'privacy',
  'legal',
  'other',
]);

/** Allowlisted CTA location tokens. */
export const CTA_LOCATIONS = Object.freeze([
  'header',
  'hero',
  'footer',
  'inline',
  'service_body',
  'article_body',
  'case_study_body',
  'finder_result',
  'thank_you',
  'nav',
  'unknown',
]);

/**
 * @param {string} event
 */
export function isMeasurementEvent(event) {
  return MEASUREMENT_EVENTS.includes(event);
}

/**
 * @param {string} stage
 */
export function isCrmStage(stage) {
  return CRM_STAGES.includes(stage);
}

/**
 * Parse UTM + coarse referrer (host only) from URL / document referrer.
 * Never stores full URLs with query PII.
 * @param {{ href?: string, referrer?: string }} [opts]
 */
export function parseAttribution(opts = {}) {
  const href = opts.href || '';
  /** @type {Record<string, string | null>} */
  const out = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    referrer_host: null,
  };
  try {
    const u = new URL(href, 'https://geezconsulting.com');
    for (const key of [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ]) {
      const v = u.searchParams.get(key);
      if (v && v.length <= 80 && !/@/.test(v)) out[key] = v.slice(0, 80);
    }
  } catch {
    /* ignore */
  }
  if (opts.referrer) {
    try {
      out.referrer_host = new URL(opts.referrer).hostname.slice(0, 120) || null;
    } catch {
      out.referrer_host = null;
    }
  }
  return out;
}

/**
 * Build the consistent event envelope. Callers pass only allowlisted props.
 * @param {{
 *   event: string,
 *   page: { path: string, page_type: string },
 *   locale: LocaleCode | string,
 *   service?: string | null,
 *   cta_location?: string | null,
 *   session?: { sid?: string | null } | null,
 *   attribution?: Record<string, string | null>,
 *   props?: Record<string, unknown>,
 *   ts?: string,
 * }} input
 */
export function buildMeasurementEvent(input) {
  if (!isMeasurementEvent(input.event)) {
    throw new Error(`Unknown measurement event: ${input.event}`);
  }
  const pageType = PAGE_TYPES.includes(input.page?.page_type)
    ? input.page.page_type
    : 'other';
  const path = normalizePath(input.page?.path || '/');
  const locale = normalizeLocale(input.locale);
  const cta =
    input.cta_location && CTA_LOCATIONS.includes(input.cta_location)
      ? input.cta_location
      : input.cta_location
        ? 'unknown'
        : null;

  /** @type {Record<string, unknown>} */
  const envelope = {
    event: input.event,
    schema_version: MEASUREMENT_SCHEMA_VERSION,
    ts: input.ts || new Date().toISOString(),
    page: { path, page_type: pageType },
    locale,
    service: sanitizeCode(input.service),
    cta_location: cta,
    session: {
      sid:
        input.session && typeof input.session.sid === 'string'
          ? input.session.sid.slice(0, 64)
          : null,
    },
    attribution: {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      referrer_host: null,
      ...(input.attribution || {}),
    },
    props: sanitizeProps(input.props || {}),
  };

  const { event, stripped } = sanitizeAnalyticsEvent(envelope);
  const violations = analyticsPiiViolations(event);
  return {
    ok: stripped.length === 0 && violations.length === 0,
    event: /** @type {Record<string, unknown>} */ (event),
    stripped,
    violations,
  };
}

/**
 * CRM stage handoff payload (staff systems). Never include free-text notes
 * that may contain PII — loss_reason is a code; detail stays in CRM only.
 * @param {{
 *   stage: string,
 *   service?: string | null,
 *   language?: string | null,
 *   source?: string | null,
 *   loss_reason?: string | null,
 *   inquiry_id?: string | null,
 *   ts?: string,
 * }} input
 */
export function buildCrmStageHandoff(input) {
  if (!isCrmStage(input.stage)) {
    throw new Error(`Unknown CRM stage: ${input.stage}`);
  }
  const loss =
    input.stage === 'lost'
      ? CRM_LOSS_REASONS.includes(String(input.loss_reason || ''))
        ? input.loss_reason
        : 'other'
      : null;

  const record = {
    kind: 'crm_stage',
    schema_version: MEASUREMENT_SCHEMA_VERSION,
    stage: input.stage,
    service: sanitizeCode(input.service),
    language: normalizeLocale(input.language || 'en'),
    source: sanitizeCode(input.source) || 'unknown',
    loss_reason: loss,
    inquiry_id:
      typeof input.inquiry_id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(input.inquiry_id)
        ? input.inquiry_id
        : null,
    ts: input.ts || new Date().toISOString(),
  };

  const { event, stripped } = sanitizeAnalyticsEvent(record);
  return {
    ok: stripped.length === 0,
    record: /** @type {Record<string, unknown>} */ (event),
    stripped,
  };
}

/**
 * Dedupe key helper (shared by browser + tests).
 * @param {string} event
 * @param {string} path
 * @param {string} [extra]
 */
export function measurementDedupeKey(event, path, extra = '') {
  return `${event}|${normalizePath(path)}|${extra}`.slice(0, 200);
}

/**
 * Props allowlist — categorical codes / booleans / short tokens only.
 * @param {Record<string, unknown>} props
 */
function sanitizeProps(props) {
  /** @type {Record<string, unknown>} */
  const out = {};
  const allow = new Set([
    'article_slug',
    'case_study_slug',
    'from_locale',
    'to_locale',
    'recommended_service',
    'finder_stage',
    'finder_goal',
    'help_category',
    'business_stage',
    'partner_id',
    'outbound_host',
    'submit_ok',
    'deduped',
  ]);
  for (const [k, v] of Object.entries(props)) {
    if (!allow.has(k)) continue;
    if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') {
      const s = v.slice(0, 80);
      if (!/@/.test(s) && !/^[+()\d\s.-]{7,20}$/.test(s)) out[k] = s;
    } else if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * @param {unknown} value
 */
function sanitizeCode(value) {
  if (value == null || value === '') return null;
  const s = String(value).slice(0, 80);
  if (!/^[a-z0-9][a-z0-9_./-]{0,79}$/i.test(s)) return null;
  return s;
}

/**
 * @param {string} path
 */
function normalizePath(path) {
  const p = String(path || '/').split('?')[0].split('#')[0] || '/';
  return p.startsWith('/') ? p.slice(0, 200) : `/${p}`.slice(0, 200);
}

/**
 * @param {unknown} locale
 * @returns {LocaleCode}
 */
function normalizeLocale(locale) {
  const l = String(locale || 'en').toLowerCase();
  if (l.startsWith('am')) return 'am';
  if (l.startsWith('ti')) return 'ti';
  return 'en';
}

/**
 * Map route bare path → page_type + optional service/slug props.
 * @param {string} barePath
 */
export function inferPageContext(barePath) {
  const path = normalizePath(barePath);
  if (path === '/') return { page_type: 'home', service: null, slug: null };
  if (path === '/services/' || path === '/services') {
    return { page_type: 'services_overview', service: null, slug: null };
  }
  const svc = path.match(/^\/services\/([a-z0-9-]+)\/?$/i);
  if (svc) return { page_type: 'service', service: svc[1], slug: svc[1] };
  if (path.startsWith('/resources/') && path !== '/resources/') {
    const slug = path.replace(/^\/resources\//, '').replace(/\/$/, '');
    return { page_type: 'article', service: null, slug };
  }
  if (path === '/resources/' || path === '/resources') {
    return { page_type: 'resources_index', service: null, slug: null };
  }
  if (path.startsWith('/client-results/') && path !== '/client-results/') {
    const slug = path
      .replace(/^\/client-results\//, '')
      .replace(/\/$/, '');
    return { page_type: 'case_study', service: null, slug };
  }
  if (path === '/client-results/' || path === '/client-results') {
    return { page_type: 'client_results_index', service: null, slug: null };
  }
  if (path.includes('book-a-fit-call')) {
    return { page_type: 'fit_form', service: null, slug: null };
  }
  if (path.includes('find-your-service')) {
    return { page_type: 'service_finder', service: null, slug: null };
  }
  if (path.includes('thank-you')) {
    return { page_type: 'thank_you', service: null, slug: null };
  }
  if (path.includes('technology-support')) {
    return { page_type: 'technology', service: null, slug: null };
  }
  if (path.includes('privacy')) {
    return { page_type: 'privacy', service: null, slug: null };
  }
  if (
    path.includes('disclaimers') ||
    path.includes('terms') ||
    path.includes('unsubscribe')
  ) {
    return { page_type: 'legal', service: null, slug: null };
  }
  return { page_type: 'other', service: null, slug: null };
}

/**
 * Auto page-view event name for a page_type, or null if none.
 * @param {string} pageType
 */
export function autoViewEventForPageType(pageType) {
  if (pageType === 'service') return 'service_page_view';
  if (pageType === 'article') return 'article_view';
  if (pageType === 'case_study') return 'case_study_view';
  return null;
}
