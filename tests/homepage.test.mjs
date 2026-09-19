import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHomepageModel, renderHomepageHtml } from '../site/homepage/render.mjs';
import { homepageSafeCopy } from '../site/homepage/safe-copy.mjs';
import { readDataJson, loadLocaleBundle } from '../content/lib/load.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function countH1(html) {
  return (html.match(/<h1\b/gi) || []).length;
}

function hasHorizontalRisk(css) {
  return /width:\s*\d{4,}px/.test(css) || /min-width:\s*\d{4,}px/.test(css);
}

test('safe copy never exposes TODO_VERIFICATION strings', () => {
  const blob = JSON.stringify(homepageSafeCopy);
  assert.doesNotMatch(blob, /TODO_VERIFICATION/);
});

test('EN homepage has exactly one H1 and required landmarks', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderHomepageHtml(buildHomepageModel('en', bundle.ui, navigation));
  assert.equal(countH1(html), 1);
  assert.match(html, /<header class="geez-header/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<footer class="geez-footer">/);
  assert.match(html, /aria-label="Language"/);
  assert.match(html, /id="pathways"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="faq"/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
  assert.doesNotMatch(html, /carousel|swiper|slick/i);
  assert.match(html, /rel="canonical" href="https:\/\/geezconsulting\.com\/"/);
  assert.match(html, /hreflang="x-default"/);
  assert.match(html, /locale-preference\.js/);
  assert.match(html, /consent\.js/);
  // First-party deferred scripts + JSON-LD only — no third-party trackers.
  assert.doesNotMatch(
    html,
    /<script(?![^>]*(?:application\/ld\+json|consent\.js|locale-preference\.js|web-vitals-rum\.js|analytics\.js|intro\.js|geez-measure-config))/i,
  );
  assert.match(html, /defer/);
  assert.doesNotMatch(html, /googletagmanager|google-analytics|gtag\(|facebook\.net|hotjar|plausible/i);
  assert.match(html, /data-geez-consent="analytics"/);
  assert.match(html, /geez-measure-config/);
});

test('primary links point at Book a Fit Call and pathways', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderHomepageHtml(buildHomepageModel('en', bundle.ui, navigation));
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/book-a-fit-call\/"/);
  assert.match(html, /href="#pathways"/);
  assert.match(html, /Book a Fit Call/);
  assert.doesNotMatch(html, /20-minute|20 minute/i);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/start-a-business\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/business-plans-funding-readiness\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/bookkeeping-payroll\/"/);
  assert.match(html, /href="(?:\/GEEZ-CONSULTING)?\/services\/growth-operations\/"/);
});

test('locale behavior prefixes AM/TI paths and switches language current', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  for (const locale of ['am', 'ti']) {
    const bundle = await loadLocaleBundle(locale);
    const model = buildHomepageModel(locale, bundle.ui, navigation);
    const html = renderHomepageHtml(model);
    assert.equal(countH1(html), 1);
    assert.match(html, new RegExp(`lang="${locale}"`));
    assert.match(
      html,
      new RegExp(`href="(?:/GEEZ-CONSULTING)?/${locale}/book-a-fit-call/"`),
    );
    assert.match(
      html,
      new RegExp(`href="(?:/GEEZ-CONSULTING)?/${locale}/services/start-a-business/"`),
    );
    assert.match(html, new RegExp(`hreflang="${locale}"[^>]*aria-current="true"|aria-current="true"[^>]*hreflang="${locale}"`));
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
  }
});

test('live-site reviews + portrait + logo + socials ship; case studies stay gated', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const model = buildHomepageModel('en', bundle.ui, navigation);
  assert.equal(model.trust.render, true);
  assert.equal(model.caseStudy.render, false);
  assert.equal(model.testimonials.render, true);
  assert.ok(model.hero.image);
  assert.match(model.hero.image.src, /\/media\/founder\/saba-teklu\.jpg$/);
  assert.ok(model.founder.image);
  assert.equal(model.founder.name, 'Saba Teklu');
  assert.equal(model.slogan, 'More than paperwork');
  assert.ok(model.logo);
  assert.equal(model.socials.length, 4);
  const html = renderHomepageHtml(model);
  assert.match(html, /geez-home-trust/);
  assert.match(html, /geez-home-quotes/);
  assert.match(html, /Yonas Hila/);
  assert.match(html, /geez-home-hero__portrait/);
  assert.match(html, /\/media\/founder\/saba-teklu\.jpg/);
  assert.match(html, /geez-header__logo/);
  assert.match(html, /geez-intro/);
  assert.match(html, /linkedin\.com\/company\/geez-consulting/);
  assert.match(html, /instagram\.com\/geez\.consulting/);
  assert.match(html, /geez-home-audience/);
  assert.match(html, /geez-home-faq/);
  assert.match(html, /geez-home-card__media--start/);
  assert.match(html, /intro\.js/);
});

test('homepage CSS is mobile-safe at 360px class constraints', async () => {
  const css = await readFile(path.join(root, 'site/homepage/homepage.css'), 'utf8');
  assert.ok(!hasHorizontalRisk(css));
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /minmax\(0,/);
});

test('responsive image attributes appear when an image is provided', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const model = buildHomepageModel('en', bundle.ui, navigation);
  model.hero.image = {
    src: '/assets/founder.jpg',
    alt: 'Approved founder portrait',
    width: 800,
    height: 1000,
  };
  model.founder.image = {
    src: '/assets/founder.jpg',
    alt: 'Approved founder portrait',
    width: 400,
    height: 400,
  };
  const html = renderHomepageHtml(model);
  assert.match(html, /width="800"/);
  assert.match(html, /height="1000"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /loading="lazy"/);
});
