import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio, meetsWcag } from '../design/lib/contrast.mjs';
import { allPrimitives, nestedInteractiveAntiPattern } from '../design/lib/markup.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

test('documented color pairs meet WCAG 2.2 AA for stated usage', async () => {
  const tokens = JSON.parse(
    await readFile(path.join(root, 'design/tokens.json'), 'utf8'),
  );
  for (const pair of tokens.pairs) {
    const fg = tokens.color[pair.fg];
    const bg = tokens.color[pair.bg];
    assert.ok(fg && bg, `${pair.fg}/${pair.bg} missing`);
    assert.ok(
      meetsWcag(fg, bg, pair.min),
      `${pair.usage}: ${fg} on ${bg} = ${contrastRatio(fg, bg).toFixed(2)} (need ${pair.min})`,
    );
  }
});

test('gold-accent is not used as text on light surfaces', async () => {
  const tokens = JSON.parse(
    await readFile(path.join(root, 'design/tokens.json'), 'utf8'),
  );
  for (const pair of tokens.forbiddenPairs) {
    const fg = tokens.color[pair.fg];
    const bg = tokens.color[pair.bg];
    assert.ok(contrastRatio(fg, bg) < 4.5, pair.reason);
  }
});

test('CSS tokens declare burgundy, gold, surfaces, focus, motion, touch', async () => {
  const css = await readFile(path.join(root, 'design/css/tokens.css'), 'utf8');
  for (const name of [
    '--geez-color-burgundy',
    '--geez-color-gold-accent',
    '--geez-color-gold-ink',
    '--geez-color-surface',
    '--geez-color-charcoal',
    '--geez-color-focus',
    '--geez-touch',
    '--geez-motion',
    '--geez-container-wide',
    '--geez-bp-md',
  ]) {
    assert.ok(css.includes(name), name);
  }
  assert.match(css, /prefers-reduced-motion/);
});

test('fonts load 400/700 only and include Ethiopic family', async () => {
  const latin = await readFile(
    path.join(root, 'design/css/fonts-latin.css'),
    'utf8',
  );
  const ethiopic = await readFile(
    path.join(root, 'design/css/fonts-ethiopic.css'),
    'utf8',
  );
  assert.match(latin, /Noto\+Sans/);
  assert.doesNotMatch(latin, /Noto\+Sans\+Ethiopic/);
  assert.match(ethiopic, /Noto\+Sans\+Ethiopic/);
  assert.match(latin, /display=swap/);
  assert.match(ethiopic, /display=swap/);
  assert.doesNotMatch(latin, /wght@400;500;600;700/);
});

test('primitives use semantic landmarks and skip link', () => {
  assert.match(allPrimitives.header, /<header class="geez-header">/);
  assert.match(allPrimitives.header, /class="geez-skip"/);
  assert.match(allPrimitives.header, /aria-label="Primary"/);
  assert.match(allPrimitives.footer, /<footer class="geez-footer">/);
  assert.equal(count(allPrimitives.header, 'aria-current="page"'), 1);
});

test('language selector is a named nav of links, not color-only current state', () => {
  const html = allPrimitives.languageSelector;
  assert.match(html, /aria-label="Language"/);
  assert.match(html, /hreflang="am"/);
  assert.match(html, /lang="ti"/);
  assert.match(html, /aria-current="true"/);
  assert.doesNotMatch(html, /<select/);
});

test('card and case preview keep a single link in the heading (no nested controls)', () => {
  assert.match(allPrimitives.card, /<article class="geez-card">/);
  assert.match(allPrimitives.card, /<h2><a /);
  assert.equal(count(allPrimitives.card, '<a '), 1);
  assert.equal(count(allPrimitives.caseStudyPreview, '<a '), 1);
});

test('accordion is native details/summary', () => {
  assert.match(allPrimitives.accordion, /<details class="geez-accordion">/);
  assert.match(allPrimitives.accordion, /<summary>/);
  assert.doesNotMatch(allPrimitives.accordion, /<button/);
});

test('form field has label for, describedby, and error id', () => {
  const html = allPrimitives.formField;
  assert.match(html, /<label for="geez-email">/);
  assert.match(html, /aria-describedby="geez-email-hint geez-email-error"/);
  assert.match(html, /autocomplete="email"/);
});

test('error summary is an alert with in-page links', () => {
  assert.match(allPrimitives.errorSummary, /role="alert"/);
  assert.match(allPrimitives.errorSummary, /href="#geez-email"/);
});

test('testimonial and breadcrumbs are semantic', () => {
  assert.match(allPrimitives.testimonial, /<blockquote>/);
  assert.match(allPrimitives.breadcrumbs, /aria-label="Breadcrumb"/);
  assert.match(allPrimitives.breadcrumbs, /aria-current="page"/);
  assert.match(allPrimitives.section, /aria-labelledby="services-heading"/);
});

test('nested interactive anti-pattern is documented as invalid', () => {
  assert.match(nestedInteractiveAntiPattern, /<button type="button">Outer<button/);
  for (const html of Object.values(allPrimitives)) {
    assert.doesNotMatch(html, /<button[^>]*>[\s\S]*<button/);
    assert.doesNotMatch(html, /<a [^>]*>[\s\S]*<button/);
  }
});

test('base CSS uses focus-visible and reduced motion', async () => {
  const css = await readFile(path.join(root, 'design/css/base.css'), 'utf8');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test('primitive CSS sets 44px-class touch min-height', async () => {
  const css = await readFile(path.join(root, 'design/css/primitives.css'), 'utf8');
  assert.match(css, /min-height: var\(--geez-touch\)/);
});
