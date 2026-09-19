/**
 * Performance-oriented document head helpers (fonts, CSS, caching hints).
 */

/**
 * Font + core stylesheet links. Latin always; Ethiopic only for am/ti.
 * Async stylesheet pattern keeps fonts off the critical path with noscript fallback.
 * @param {{
 *   assetPrefix: string,
 *   locale: string,
 *   extraCss?: string[],
 *   escapeHtml: (s: string) => string,
 * }} opts
 */
export function renderStylesheetLinks({
  assetPrefix,
  locale,
  extraCss = [],
  escapeHtml,
}) {
  const e = escapeHtml;
  const base = e(assetPrefix);
  const ethiopic =
    locale === 'am' || locale === 'ti'
      ? `
  <link rel="stylesheet" href="${base}/fonts-ethiopic.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${base}/fonts-ethiopic.css"></noscript>`
      : '';

  const pageCss = extraCss
    .map(
      (f) =>
        `<link rel="stylesheet" href="${base}/${e(f)}">`,
    )
    .join('\n  ');

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${base}/fonts-latin.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${base}/fonts-latin.css"></noscript>${ethiopic}
  <link rel="stylesheet" href="${base}/site-core.css">
  ${pageCss}`;
}

/**
 * Page measurement config (no PII) + consent-gated first-party analytics.
 * @param {{
 *   assetPrefix: string,
 *   escapeHtml: (s: string) => string,
 *   locale?: string,
 *   pageType?: string,
 *   service?: string | null,
 *   slug?: string | null,
 * }} opts
 */
export function renderMeasurementTags({
  assetPrefix,
  escapeHtml,
  locale = 'en',
  pageType = 'other',
  service = null,
  slug = null,
}) {
  const e = escapeHtml;
  const base = e(assetPrefix);
  const config = {
    schema_version: '1.0.0',
    locale,
    page_type: pageType,
    service: service || null,
    slug: slug || null,
    platform: 'geez_first_party',
  };
  return `<script type="application/json" id="geez-measure-config">${JSON.stringify(
    config,
  )}</script>
  <script type="text/plain" data-geez-consent="analytics" src="${base}/analytics.js"></script>`;
}

/**
 * Sitewide deferred scripts (consent + locale). Optional RUM when approved.
 * Measurement loads via consent gate (not counted as active deferred JS until opt-in).
 * @param {{
 *   assetPrefix: string,
 *   escapeHtml: (s: string) => string,
 *   enableRum?: boolean,
 *   locale?: string,
 *   pageType?: string,
 *   service?: string | null,
 *   slug?: string | null,
 * }} opts
 */
export function renderDeferredScripts({
  assetPrefix,
  escapeHtml,
  enableRum = false,
  locale = 'en',
  pageType = 'other',
  service = null,
  slug = null,
}) {
  const e = escapeHtml;
  const base = e(assetPrefix);
  const rum = enableRum
    ? `
  <script>window.__GEEZ_RUM__=true;</script>
  <script src="${base}/web-vitals-rum.js" defer></script>`
    : '';
  const measure = renderMeasurementTags({
    assetPrefix,
    escapeHtml,
    locale,
    pageType,
    service,
    slug,
  });
  return `<script src="${base}/consent.js" defer></script>
  <script src="${base}/locale-preference.js" defer></script>
  <script src="${base}/ambient.js" defer></script>
  <script src="${base}/motion.js" defer></script>
  ${measure}${rum}`;
}
