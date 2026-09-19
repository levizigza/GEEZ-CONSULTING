/**
 * Article / Resources governance: validation, outlines vs production,
 * Article JSON-LD, downloads accessibility checks.
 */

import {
  collectClaimFields,
  isProductionRenderableClaim,
  validateClaimFieldShape,
} from './claim.mjs';
import { RELATED_SERVICE_PATHS } from './case-studies.mjs';

export const ARTICLE_LOCALE_STATUSES = new Set([
  'outline',
  'draft',
  'pending_translation',
  'pending_review',
  'approved',
  'retired',
]);

export const DISCLAIMER_CATEGORIES = new Set([
  'general',
  'legal',
  'tax',
  'payroll',
  'financing',
  'registration',
  'immigration',
  'credit',
  'program',
]);

export const REVIEW_FLAGS = new Set([
  'legal',
  'tax',
  'payroll',
  'financing',
  'registration',
  'immigration',
  'program',
  'credit',
]);

export { RELATED_SERVICE_PATHS };

/**
 * @param {unknown} field
 */
function claimHasPublicValue(field) {
  if (!isProductionRenderableClaim(/** @type {any} */ (field))) return false;
  const v = /** @type {any} */ (field).value;
  if (v == null) return false;
  if (typeof v === 'string' && !v.trim()) return false;
  return true;
}

/**
 * @param {unknown} entity
 * @param {string} [path]
 * @returns {string[]}
 */
