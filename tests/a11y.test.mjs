import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  runAxeOnHtml,
  runStructuralChecks,
  auditSamplePages,
  collectHighIssues,
  A11Y_SAMPLE_PAGES,
} from '../design/lib/a11y-audit.mjs';
import { contrastRatio, meetsWcag } from '../design/lib/contrast.mjs';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { renderFitFormPage } from '../site/intake/render.mjs';
import { JSDOM } from 'jsdom';
import { ensureDist, readDistFile, distRoot as root } from './lib/ensure-dist.mjs';

test('fit call contact radios have unique ids and label for attributes', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderFitFormPage('en', bundle.ui, navigation);
  assert.match(html, /id="preferredContactMethod-email"/);
  assert.match(html, /id="preferredContactMethod-phone"/);
  assert.match(html, /for="preferredContactMethod-email"/);
  assert.match(html, /for="preferredContactMethod-phone"/);
  assert.match(html, /id="preferredContactMethod"/);
});

test('footer note and headings avoid opacity and gold-accent small text', async () => {
  const primitives = await readFile(
    path.join(root, 'design/css/primitives.css'),
    'utf8',
  );
  const home = await readFile(
    path.join(root, 'site/homepage/homepage.css'),
    'utf8',
  );
  assert.match(primitives, /\.geez-footer__note/);
  const footerH2 = primitives.match(
    /\.geez-footer h2\s*\{[^}]+\}/,
  )?.[0];
  assert.ok(footerH2, 'footer h2 rule missing');
  assert.match(footerH2, /--geez-color-on-brand/);
  assert.doesNotMatch(footerH2, /gold-accent/);
  assert.doesNotMatch(home, /\.geez-footer__note\s*\{[^}]*opacity:\s*0\.9/);
  assert.ok(meetsWcag('#FFF8F4', '#3A0F18', 4.5));
});

test('skip link is visible on focus and focus-visible', async () => {
  const css = await readFile(path.join(root, 'design/css/base.css'), 'utf8');
  assert.match(css, /\.geez-skip:focus,\s*\n\.geez-skip:focus-visible/);
  assert.match(css, /overflow-wrap:\s*break-word/);
});

test('choice controls meet 24px-class target sizing', async () => {
  const css = await readFile(path.join(root, 'site/intake/intake.css'), 'utf8');
  assert.match(css, /\.geez-choice input\[type="checkbox"\]/);
  assert.match(css, /min-width:\s*1\.25rem/);
  assert.match(css, /min-height:\s*1\.25rem/);
});

test('consent banner uses region not incomplete dialog', async () => {
  const js = await readFile(path.join(root, 'site/privacy/consent.js'), 'utf8');
  assert.match(js, /role',\s*'region'/);
  assert.doesNotMatch(js, /role',\s*'dialog'/);
});

test('header stacks safely at narrow widths', async () => {
  const css = await readFile(
    path.join(root, 'design/css/primitives.css'),
    'utf8',
  );
  assert.match(css, /\.geez-nav-drawer/);
  assert.match(css, /@media \(min-width: 64rem\)/);
  assert.match(css, /\.geez-header__nav--desktop/);
  assert.match(css, /@media \(max-width: 22\.5rem\)/);
});

test('structural checks catch missing skip and lang', () => {
  const dom = new JSDOM(
    '<!DOCTYPE html><html><head><title>x</title></head><body><main><h1>Hi</h1></main></body></html>',
  );
  const issues = runStructuralChecks(dom.window.document, { locale: 'en' });
  assert.ok(issues.some((i) => i.id === 'html-lang'));
  assert.ok(issues.some((i) => i.id === 'skip-link'));
  assert.ok(issues.some((i) => i.id === 'main-id'));
});

test('sample pages have no critical/serious automated a11y issues', async () => {
  await ensureDist();

  const reports = await auditSamplePages({
    samples: A11Y_SAMPLE_PAGES.filter((s) =>
      [
        'EN home',
        'EN fit call',
        'EN finder',
        'AM home',
        'AM fit call',
        'TI home',
        'TI fit call',
        'TI privacy',
      ].includes(s.label),
    ),
  });
  const high = collectHighIssues(reports);
  assert.deepEqual(
    high,
    [],
    high.map((h) => `${h.page}:${h.id}:${h.message}`).join('\n'),
  );
});

test('AM/TI html lang and single h1 on home samples', async () => {
  for (const rel of ['am/index.html', 'ti/index.html']) {
    const html = await readDistFile(rel);
    const report = await runAxeOnHtml(html, {
      rel,
      locale: rel.startsWith('am') ? 'am' : 'ti',
    });
    assert.equal(report.structural.filter((s) => s.impact === 'critical').length, 0);
    assert.ok(!report.structural.some((s) => s.id.startsWith('html-lang')));
    assert.ok(!report.structural.some((s) => s.id === 'single-h1'));
  }
});

test('gold-accent remains insufficient on cream (regression)', () => {
  assert.ok(contrastRatio('#C9A227', '#F7F1E8') < 4.5);
});
