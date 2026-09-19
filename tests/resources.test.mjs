import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import {
  validateArticleShape,
  isArticleProductionReady,
  filterIndexArticles,
  buildPublicArticleView,
  buildArticleJsonLd,
  collectReviewFlags,
  downloadIsRenderable,
} from '../content/lib/articles.mjs';
import {
  renderResourcesIndex,
  renderArticlePage,
  listArticlePagesForBuild,
} from '../site/resources/render.mjs';

function countH1(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

test('EN articles validate and include six new outlines plus three legacy', async () => {
  const doc = await readDataJson('locales/en/articles.json');
  assert.equal(doc.items.length, 9);
  for (const [i, item] of doc.items.entries()) {
    const errors = validateArticleShape(item, `items[${i}]`);
    assert.deepEqual(errors, [], errors.join('; '));
  }
  const slugs = doc.items.map((a) => a.slug);
  for (const slug of [
    'starting-a-business-in-alberta-newcomer-checklist',
    'sole-proprietorship-vs-corporation-in-alberta-questions',
    'what-a-lender-ready-business-plan-needs',
    'bookkeeping-setup-for-the-first-year',
    'preparing-for-a-bdc-or-bank-conversation',
    'calgary-alberta-newcomer-entrepreneur-resource-map',
  ]) {
    assert.ok(slugs.includes(slug), slug);
  }
});

test('outlines are not production-ready and carry review flags', async () => {
  const bundle = await loadLocaleBundle('en');
  const outline = bundle.articles.find(
    (a) => a.slug === 'starting-a-business-in-alberta-newcomer-checklist',
  );
  assert.equal(outline.localeStatus, 'outline');
  assert.equal(isArticleProductionReady(outline), false);
  const flags = collectReviewFlags(outline);
  assert.ok(flags.includes('registration') || flags.includes('legal'));
  const view = buildPublicArticleView(outline);
  assert.equal(view.isOutline, true);
  assert.equal(buildArticleJsonLd(view, 'https://example.com/x', 'Brand'), null);
});

test('legacy credit post is marked merge in roadmap fields', async () => {
  const bundle = await loadLocaleBundle('en');
  const credit = bundle.articles.find(
    (a) => a.slug === 'steps-to-improve-your-credit-and-financial-situation',
  );
  assert.equal(credit.roadmapAction, 'merge');
  assert.match(credit.roadmapNotes, /BDC or Bank/i);
});

test('Resources index lists EN outlines with badge and one H1', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderResourcesIndex(
    'en',
    bundle.ui,
    navigation,
    bundle.articles,
  );
  assert.equal(countH1(html), 1);
  assert.match(html, /Outline — under review/);
  assert.match(html, /starting-a-business-in-alberta-newcomer-checklist/);
  assert.match(html, /noindex/);
  assert.match(html, /og:title/);
});

test('article template has TOC, update notice, flags, sources, CTA', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const article = bundle.articles.find(
    (a) => a.slug === 'what-a-lender-ready-business-plan-needs',
  );
  const html = renderArticlePage(
    article,
    'en',
    bundle.ui,
    navigation,
    bundle.articles,
  );
  assert.equal(countH1(html), 1);
  assert.match(html, /geez-res-toc/);
  assert.match(html, /editorial outline|Outline — under review/i);
  assert.match(html, /Flagged for qualified review|geez-res-flag/);
  assert.match(html, /Sources and citations/);
  assert.match(html, /Related service/);
  assert.match(html, /Book a Fit Call/);
  assert.doesNotMatch(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
});

test('planned downloads are not linked as available files', () => {
  assert.equal(
    downloadIsRenderable({
      status: 'planned',
      href: null,
      label: 'x',
      format: 'pdf',
    }),
    false,
  );
  assert.equal(
    downloadIsRenderable({
      status: 'available',
      href: '/downloads/x.pdf',
      label: 'x',
      format: 'pdf',
    }),
    true,
  );
});

test('AM index stays empty while articles are pending_translation', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('am');
  assert.equal(filterIndexArticles(bundle.articles).length, 0);
  assert.equal(listArticlePagesForBuild('am', bundle.articles).length, 0);
  const html = renderResourcesIndex(
    'am',
    bundle.ui,
    navigation,
    bundle.articles,
  );
  assert.match(html, /በዝግጅት|empty|ጡመራ/);
});

test('locale bundles still validate with new article shapes', async () => {
  for (const locale of ['en', 'am', 'ti']) {
    const bundle = await loadLocaleBundle(locale);
    assert.equal(bundle.meta.productionSafe, true);
    assert.ok(bundle.articles.length >= 3);
  }
});