export function validateArticleShape(entity, path = 'article') {
  /** @type {string[]} */
  const errors = [];
  if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
    return [`${path}: expected object`];
  }
  const a = /** @type {Record<string, unknown>} */ (entity);

  for (const key of [
    'id',
    'slug',
    'locale',
    'recordStatus',
    'localeStatus',
    'disclaimerCategory',
    'relatedServiceId',
  ]) {
    if (typeof a[key] !== 'string' || !String(a[key]).trim()) {
      errors.push(`${path}.${key}: non-empty string required`);
    }
  }
  if (a.locale && !['en', 'am', 'ti'].includes(/** @type {string} */ (a.locale))) {
    errors.push(`${path}.locale: must be en|am|ti`);
  }
  if (
    a.recordStatus &&
    !['draft', 'pending_review', 'approved', 'rejected', 'remove'].includes(
      /** @type {string} */ (a.recordStatus),
    )
  ) {
    errors.push(`${path}.recordStatus: invalid`);
  }
  if (a.localeStatus && !ARTICLE_LOCALE_STATUSES.has(/** @type {string} */ (a.localeStatus))) {
    errors.push(`${path}.localeStatus: invalid`);
  }
  if (
    a.disclaimerCategory &&
    !DISCLAIMER_CATEGORIES.has(/** @type {string} */ (a.disclaimerCategory))
  ) {
    errors.push(`${path}.disclaimerCategory: invalid`);
  }
  if (
    a.relatedServiceId &&
    !RELATED_SERVICE_PATHS[/** @type {string} */ (a.relatedServiceId)]
  ) {
    errors.push(`${path}.relatedServiceId: unknown service id`);
  }

  for (const key of ['title', 'excerpt', 'datePublished', 'dateModified']) {
    errors.push(...validateClaimFieldShape(a[key], `${path}.${key}`));
  }

  for (const personKey of ['author', 'reviewer']) {
    const person = a[personKey];
    if (!person || typeof person !== 'object') {
      errors.push(`${path}.${personKey}: object required`);
    } else {
      const p = /** @type {Record<string, unknown>} */ (person);
      errors.push(...validateClaimFieldShape(p.name, `${path}.${personKey}.name`));
      errors.push(...validateClaimFieldShape(p.role, `${path}.${personKey}.role`));
    }
  }

  const cta = a.cta;
  if (!cta || typeof cta !== 'object') {
    errors.push(`${path}.cta: object required`);
  } else {
    const c = /** @type {Record<string, unknown>} */ (cta);
    if (typeof c.label !== 'string' || !c.label.trim()) {
      errors.push(`${path}.cta.label: required`);
    }
    if (typeof c.href !== 'string' || !String(c.href).startsWith('/')) {
      errors.push(`${path}.cta.href: path starting with / required`);
    }
  }

  if (!Array.isArray(a.citations)) {
    errors.push(`${path}.citations: array required`);
  } else {
    a.citations.forEach((cite, i) => {
      if (!cite || typeof cite !== 'object') {
        errors.push(`${path}.citations[${i}]: object required`);
        return;
      }
      const c = /** @type {Record<string, unknown>} */ (cite);
      if (typeof c.id !== 'string' || !c.id) errors.push(`${path}.citations[${i}].id: required`);
      if (typeof c.label !== 'string' || !c.label) {
        errors.push(`${path}.citations[${i}].label: required`);
      }
      if (
        !['planned', 'needs_verification', 'verified', 'outdated'].includes(
          /** @type {string} */ (c.status),
        )
      ) {
        errors.push(`${path}.citations[${i}].status: invalid`);
      }
    });
  }

  if (!Array.isArray(a.sections) || a.sections.length === 0) {
    errors.push(`${path}.sections: non-empty array required`);
  } else {
    a.sections.forEach((sec, i) => {
      if (!sec || typeof sec !== 'object') {
        errors.push(`${path}.sections[${i}]: object required`);
        return;
      }
      const s = /** @type {Record<string, unknown>} */ (sec);
      if (typeof s.id !== 'string' || !s.id) errors.push(`${path}.sections[${i}].id: required`);
      if (typeof s.heading !== 'string' || !s.heading.trim()) {
        errors.push(`${path}.sections[${i}].heading: required`);
      }
      if (!Array.isArray(s.items) || s.items.length === 0) {
        errors.push(`${path}.sections[${i}].items: non-empty array required`);
        return;
      }
      s.items.forEach((item, j) => {
        if (!item || typeof item !== 'object') {
          errors.push(`${path}.sections[${i}].items[${j}]: object required`);
          return;
        }
        const it = /** @type {Record<string, unknown>} */ (item);
        if (typeof it.text !== 'string' || !it.text.trim()) {
          errors.push(`${path}.sections[${i}].items[${j}].text: required`);
        }
        if (it.reviewFlags != null) {
          if (!Array.isArray(it.reviewFlags)) {
            errors.push(`${path}.sections[${i}].items[${j}].reviewFlags: array`);
          } else {
            for (const f of it.reviewFlags) {
              if (!REVIEW_FLAGS.has(/** @type {string} */ (f))) {
                errors.push(
                  `${path}.sections[${i}].items[${j}].reviewFlags: invalid flag ${f}`,
                );
              }
            }
          }
        }
      });
    });
  }

  if (a.downloads != null) {
    if (!Array.isArray(a.downloads)) {
      errors.push(`${path}.downloads: array`);
    } else {
      a.downloads.forEach((d, i) => {
        if (!d || typeof d !== 'object') {
          errors.push(`${path}.downloads[${i}]: object required`);
          return;
        }
        const dl = /** @type {Record<string, unknown>} */ (d);
        if (typeof dl.id !== 'string') errors.push(`${path}.downloads[${i}].id: required`);
        if (typeof dl.label !== 'string') {
          errors.push(`${path}.downloads[${i}].label: required`);
        }
        if (!['pdf', 'docx', 'xlsx', 'csv', 'other'].includes(/** @type {string} */ (dl.format))) {
          errors.push(`${path}.downloads[${i}].format: invalid`);
        }
        if (
          !['planned', 'draft', 'available', 'removed'].includes(
            /** @type {string} */ (dl.status),
          )
        ) {
          errors.push(`${path}.downloads[${i}].status: invalid`);
        }
        if (dl.status === 'available' && (!dl.href || typeof dl.href !== 'string')) {
          errors.push(`${path}.downloads[${i}].href: required when available`);
        }
      });
    }
  }

  return errors;
}

/**
 * Production-ready = approved record, not outline-only, key claims approved.
 * @param {Record<string, unknown>} article
 */
export function isArticleProductionReady(article) {
  if (!article || typeof article !== 'object') return false;
  if (article.recordStatus !== 'approved') return false;
  if (article.localeStatus === 'outline' || article.localeStatus === 'retired') {
    return false;
  }
  if (article.localeStatus !== 'approved') return false;
  if (!claimHasPublicValue(article.title)) return false;
  if (!claimHasPublicValue(article.excerpt)) return false;
  if (!claimHasPublicValue(article.datePublished)) return false;
  const author = /** @type {any} */ (article.author);
  if (!claimHasPublicValue(author?.name)) return false;
  return true;
}

/**
 * List articles safe to show on the public Resources index.
 * Only production-ready articles appear — outlines/drafts stay off the index.
 * @param {unknown[]} items
 */
