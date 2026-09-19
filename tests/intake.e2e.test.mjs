import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recommendService } from '../site/intake/service-finder-model.mjs';
import {
  validateFitForm,
  normalizeFitFormInput,
  redactFitFormForLogs,
  containsSensitiveContent,
} from '../site/intake/fit-form-validate.mjs';
import {
  createIntakeHandler,
  createMemoryProvider,
} from '../site/intake/submit-handler.mjs';
import { createRateLimiter } from '../site/intake/spam-guard.mjs';
import { createIntakeServer } from '../site/intake/http-server.mjs';
import {
  renderServiceFinderPage,
  renderFitFormPage,
  renderThankYouPage,
} from '../site/intake/render.mjs';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { thankYouPageContract } from '../site/intake/thank-you-contract.mjs';

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

test('service finder recommends one primary service without eligibility claims', () => {
  const out = recommendService({
    businessStage: 'idea',
    primaryGoal: 'launch_register',
    currentObstacle: 'dont_know_steps',
    preferredLanguage: 'en',
    desiredTiming: 'exploring',
  });
  assert.equal(out.ok, true);
  assert.equal(out.recommendation.serviceId, 'start-a-business');
  assert.match(out.recommendation.disclaimer, /Not legal/i);
  assert.ok(
    out.recommendation.reasons.some((r) => /does not promise outcomes/i.test(r)),
  );
  assert.doesNotMatch(
    JSON.stringify(out.recommendation),
    /eligible|guaranteed loan/i,
  );
});

test('service finder maps funding obstacle to funding-readiness service', () => {
  const out = recommendService({
    businessStage: 'early_operating',
    primaryGoal: 'unsure',
    currentObstacle: 'funding_confusion',
    preferredLanguage: 'am',
    desiredTiming: '1_to_3_months',
  });
  assert.equal(out.ok, true);
  assert.equal(
    out.recommendation.serviceId,
    'business-plans-funding-readiness',
  );
});

test('fit form validation requires consent and email-or-phone', () => {
  const missing = validateFitForm(
    normalizeFitFormInput(
      validPayload({ email: '', phone: '', consentResponsePurpose: '' }),
    ),
  );
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some((e) => e.field === 'email' || e.field === 'phone'));
  assert.ok(missing.errors.some((e) => e.field === 'consentResponsePurpose'));
});

test('fit form rejects sensitive identity/banking content', () => {
  assert.equal(containsSensitiveContent('my SIN is 123-456-789'), true);
  const bad = validateFitForm(
    normalizeFitFormInput(
      validPayload({ goalProblem: 'Here is my bank login password hunter2' }),
    ),
  );
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /sensitive|Remove financial/i.test(e.message)));
});

test('redaction omits PII from log shape', () => {
  const redacted = redactFitFormForLogs(
    validPayload({ email: 'a@b.c', phone: '4035551212' }),
  );
  assert.equal(redacted.hasEmail, true);
  assert.equal(redacted.hasPhone, true);
  assert.equal('email' in redacted, false);
  assert.equal('phone' in redacted, false);
  assert.equal('name' in redacted, false);
  assert.equal('goalProblem' in redacted, false);
});

test('thank-you contract has next steps and no response SLA', () => {
  for (const locale of ['en', 'am', 'ti']) {
    const copy = thankYouPageContract(locale);
    assert.ok(copy.nextSteps.length >= 2);
    assert.match(copy.noSla, /guaranteed response time/i);
    assert.doesNotMatch(copy.noSla, /\d+\s*(minute|hour|business day)/i);
  }
});

test('intake pages render in all locales with one H1 and no TODO markers', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  for (const locale of ['en', 'am', 'ti']) {
    const bundle = await loadLocaleBundle(locale);
    for (const html of [
      renderServiceFinderPage(locale, bundle.ui, navigation),
      renderFitFormPage(locale, bundle.ui, navigation),
      renderThankYouPage(locale, bundle.ui, navigation),
    ]) {
      assert.equal((html.match(/<h1\b/gi) || []).length, 1, locale);
      assert.doesNotMatch(html, /TODO_VERIFICATION/);
      assert.match(html, /noindex/);
    }
    const fit = renderFitFormPage(locale, bundle.ui, navigation);
    assert.match(fit, /consentResponsePurpose/);
    assert.match(fit, /name="goalProblem"/);
    assert.match(fit, /for="name"/);
    assert.match(fit, /role="radiogroup"/);
  }
});

test('keyboard affordances: focusable error summary and labeled controls', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderFitFormPage('en', bundle.ui, navigation, {
    errors: [{ field: 'email', message: 'Enter a valid email address.' }],
    values: validPayload({ email: 'bad' }),
  });
  assert.match(html, /id="fit-error-summary"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /href="#email"/);
  assert.match(html, /<label for="name">/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /geez-skip/);
});

