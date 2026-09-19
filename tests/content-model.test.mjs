import test from 'node:test';
import assert from 'node:assert/strict';
import {
  claimField,
  isProductionRenderableClaim,
  TODO_VERIFICATION,
  collectClaimFields,
} from '../content/lib/claim.mjs';
import {
  loadLocaleBundle,
  validateBundle,
  validateSamplesAreNonProduction,
  readDataJson,
} from '../content/lib/load.mjs';
import {
  applyProductionGate,
  listBlockedClaims,
} from '../content/lib/production-gate.mjs';

test('claimField helper defaults to TODO_VERIFICATION', () => {
  const field = claimField('x');
  assert.equal(field.source, TODO_VERIFICATION);
  assert.equal(field.approvalStatus, 'todo_verification');
  assert.equal(field.lastReviewed, null);
  assert.equal(isProductionRenderableClaim(field), false);
});

test('only fully approved claims are production-renderable', () => {
  assert.equal(
    isProductionRenderableClaim({
      value: 'ok',
      source: 'https://example.com/evidence',
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
    }),
    true,
  );
  assert.equal(
    isProductionRenderableClaim({
      value: 'ok',
      source: TODO_VERIFICATION,
      approvalStatus: 'approved',
      lastReviewed: '2026-09-18',
    }),
    false,
  );
  assert.equal(
    isProductionRenderableClaim({
      value: 'ok',
      source: 'https://example.com/evidence',
      approvalStatus: 'draft',
      lastReviewed: '2026-09-18',
    }),
    false,
  );
});

test('shared services model includes the four redesign offerings', async () => {
  const services = await readDataJson('shared/services.json');
  const ids = services.map((s) => s.id);
  assert.deepEqual(ids.sort(), [
    'books-payroll',
    'grow-with-a-system',
    'plan-funding-readiness',
    'start-strong',
  ].sort());
});

test('en/am/ti bundles validate and stay productionSafe', async () => {
  for (const locale of ['en', 'am', 'ti']) {
    const bundle = await loadLocaleBundle(locale);
    const errors = validateBundle(bundle);
    assert.deepEqual(errors, [], `${locale} errors: ${errors.join('; ')}`);
    assert.equal(bundle.meta.productionSafe, true);
    assert.equal(bundle.meta.locale, locale);
    assert.ok(Array.isArray(bundle.testimonials));
    assert.equal(bundle.testimonials.length, 0);
    if (locale === 'en') {
      assert.equal(bundle.caseStudies.length, 3);
      assert.ok(bundle.caseStudies.every((c) => c.recordStatus === 'draft'));
    } else {
      assert.equal(bundle.caseStudies.length, 0);
    }
  }
});

test('production gate blocks unverified claims and drops empty social proof', async () => {
  const bundle = await loadLocaleBundle('en');
  const gated = applyProductionGate(bundle);
  const blocked = listBlockedClaims(gated);
  assert.ok(blocked.length > 0, 'expected blocked claims');
  assert.equal(gated.testimonials.length, 0);
  assert.equal(gated.caseStudies.length, 0);

  const stillLive = collectClaimFields(gated).filter(
    ({ field }) => isProductionRenderableClaim(field),
  );
  assert.equal(stillLive.length, 0);
});

test('production gate refuses non-production sample bundles', async () => {
  const sample = await readDataJson('_samples/testimonials.json');
  assert.equal(sample.productionSafe, false);
  assert.equal(sample.nonProduction, true);
  assert.throws(() =>
    applyProductionGate({
      meta: { locale: 'en', productionSafe: false, schemaVersion: '1.0.0' },
      testimonials: sample.items,
    }),
  );
});

test('samples directory is marked non-production', async () => {
  const errors = await validateSamplesAreNonProduction();
  assert.deepEqual(errors, []);
});

test('languages model matches Polylang trio', async () => {
  const languages = await readDataJson('shared/languages.json');
  assert.deepEqual(languages.supported, ['en', 'am', 'ti']);
  assert.equal(languages.defaultLocale, 'en');
});