export function filterIndexArticles(items) {
  return (Array.isArray(items) ? items : []).filter((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    return isArticleProductionReady(/** @type {Record<string, unknown>} */ (raw));
  });
}

/**
 * Articles included in the static build (outlines/drafts as noindex shells).
 * @param {unknown[]} items
 */
export function filterBuildArticles(items) {
  return (Array.isArray(items) ? items : []).filter((raw) => {
    if (!raw || typeof raw !== 'object') return false;
    const a = /** @type {Record<string, unknown>} */ (raw);
    if (a.recordStatus === 'remove' || a.recordStatus === 'rejected') return false;
    if (a.localeStatus === 'retired') return false;
    if (a.localeStatus === 'pending_translation') return false;
    const title = /** @type {any} */ (a.title)?.value;
    return typeof title === 'string' && title.trim().length > 0;
  });
}

/**
 * Collect review flags across outline items (for QA dashboards).
 * @param {Record<string, unknown>} article
 */
export function collectReviewFlags(article) {
  /** @type {Set<string>} */
  const flags = new Set();
  const sections = Array.isArray(article.sections) ? article.sections : [];
  for (const sec of sections) {
    const items = Array.isArray(/** @type {any} */ (sec).items)
      ? /** @type {any} */ (sec).items
      : [];
    for (const item of items) {
      for (const f of item.reviewFlags || []) flags.add(f);
      if (item.sourceNeeded) flags.add('source_needed');
    }
  }
  return [...flags].sort();
}

/**
 * Public view for rendering (never invents expert conclusions).
 * @param {Record<string, unknown>} article
 */
export function buildPublicArticleView(article) {
  const title = String(/** @type {any} */ (article.title)?.value || '');
  const excerpt = String(/** @type {any} */ (article.excerpt)?.value || '');
  const isOutline = article.localeStatus === 'outline';
  const ready = isArticleProductionReady(article);
  const author = /** @type {any} */ (article.author);
  const reviewer = /** @type {any} */ (article.reviewer);

  return {
    id: article.id,
    slug: article.slug,
    locale: article.locale,
    recordStatus: article.recordStatus,
    localeStatus: article.localeStatus,
    title,
    excerpt,
    isOutline,
    productionReady: ready,
    disclaimerCategory: article.disclaimerCategory,
    relatedServiceId: article.relatedServiceId,
    relatedServicePath:
      RELATED_SERVICE_PATHS[/** @type {string} */ (article.relatedServiceId)],
    cta: article.cta,
    datePublished: /** @type {any} */ (article.datePublished)?.value || null,
    dateModified: /** @type {any} */ (article.dateModified)?.value || null,
    authorName: author?.name?.value || null,
    authorRole: author?.role?.value || null,
    reviewerName: reviewer?.name?.value || null,
    reviewerRole: reviewer?.role?.value || null,
    citations: Array.isArray(article.citations) ? article.citations : [],
    sections: Array.isArray(article.sections) ? article.sections : [],
    downloads: Array.isArray(article.downloads) ? article.downloads : [],
    showToc: article.showToc !== false,
    reviewFlags: collectReviewFlags(article),
    topics: Array.isArray(article.topics) ? article.topics : [],
  };
}

/**
 * Article JSON-LD from visible approved facts only (no Review markup).
 * @param {ReturnType<typeof buildPublicArticleView>} view
 * @param {string} absoluteUrl
 * @param {string} brand
 */
export function buildArticleJsonLd(view, absoluteUrl, brand) {
  if (!view?.productionReady) return null;
  /** @type {Record<string, unknown>} */
  const data = {
    '@type': 'Article',
    headline: view.title,
    description: view.excerpt,
    url: absoluteUrl,
    datePublished: view.datePublished,
    inLanguage: view.locale,
    author: {
      '@type': 'Person',
      name: view.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: brand,
      url: 'https://geezconsulting.com',
    },
    about: {
      '@type': 'Service',
      url: `https://geezconsulting.com${view.relatedServicePath}`,
    },
  };
  if (view.dateModified) data.dateModified = view.dateModified;
  if (view.authorRole) {
    /** @type {any} */ (data.author).jobTitle = view.authorRole;
  }
  return data;
}

/**
 * Accessible download list item rules: available files need href + alt text path note.
 * @param {object} download
 */
export function downloadIsRenderable(download) {
  if (!download || download.status !== 'available') return false;
  if (typeof download.href !== 'string' || !download.href.startsWith('/')) {
    return false;
  }
  return true;
}