test('handler success, validation, spam, and provider failure', async () => {
  const logs = [];
  const okProvider = createMemoryProvider();
  const okHandler = createIntakeHandler({
    provider: okProvider,
    rateLimiter: createRateLimiter({ windowMs: 60_000, max: 20 }),
    onLog: (e) => logs.push(e),
  });

  const success = await okHandler.handle(validPayload(), {
    clientKey: 't-success',
    secureTransport: true,
  });
  assert.equal(success.status, 200);
  assert.equal(success.body.ok, true);
  assert.equal(success.body.redirectTo, '/thank-you/');
  assert.ok(success.body.thankYou.nextSteps.length);
  assert.equal(okProvider.store.length, 1);

  const invalid = await okHandler.handle(validPayload({ name: '' }), {
    clientKey: 't-invalid',
    secureTransport: true,
  });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.code, 'validation_failed');
  assert.ok(invalid.body.values);
  assert.equal(invalid.body.values.email, 'test@example.com');

  const spam = await okHandler.handle(
    validPayload({ company_website: 'http://spam.test' }),
    { clientKey: 't-spam', secureTransport: true },
  );
  assert.equal(spam.status, 200);
  assert.equal(spam.body.spamSilent, true);
  assert.equal(okProvider.store.length, 1);

  const failProvider = createMemoryProvider({ fail: true });
  const failHandler = createIntakeHandler({
    provider: failProvider,
    onLog: (e) => logs.push(e),
  });
  const failed = await failHandler.handle(validPayload({ email: 'fail@example.com' }), {
    clientKey: 't-fail',
    secureTransport: true,
  });
  assert.equal(failed.status, 502);
  assert.equal(failed.body.code, 'provider_failure');
  assert.equal(failed.body.retry, true);

  assert.ok(logs.every((e) => !JSON.stringify(e).includes('test@example.com')));
  assert.ok(logs.every((e) => !JSON.stringify(e).includes('Test User')));
});

test('rate limiter blocks burst submissions', async () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const handler = createIntakeHandler({
    provider: createMemoryProvider(),
    rateLimiter: limiter,
  });
  assert.equal(
    (await handler.handle(validPayload(), { clientKey: 'burst' })).status,
    200,
  );
  assert.equal(
    (await handler.handle(validPayload(), { clientKey: 'burst' })).status,
    200,
  );
  const limited = await handler.handle(validPayload(), { clientKey: 'burst' });
  assert.equal(limited.status, 429);
  assert.equal(limited.body.code, 'rate_limited');
});

test('HTTP e2e: success, validation, spam, provider failure, finder, locales', async () => {
  const provider = createMemoryProvider();
  const app = createIntakeServer({
    provider,
    distDir: path.join(root, 'dist'),
  });
  const { baseUrl } = await app.listen(0);

  try {
    const okRes = await fetch(`${baseUrl}/api/fit-call/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(validPayload()),
    });
    assert.equal(okRes.status, 200);
    const okBody = await okRes.json();
    assert.equal(okBody.ok, true);
    assert.equal(okBody.redirectTo, '/thank-you/');

    const badRes = await fetch(`${baseUrl}/api/fit-call/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ email: '', phone: '' })),
    });
    assert.equal(badRes.status, 400);
    const badBody = await badRes.json();
    assert.equal(badBody.code, 'validation_failed');
    assert.ok(badBody.errors.length);

    const spamRes = await fetch(`${baseUrl}/api/fit-call/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ company_website: 'bot' })),
    });
    assert.equal(spamRes.status, 200);
    assert.equal((await spamRes.json()).spamSilent, true);

    await app.close();

    const failApp = createIntakeServer({
      provider: createMemoryProvider({ fail: true }),
      distDir: path.join(root, 'dist'),
    });
    const { baseUrl: failUrl } = await failApp.listen(0);
    try {
      const failRes = await fetch(`${failUrl}/api/fit-call/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload({ email: 'x@y.z' })),
      });
      assert.equal(failRes.status, 502);
      assert.equal((await failRes.json()).code, 'provider_failure');

      for (const locale of ['en', 'am', 'ti']) {
        const prefix = locale === 'en' ? '' : `/${locale}`;
        const fitPage = await fetch(`${failUrl}${prefix}/book-a-fit-call/`);
        assert.equal(fitPage.status, 200);
        const fitHtml = await fitPage.text();
        assert.match(fitHtml, /<h1/);
        assert.match(fitHtml, /geez-fit-form/);

        const finder = await fetch(
          `${failUrl}${prefix}/find-your-service/?businessStage=idea&primaryGoal=launch_register&currentObstacle=dont_know_steps&preferredLanguage=${locale === 'en' ? 'en' : locale}&desiredTiming=exploring`,
        );
        assert.equal(finder.status, 200);
        const finderHtml = await finder.text();
        assert.match(finderHtml, /Start a Business|Suggested starting service|finder-result/i);

        const thanks = await fetch(`${failUrl}${prefix}/thank-you/`);
        assert.equal(thanks.status, 200);
        assert.match(await thanks.text(), /Thank you|What happens next/i);
      }

      // no-JS POST preserves errors in HTML
      const formPost = await fetch(`${failUrl}/book-a-fit-call/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(
          validPayload({ name: '', goalProblem: 'Need help' }),
        ).toString(),
        redirect: 'manual',
      });
      assert.ok([400, 502].includes(formPost.status));
      const postHtml = await formPost.text();
      assert.match(postHtml, /geez-error-summary|Try again|could not send/i);
    } finally {
      await failApp.close();
    }
  } finally {
    try {
      await app.close();
    } catch {
      /* already closed */
    }
  }
});
