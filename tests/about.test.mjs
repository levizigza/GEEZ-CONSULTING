import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureDist, readDistFile } from './lib/ensure-dist.mjs';

test('about-saba ships live-site bio without verification disclaimer', async () => {
  await ensureDist();
  const html = await readDistFile('about-saba/index.html');
  assert.match(html, /<h1[^>]*>About Saba<\/h1>/);
  assert.match(html, /Saba Teklu/);
  assert.match(html, /Founder and Director/);
  assert.match(html, /newcomers, startups/);
  assert.doesNotMatch(html, /Portrait provided by Saba/);
  assert.doesNotMatch(html, /Full credentials publish only after verification/);
  assert.match(html, /saba-teklu-live\.jpg/);
  assert.match(html, /yonas-profile\.png/);
  assert.match(html, /Yonas Hila/);
  assert.match(html, /Jonas Driving School/);
  assert.match(html, /geez-header__logo/);
});

test('interior pages include the header logo mark', async () => {
  for (const rel of [
    'services/index.html',
    'book-a-fit-call/index.html',
    'about-saba/index.html',
  ]) {
    const html = await readDistFile(rel);
    assert.match(html, /geez-header__logo/, rel);
    assert.match(html, /geez-wordmark-light\.png/, rel);
  }
});
