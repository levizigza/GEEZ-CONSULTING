/**
 * Locale helpers: BCP 47 lang tags, alternates, canonicals, preference policy.
 */

export const LOCALES = /** @type {const} */ (['en', 'am', 'ti']);

export const SITE_ORIGIN = 'https://geezconsulting.com';

/** HTML lang attribute values (BCP 47). */
export const HTML_LANG = {
  en: 'en',
  am: 'am',
  ti: 'ti',
};

/**
 * @param {string} locale
 */
export function htmlLangFor(locale) {
  return HTML_LANG[locale] || 'en';
}

/**
 * @param {string} locale
 * @param {string} path localized or bare path starting with /
 */
export function absoluteUrl(locale, path) {
  const p = path.startsWith('http') ? new URL(path).pathname : path;
  const localized =
    locale === 'en'
      ? p
      : p.startsWith(`/${locale}/`) || p === `/${locale}`
        ? p
        : p === '/'
          ? `/${locale}/`
          : `/${locale}${p.startsWith('/') ? p : `/${p}`}`;
  return `${SITE_ORIGIN}${localized.startsWith('/') ? localized : `/${localized}`}`;
}

/**
 * Reciprocal hreflang set + x-default (EN).
 * @param {string} barePath path without locale prefix, e.g. /services/
 * @param {{ includeXDefault?: boolean }} [opts]
 */
export function buildHreflangAlternates(barePath, { includeXDefault = true } = {}) {
  const bare = barePath.startsWith('/') ? barePath : `/${barePath}`;
  /** @type {{ hreflang: string, href: string }[]} */
  const alts = LOCALES.map((locale) => ({
    hreflang: locale,
    href: absoluteUrl(locale, bare),
  }));
  if (includeXDefault) {
    alts.push({ hreflang: 'x-default', href: absoluteUrl('en', bare) });
  }
  return alts;
}

/**
 * Self-canonical for the current locale URL.
 * @param {string} locale
 * @param {string} barePath
 */
export function buildCanonical(locale, barePath) {
  return absoluteUrl(locale, barePath);
}

/**
 * Strip locale prefix to get bare path.
 * @param {string} path
 */
export function barePathFrom(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p.replace(/^\/(am|ti)(?=\/|$)/, '') || '/';
}

/**
 * Policy: language preference may be remembered but must never force-redirect
 * a user who landed on a specific locale URL.
 */
export const LANGUAGE_PREFERENCE_POLICY = {
  storageKey: 'geez_lang_pref',
  forcedRedirect: false,
  offerSwitchBanner: true,
};

/** BCP 47 tags for Intl formatting (Canada). */
export const INTL_LOCALE = {
  en: 'en-CA',
  am: 'am-ET',
  ti: 'ti-ET',
};

/**
 * @param {string} locale
 */
export function intlLocaleFor(locale) {
  return INTL_LOCALE[locale] || INTL_LOCALE.en;
}

/**
 * Locale-aware date formatting (never invents calendar content).
 * @param {string} locale
 * @param {Date | string | number} value
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDate(locale, value, options = { dateStyle: 'medium' }) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(intlLocaleFor(locale), options).format(d);
}

/**
 * Locale-aware number formatting.
 * @param {string} locale
 * @param {number} value
 * @param {Intl.NumberFormatOptions} [options]
 */
export function formatNumber(locale, value, options = {}) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(intlLocaleFor(locale), options).format(value);
}
