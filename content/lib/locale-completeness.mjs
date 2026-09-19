/**
 * Locale completeness audit + translation queue builders.
 * Does not invent translations — only inventories gaps.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from './locale.mjs';
import { readDataJson } from './load.mjs';
import { collectClaimFields, TODO_VERIFICATION } from './claim.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Priority routes for parity audits. */
export const PRIORITY_ROUTE_IDS = [
  'home',
  'services',
  'service-start-a-business',
  'service-business-plans-funding',
  'service-bookkeeping-payroll',
  'service-growth-operations',
  'technology-support',
  'client-results',
  'resources',
  'about-saba',
  'book-a-fit-call',
  'thank-you',
  'service-finder',
  'privacy',
  'disclaimers',
];

/**
 * @param {unknown} value
 */
function isTodoOrEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') {
    const t = value.trim();
    return !t || /TODO_VERIFICATION/i.test(t);
  }
  return false;
}

/**
 * @param {unknown} field
 */
function claimNeedsTranslation(field) {
  if (!field || typeof field !== 'object') return true;
  const f = /** @type {Record<string, unknown>} */ (field);
  if (f.source === TODO_VERIFICATION) return true;
  if (f.approvalStatus !== 'approved') {
    if (isTodoOrEmpty(f.value)) return true;
  }
  return isTodoOrEmpty(f.value) && f.approvalStatus !== 'approved';
}

/**
 * Build queue row.
 * @param {object} partial
 */
export function queueRow(partial) {
  return {
    id: partial.id,
    locale: partial.locale,
    surface: partial.surface,
    sourceString: partial.sourceString ?? '',
    context: partial.context,
    charConstraint: partial.charConstraint ?? null,
    reviewer: partial.reviewer ?? 'Native reviewer (AM or TI)',
    status: partial.status ?? 'needs_translation',
    lastReviewed: partial.lastReviewed ?? null,
    notes: partial.notes ?? '',
  };
}

/**
 * Audit shared navigation labels for AM/TI.
 * @param {object} navigation
 * @param {object} enLabels
 */
function auditNav(navigation, enLabels) {
  /** @type {ReturnType<typeof queueRow>[]} */
  const rows = [];
  for (const locale of ['am', 'ti']) {
    const labels = navigation.labels?.[locale] || {};
    for (const [key, enVal] of Object.entries(enLabels)) {
      const val = labels[key];
      if (isTodoOrEmpty(val)) {
        rows.push(
          queueRow({
            id: `nav-${locale}-${key}`,
            locale,
            surface: 'navigation',
            sourceString: String(enVal),
            context: `Header/footer label key ${key}`,
            charConstraint: key.startsWith('nav.') ? 28 : key.startsWith('cta.') ? 22 : 40,
            status: 'needs_translation',
            notes: 'Do not machine-translate for production',
          }),
        );
      } else if (
        typeof val === 'string' &&
        typeof enVal === 'string' &&
        val.trim() === enVal.trim() &&
        !/^a11y\./.test(key)
      ) {
        rows.push(
          queueRow({
            id: `nav-${locale}-${key}-en-copy`,
            locale,
            surface: 'navigation',
            sourceString: String(enVal),
            context: `Header/footer label key ${key} still matches English`,
            charConstraint: key.startsWith('nav.') ? 28 : key.startsWith('cta.') ? 22 : 40,
            status: 'needs_native_review',
            notes: 'English string used as interim — keep noindex until approved',
          }),
        );
      }
    }
  }
  return rows;
}

/**
 * Audit route titles.
 * @param {object} routesDoc
 */
function auditRouteTitles(routesDoc) {
  /** @type {ReturnType<typeof queueRow>[]} */
  const rows = [];
  for (const route of routesDoc.routes) {
    if (!PRIORITY_ROUTE_IDS.includes(route.id) && route.type !== 'page') continue;
    const enTitle = route.title?.en || route.id;
    for (const locale of ['am', 'ti']) {
      const t = route.title?.[locale];
      if (isTodoOrEmpty(t)) {
        rows.push(
          queueRow({
            id: `route-title-${locale}-${route.id}`,
            locale,
            surface: `route:${route.id}`,
            sourceString: String(enTitle),
            context: `Document/browser title for ${route.path}`,
            charConstraint: 60,
            status: 'needs_translation',
          }),
        );
      }
    }
  }
  return rows;
}

