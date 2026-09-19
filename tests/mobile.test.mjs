/**
 * Viewport configuration matrix — mobile + PC screen configs.
 * Configurations covered by layout/CSS contracts (not device farms):
 * Mobile widths: ~320 (SE), 360–412 (Android), 390–430 (iPhone), fold/split
 * PC widths: 1024 tablet-land, 1280–1440 laptop, 1920 desktop, 2560 ultrawide
 * Orientation: portrait + short landscape
 * Chrome: notch / Dynamic Island / home indicator via viewport-fit + safe-area
 * Keyboard: interactive-widget=resizes-content; inputs ≥16px (no iOS focus zoom)
 * A11y: zoom allowed (no maximum-scale); text-size-adjust; touch ≥44px
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ensureDist, readDistFile, distRoot as root } from './lib/ensure-dist.mjs';

const VIEWPORT_RE =
  /name="viewport"[^>]*content="[^"]*width=device-width[^"]*initial-scale=1[^"]*viewport-fit=cover[^"]*interactive-widget=resizes-content/;

/** Representative matrix used as documentation + CSS contract anchors (px). */
export const VIEWPORT_MATRIX = [
  { name: 'iphone-se', w: 320, h: 568, kind: 'mobile' },
  { name: 'android-360', w: 360, h: 740, kind: 'mobile' },
  { name: 'iphone-14', w: 390, h: 844, kind: 'mobile' },
  { name: 'iphone-14-pro-max', w: 430, h: 932, kind: 'mobile' },
  { name: 'android-412', w: 412, h: 915, kind: 'mobile' },
  { name: 'phone-landscape', w: 740, h: 360, kind: 'mobile-landscape' },
  { name: 'ipad-portrait', w: 768, h: 1024, kind: 'tablet' },
  { name: 'ipad-landscape', w: 1024, h: 768, kind: 'tablet' },
  { name: 'laptop-1366', w: 1366, h: 768, kind: 'pc' },
  { name: 'laptop-1440', w: 1440, h: 900, kind: 'pc' },
  { name: 'desktop-1920', w: 1920, h: 1080, kind: 'pc' },
  { name: 'ultrawide-2560', w: 2560, h: 1080, kind: 'pc' },
];

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

test('viewport matrix tokens and layout contracts cover phone through ultrawide PC', async () => {
  assert.ok(VIEWPORT_MATRIX.length >= 10);
  assert.ok(VIEWPORT_MATRIX.some((v) => v.kind === 'mobile' && v.w <= 320));
  assert.ok(VIEWPORT_MATRIX.some((v) => v.kind === 'pc' && v.w >= 1920));
  assert.ok(VIEWPORT_MATRIX.some((v) => v.kind === 'pc' && v.w >= 2560));
  assert.ok(VIEWPORT_MATRIX.some((v) => v.kind === 'mobile-landscape'));

  const tokens = await readFile(path.join(root, 'design/css/tokens.css'), 'utf8');
  assert.match(tokens, /--geez-bp-xs:\s*22\.5rem/);
  assert.match(tokens, /--geez-bp-sm:\s*32rem/);
  assert.match(tokens, /--geez-bp-md:\s*48rem/);
  assert.match(tokens, /--geez-bp-lg:\s*64rem/);
  assert.match(tokens, /--geez-bp-xl:\s*90rem/);

  const core = await readFile(path.join(root, 'dist/assets/site-core.css'), 'utf8');
  assert.match(core, /@media \(min-width:\s*64rem\)/);
  assert.match(core, /@media \(min-width:\s*90rem\)/);
  assert.match(core, /@media \(max-width:\s*63\.99rem\)/);
  assert.match(core, /100dvw/);
  assert.match(core, /\.geez-page-band/);

  const home = await readFile(path.join(root, 'site/homepage/homepage.css'), 'utf8');
  assert.match(home, /88dvh/);
  assert.match(home, /@media \(min-width:\s*64rem\)[\s\S]*geez-home-hero__grid/);
  assert.match(home, /@media \(max-width:\s*63\.99rem\)/);
  assert.match(home, /@media \(max-height:\s*28rem\) and \(orientation:\s*landscape\)/);
  assert.match(home, /@media \(min-width:\s*90rem\)/);
});

test('header stays single-row coherent below desktop chrome breakpoint', async () => {
  const css = await readFile(path.join(root, 'design/css/primitives.css'), 'utf8');
  assert.match(css, /@media \(max-width:\s*63\.99rem\)[\s\S]*flex-wrap:\s*nowrap/);
  assert.match(css, /\.geez-nav-drawer[\s\S]*margin-inline-start:\s*auto/);
  assert.match(css, /@media \(min-width:\s*64rem\)[\s\S]*\.geez-nav-drawer[\s\S]*display:\s*none/);
});
