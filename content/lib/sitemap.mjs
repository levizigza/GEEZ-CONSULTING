/**
 * Sitemap + robots generation.
 * Sitemap includes only indexable (published + approved + not forced-noindex) URLs.
 */

import { SITE_ORIGIN, LOCALES } from './locale.mjs';
import { localizePath, resolveIndexability, expandLocaleRoutes } from './routes.mjs';

/**
 * @param {object} routesDoc
 * @param {{
 *   isRouteIndexable?: (route: object, locale: string) => boolean,
 *   caseStudyUrls?: { locale: string, path: string }[],
 * }} [opts]
 */
export function collectSitemapEntries(routesDoc, opts = {}) {
  /** @type {{ loc: string, lastmod?: string, changefreq?: string, priority?: string }[]} */
  const entries = [];
  const seen = new Set();

  for (const locale of LOCALES) {
    const expanded = expandLocaleRoutes(routesDoc, locale);
    for (const row of expanded) {
      const route = routesDoc.routes.find((r) => r.id === row.id) || row;
      const indexable =
        typeof opts.isRouteIndexable === 'function'
          ? opts.isRouteIndexable(route, locale)
          : resolveIndexability(route, { hasApprovedContent: false }).indexable;

      if (!indexable) continue;
      if (
        route.id === 'thank-you' ||
        route.id === 'service-finder' ||
        route.id === 'book-a-fit-call'
      ) {
        continue;
      }

      const loc = `${SITE_ORIGIN}${row.localizedPath || localizePath(locale, route.path)}`;
      if (seen.has(loc)) continue;
      seen.add(loc);
      entries.push({
        loc,
        changefreq: route.id === 'home' ? 'weekly' : 'monthly',
        priority: route.id === 'home' ? '1.0' : '0.7',
      });
    }
  }

  for (const cs of opts.caseStudyUrls || []) {
    const loc = cs.path.startsWith('http')
      ? cs.path
      : `${SITE_ORIGIN}${cs.path.startsWith('/') ? cs.path : `/${cs.path}`}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    entries.push({ loc, changefreq: 'monthly', priority: '0.6' });
  }

  return entries.sort((a, b) => a.loc.localeCompare(b.loc));
}

/**
 * @param {ReturnType<typeof collectSitemapEntries>} entries
 */
export function renderSitemapXml(entries) {
  const urls = entries
    .map((e) => {
      const last = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
      const cf = e.changefreq
        ? `\n    <changefreq>${e.changefreq}</changefreq>`
        : '';
      const pr = e.priority ? `\n    <priority>${e.priority}</priority>` : '';
      return `  <url>\n    <loc>${escapeXml(e.loc)}</loc>${last}${cf}${pr}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Safe robots.txt: allow crawl; block confirmation; point to sitemap.
 */
export function renderRobotsTxt({
  sitemapUrl = `${SITE_ORIGIN}/sitemap.xml`,
  extraDisallows = [],
} = {}) {
  const disallows = [
    '/thank-you/',
    '/am/thank-you/',
    '/ti/thank-you/',
    ...extraDisallows,
  ];
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Confirmation pages (always noindex)',
    ...disallows.map((d) => `Disallow: ${d}`),
    '',
    '# Sitemap lists only indexable URLs (drafts/noindex omitted)',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');
}

/**
 * @param {string} s
 */
function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
