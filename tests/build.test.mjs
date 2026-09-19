import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readDistFile } from './lib/ensure-dist.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function countH1(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

test('production build writes homepage, services, and technology pages', async () => {
  const result = spawnSync(process.execPath, ['site/build.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  for (const rel of ['index.html', 'am/index.html', 'ti/index.html']) {
    const html = await readDistFile(rel);
    assert.equal(countH1(html), 1, rel);
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
    assert.match(html, /<main id="main">/);
  }

  const serviceFiles = [
    'services/index.html',
    'services/start-a-business/index.html',
    'services/business-plans-funding-readiness/index.html',
    'services/bookkeeping-payroll/index.html',
    'services/growth-operations/index.html',
    'technology-support/index.html',
    'client-results/index.html',
    'client-results/jonas-driving-school/index.html',
    'am/services/index.html',
    'am/client-results/index.html',
    'ti/technology-support/index.html',
  ];
  for (const rel of serviceFiles) {
    const html = await readDistFile(rel);
    assert.equal(countH1(html), 1, rel);
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
    assert.doesNotMatch(html, /Navigate Technology Solutions/i);
  }

  const crIndex = await readDistFile('client-results/index.html');
  assert.match(crIndex, /noindex/);
  assert.match(crIndex, /Stories in progress/);

  const draftCase = await readDistFile(
    'client-results/jonas-driving-school/index.html',
  );
  assert.match(draftCase, /noindex/);
  assert.doesNotMatch(draftCase, /"@type":"Article"/);
  assert.match(draftCase, /"@type":"BreadcrumbList"/);
  assert.match(draftCase, /geez-cr__media--pending/);

  const sitemap = await readDistFile('sitemap.xml');
  assert.match(sitemap, /urlset/);
  assert.doesNotMatch(sitemap, /<loc>/);

  await access(path.join(root, 'dist/assets/site-core.css'));
  await access(path.join(root, 'dist/assets/fonts-latin.css'));
  await access(path.join(root, 'dist/_headers'));
  await access(path.join(root, 'dist/assets/homepage.css'));
  await access(path.join(root, 'dist/assets/services.css'));
  await access(path.join(root, 'dist/assets/client-results.css'));
  await access(path.join(root, 'dist/assets/resources.css'));
  await access(path.join(root, 'dist/assets/privacy.css'));
  await access(path.join(root, 'dist/assets/consent.js'));
  await access(path.join(root, 'dist/assets/analytics.js'));
  await access(path.join(root, 'dist/assets/intake.css'));
  await access(path.join(root, 'dist/resources/index.html'));
  await access(path.join(root, 'dist/privacy/index.html'));
  await access(path.join(root, 'dist/disclaimers/index.html'));
  await access(path.join(root, 'dist/unsubscribe/index.html'));
  await access(
    path.join(
      root,
      'dist/resources/starting-a-business-in-alberta-newcomer-checklist/index.html',
    ),
  );
  await access(path.join(root, 'dist/assets/fit-form.js'));
  await access(path.join(root, 'dist/assets/service-finder.js'));
  await access(path.join(root, 'dist/assets/locale-preference.js'));
  await access(path.join(root, 'dist/robots.txt'));
  await access(path.join(root, 'dist/sitemap.xml'));
  await access(path.join(root, 'dist/book-a-fit-call/index.html'));
  await access(path.join(root, 'dist/find-your-service/index.html'));
  await access(path.join(root, 'dist/thank-you/index.html'));
  await access(path.join(root, 'dist/build-manifest.json'));

  const manifest = JSON.parse(await readDistFile('build-manifest.json'));
  assert.ok(manifest.pages.some((p) => p.includes('/services/')));
  assert.ok(manifest.pages.some((p) => p.includes('/technology-support/')));
  assert.ok(manifest.pages.some((p) => p.includes('/client-results/')));
  assert.ok(manifest.pages.some((p) => p.includes('/book-a-fit-call/')));
  assert.ok(manifest.pages.some((p) => p.includes('/find-your-service/')));
});
