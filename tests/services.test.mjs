import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import {
  renderServicesOverview,
  renderServiceDetail,
  listServiceDetailIds,
  buildServiceJsonLd,
} from '../site/services/render.mjs';
import { renderTechnologySupport } from '../site/technology/render.mjs';
import { servicesCatalogEn } from '../site/services/safe-copy.mjs';

function countH1(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

function extractJsonLd(html) {
  const m = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  return m ? JSON.parse(m[1]) : null;
}

test('service catalog covers overview plus four core services', () => {
  assert.ok(servicesCatalogEn.overview);
  for (const id of listServiceDetailIds()) {
    assert.ok(servicesCatalogEn[id], id);
    const s = servicesCatalogEn[id];
    for (const key of [
      'audience',
      'problem',
      'outcome',
      'deliverables',
      'process',
      'clientProvides',
      'timelinePricing',
      'exclusions',
      'faqs',
      'relatedResources',
    ]) {
      assert.ok(s[key], `${id}.${key}`);
    }
    assert.equal(s.process.length, 3);
    assert.equal(s.proof.render, false);
    assert.doesNotMatch(s.timelinePricing, /\$|CAD|\d+\s*%/i);
  }
});

test('services overview has one H1, breadcrumbs, and links to four services + tech', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderServicesOverview('en', bundle.ui, navigation);
  assert.equal(countH1(html), 1);
  assert.match(html, /aria-label="Breadcrumb"/);
  assert.match(html, /geez-page-band/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/start-a-business\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/business-plans-funding-readiness\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/bookkeeping-payroll\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/growth-operations\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/technology-support\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/book-a-fit-call\/"/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
  assert.doesNotMatch(html, /Navigate Technology Solutions/i);
});

test('each service detail includes required sections, one H1, CTA, no invented prices', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  for (const id of listServiceDetailIds()) {
    const html = renderServiceDetail(id, 'en', bundle.ui, navigation);
    assert.equal(countH1(html), 1, id);
    assert.match(html, /Who it is for/);
    assert.match(html, /The problem/);
    assert.match(html, /Desired outcome/);
    assert.match(html, /Deliverables/);
    assert.match(html, /How engagement works/);
    assert.match(html, /What you provide/);
    assert.match(html, /Timeline and pricing/);
    assert.match(html, /Scope exclusions/);
    assert.match(html, /Proof/);
    assert.match(html, /FAQ/);
    assert.match(html, /Related resources/);
    assert.match(html, /Book a Fit Call/);
    assert.match(html, /name="description"/);
    assert.match(html, /noindex/);
    assert.doesNotMatch(html, /\$\d|CAD\s*\d/i);
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
  }
});

test('Service JSON-LD contains only visible facts and no Offer', () => {
  const service = servicesCatalogEn['start-a-business'];
  const ld = buildServiceJsonLd(
    service,
    'https://geezconsulting.com/services/start-a-business/',
    "Ge'ez Consulting",
  );
  assert.equal(ld['@type'], 'Service');
  assert.equal(ld.name, service.h1);
  assert.equal(ld.description, service.metaDescription);
  assert.equal(ld.provider.name, "Ge'ez Consulting");
  assert.equal(ld.offers, undefined);
  assert.equal(ld.aggregateRating, undefined);
});

test('service detail HTML embeds matching Service JSON-LD', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderServiceDetail(
    'bookkeeping-payroll',
    'en',
    bundle.ui,
    navigation,
  );
  const ld = extractJsonLd(html);
  assert.ok(ld);
  assert.ok(ld['@graph']);
  const service = ld['@graph'].find((n) => n['@type'] === 'Service');
  assert.ok(service);
  assert.equal(service.name, 'Bookkeeping & Payroll');
  assert.match(service.url, /\/services\/bookkeeping-payroll\/$/);
  assert.equal(service.offers, undefined);
});

test('AM/TI service pages prefix locale paths and keep one H1', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  for (const locale of ['am', 'ti']) {
    const bundle = await loadLocaleBundle(locale);
    const html = renderServiceDetail(
      'growth-operations',
      locale,
      bundle.ui,
      navigation,
    );
    assert.equal(countH1(html), 1);
    assert.match(html, new RegExp(`lang="${locale}"`));
    assert.match(
      html,
      new RegExp(`href="(?:/GEEZ-CONSULTING)?/${locale}/book-a-fit-call/"`),
    );
    assert.match(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
  }
});

test('Technology Support is draft/noindex, omits partner name, has no Service JSON-LD', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderTechnologySupport('en', bundle.ui, navigation);
  assert.equal(countH1(html), 1);
  assert.match(html, /noindex/);
  assert.match(html, /draft/i);
  assert.match(html, /Contracting party/);
  assert.match(html, /Data handling/);
  assert.doesNotMatch(html, /Navigate Technology Solutions/i);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
  assert.equal(extractJsonLd(html), null);
  assert.match(html, /aria-label="Breadcrumb"/);
});
