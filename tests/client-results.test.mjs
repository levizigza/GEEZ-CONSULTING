import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { applyProductionGate } from '../content/lib/production-gate.mjs';
import {
  validateCaseStudyShape,
  isCaseStudyProductionReady,
  filterProductionCaseStudies,
  resolveCaseStudiesForLocale,
  buildPublicCaseStudyView,
  buildCaseStudyJsonLd,
  resolveIdentityDisplay,
} from '../content/lib/case-studies.mjs';
import {
  renderClientResultsIndex,
  renderCaseStudyPage,
  renderCaseStudyMedia,
} from '../site/client-results/render.mjs';

function approved(value, extra = {}) {
  return {
    value,
    source: 'https://example.com/evidence/case-study-fixture',
    approvalStatus: 'approved',
    lastReviewed: '2026-09-18',
    ledgerId: 'CL-022',
    ...extra,
  };
}

function makeReadyCaseStudy(overrides = {}) {
  return {
    id: 'cs-fixture-ready',
    slug: 'fixture-ready',
    locale: 'en',
    recordStatus: 'approved',
    title: approved('Fixture case study'),
    summary: approved('A permitted qualitative story for tests.'),
    clientName: approved('Fixture Co.'),
    clientSector: approved('Professional services'),
    anonymizedLabel: approved('A Calgary professional services firm'),
    permissionStatus: approved('named_public'),
    businessStage: approved('Early operating'),
    situation: approved('Needed clearer launch steps.'),
    constraint: approved('Limited time while working full-time.'),
    goal: approved('Open with a workable checklist.'),
    workPerformed: approved('Startup sequencing and registration prep coaching.'),
    deliverables: approved(['Launch checklist', 'Banking conversation prep notes']),
    timeline: approved(null),
    outcomes: [
      {
        kind: 'qualitative',
        statement: approved(
          'Client reported clearer next steps. No financing or revenue metrics.',
        ),
        metricDefinition: approved(null),
        baseline: approved(null),
        resultValue: approved(null),
        window: approved(null),
        metricSource: approved(null),
      },
    ],
    quote: approved('The checklist made the path clearer.'),
    quoteApproverName: approved('Alex Fixture'),
    quoteApproverRole: approved('Owner'),
    scopeCaveat: approved(
      'Individual results vary. Ge’ez does not guarantee financing or registrations.',
    ),
    relatedServiceId: 'start-strong',
    cta: { label: 'Book a Fit Call', href: '/book-a-fit-call/' },
    image: {
      src: approved(null),
      alt: approved(null),
    },
    ...overrides,
  };
}

test('migrated EN case studies validate and stay draft/non-production', async () => {
  const bundle = await loadLocaleBundle('en');
  assert.equal(bundle.caseStudies.length, 3);
  for (const cs of bundle.caseStudies) {
    const errors = validateCaseStudyShape(cs);
    assert.deepEqual(errors, [], errors.join('; '));
    assert.equal(cs.recordStatus, 'draft');
    assert.equal(isCaseStudyProductionReady(cs), false);
    assert.equal(cs.outcomes[0].kind, 'qualitative');
    assert.equal(cs.outcomes[0].resultValue.value, null);
  }
  const gated = applyProductionGate(bundle);
  assert.equal(gated.caseStudies.length, 0);
});

test('draft filtering drops unapproved records from production lists and schema', () => {
  const draft = makeReadyCaseStudy({ recordStatus: 'draft' });
  const ready = makeReadyCaseStudy();
  assert.equal(isCaseStudyProductionReady(draft), false);
  assert.equal(isCaseStudyProductionReady(ready), true);
  assert.deepEqual(
    filterProductionCaseStudies([draft, ready]).map((c) => c.id),
    ['cs-fixture-ready'],
  );
  const draftViewBlocked = buildCaseStudyJsonLd(
    { ...buildPublicCaseStudyView(draft), productionReady: false },
    'https://geezconsulting.com/client-results/x/',
    "Ge'ez Consulting",
  );
  assert.equal(draftViewBlocked, null);
  const readyView = buildPublicCaseStudyView(ready);
  const ld = buildCaseStudyJsonLd(
    readyView,
    'https://geezconsulting.com/client-results/fixture-ready/',
    "Ge'ez Consulting",
  );
  assert.equal(ld['@type'], 'Article');
  assert.equal(ld.aggregateRating, undefined);
  assert.equal(ld.review, undefined);
});

