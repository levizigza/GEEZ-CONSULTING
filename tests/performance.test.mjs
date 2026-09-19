import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  analyzeHtmlRequests,
  auditRepresentativePages,
} from '../design/lib/perf-audit.mjs';
import {
  buildImageCandidates,
  renderResponsiveImage,
} from '../content/lib/images.mjs';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { renderHomepageHtml, buildHomepageModel } from '../site/homepage/render.mjs';
import { ensureDist, readDistFile, distRoot as root } from './lib/ensure-dist.mjs';

test('responsive image helper emits picture/avif/webp and dimensions', () => {
  const candidate = buildImageCandidates({
    basePath: '/media/hero.jpg',
    width: 1200,
    height: 900,
    alt: 'Calgary storefront',
    priority: true,
  });
  const html = renderResponsiveImage(candidate, (s) => s);
  assert.match(html, /<picture>/);
  assert.match(html, /type="image\/avif"/);
  assert.match(html, /type="image\/webp"/);
  assert.match(html, /width="1200"/);
  assert.match(html, /height="900"/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /loading="eager"/);
});

test('EN pages do not load Ethiopic font stylesheet', async () => {
  const html = await readDistFile('index.html');
  assert.match(html, /fonts-latin\.css/);
  assert.doesNotMatch(html, /fonts-ethiopic\.css/);
  assert.match(html, /site-core\.css/);
  assert.match(html, /preconnect.*fonts\.gstatic\.com/);
});

test('AM pages load Ethiopic fonts in addition to Latin', async () => {
  const html = await readDistFile('am/index.html');
  assert.match(html, /fonts-latin\.css/);
  assert.match(html, /fonts-ethiopic\.css/);
});

test('representative pages stay within request/shape budgets', async () => {
  await ensureDist();
  const budget = JSON.parse(
    await readFile(path.join(root, 'design/perf-budget.json'), 'utf8'),
  );
  const report = await auditRepresentativePages(path.join(root, 'dist'), budget);
  assert.deepEqual(report.violations, [], report.violations.join('\n'));
  assert.ok(report.summary.jsBytes < budget.budgets.totalJsBytes);
  assert.ok(report.summary.cssBytes < budget.budgets.totalCssBytes);
});

test('no sync scripts in head; deferred site scripts only', async () => {
  for (const rel of [
    'index.html',
    'services/start-a-business/index.html',
    'book-a-fit-call/index.html',
  ]) {
    const html = await readDistFile(rel);
    const a = analyzeHtmlRequests(html);
    assert.equal(a.syncScriptsInHead, 0, rel);
    assert.ok(a.blockingStylesheetCount <= 4, rel);
  }
});

test('homepage includes consent.js and LCP portrait with dimensions', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const model = buildHomepageModel('en', bundle.ui, navigation, {
    business: bundle.business,
    serviceArea: bundle.serviceArea,
    languages: bundle.languages,
    founder: bundle.founder,
  });
  const html = renderHomepageHtml(model);
  assert.match(html, /consent\.js/);
  assert.match(html, /geez-home-hero__portrait/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /width="900"/);
  assert.match(html, /height="1125"/);
  assert.match(html, /site-core\.css/);
});

test('fit-form JS is page-scoped not global', async () => {
  const home = await readDistFile('index.html');
  const form = await readDistFile('book-a-fit-call/index.html');
  assert.doesNotMatch(home, /fit-form\.js/);
  assert.match(form, /fit-form\.js/);
});
