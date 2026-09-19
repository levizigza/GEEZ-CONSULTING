/**
 * Technical SEO helpers: titles, descriptions, Open Graph / Twitter,
 * image alt policy. No keyword stuffing; no invented NAP.
 */

import {
  SITE_ORIGIN,
  buildCanonical,
  buildHreflangAlternates,
  htmlLangFor,
} from './locale.mjs';
import { isProductionRenderableClaim } from './claim.mjs';

/** Open Graph locale tags (BCP 47 → OG). */
export const OG_LOCALE = {
  en: 'en_CA',
  am: 'am_ET',
  ti: 'ti_ET',
};

/**
 * @param {string} locale
 */
export function ogLocaleFor(locale) {
  return OG_LOCALE[locale] || OG_LOCALE.en;
}

/**
 * @param {string} locale
 */
export function ogLocaleAlternates(locale) {
  return Object.entries(OG_LOCALE)
    .filter(([code]) => code !== locale)
    .map(([, tag]) => tag);
}

/**
 * Claim value only when production-approved.
 * @param {import('../types/index.d.ts').ClaimField | null | undefined} field
 */
export function approvedClaimValue(field) {
  if (!isProductionRenderableClaim(field)) return null;
  return field.value;
}

/**
 * Unique, non-stuffed document title.
 * @param {{ pageTitle: string, brand?: string, maxLen?: number }} opts
 */
export function buildDocumentTitle({ pageTitle, brand = "Ge'ez Consulting", maxLen = 60 }) {
  const page = String(pageTitle || '').trim();
  const b = String(brand || '').trim();
  if (!page) return b.slice(0, maxLen);
  if (page.toLowerCase().includes(b.toLowerCase())) return page.slice(0, maxLen);
  const combined = `${page} | ${b}`;
  return combined.length <= maxLen ? combined : page.slice(0, maxLen);
}

/**
 * Meta description: prefer approved SEO claim, else visible page summary.
 * @param {{ preferred?: string | null, fallback: string, maxLen?: number }} opts
 */
export function buildMetaDescription({ preferred, fallback, maxLen = 155 }) {
  const raw = String(preferred || fallback || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen - 1).trimEnd()}…`;
}

/**
 * Meaningful alt: return trimmed alt, or null to mark decorative/omit.
 * Never invents descriptive text for missing alts.
 * @param {string | null | undefined} alt
 * @param {{ decorative?: boolean }} [opts]
 */
export function resolveImageAlt(alt, { decorative = false } = {}) {
  if (decorative) return { alt: '', decorative: true };
  const t = typeof alt === 'string' ? alt.trim() : '';
  if (!t) return { alt: null, decorative: false, omitUntilVerified: true };
  return { alt: t, decorative: false };
}

/**
 * Absolute asset URL for OG images when approved path is known.
 * @param {string | null | undefined} pathOrUrl
 */
export function absoluteAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_ORIGIN}${p}`;
}

/**
 * Build head meta model for a page (canonical + social).
 * @param {object} opts
 */
export function buildPageSeo({
  locale,
  barePath,
  title,
  description,
  robots = 'noindex, nofollow',
  ogType = 'website',
  ogImage = null,
  ogImageAlt = null,
  twitterCard = 'summary_large_image',
}) {
  const canonical = buildCanonical(locale, barePath);
  const alternates = buildHreflangAlternates(barePath);
  const ogLocale = ogLocaleFor(locale);
  const image = absoluteAssetUrl(ogImage);

  return {
    locale,
    htmlLang: htmlLangFor(locale),
    title,
    description,
    robots,
    canonical,
    alternates,
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      locale: ogLocale,
      localeAlternates: ogLocaleAlternates(locale),
      siteName: "Ge'ez Consulting",
      image,
      imageAlt: image ? ogImageAlt : null,
    },
    twitter: {
      card: image ? twitterCard : 'summary',
      title,
      description,
      image,
      imageAlt: image ? ogImageAlt : null,
    },
  };
}

/**
 * Render Open Graph + Twitter meta tags (escaped by caller or escapeHtml).
 * @param {ReturnType<typeof buildPageSeo>} seo
 * @param {(s: string) => string} escape
 */
export function renderSocialMeta(seo, escape) {
  const e = escape;
  const og = seo.openGraph;
  const tw = seo.twitter;
  /** @type {string[]} */
  const lines = [
    `<meta property="og:type" content="${e(og.type)}">`,
    `<meta property="og:url" content="${e(og.url)}">`,
    `<meta property="og:title" content="${e(og.title)}">`,
    `<meta property="og:description" content="${e(og.description)}">`,
    `<meta property="og:locale" content="${e(og.locale)}">`,
    `<meta property="og:site_name" content="${e(og.siteName)}">`,
  ];
  for (const alt of og.localeAlternates) {
    lines.push(`<meta property="og:locale:alternate" content="${e(alt)}">`);
  }
  if (og.image) {
    lines.push(`<meta property="og:image" content="${e(og.image)}">`);
    if (og.imageAlt) {
      lines.push(`<meta property="og:image:alt" content="${e(og.imageAlt)}">`);
    }
  }
  lines.push(
    `<meta name="twitter:card" content="${e(tw.card)}">`,
    `<meta name="twitter:title" content="${e(tw.title)}">`,
    `<meta name="twitter:description" content="${e(tw.description)}">`,
  );
  if (tw.image) {
    lines.push(`<meta name="twitter:image" content="${e(tw.image)}">`);
    if (tw.imageAlt) {
      lines.push(`<meta name="twitter:image:alt" content="${e(tw.imageAlt)}">`);
    }
  }
  return lines.join('\n  ');
}

/**
 * Appointment / Fit Call URL with UTM tags for GBP and citations.
 * @param {string} locale
 * @param {{ source?: string, medium?: string, campaign?: string }} [utm]
 */
export function appointmentUrlWithUtm(
  locale,
  { source = 'google', medium = 'organic', campaign = 'gbp' } = {},
) {
  const path =
    locale === 'en' ? '/book-a-fit-call/' : `/${locale}/book-a-fit-call/`;
  const u = new URL(path, SITE_ORIGIN);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}
