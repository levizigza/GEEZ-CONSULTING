import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCanonical,
  buildHreflangAlternates,
  htmlLangFor,
  formatDate,
  formatNumber,
  barePathFrom,
  SITE_ORIGIN,
} from '../content/lib/locale.mjs';
import {
  auditLocaleCompleteness,
  findSilentEnglishRisks,
  isLocaleSurfaceComplete,
  robotsForLocalePage,
  PRIORITY_ROUTE_IDS,
} from '../content/lib/locale-completeness.mjs';
import { languageAlternates, loadRoutingDocs } from '../content/lib/routes.mjs';
import {
  renderServicesOverview,
  renderServiceDetail,
} from '../site/services/render.mjs';
import { renderDocument } from '../site/templates/chrome.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { routes } = await loadRoutingDocs();
const navigation = JSON.parse(
  await readFile(
    path.join(root, 'content/data/shared/navigation.json'),
    'utf8',
  ),
);

test('html lang tags are BCP 47 en/am/ti', () => {
  assert.equal(htmlLangFor('en'), 'en');
  assert.equal(htmlLangFor('am'), 'am');
  assert.equal(htmlLangFor('ti'), 'ti');
});

test('hreflang alternates are reciprocal with x-default to EN', () => {
  const bare = '/services/start-a-business/';
  const alts = buildHreflangAlternates(bare);
  assert.deepEqual(
    alts.map((a) => a.hreflang),
    ['en', 'am', 'ti', 'x-default'],
  );
  assert.equal(alts[0].href, `${SITE_ORIGIN}${bare}`);
  assert.equal(alts[1].href, `${SITE_ORIGIN}/am${bare}`);
  assert.equal(alts[2].href, `${SITE_ORIGIN}/ti${bare}`);
  assert.equal(alts[3].href, alts[0].href);
});

test('self-canonical is locale-specific', () => {
  assert.equal(
    buildCanonical('en', '/client-results/'),
    `${SITE_ORIGIN}/client-results/`,
  );
  assert.equal(
    buildCanonical('am', '/client-results/'),
    `${SITE_ORIGIN}/am/client-results/`,
  );
  assert.equal(barePathFrom('/ti/book-a-fit-call/'), '/book-a-fit-call/');
});

test('routes languageAlternates match locale helper URLs', () => {
  const alts = languageAlternates(routes, 'services');
  const helper = buildHreflangAlternates('/services/');
  assert.equal(alts.length, helper.length);
  for (let i = 0; i < alts.length; i += 1) {
    assert.equal(alts[i].hreflang, helper[i].hreflang);
    assert.equal(alts[i].absoluteHref, helper[i].href);
  }
});

test('locale-aware formatting uses Canada / Ethiopia tags', () => {
  const d = new Date('2026-03-15T12:00:00Z');
  assert.ok(formatDate('en', d).length > 0);
  assert.ok(formatDate('am', d).length > 0);
  assert.equal(formatNumber('en', 1234.5), '1,234.5');
});

test('locale completeness audit inventories gaps without inventing copy', async () => {
  const audit = await auditLocaleCompleteness();
  assert.equal(audit.policy, 'No machine-filled production translations');
  assert.ok(audit.items.length > 0);
  assert.ok(PRIORITY_ROUTE_IDS.includes('home'));
  assert.ok(audit.byLocale.am.incomplete > 0);
  assert.ok(audit.byLocale.ti.incomplete > 0);
  for (const row of audit.items) {
    assert.ok(row.id);
    assert.ok(row.locale);
    assert.ok(row.surface);
    assert.ok(row.context);
    assert.ok(row.status);
    assert.ok(row.reviewer);
    assert.ok('lastReviewed' in row);
    assert.ok('sourceString' in row);
    assert.doesNotMatch(String(row.notes), /machine.?fill production/i);
  }
  assert.equal(isLocaleSurfaceComplete(audit, 'am', 'services'), false);
  assert.match(robotsForLocalePage('am', false), /noindex/);
});

test('AM/TI service pages mark English interim explicitly and stay noindex', () => {
  const ui = {};
  const html = renderServicesOverview('am', ui, navigation);
  assert.match(html, /lang="am"/);
  assert.match(html, /lang="en"/);
  assert.match(html, /translation pending|shown in English|geez:translation-status/i);
  assert.match(html, /noindex/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(html, /rel="canonical"/);
  assert.equal(findSilentEnglishRisks('am', html).length, 0);

  const detail = renderServiceDetail('start-a-business', 'ti', ui, navigation);
  assert.match(detail, /lang="ti"/);
  assert.match(detail, /lang="en"/);
  assert.match(detail, /noindex/);
});

test('renderDocument emits reciprocal hreflang and self-canonical', () => {
  const html = renderDocument({
    lang: 'am',
    locale: 'am',
    title: 'Test',
    description: 'Desc',
    assetPrefix: '/assets',
    bodyHtml: '<main id="main"></main>',
    barePath: '/find-your-service/',
    translationPending: true,
  });
  assert.match(html, /hreflang="en"/);
  assert.match(html, /hreflang="am"/);
  assert.match(html, /hreflang="ti"/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(
    html,
    new RegExp(
      `rel="canonical" href="${SITE_ORIGIN.replace(/\./g, '\\.')}/am/find-your-service/"`,
    ),
  );
  assert.match(html, /geez:translation-status/);
  assert.match(html, /locale-preference\.js/);
});

test('slug map documents shared Latin strategy for priority paths', async () => {
  const map = JSON.parse(
    await readFile(
      path.join(root, 'content/data/shared/slug-map.json'),
      'utf8',
    ),
  );
  assert.equal(map.defaultStrategy, 'shared-latin-slug');
  const services = map.entries.find((e) => e.id === 'services');
  assert.equal(services.en, '/services/');
  assert.equal(services.am, '/am/services/');
  assert.equal(services.ti, '/ti/services/');
});