/**
 * Audit locale claim bundles for empty/TODO fields on priority entities.
 * @param {string} locale
 * @param {Record<string, unknown>} bundle
 */
function auditBundleClaims(locale, bundle) {
  /** @type {ReturnType<typeof queueRow>[]} */
  const rows = [];
  if (locale === 'en') return rows;

  const founderClaims = collectClaimFields(bundle.founder, 'founder');
  for (const { path: p, field } of founderClaims) {
    if (claimNeedsTranslation(field)) {
      const enHint =
        p.includes('bio')
          ? '(Founder biography — supply approved native text; do not copy EN)'
          : '';
      rows.push(
        queueRow({
          id: `founder-${locale}-${p}`,
          locale,
          surface: 'founder',
          sourceString: String(field.value ?? ''),
          context: `${p} ${enHint}`.trim(),
          charConstraint: p.includes('bio') ? 600 : 80,
          status: field.value == null ? 'needs_translation' : 'needs_review',
          notes: 'Avoid duplicate EN biography pasted into AM/TI',
        }),
      );
    }
  }

  if (Array.isArray(bundle.faqs)) {
    for (const faq of bundle.faqs) {
      for (const key of ['question', 'answer']) {
        if (claimNeedsTranslation(faq[key])) {
          rows.push(
            queueRow({
              id: `faq-${locale}-${faq.id}-${key}`,
              locale,
              surface: 'faqs',
              sourceString: '',
              context: `FAQ ${faq.id}.${key} — translate from approved EN after EN approval`,
              charConstraint: key === 'question' ? 120 : 400,
              status: 'blocked_on_en_approval',
            }),
          );
        }
      }
    }
  }

  const uiForm = /** @type {any} */ (bundle.ui)?.form;
  if (uiForm && typeof uiForm === 'object') {
    for (const [key, val] of Object.entries(uiForm)) {
      if (isTodoOrEmpty(val)) {
        rows.push(
          queueRow({
            id: `ui-form-${locale}-${key}`,
            locale,
            surface: 'forms',
            sourceString: '',
            context: `ui.form.${key} (legacy WPForms string map)`,
            charConstraint: 80,
            status: 'needs_translation',
            notes: 'Prefer site/intake/i18n.mjs as redesign source of truth',
          }),
        );
      }
    }
  }

  return rows;
}

/**
 * Surfaces that intentionally ship English body on AM/TI until translated
 * (must remain noindex).
 */
export const ENGLISH_BODY_ON_LOCALE_SURFACES = [
  {
    id: 'services-detail-copy',
    locales: ['am', 'ti'],
    surface: 'services',
    context:
      'Full service detail/overview body is EN in site/services/safe-copy.mjs; chrome labels partially localized',
    status: 'needs_translation',
    charConstraint: null,
  },
  {
    id: 'intake-long-copy',
    locales: ['am', 'ti'],
    surface: 'intake',
    context:
      'Fit Call / finder long strings and sharedOptions largely EN in site/intake/i18n.mjs (validation, consent, options)',
    status: 'needs_translation',
    charConstraint: null,
  },
  {
    id: 'thank-you-confirmations',
    locales: ['am', 'ti'],
    surface: 'confirmations',
    context:
      'Thank-you page copy is EN interim in site/intake/thank-you-contract.mjs',
    status: 'needs_translation',
    charConstraint: null,
  },
  {
    id: 'fit-call-emails',
    locales: ['am', 'ti'],
    surface: 'emails',
    context:
      'Auto-reply + staff notification subjects/bodies in notificationEmailContract are EN-only; localize after native review',
    status: 'needs_translation',
    charConstraint: 78,
  },
  {
    id: 'client-results-chrome',
    locales: ['am', 'ti'],
    surface: 'client-results',
    context: 'Client Results chrome uses EN with translation notes',
    status: 'needs_translation',
    charConstraint: null,
  },
  {
    id: 'technology-support-copy',
    locales: ['am', 'ti'],
    surface: 'technology-support',
    context: 'Technology Support page body still EN interim (draft/noindex)',
    status: 'needs_translation',
    charConstraint: null,
  },
];

/**
 * Full audit used by CLI, tests, and queue generation.
 */
