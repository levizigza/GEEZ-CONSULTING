/**
 * Cross-check: redesign EN copy reflects live geezconsulting.com sentiments.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { homepageSafeCopy } from '../site/homepage/safe-copy.mjs';
import { ABOUT_SABA_EN, CLIENT_REFLECTIONS } from '../site/about/safe-copy.mjs';
import { servicesCatalogEn } from '../site/services/safe-copy.mjs';
import { technologySupportCopy } from '../site/technology/safe-copy.mjs';
import { ensureDist, readDistFile } from './lib/ensure-dist.mjs';

test('homepage EN mirrors live positioning, services list, and FAQ sentiments', () => {
  const en = homepageSafeCopy.en;
  assert.match(en.heroH1, /company.?s future|Working for/i);
  assert.match(en.heroLead, /startup looking to scale|established organization/i);
  assert.match(en.faqs.find((f) => /services do you offer/i.test(f.q)).a, /up to 10 employees/i);
  assert.match(en.faqs.find((f) => /pricing/i.test(f.q)).a, /free quote/i);
  assert.match(en.faqs.find((f) => /timelines/i.test(f.q)).a, /mutually acceptable/i);
  assert.match(en.faqs.find((f) => /references/i.test(f.q)).a, /upon request/i);
  assert.match(en.footerAddress, /5235 28 Ave SE/);
  assert.match(en.footerEmail, /info@geezconsulting\.com/);
  assert.match(en.footerPhone, /403/);
});

test('about bio keeps live founder sentiments', () => {
  const blob = [ABOUT_SABA_EN.lead, ...ABOUT_SABA_EN.paragraphs].join(' ');
  assert.match(blob, /non-profit/i);
  assert.match(blob, /immigrant/i);
  assert.match(blob, /Black community/i);
  assert.match(blob, /strategic insights/i);
  assert.equal(CLIENT_REFLECTIONS.length, 3);
  assert.match(CLIENT_REFLECTIONS[0].quote, /game-changer/);
});

test('technology page publishes Navigate MSP partnership from live site', () => {
  assert.match(technologySupportCopy.en.intro, /Navigate Technology Solutions/i);
  assert.equal(technologySupportCopy.en.draft, false);
  assert.equal(technologySupportCopy.en.indexable, true);
});

test('services overview and bookkeeping reflect live service list details', () => {
  assert.match(servicesCatalogEn.overview.techCard.text, /Navigate Technology Solutions/i);
  assert.match(servicesCatalogEn['bookkeeping-payroll'].audience, /up to 10 employees/i);
});

test('built home and about pages carry live contact + founder cues', async () => {
  await ensureDist();
  const home = await readDistFile('index.html');
  assert.match(home, /Working for your company/);
  assert.match(home, /info@geezconsulting\.com/);
  assert.match(home, /5235 28 Ave SE/);
  assert.match(home, /free quote/i);
  const about = await readDistFile('about-saba/index.html');
  assert.match(about, /non-profit/i);
  assert.match(about, /Black community/i);
});
