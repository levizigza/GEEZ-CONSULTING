/**
 * Privacy / consent helpers for Alberta PIPA– and CASL-informed implementation.
 * This module is engineering control — not legal advice.
 */

/** Version string recorded with marketing consent events. */
export const MARKETING_CONSENT_VERSION = '1.0.0';

/** Version for non-essential cookie/script consent records. */
export const SCRIPT_CONSENT_VERSION = '2026-09-18.1';

/** localStorage keys owned by this site. */
export const STORAGE_KEYS = {
  /** Functional: last explicit language choice (essential UX). */
  localePreference: 'geez_lang_pref',
  /** Non-essential script categories (analytics, marketing embeds). */
  scriptConsent: 'geez_script_consent_v1',
};

/** Categories that must not load until opt-in consent. */
export const NON_ESSENTIAL_SCRIPT_CATEGORIES = ['analytics', 'marketing', 'embedded'];

/**
 * Field / property names that must never appear in analytics or public logs.
 * @type {ReadonlySet<string>}
 */
export const PII_PROPERTY_DENYLIST = new Set([
  'name',
  'email',
  'phone',
  'telephone',
  'mobile',
  'goalProblem',
  'goal',
  'message',
  'body',
  'company',
  'organization',
  'address',
  'streetAddress',
  'postalCode',
  'sin',
  'password',
  'referralSource',
  'timeline',
  'ip',
  'clientIp',
  'userAgent',
  'fullName',
  'firstName',
  'lastName',
]);

/**
 * @param {unknown} value
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursively strip denylisted keys and string values that look like email/phone.
 * Returns a new object safe for analytics sinks.
 * @param {unknown} payload
 * @returns {{ ok: boolean, event: unknown, stripped: string[] }}
 */
export function sanitizeAnalyticsEvent(payload) {
  /** @type {string[]} */
  const stripped = [];

  /**
   * @param {unknown} node
   * @param {string} path
   */
  function walk(node, path) {
    if (node == null) return node;
    if (typeof node === 'string') {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(node) || /^[+()\d\s.-]{7,20}$/.test(node)) {
        stripped.push(path || '(string)');
        return '[redacted]';
      }
      return node;
    }
    if (Array.isArray(node)) {
      return node.map((item, i) => walk(item, `${path}[${i}]`));
    }
    if (!isPlainObject(node)) return node;
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, val] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      if (PII_PROPERTY_DENYLIST.has(key)) {
        stripped.push(nextPath);
        continue;
      }
      out[key] = walk(val, nextPath);
    }
    return out;
  }

  const event = walk(payload, '');
  return { ok: stripped.length === 0, event, stripped };
}

/**
 * Assert analytics payload has no denylisted keys (strict — fails closed).
 * @param {unknown} payload
 * @returns {string[]} error messages (empty = pass)
 */
export function analyticsPiiViolations(payload) {
  const { stripped } = sanitizeAnalyticsEvent(payload);
  return stripped.map((p) => `PII property or pattern not allowed in analytics: ${p}`);
}

/**
 * Build a marketing-consent audit record (CASL-informed: specific, recorded).
 * @param {{ granted: boolean, source?: string, now?: Date }} opts
 */
export function buildMarketingConsentRecord({
  granted,
  source = 'fit-call-form',
  now = new Date(),
}) {
  return {
    granted: Boolean(granted),
    timestamp: now.toISOString(),
    source,
    version: MARKETING_CONSENT_VERSION,
  };
}

/**
 * Parse script-consent JSON from storage.
 * @param {string | null | undefined} raw
 */
export function parseScriptConsent(raw) {
  if (!raw) {
    return {
      version: SCRIPT_CONSENT_VERSION,
      analytics: false,
      marketing: false,
      embedded: false,
      updatedAt: null,
    };
  }
  try {
    const data = JSON.parse(raw);
    return {
      version: String(data.version || SCRIPT_CONSENT_VERSION),
      analytics: Boolean(data.analytics),
      marketing: Boolean(data.marketing),
      embedded: Boolean(data.embedded),
      updatedAt: data.updatedAt || null,
    };
  } catch {
    return {
      version: SCRIPT_CONSENT_VERSION,
      analytics: false,
      marketing: false,
      embedded: false,
      updatedAt: null,
    };
  }
}

/**
 * Whether a non-essential category may load.
 * @param {ReturnType<typeof parseScriptConsent>} consent
 * @param {string} category
 */
export function scriptCategoryAllowed(consent, category) {
  if (!NON_ESSENTIAL_SCRIPT_CATEGORIES.includes(category)) return true;
  return Boolean(/** @type {Record<string, unknown>} */ (consent)[category]);
}

/**
 * ClaimField → public string without leaking TODO_VERIFICATION.
 * @param {unknown} field
 * @param {string} pendingLabel
 */
export function privacyClaimDisplay(field, pendingLabel = 'Pending verification') {
  if (!field || typeof field !== 'object') return pendingLabel;
  const f = /** @type {Record<string, unknown>} */ (field);
  const status = String(f.approvalStatus || '');
  const value = f.value;
  if (
    status === 'todo_verification' ||
    status === 'rejected' ||
    value == null ||
    (typeof value === 'string' &&
      (!value.trim() || /TODO_VERIFICATION/i.test(value)))
  ) {
    return pendingLabel;
  }
  return String(value);
}
