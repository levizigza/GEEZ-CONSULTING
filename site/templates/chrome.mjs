/** Shared HTML helpers and site chrome for static pages. */

import {
  buildCanonical,
  buildHreflangAlternates,
  barePathFrom,
  htmlLangFor,
} from '../../content/lib/locale.mjs';
import { buildPageSeo, renderSocialMeta } from '../../content/lib/seo.mjs';
import { getBasePath } from '../../content/lib/base-path.mjs';
import {
  renderStylesheetLinks,
  renderDeferredScripts,
} from './perf-head.mjs';
import { inferPageContext } from '../../content/lib/measurement.mjs';

/**
 * @param {string} s
 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {object} opts
 */
export function renderDocument({
  lang,
  locale = lang,
  dir = 'ltr',
  title,
  description,
  robots = 'noindex, nofollow',
  assetPrefix,
  bodyHtml,
  jsonLd = null,
  extraCss = [],
  /** bare path without locale prefix, e.g. /services/ */
  barePath = '/',
  canonical = null,
  alternates = null,
  translationPending = false,
  ogType = 'website',
  ogImage = null,
  ogImageAlt = null,
  social = true,
  /** Privacy-safe RUM — off until product approves */
  enableRum = false,
  /** Override inferred measurement page_type / service / slug */
  measure = null,
}) {
  const e = escapeHtml;
  const htmlLang = htmlLangFor(locale || lang);
  const loc = locale || 'en';
  const bare =
    barePathFrom(barePath) === barePath ? barePath : barePathFrom(barePath);
  const seo = buildPageSeo({
    locale: loc,
    barePath: bare,
    title,
    description,
    robots,
    ogType,
    ogImage,
    ogImageAlt,
  });
  const canon = canonical || seo.canonical;
  const alts = alternates || seo.alternates;

  const cssLinks = renderStylesheetLinks({
    assetPrefix,
    locale: loc,
    extraCss,
    escapeHtml: e,
  });

  const hreflangLinks = alts
    .map(
      (a) =>
        `<link rel="alternate" hreflang="${e(a.hreflang)}" href="${e(a.href)}">`,
    )
    .join('\n  ');

  const socialMeta = social
    ? renderSocialMeta({ ...seo, openGraph: { ...seo.openGraph, url: canon } }, e)
    : '';

  let ld = '';
  if (jsonLd) {
    const payload = Array.isArray(jsonLd)
      ? { '@context': 'https://schema.org', '@graph': jsonLd.filter(Boolean) }
      : jsonLd;
    ld = `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
  }

  const pendingMeta = translationPending
    ? `<meta name="geez:translation-status" content="pending">`
    : '';

  const bodyClass = [
    `geez-locale-${e(loc)}`,
    translationPending ? 'geez-translation-pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inferred = inferPageContext(bare);
  const pageType = measure?.page_type || inferred.page_type;
  const service = measure?.service ?? inferred.service;
  const slug = measure?.slug ?? inferred.slug;

  const deferred = renderDeferredScripts({
    assetPrefix,
    escapeHtml: e,
    enableRum,
    locale: loc,
    pageType,
    service,
    slug,
  });

  return `<!DOCTYPE html>
<html lang="${e(htmlLang)}" dir="${e(dir)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="robots" content="${e(robots)}">
  <meta name="description" content="${e(description)}">
  <meta name="geez-base-path" content="${e(getBasePath())}">
  <link rel="canonical" href="${e(canon)}">
  ${hreflangLinks}
  ${socialMeta}
  ${pendingMeta}
  ${cssLinks}
  ${ld}
</head>
<body class="${bodyClass}" data-geez-page-type="${e(pageType)}">
${bodyHtml}
  ${deferred}
</body>
</html>
`;
}

/**
 * Wrap English interim copy so it is not silent on am/ti pages.
 * @param {string} html
 * @param {string} locale
 */
export function withExplicitEnglish(html, locale) {
  if (locale === 'en') return html;
  return `<div lang="en">${html}</div>`;
}

/**
 * @param {object} m chrome model
 */
export function renderHeader(m) {
  const e = escapeHtml;
  const langItems = m.languages
    .map(
      (l) => `<li>
        <a href="${e(l.href)}" hreflang="${e(l.code)}" lang="${e(l.code)}"${
          l.current ? ' aria-current="true"' : ''
        }>${e(l.label)}</a>
      </li>`,
    )
    .join('\n');

  const currentAttr = (href) =>
    href === m.currentPath ? ' aria-current="page"' : '';

  return `<a class="geez-skip" href="#main">${e(m.skip)}</a>
  <header class="geez-header">
    <div class="geez-header__inner geez-container">
      <a class="geez-header__brand" href="${e(m.homeHref)}">${e(m.brand)}</a>
      <nav class="geez-header__nav" aria-label="${e(m.primaryNavAria)}">
        <ul>
          <li><a href="${e(m.homeHref)}"${currentAttr(m.homeHref)}>${e(m.nav.home)}</a></li>
          <li><a href="${e(m.servicesHref)}"${currentAttr(m.servicesHref)}>${e(m.nav.services)}</a></li>
          <li><a href="${e(m.resourcesHref)}"${currentAttr(m.resourcesHref)}>${e(m.nav.resources)}</a></li>
          <li><a href="${e(m.aboutHref)}"${currentAttr(m.aboutHref)}>${e(m.nav.about)}</a></li>
        </ul>
      </nav>
      <nav class="geez-lang" aria-label="${e(m.langAria)}">
        <ul>
          ${langItems}
        </ul>
      </nav>
      <div class="geez-header__cta">
        <a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="header">${e(m.ctaPrimary)}</a>
      </div>
    </div>
  </header>`;
}

/**
 * @param {{ label: string, href?: string, current?: boolean }[]} crumbs
 * @param {string} ariaLabel
 */
export function renderBreadcrumbs(crumbs, ariaLabel = 'Breadcrumb') {
  const e = escapeHtml;
  const items = crumbs
    .map((c, i) => {
      const isLast = i === crumbs.length - 1 || c.current;
      if (isLast || !c.href) {
        return `<li><span aria-current="page">${e(c.label)}</span></li>`;
      }
      return `<li><a href="${e(c.href)}">${e(c.label)}</a></li>`;
    })
    .join('\n');
  return `<nav class="geez-breadcrumbs" aria-label="${e(ariaLabel)}">
  <ol>
    ${items}
  </ol>
</nav>`;
}

/**
 * @param {object} m
 */
export function renderFooter(m) {
  const e = escapeHtml;
  return `<footer class="geez-footer">
  <div class="geez-container geez-footer__grid">
    <nav aria-label="${e(m.nav.services)}">
      <h2>${e(m.nav.services)}</h2>
      <ul>
        ${(m.footerServiceLinks || [])
          .map((l) => `<li><a href="${e(l.href)}">${e(l.label)}</a></li>`)
          .join('\n')}
      </ul>
    </nav>
    <nav aria-label="${e(m.brand)}">
      <h2>${e(m.brand)}</h2>
      <ul>
        <li><a href="${e(m.aboutHref)}">${e(m.nav.about)}</a></li>
        <li><a href="${e(m.resourcesHref)}">${e(m.nav.resources)}</a></li>
        <li><a href="${e(m.bookHref)}" data-geez-cta="footer">${e(m.ctaPrimary)}</a></li>
        ${
          m.clientResultsHref
            ? `<li><a href="${e(m.clientResultsHref)}">${e(
                m.nav.clientResults || 'Client Results',
              )}</a></li>`
            : ''
        }
      </ul>
    </nav>
    <nav aria-label="${e(m.footerLegalHeading || 'Legal')}">
      <h2>${e(m.footerLegalHeading || 'Legal')}</h2>
      <ul>
        <li><a href="${e(m.privacyHref)}">${e(m.footerPrivacy || 'Privacy')}</a></li>
        <li><a href="${e(m.termsHref)}">${e(m.footerTerms || 'Terms')}</a></li>
        <li><a href="${e(m.disclaimersHref)}">${e(
          m.footerDisclaimers || 'Disclaimers',
        )}</a></li>
      </ul>
      <p class="geez-footer__note">${e(m.footerLegalNote)}</p>
    </nav>
  </div>
</footer>`;
}
