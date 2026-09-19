import test from 'node:test';
import assert from 'node:assert/strict';
import {
  localizePath,
  materializePath,
  resolveIndexability,
  expandLocaleRoutes,
  allLocalizedRouteTable,
  buildBreadcrumbs,
  buildHeaderNavigation,
  languageAlternates,
  localizeRedirectTarget,
  validateRoutingDocs,
  loadRoutingDocs,
  LOCALES,
  detectApprovedContent,
} from '../content/lib/routes.mjs';
import { loadLocaleBundle } from '../content/lib/load.mjs';

const { routes, redirects, navigation } = await loadRoutingDocs();

test('routing docs validate', () => {
  const errors = validateRoutingDocs(routes, redirects, navigation);
  assert.deepEqual(errors, [], errors.join('; '));
});

test('locale path prefixes follow Polylang convention', () => {
  assert.equal(localizePath('en', '/services/'), '/services/');
  assert.equal(localizePath('am', '/services/'), '/am/services/');
  assert.equal(localizePath('ti', '/'), '/ti/');
  assert.equal(
    localizePath('am', materializePath('/resources/:slug/', 'how-to-name-your-business')),
    '/am/resources/how-to-name-your-business/',
  );
});

test('draft routes are never effectively indexable', () => {
  for (const route of routes.routes) {
    const result = resolveIndexability(route, { hasApprovedContent: true });
    if (route.status === 'draft') {
      assert.equal(result.indexable, false, route.id);
      assert.match(result.robots, /noindex/);
    }
  }
});

test('thank-you stays noindex even if marked published with content', () => {
  const thankYou = routes.routes.find((r) => r.id === 'thank-you');
  const published = { ...thankYou, status: 'published', indexable: true };
  const result = resolveIndexability(published, { hasApprovedContent: true });
  assert.equal(result.indexable, false);
});

test('full locale route table covers all locales without empty indexable pages', () => {
  const table = allLocalizedRouteTable(routes);
  assert.equal(table.length, routes.routes.length * LOCALES.length);
  for (const row of table) {
    assert.equal(row.effectivelyIndexable, false);
    assert.ok(row.localizedPath.startsWith('/'));
    if (row.locale !== 'en') {
      assert.ok(
        row.localizedPath.startsWith(`/${row.locale}`),
        row.localizedPath,
      );
    }
  }
});

test('header is shallow: essential links + one primary CTA + language selector', () => {
  const header = buildHeaderNavigation(routes, navigation, 'en');
  assert.deepEqual(
    header.items.map((i) => i.routeId),
    ['home', 'services', 'resources', 'about-saba'],
  );
  assert.equal(header.primaryCta.routeId, 'book-a-fit-call');
  assert.equal(header.primaryCta.href, '/book-a-fit-call/');
  assert.equal(header.languageSelector.options.length, 3);
  assert.ok(header.languageSelector.ariaLabel);

  const am = buildHeaderNavigation(routes, navigation, 'am');
  assert.equal(am.primaryCta.href, '/am/book-a-fit-call/');
  assert.equal(am.items[1].href, '/am/services/');
});

test('breadcrumbs are task-shallow for a service page', () => {
  const crumbs = buildBreadcrumbs(
    routes,
    navigation,
    'en',
    'service-start-a-business',
  );
  assert.deepEqual(
    crumbs.map((c) => c.routeId),
    ['home', 'services', 'service-start-a-business'],
  );
  assert.equal(crumbs.at(-1).current, true);
  assert.equal(crumbs[1].href, '/services/');

  const ti = buildBreadcrumbs(
    routes,
    navigation,
    'ti',
    'service-bookkeeping-payroll',
  );
  assert.equal(ti[0].href, '/ti/');
  assert.equal(ti[1].href, '/ti/services/');
});

test('language alternates emit en/am/ti hreflang candidates plus x-default', () => {
  const alts = languageAlternates(routes, 'resources');
  assert.deepEqual(
    alts.map((a) => a.hreflang),
    ['en', 'am', 'ti', 'x-default'],
  );
  assert.deepEqual(
    alts.map((a) => a.href),
    ['/resources/', '/am/resources/', '/ti/resources/', '/resources/'],
  );
});

test('legacy redirects preserve inbound blog and article URLs', () => {
  const blog = redirects.redirects.find((r) => r.id === 'blog-to-resources');
  assert.equal(blog.from, '/blog/');
  assert.equal(blog.to, '/resources/');
  assert.equal(blog.statusCode, 301);

  const amArticle = redirects.redirects.find((r) => r.id === 'article-name-am');
  assert.equal(amArticle.from, '/am/how-to-name-your-business-2/');
  assert.equal(amArticle.to, '/am/resources/how-to-name-your-business/');

  const contact = redirects.redirects.find((r) => r.id === 'contact-alias');
  assert.equal(
    localizeRedirectTarget(contact, 'am'),
    '/am/book-a-fit-call/',
  );
});

test('client-results stays non-approved without production-ready case studies', async () => {
  const bundle = await loadLocaleBundle('en');
  const route = routes.routes.find((r) => r.id === 'client-results');
  assert.equal(detectApprovedContent(route, bundle), false);
  assert.equal(bundle.testimonials.length, 0);
  assert.ok(bundle.caseStudies.length >= 1);
  assert.ok(bundle.caseStudies.every((c) => c.recordStatus === 'draft'));
});

test('no draft route is flagged indexable in source data', () => {
  for (const route of routes.routes) {
    if (route.status === 'draft') assert.equal(route.indexable, false);
  }
});

test('expandLocaleRoutes includes technology support and legal pages', () => {
  const en = expandLocaleRoutes(routes, 'en');
  const ids = en.map((r) => r.id);
  for (const id of [
    'technology-support',
    'privacy',
    'terms',
    'disclaimers',
    'thank-you',
    'book-a-fit-call',
    'service-finder',
  ]) {
    assert.ok(ids.includes(id), id);
  }
});