test('schema validity rejects missing required case-study fields', () => {
  const bad = makeReadyCaseStudy();
  delete bad.situation;
  const errors = validateCaseStudyShape(bad);
  assert.ok(errors.some((e) => e.includes('situation')));
});

test('anonymized mode hides legal name when story_anonymized', () => {
  const anon = makeReadyCaseStudy({
    permissionStatus: approved('story_anonymized'),
  });
  const identity = resolveIdentityDisplay(anon);
  assert.equal(identity.mode, 'anonymized');
  assert.equal(identity.label, 'A Calgary professional services firm');
  assert.equal(identity.showIdentity, false);
  const view = buildPublicCaseStudyView(anon);
  assert.equal(view.identity.mode, 'anonymized');
  const ld = buildCaseStudyJsonLd(
    view,
    'https://geezconsulting.com/client-results/fixture-ready/',
    "Ge'ez Consulting",
  );
  assert.equal(ld.mentions, undefined);
});

test('missing-image behavior uses placeholder, never broken img', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const ready = makeReadyCaseStudy();
  const html = renderCaseStudyPage(ready, 'en', bundle.ui, navigation);
  assert.match(html, /geez-cr__media--pending/);
  assert.doesNotMatch(html, /geez-cr__media[\s\S]{0,240}<img\b/);
  assert.equal(
    /<img\b/.test(renderCaseStudyMedia(null, 'Photo forthcoming')),
    false,
  );
  assert.match(
    renderCaseStudyMedia(
      { src: '/assets/case.jpg', alt: 'Approved photo' },
      'Photo forthcoming',
    ),
    /<img src="\/assets\/case\.jpg"/,
  );
});

test('locale fallback is opt-in; default has no silent English on AM/TI', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const amBundle = await loadLocaleBundle('am');
  const ready = makeReadyCaseStudy();

  const noFallback = resolveCaseStudiesForLocale('am', [], [ready], {
    productionOnly: true,
    allowEnglishFallback: false,
  });
  assert.equal(noFallback.length, 0);

  const withFallback = resolveCaseStudiesForLocale('am', [], [ready], {
    productionOnly: true,
    allowEnglishFallback: true,
  });
  assert.equal(withFallback.length, 1);
  assert.equal(withFallback[0].usedFallback, true);

  const indexHtml = renderClientResultsIndex(
    'am',
    amBundle.ui,
    navigation,
    [],
    [ready],
  );
  assert.doesNotMatch(indexHtml, /Fixture case study/);
  assert.match(indexHtml, /Stories in progress|noindex/i);
});

test('Client Results index stays empty/noindex without approved stories', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const html = renderClientResultsIndex(
    'en',
    bundle.ui,
    navigation,
    bundle.caseStudies,
    bundle.caseStudies,
  );
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /noindex/);
  assert.match(html, /Stories in progress/);
  assert.doesNotMatch(html, /jonas-driving-school/);
  assert.doesNotMatch(html, /TODO_VERIFICATION/);
});

test('draft case-study page is noindex and omits Article JSON-LD', async () => {
  const navigation = await readDataJson('shared/navigation.json');
  const bundle = await loadLocaleBundle('en');
  const draft = bundle.caseStudies[0];
  const html = renderCaseStudyPage(draft, 'en', bundle.ui, navigation);
  assert.match(html, /noindex/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /geez-cr__media--pending/);
});