export async function auditLocaleCompleteness() {
  const navigation = await readDataJson('shared/navigation.json');
  const routesDoc = await readDataJson('shared/routes.json');
  const enLabels = navigation.labels.en;

  /** @type {ReturnType<typeof queueRow>[]} */
  const queue = [
    ...auditNav(navigation, enLabels),
    ...auditRouteTitles(routesDoc),
  ];

  for (const locale of LOCALES) {
    const { loadLocaleBundle } = await import('./load.mjs');
    const bundle = await loadLocaleBundle(locale);
    queue.push(...auditBundleClaims(locale, bundle));
  }

  for (const surface of ENGLISH_BODY_ON_LOCALE_SURFACES) {
    for (const locale of surface.locales) {
      queue.push(
        queueRow({
          id: `${surface.id}-${locale}`,
          locale,
          surface: surface.surface,
          sourceString: '(see EN source files)',
          context: surface.context,
          charConstraint: surface.charConstraint,
          status: surface.status,
          notes: 'Keep route draft/noindex until native translation approved',
        }),
      );
    }
  }

  // Deduplicate by id
  const byId = new Map();
  for (const row of queue) byId.set(row.id, row);
  const items = [...byId.values()].sort((a, b) =>
    `${a.locale}:${a.surface}`.localeCompare(`${b.locale}:${b.surface}`),
  );

  /** @type {Record<string, { incomplete: number, blocked: number }>} */
  const byLocale = { am: { incomplete: 0, blocked: 0 }, ti: { incomplete: 0, blocked: 0 }, en: { incomplete: 0, blocked: 0 } };
  for (const row of items) {
    if (!byLocale[row.locale]) byLocale[row.locale] = { incomplete: 0, blocked: 0 };
    if (row.status === 'blocked_on_en_approval') byLocale[row.locale].blocked += 1;
    else if (row.status !== 'approved') byLocale[row.locale].incomplete += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    policy: 'No machine-filled production translations',
    items,
    byLocale,
    priorityRouteIds: PRIORITY_ROUTE_IDS,
  };
}

/**
 * A locale page is "translation-complete" only when no open queue rows
 * touch that surface — used to gate indexability.
 * @param {Awaited<ReturnType<typeof auditLocaleCompleteness>>} audit
 * @param {string} locale
 * @param {string} surface
 */
export function isLocaleSurfaceComplete(audit, locale, surface) {
  if (locale === 'en') return true;
  return !audit.items.some(
    (row) =>
      row.locale === locale &&
      row.surface === surface &&
      row.status !== 'approved' &&
      row.status !== 'wont_translate',
  );
}

/**
 * Robots for a locale page: incomplete AM/TI stays noindex.
 * @param {string} locale
 * @param {boolean} surfaceComplete
 * @param {boolean} [forceNoindex]
 */
export function robotsForLocalePage(locale, surfaceComplete, forceNoindex = false) {
  if (forceNoindex) return 'noindex, nofollow';
  if (locale !== 'en' && !surfaceComplete) return 'noindex, nofollow';
  return 'noindex, nofollow'; // redesign still draft globally until publish checklist
}

/**
 * Detect silent English body: Latin-only long text on am/ti without lang=en wrapper intent.
 * @param {string} locale
 * @param {string} html
 */
export function findSilentEnglishRisks(locale, html) {
  if (locale === 'en') return [];
  /** @type {string[]} */
  const risks = [];
  // Translation notes are explicit — OK
  const hasNote = /translation pending|shown in English until/i.test(html);
  // If page claims lang=am/ti but has long English service paragraphs without lang="en"
  if (
    new RegExp(`lang="${locale}"`).test(html) &&
    /Who it is for|Desired outcome|Book a Fit Call/.test(html) &&
    !hasNote &&
    !/lang="en"/.test(html)
  ) {
    risks.push('English marketing copy appears without lang="en" or translation note');
  }
  return risks;
}

/**
 * Write JSON queue to content/data/shared (caller may also write markdown).
 * @param {Awaited<ReturnType<typeof auditLocaleCompleteness>>} audit
 */
export async function writeTranslationQueueJson(audit) {
  const outPath = path.join(
    root,
    'content/data/shared/translation-queue.json',
  );
  const { writeFile, mkdir } = await import('node:fs/promises');
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  return outPath;
}
