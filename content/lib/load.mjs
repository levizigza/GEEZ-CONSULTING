import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectClaimFields,
  validateClaimFieldShape,
} from './claim.mjs';
import { validateCaseStudyShape } from './case-studies.mjs';
import { validateArticleShape } from './articles.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CONTENT_ROOT = path.resolve(__dirname, '..');
export const DATA_ROOT = path.join(CONTENT_ROOT, 'data');

/**
 * @param {string} relPath relative to content/data
 */
export async function readDataJson(relPath) {
  const full = path.join(DATA_ROOT, relPath);
  const raw = await readFile(full, 'utf8');
  return JSON.parse(raw);
}

/**
 * @param {string} locale
 */
export async function loadLocaleBundle(locale) {
  const shared = {
    business: await readDataJson('shared/business.json'),
    languages: await readDataJson('shared/languages.json'),
    serviceArea: await readDataJson('shared/service-area.json'),
    services: await readDataJson('shared/services.json'),
    technologyPartner: await readDataJson('shared/technology-partner.json'),
    process: await readDataJson('shared/process.json'),
    disclaimers: await readDataJson('shared/disclaimers.json'),
    ctas: await readDataJson(`locales/${locale}/ctas.json`),
  };

  const founder = await readDataJson(`locales/${locale}/founder.json`);
  const faqs = await readDataJson(`locales/${locale}/faqs.json`);
  const articles = await readDataJson(`locales/${locale}/articles.json`);
  const seo = await readDataJson(`locales/${locale}/seo.json`);
  const testimonials = await readDataJson(`locales/${locale}/testimonials.json`);
  const caseStudies = await readDataJson(`locales/${locale}/case-studies.json`);
  const ui = await readDataJson(`locales/${locale}/ui.json`);

  return {
    meta: {
      schemaVersion: '1.0.0',
      locale,
      productionSafe: true,
    },
    ...shared,
    founder,
    faqs: faqs.items,
    articles: articles.items,
    testimonials: testimonials.items,
    caseStudies: caseStudies.items,
    seo,
    ui,
  };
}

/**
 * Validate structural rules for a loaded bundle (not full JSON Schema engine).
 * @param {Record<string, unknown>} bundle
 */
export function validateBundle(bundle) {
  /** @type {string[]} */
  const errors = [];

  if (!bundle || typeof bundle !== 'object') {
    return ['bundle: expected object'];
  }
  if (!bundle.meta || typeof bundle.meta !== 'object') {
    errors.push('meta: required');
  } else {
    const meta = /** @type {Record<string, unknown>} */ (bundle.meta);
    if (!['en', 'am', 'ti'].includes(/** @type {string} */ (meta.locale))) {
      errors.push('meta.locale: must be en|am|ti');
    }
    if (meta.productionSafe !== true && meta.productionSafe !== false) {
      errors.push('meta.productionSafe: boolean required');
    }
  }

  const requiredServiceIds = [
    'start-strong',
    'plan-funding-readiness',
    'books-payroll',
    'grow-with-a-system',
  ];
  if (!Array.isArray(bundle.services)) {
    errors.push('services: array required');
  } else {
    const ids = bundle.services.map((s) => s && s.id);
    for (const id of requiredServiceIds) {
      if (!ids.includes(id)) errors.push(`services: missing id ${id}`);
    }
  }

  for (const { path: p, field } of collectClaimFields(bundle)) {
    errors.push(...validateClaimFieldShape(field, p));
  }

  if (Array.isArray(bundle.caseStudies)) {
    bundle.caseStudies.forEach((item, i) => {
      errors.push(...validateCaseStudyShape(item, `caseStudies[${i}]`));
    });
  }

  if (Array.isArray(bundle.articles)) {
    bundle.articles.forEach((item, i) => {
      errors.push(...validateArticleShape(item, `articles[${i}]`));
    });
  }

  return errors;
}

/**
 * Ensure sample directory files declare non-production.
 */
export async function validateSamplesAreNonProduction() {
  /** @type {string[]} */
  const errors = [];
  const sampleDir = path.join(DATA_ROOT, '_samples');
  let files = [];
  try {
    files = await readdir(sampleDir);
  } catch {
    return ['data/_samples: directory missing'];
  }
  for (const file of files.filter((f) => f.endsWith('.json'))) {
    const data = await readDataJson(`_samples/${file}`);
    if (data.productionSafe !== false) {
      errors.push(`_samples/${file}: productionSafe must be false`);
    }
    if (data.nonProduction !== true) {
      errors.push(`_samples/${file}: nonProduction must be true`);
    }
  }
  return errors;
}
