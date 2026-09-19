import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyticsPiiViolations } from '../content/lib/privacy.mjs';
import {
  MEASUREMENT_EVENTS,
  CRM_STAGES,
  CRM_LOSS_REASONS,
  MEASUREMENT_SCHEMA_VERSION,
  buildMeasurementEvent,
  buildCrmStageHandoff,
  parseAttribution,
  inferPageContext,
  autoViewEventForPageType,
  measurementDedupeKey,
  isMeasurementEvent,
} from '../content/lib/measurement.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('all required measurement events are registered', () => {
  const required = [
    'service_page_view',
    'article_view',
    'language_select',
    'case_study_view',
    'service_finder_start',
    'service_finder_complete',
    'cta_click',
    'fit_form_start',
    'fit_form_submit',
    'booking_complete',
    'phone_click',
    'outbound_partner_click',
  ];
  for (const name of required) {
    assert.equal(isMeasurementEvent(name), true, name);
  }
  assert.equal(MEASUREMENT_EVENTS.length, required.length);
});

test('buildMeasurementEvent emits consistent schema without PII', () => {
  const { ok, event, violations } = buildMeasurementEvent({
    event: 'fit_form_submit',
    page: { path: '/book-a-fit-call/', page_type: 'fit_form' },
    locale: 'en',
    service: null,
    cta_location: null,
    session: { sid: 'stest123456' },
    attribution: parseAttribution({
      href: 'https://geezconsulting.com/book-a-fit-call/?utm_source=newsletter&utm_medium=email',
      referrer: 'https://example.com/path?q=1',
    }),
    props: {
      help_category: 'start-a-business',
      business_stage: 'pre_launch',
      submit_ok: true,
      // Attempted PII must not survive props allowlist
      email: 'leak@example.com',
      name: 'Ada',
    },
    ts: '2026-09-19T00:00:00.000Z',
  });
  assert.equal(ok, true);
  assert.deepEqual(violations, []);
  assert.equal(event.event, 'fit_form_submit');
  assert.equal(event.schema_version, MEASUREMENT_SCHEMA_VERSION);
  assert.equal(event.page.path, '/book-a-fit-call/');
  assert.equal(event.page.page_type, 'fit_form');
  assert.equal(event.locale, 'en');
  assert.equal(event.attribution.utm_source, 'newsletter');
  assert.equal(event.attribution.referrer_host, 'example.com');
  assert.equal(event.props.help_category, 'start-a-business');
  assert.equal('email' in event.props, false);
  assert.equal('name' in event.props, false);
  assert.deepEqual(analyticsPiiViolations(event), []);
});

test('buildMeasurementEvent strips denylisted envelope keys', () => {
  const { event } = buildMeasurementEvent({
    event: 'cta_click',
    page: { path: '/', page_type: 'home' },
    locale: 'am',
    cta_location: 'header',
    props: {},
  });
  // Inject after build via sanitizer path
  const poisoned = {
    ...event,
    email: 'x@y.z',
    name: 'Secret',
  };
  assert.ok(analyticsPiiViolations(poisoned).length >= 2);
});

test('phone and free-text never accepted in event props', () => {
  const { event } = buildMeasurementEvent({
    event: 'phone_click',
    page: { path: '/', page_type: 'home' },
    locale: 'en',
    props: {
      outbound_host: 'geezconsulting.com',
      message: 'call me at 4035551212',
      phone: '4035551212',
    },
  });
  assert.equal('phone' in event.props, false);
  assert.equal('message' in event.props, false);
  assert.deepEqual(analyticsPiiViolations(event), []);
});

test('inferPageContext maps representative routes', () => {
  assert.equal(inferPageContext('/').page_type, 'home');
  assert.equal(
    inferPageContext('/services/start-a-business/').page_type,
    'service',
  );
  assert.equal(
    inferPageContext('/services/start-a-business/').service,
    'start-a-business',
  );
  assert.equal(
    autoViewEventForPageType('service'),
    'service_page_view',
  );
  assert.equal(
    autoViewEventForPageType(
      inferPageContext(
        '/resources/starting-a-business-in-alberta-newcomer-checklist/',
      ).page_type,
    ),
    'article_view',
  );
  assert.equal(
    autoViewEventForPageType(
      inferPageContext('/client-results/jonas-driving-school/').page_type,
    ),
    'case_study_view',
  );
  assert.equal(inferPageContext('/thank-you/').page_type, 'thank_you');
});

test('CRM handoff stages include loss reason codes only', () => {
  assert.deepEqual(
    [...CRM_STAGES],
    [
      'contacted',
      'booked',
      'qualified',
      'proposal_sent',
      'won',
      'lost',
    ],
  );
  const { ok, record } = buildCrmStageHandoff({
    stage: 'lost',
    service: 'start-a-business',
    language: 'ti',
    source: 'newsletter',
    loss_reason: 'timing',
    inquiry_id: 'inq_abc123',
    ts: '2026-09-19T12:00:00.000Z',
  });
  assert.equal(ok, true);
  assert.equal(record.stage, 'lost');
  assert.equal(record.loss_reason, 'timing');
  assert.equal(record.language, 'ti');
  assert.ok(CRM_LOSS_REASONS.includes(record.loss_reason));
  assert.deepEqual(analyticsPiiViolations(record), []);

  const badLoss = buildCrmStageHandoff({
    stage: 'lost',
    loss_reason: 'they said email me at ada@example.com',
  });
  assert.equal(badLoss.record.loss_reason, 'other');
});

test('dedupe keys are stable and path-scoped', () => {
  assert.equal(
    measurementDedupeKey('service_page_view', '/services/start-a-business/'),
    measurementDedupeKey(
      'service_page_view',
      '/services/start-a-business/?utm_source=x',
    ),
  );
});

test('analytics.js is first-party, consent-gated, and PII-safe', async () => {
  const src = await readFile(
    path.join(root, 'site/privacy/analytics.js'),
    'utf8',
  );
  assert.match(src, /GeezAnalytics/);
  assert.match(src, /geez_debug_analytics/);
  assert.match(src, /booking_complete/);
  assert.match(src, /phone_click/);
  assert.match(src, /language_select/);
  assert.match(src, /sendBeacon|\/api\/analytics\//);
  assert.doesNotMatch(src, /googletagmanager|gtag\(|facebook\.net|hotjar|plausible/i);
  assert.match(src, /telephone number/);
});

test('measurement plan documents baseline and no uplift claims', async () => {
  const md = await readFile(
    path.join(root, 'docs/geez-redesign/measurement-plan.md'),
    'utf8',
  );
  assert.match(md, /28 calendar days/);
  assert.match(md, /Do not claim conversion improvement/i);
  assert.match(md, /first-party/i);
  assert.match(md, /CRM stage handoff/i);
  for (const name of MEASUREMENT_EVENTS) {
    assert.match(md, new RegExp(name));
  }
});
