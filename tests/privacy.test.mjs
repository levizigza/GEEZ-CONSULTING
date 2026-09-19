import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeAnalyticsEvent,
  analyticsPiiViolations,
  buildMarketingConsentRecord,
  parseScriptConsent,
  scriptCategoryAllowed,
  MARKETING_CONSENT_VERSION,
  privacyClaimDisplay,
} from '../content/lib/privacy.mjs';
import {
  validateFitForm,
  normalizeFitFormInput,
  redactFitFormForLogs,
} from '../site/intake/fit-form-validate.mjs';
import {
  renderFitFormPage,
  renderThankYouPage,
} from '../site/intake/render.mjs';
import {
  renderPrivacyPage,
  renderDisclaimersPage,
  renderUnsubscribePage,
} from '../site/privacy/render.mjs';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { createIntakeHandler, createMemoryProvider } from '../site/intake/submit-handler.mjs';
import { createRateLimiter } from '../site/intake/spam-guard.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function validPayload(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    phone: '',
    preferredContactMethod: 'email',
    preferredLanguage: 'en',
    businessStage: 'pre_launch',
    helpCategory: 'start-a-business',
    goalProblem: 'I need help sequencing launch steps.',
    timeline: '',
    company: '',
    consentResponsePurpose: '1',
    consentMarketing: '',
    locale: 'en',
    company_website: '',
    ...overrides,
  };
}

test('analytics sanitizer strips PII keys and email-like values', () => {
  const raw = {
    event: 'fit_submit',
    helpCategory: 'start-a-business',
    name: 'Ada',
    email: 'ada@example.com',
    nested: { phone: '4035551212', ok: true },
  };
  const violations = analyticsPiiViolations(raw);
  assert.ok(violations.length >= 2);
  const { event } = sanitizeAnalyticsEvent(raw);
  assert.equal(/** @type {any} */ (event).helpCategory, 'start-a-business');
  assert.equal('name' in /** @type {object} */ (event), false);
  assert.equal('email' in /** @type {object} */ (event), false);
  assert.equal('phone' in /** @type {any} */ (event).nested, false);
  assert.equal(/** @type {any} */ (event).nested.ok, true);
});

test('redacted intake logs pass analytics PII checks', () => {
  const redacted = redactFitFormForLogs(
    validPayload({ email: 'a@b.c', phone: '4035551212', name: 'Secret' }),
  );
  assert.deepEqual(analyticsPiiViolations(redacted), []);
  assert.equal('name' in redacted, false);
  assert.equal('email' in redacted, false);
  assert.equal('goalProblem' in redacted, false);
});

test('marketing consent is never required for a service inquiry', () => {
  const withoutMarketing = validateFitForm(
    normalizeFitFormInput(validPayload({ consentMarketing: '' })),
  );
  assert.equal(withoutMarketing.ok, true);
  assert.equal(withoutMarketing.payload.marketingConsent.granted, false);
  assert.equal(
    withoutMarketing.payload.marketingConsent.version,
    MARKETING_CONSENT_VERSION,
  );
  assert.ok(withoutMarketing.payload.marketingConsent.timestamp);
  assert.equal(withoutMarketing.payload.marketingConsent.source, 'fit-call-form');

  const withMarketing = validateFitForm(
    normalizeFitFormInput(validPayload({ consentMarketing: '1' })),
  );
  assert.equal(withMarketing.ok, true);
  assert.equal(withMarketing.payload.marketingConsent.granted, true);

  assert.equal(
    withoutMarketing.errors.some((e) => e.field === 'consentMarketing'),
    false,
  );
});

test('handler accepts inquiry without marketing consent', async () => {
  const provider = createMemoryProvider();
  const handler = createIntakeHandler({
    provider,
    rateLimiter: createRateLimiter({ windowMs: 60_000, max: 20 }),
  });
  const result = await handler.handle(validPayload({ consentMarketing: '' }), {
    clientKey: 'privacy-no-mkt',
    secureTransport: true,
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(provider.store[0].payload.marketingConsent.granted, false);
});

test('Fit Call form shows optional marketing unchecked and JIT notices', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderFitFormPage('en', bundle.ui, navigation);
  assert.match(html, /name="consentMarketing"/);
  assert.doesNotMatch(html, /consentMarketing[^>]*required/);
  assert.doesNotMatch(html, /id="consentMarketing"[^>]*checked/);
  assert.match(html, /Optional:/);
  assert.match(html, /Just-in-time notice|respond to this Fit Call/i);
  assert.doesNotMatch(html, /name="referralSource"/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
});

test('script consent defaults block non-essential categories', () => {
  const consent = parseScriptConsent(null);
  assert.equal(scriptCategoryAllowed(consent, 'analytics'), false);
  assert.equal(scriptCategoryAllowed(consent, 'marketing'), false);
  assert.equal(scriptCategoryAllowed(consent, 'essential'), true);
});

test('privacy and disclaimers pages render structure without TODO token', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const policy = await readDataJson('shared/privacy-policy.json');
  const disclaimers = await readDataJson('shared/disclaimers.json');
  const privacy = renderPrivacyPage('en', bundle.ui, navigation, policy);
  const disc = renderDisclaimersPage('en', bundle.ui, navigation, disclaimers);
  const unsub = renderUnsubscribePage('en', bundle.ui, navigation);
  for (const html of [privacy, disc, unsub]) {
    assert.equal((html.match(/<h1\b/gi) || []).length, 1);
    assert.match(html, /noindex/);
    assert.doesNotMatch(html, /TODO_VERIFICATION/);
  }
  assert.match(privacy, /Pending verification/);
  assert.match(privacy, /Who is responsible/);
  assert.match(disc, /registry|licensing/i);
  assert.match(disc, /funding|lender/i);
  assert.match(unsub, /unsubscribe/i);
});

test('privacyClaimDisplay never leaks TODO_VERIFICATION', () => {
  assert.equal(
    privacyClaimDisplay({
      value: 'TODO_VERIFICATION',
      approvalStatus: 'todo_verification',
    }),
    'Pending verification',
  );
  assert.equal(
    privacyClaimDisplay({
      value: 'Stored in Canada',
      approvalStatus: 'approved',
      source: 'counsel',
    }),
    'Stored in Canada',
  );
});

test('buildMarketingConsentRecord is specific and versioned', () => {
  const rec = buildMarketingConsentRecord({
    granted: true,
    source: 'fit-call-form',
    now: new Date('2026-09-18T12:00:00.000Z'),
  });
  assert.deepEqual(rec, {
    granted: true,
    timestamp: '2026-09-18T12:00:00.000Z',
    source: 'fit-call-form',
    version: MARKETING_CONSENT_VERSION,
  });
});

test('consent.js gates non-essential scripts via data-geez-consent', async () => {
  const src = await readFile(path.join(root, 'site/privacy/consent.js'), 'utf8');
  assert.match(src, /data-geez-consent/);
  assert.match(src, /text\/plain/);
  assert.match(src, /geez_script_consent_v1/);
});

test('thank-you page still renders after privacy form changes', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderThankYouPage('en', bundle.ui, navigation);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
});
