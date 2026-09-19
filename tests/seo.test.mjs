import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDocumentTitle,
  buildMetaDescription,
  buildPageSeo,
  resolveImageAlt,
  appointmentUrlWithUtm,
  ogLocaleFor,
  approvedClaimValue,
} from '../content/lib/seo.mjs';
import {
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildServiceJsonLd,
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
  LOCAL_BUSINESS_TYPE,
} from '../content/lib/jsonld.mjs';
import {
  collectSitemapEntries,
  renderSitemapXml,
  renderRobotsTxt,
} from '../content/lib/sitemap.mjs';
import { loadRoutingDocs } from '../content/lib/routes.mjs';
import { readDataJson } from '../content/lib/load.mjs';
import { claimField } from '../content/lib/claim.mjs';
import { renderServicesOverview, renderServiceDetail } from '../site/services/render.mjs';
import { buildHomepageModel, renderHomepageHtml } from '../site/homepage/render.mjs';

const { routes, navigation } = await loadRoutingDocs();

test('document titles are unique and non-stuffed', () => {
  const a = buildDocumentTitle({ pageTitle: 'Services' });
  const b = buildDocumentTitle({ pageTitle: 'Start a Business' });
  assert.notEqual(a, b);
  assert.ok(a.length <= 60);
  assert.doesNotMatch(a, /calgary alberta calgary/i);
});

test('meta descriptions truncate cleanly', () => {
  const long = 'x'.repeat(200);
  const d = buildMetaDescription({ fallback: long, maxLen: 155 });
  assert.ok(d.length <= 155);
  assert.match(d, /…$/);
});

test('image alt policy never invents text', () => {
  assert.equal(resolveImageAlt(null).omitUntilVerified, true);
  assert.equal(resolveImageAlt('').omitUntilVerified, true);
  assert.equal(resolveImageAlt('Founder portrait').alt, 'Founder portrait');
  assert.equal(resolveImageAlt(null, { decorative: true }).alt, '');
});

test('OG locale maps en/am/ti', () => {
  assert.equal(ogLocaleFor('en'), 'en_CA');
  assert.equal(ogLocaleFor('am'), 'am_ET');
  assert.equal(ogLocaleFor('ti'), 'ti_ET');
  const seo = buildPageSeo({
    locale: 'am',
    barePath: '/services/',
    title: 'Services',
    description: 'Overview',
  });
  assert.equal(seo.openGraph.locale, 'am_ET');
  assert.ok(seo.openGraph.localeAlternates.includes('en_CA'));
  assert.match(seo.canonical, /\/am\/services\/$/);
});

test('appointment URL includes UTM tags', () => {
  const u = appointmentUrlWithUtm('en');
  assert.match(u, /utm_source=google/);
  assert.match(u, /utm_campaign=gbp/);
  assert.match(appointmentUrlWithUtm('ti'), /\/ti\/book-a-fit-call\//);
});

test('Organization JSON-LD omits NAP until claims are approved', async () => {
  const business = await readDataJson('shared/business.json');
  assert.equal(buildOrganizationJsonLd(business), null);

  const approved = {
    brandName: claimField("Ge'ez Consulting", {
      source: 'https://geezconsulting.com/',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-011',
    }),
    streetAddress: claimField('5235 28 Ave SE', {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-007',
    }),
    addressLocality: claimField('Calgary', {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-007',
    }),
    addressRegion: claimField('AB', {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-007',
    }),
    addressCountry: claimField('CA', {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-007',
    }),
    telephoneE164: claimField('+14037002065', {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-006',
    }),
    sameAs: claimField([], {
      source: 'owner',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
      ledgerId: 'CL-012',
    }),
  };
  const org = buildOrganizationJsonLd(approved);
  assert.equal(org['@type'], LOCAL_BUSINESS_TYPE);
  assert.equal(org.name, "Ge'ez Consulting");
  assert.ok(org.address);
  assert.equal(org.telephone, '+14037002065');
  assert.equal('aggregateRating' in org, false);
  assert.equal('review' in org, false);
});

test('Person JSON-LD requires approved founder name', async () => {
  const founder = await readDataJson('locales/en/founder.json');
  assert.equal(buildPersonJsonLd(founder), null);
  assert.equal(approvedClaimValue(founder.displayName), null);
});

test('Service JSON-LD has no Offer or AggregateRating', () => {
  const ld = buildServiceJsonLd(
    {
      h1: 'Start a Business',
      metaDescription: 'Launch support in Alberta.',
      audience: 'New entrepreneurs',
    },
    'https://geezconsulting.com/services/start-a-business/',
    "Ge'ez Consulting",
  );
  assert.equal(ld['@type'], 'Service');
  assert.equal('offers' in ld, false);
  assert.equal('aggregateRating' in ld, false);
});

test('BreadcrumbList mirrors visible trail', () => {
  const ld = buildBreadcrumbListJsonLd(
    [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services/' },
      { label: 'Start a Business', href: '/services/start-a-business/', current: true },
    ],
    'en',
  );
  assert.equal(ld['@type'], 'BreadcrumbList');
  assert.equal(ld.itemListElement.length, 3);
});

test('JSON-LD graph strips rating keys', () => {
  const graph = buildJsonLdGraph([
    { '@type': 'Organization', name: 'X', aggregateRating: { ratingValue: 5 } },
  ]);
  assert.equal('aggregateRating' in graph['@graph'][0], false);
});

test('sitemap excludes draft/noindex routes', () => {
  const entries = collectSitemapEntries(routes, {
    isRouteIndexable: () => false,
  });
  assert.equal(entries.length, 0);
  const xml = renderSitemapXml(entries);
  assert.match(xml, /<urlset/);
  assert.doesNotMatch(xml, /<loc>/);
});

test('robots.txt is safe and points at sitemap', () => {
  const txt = renderRobotsTxt();
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Disallow: \/thank-you\//);
  assert.match(txt, /Sitemap: https:\/\/geezconsulting\.com\/sitemap\.xml/);
});

test('service pages emit OG tags, breadcrumbs, and Service graph', async () => {
  const html = renderServiceDetail('start-a-business', 'en', {}, navigation);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:locale" content="en_CA"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /geez-breadcrumbs/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(html, /AggregateRating/);
  assert.match(html, /Other services/);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);

  const overview = renderServicesOverview('en', {}, navigation);
  assert.match(overview, /Find your service/);
  assert.match(overview, /property="og:url"/);
});

test('homepage emits unique title, OG, and omits Organization until NAP approved', async () => {
  const bundleBusiness = await readDataJson('shared/business.json');
  const model = buildHomepageModel('en', {}, navigation, {
    business: bundleBusiness,
  });
  const html = renderHomepageHtml(model);
  assert.match(html, /<title>Business launch and growth support in Calgary/);
  assert.match(html, /property="og:description"/);
  assert.doesNotMatch(html, /"@type":"ProfessionalService"/);
  assert.doesNotMatch(html, /AggregateRating/);
});

test('production build writes empty-safe sitemap and robots', async () => {
  // Rely on build.test for full build; verify generators produce empty urlset for drafts.
  const entries = collectSitemapEntries(routes, {
    isRouteIndexable: () => false,
  });
  const xml = renderSitemapXml(entries);
  assert.doesNotMatch(xml, /<loc>/);
  assert.match(renderRobotsTxt(), /Sitemap:/);
});
