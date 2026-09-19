/**
 * Mobile configuration matrix — viewport, safe-area, nav drawer, form zoom guards.
 * Configurations covered by layout/CSS contracts (not device farms):
 * - Widths: ~320 (SE), 360–412 (Android), 390–430 (iPhone), fluid fold/split
 * - Orientation: portrait + short landscape
 * - Chrome: notch / Dynamic Island / home indicator via viewport-fit + safe-area
 * - Keyboard: interactive-widget=resizes-content; inputs ≥16px (no iOS focus zoom)
 * - A11y: zoom allowed (no maximum-scale); text-size-adjust; touch ≥44px
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ensureDist, readDistFile, distRoot as root } from './lib/ensure-dist.mjs';

const VIEWPORT_RE =
  /name="viewport"[^>]*content="[^"]*width=device-width[^"]*initial-scale=1[^"]*viewport-fit=cover[^"]*interactive-widget=resizes-content/;

test('viewport meta enables cover + keyboard resize and never locks zoom', async () => {
  await ensureDist();
  for (const rel of [
    'index.html',
    'services/index.html',
    'book-a-fit-call/index.html',
    'am/index.html',
  ]) {
    const html = await readDistFile(rel);
    assert.match(html, VIEWPORT_RE, rel);
    assert.doesNotMatch(html, /maximum-scale\s*=\s*1/, rel);
    assert.doesNotMatch(html, /user-scalable\s*=\s*no/, rel);
  }
});

test('site-core hardens overflow, dvh, safe-area, and 16px form floors', async () => {
  const css = await readFile(path.join(root, 'dist/assets/site-core.css'), 'utf8');
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /100dvh/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /safe-area-inset-right/);
  assert.match(css, /font-size:\s*max\(1rem,\s*16px\)/);
  assert.match(css, /\.geez-nav-drawer/);
  assert.match(css, /@media \(max-width:\s*22\.5rem\)/);
  assert.match(css, /orientation:\s*landscape/);
});

test('home and interior pages ship a mobile Menu drawer', async () => {
  const home = await readDistFile('index.html');
  const services = await readDistFile('services/index.html');
  const fit = await readDistFile('book-a-fit-call/index.html');
  for (const [name, html] of [
    ['home', home],
    ['services', services],
    ['fit', fit],
  ]) {
    assert.match(html, /geez-nav-drawer/, name);
    assert.match(html, /geez-nav-drawer__summary/, name);
    assert.match(html, /geez-header__nav--desktop/, name);
  }
});

test('page CSS avoids fixed desktop-only widths that break phones', async () => {
  const files = [
    'site/homepage/homepage.css',
    'site/services/services.css',
    'site/intake/intake.css',
    'design/css/base.css',
    'design/css/primitives.css',
  ];
  for (const rel of files) {
    const css = await readFile(path.join(root, rel), 'utf8');
    assert.ok(
      !/width:\s*\d{4,}px/.test(css) && !/min-width:\s*\d{4,}px/.test(css),
      `${rel} has 1000px+ fixed width`,
    );
  }
});
