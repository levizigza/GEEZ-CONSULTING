/**
 * WCAG 2.2 AA accessibility audit helpers.
 * Combines structural checks + axe-core (jsdom). Zero axe errors ≠ conformance.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
// axe-core is loaded via script injection into JSDOM (see runAxeOnHtml).


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Representative public sample URLs per locale (relative to dist/). */
export const A11Y_SAMPLE_PAGES = [
  { locale: 'en', rel: 'index.html', label: 'EN home' },
  { locale: 'en', rel: 'services/index.html', label: 'EN services' },
  { locale: 'en', rel: 'services/start-a-business/index.html', label: 'EN service detail' },
  { locale: 'en', rel: 'book-a-fit-call/index.html', label: 'EN fit call' },
  { locale: 'en', rel: 'find-your-service/index.html', label: 'EN finder' },
  { locale: 'en', rel: 'thank-you/index.html', label: 'EN thank-you' },
  { locale: 'en', rel: 'resources/index.html', label: 'EN resources' },
  {
    locale: 'en',
    rel: 'resources/starting-a-business-in-alberta-newcomer-checklist/index.html',
    label: 'EN article outline',
  },
  { locale: 'en', rel: 'client-results/index.html', label: 'EN client results' },
  { locale: 'en', rel: 'privacy/index.html', label: 'EN privacy' },
  { locale: 'en', rel: 'disclaimers/index.html', label: 'EN disclaimers' },
  { locale: 'am', rel: 'am/index.html', label: 'AM home' },
  { locale: 'am', rel: 'am/services/start-a-business/index.html', label: 'AM service' },
  { locale: 'am', rel: 'am/book-a-fit-call/index.html', label: 'AM fit call' },
  { locale: 'am', rel: 'am/find-your-service/index.html', label: 'AM finder' },
  { locale: 'am', rel: 'am/resources/index.html', label: 'AM resources' },
  { locale: 'ti', rel: 'ti/index.html', label: 'TI home' },
  { locale: 'ti', rel: 'ti/book-a-fit-call/index.html', label: 'TI fit call' },
  { locale: 'ti', rel: 'ti/find-your-service/index.html', label: 'TI finder' },
  { locale: 'ti', rel: 'ti/privacy/index.html', label: 'TI privacy' },
];

/**
 * Structural WCAG-oriented checks (complement axe; catch jsdom gaps).
 * @param {Document} document
 * @param {{ rel?: string, locale?: string }} [meta]
 */
export function runStructuralChecks(document, meta = {}) {
  /** @type {{ id: string, impact: 'critical'|'serious'|'moderate'|'minor', message: string }[]} */
  const violations = [];

  const html = document.documentElement;
  const lang = (html.getAttribute('lang') || '').trim();
  if (!lang) {
    violations.push({
      id: 'html-lang',
      impact: 'serious',
      message: 'Missing html[lang]',
    });
  } else if (meta.locale === 'am' && !/^am\b/i.test(lang)) {
    violations.push({
      id: 'html-lang-am',
      impact: 'serious',
      message: `Expected Amharic lang, got "${lang}"`,
    });
  } else if (meta.locale === 'ti' && !/^ti\b/i.test(lang)) {
    violations.push({
      id: 'html-lang-ti',
      impact: 'serious',
      message: `Expected Tigrinya lang, got "${lang}"`,
    });
  } else if (meta.locale === 'en' && !/^en\b/i.test(lang)) {
    violations.push({
      id: 'html-lang-en',
      impact: 'serious',
      message: `Expected English lang, got "${lang}"`,
    });
  }

  const title = document.querySelector('title')?.textContent?.trim();
  if (!title) {
    violations.push({
      id: 'document-title',
      impact: 'serious',
      message: 'Missing document title',
    });
  }

  const skip = document.querySelector('a.geez-skip[href="#main"]');
  if (!skip) {
    violations.push({
      id: 'skip-link',
      impact: 'serious',
      message: 'Missing skip link to #main',
    });
  }

  const mains = document.querySelectorAll('main#main, main');
  if (mains.length !== 1) {
    violations.push({
      id: 'main-landmark',
      impact: 'critical',
      message: `Expected one main landmark, found ${mains.length}`,
    });
  } else if (!document.getElementById('main')) {
    violations.push({
      id: 'main-id',
      impact: 'serious',
      message: 'main landmark missing id="main" for skip target',
    });
  }

  const h1s = document.querySelectorAll('h1');
  if (h1s.length !== 1) {
    violations.push({
      id: 'single-h1',
      impact: 'serious',
      message: `Expected exactly one h1, found ${h1s.length}`,
    });
  }

  if (!document.querySelector('header')) {
    violations.push({
      id: 'header-landmark',
      impact: 'moderate',
      message: 'Missing header landmark',
    });
  }
  if (!document.querySelector('footer')) {
    violations.push({
      id: 'footer-landmark',
      impact: 'moderate',
      message: 'Missing footer landmark',
    });
  }

  const langNav = document.querySelector('nav.geez-lang');
  if (!langNav?.getAttribute('aria-label')) {
    violations.push({
      id: 'lang-nav-label',
      impact: 'serious',
      message: 'Language selector nav missing accessible name',
    });
  }

  const primaryNav = document.querySelector('nav.geez-header__nav');
  if (!primaryNav?.getAttribute('aria-label')) {
    violations.push({
      id: 'primary-nav-label',
      impact: 'serious',
      message: 'Primary nav missing accessible name',
    });
  }

  // Heading levels should not skip (h1 → h3)
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  let prev = 0;
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        message: `Heading level skipped: h${prev} → h${level} (“${(h.textContent || '').trim().slice(0, 40)}”)`,
      });
      break;
    }
    prev = level;
  }

  // Interactive elements should have accessible names
  for (const el of document.querySelectorAll('a, button')) {
    const name = accessibleName(el);
    if (!name) {
      violations.push({
        id: 'control-name',
        impact: 'critical',
        message: `Unnamed ${el.tagName.toLowerCase()} (${el.outerHTML.slice(0, 80)})`,
      });
    }
  }

  // Form controls with id should have labels
  for (const el of document.querySelectorAll('input, select, textarea')) {
    if (el.closest('[aria-hidden="true"]') || el.closest('.geez-hp')) continue;
    const type = (el.getAttribute('type') || '').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
    const id = el.getAttribute('id');
    if (!id) {
      violations.push({
        id: 'control-id',
        impact: 'serious',
        message: `Form control missing id: ${el.outerHTML.slice(0, 60)}`,
      });
      continue;
    }
    const labelled =
      document.querySelector(`label[for="${cssEscapeAttr(id)}"]`) ||
      el.closest('label') ||
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby');
    // Radios may be labelled by fieldset legend / radiogroup
    if (
      !labelled &&
      type === 'radio' &&
      (el.closest('fieldset') || el.closest('[role="radiogroup"]'))
    ) {
      continue;
    }
    if (!labelled) {
      violations.push({
        id: 'label',
        impact: 'critical',
        message: `No label for #${id}`,
      });
    }
  }

  // Images need alt (decorative empty ok)
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) {
      violations.push({
        id: 'img-alt',
        impact: 'critical',
        message: `img missing alt: ${img.getAttribute('src') || ''}`,
      });
    }
  }

  if (/TODO_VERIFICATION/i.test(document.documentElement.outerHTML)) {
    violations.push({
      id: 'todo-leak',
      impact: 'serious',
      message: 'TODO_VERIFICATION leaked into public HTML',
    });
  }

  return violations;
}

/**
 * @param {Element} el
 */
function accessibleName(el) {
  const aria = el.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const parts = labelledby
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
  }
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  if (el.getAttribute('title')?.trim()) return el.getAttribute('title').trim();
  if (el.getAttribute('alt')?.trim()) return el.getAttribute('alt').trim();
  const img = el.querySelector?.('img[alt]');
  if (img?.getAttribute('alt')?.trim()) return img.getAttribute('alt').trim();
  const labelledChild = el.querySelector?.(
    '[aria-label], [aria-labelledby], title',
  );
  if (labelledChild?.getAttribute('aria-label')?.trim()) {
    return labelledChild.getAttribute('aria-label').trim();
  }
  return '';
}

/** Escape for use inside a CSS attribute selector value. */
function cssEscapeAttr(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Run axe-core against an HTML string (with inlined linked CSS when possible).
 * Injects axe into a JSDOM window (Node import of axe.run needs browser globals).
 * @param {string} html
 * @param {{ rel?: string, locale?: string, distDir?: string }} [opts]
 */
export async function runAxeOnHtml(html, opts = {}) {
  const distDir = opts.distDir || path.join(root, 'dist');
  const axeSource = await readFile(
    path.join(root, 'node_modules/axe-core/axe.min.js'),
    'utf8',
  );
  const dom = new JSDOM(html, {
    url: `https://geezconsulting.com/${opts.rel || ''}`,
    pretendToBeVisual: true,
    runScripts: 'dangerously',
  });
  const { window } = dom;
  const { document } = window;

  // Inline linked stylesheets from /assets for rule context
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
  for (const link of links) {
    const href = link.getAttribute('href') || '';
    const match = href.match(/\/assets\/([^/?#]+)$/);
    if (!match) continue;
    try {
      const css = await readFile(path.join(distDir, 'assets', match[1]), 'utf8');
      const style = document.createElement('style');
      style.textContent = css;
      link.replaceWith(style);
    } catch {
      /* missing asset */
    }
  }

  const script = document.createElement('script');
  script.textContent = axeSource;
  document.head.appendChild(script);

  if (!window.axe || typeof window.axe.run !== 'function') {
    throw new Error('axe-core failed to load inside JSDOM');
  }

  const results = await window.axe.run(document, {
    runOnly: {
      type: 'tag',
      values: [
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
        'wcag22aa',
        'best-practice',
      ],
    },
    rules: {
      // jsdom cannot compute reliable visual contrast; token pairs are tested separately
      'color-contrast': { enabled: false },
    },
  });

  const structural = runStructuralChecks(document, opts);
  dom.window.close();

  return {
    rel: opts.rel,
    locale: opts.locale,
    axe: {
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 5).map((n) => n.target),
      })),
      incomplete: results.incomplete.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
      })),
      passes: results.passes.length,
    },
    structural,
  };
}

/**
 * @param {string} [distDir]
 */
export async function listDistHtmlFiles(distDir = path.join(root, 'dist')) {
  /** @type {string[]} */
  const out = [];
  async function walk(dir, prefix = '') {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name === 'assets') continue;
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      if (ent.isDirectory()) await walk(path.join(dir, ent.name), rel);
      else if (ent.name === 'index.html') out.push(rel.replace(/\\/g, '/'));
    }
  }
  await walk(distDir);
  return out.sort();
}

/**
 * Audit sample pages under dist/.
 * @param {{ distDir?: string, samples?: typeof A11Y_SAMPLE_PAGES }} [opts]
 */
export async function auditSamplePages(opts = {}) {
  const distDir = opts.distDir || path.join(root, 'dist');
  const samples = opts.samples || A11Y_SAMPLE_PAGES;
  /** @type {Awaited<ReturnType<typeof runAxeOnHtml>>[]} */
  const reports = [];
  for (const sample of samples) {
    const full = path.join(distDir, sample.rel);
    const html = await readFile(full, 'utf8');
    const report = await runAxeOnHtml(html, {
      rel: sample.rel,
      locale: sample.locale,
      distDir,
    });
    reports.push({ ...report, label: sample.label });
  }
  return reports;
}

/**
 * Flatten critical/serious issues from reports.
 * @param {Awaited<ReturnType<typeof auditSamplePages>>} reports
 */
export function collectHighIssues(reports) {
  /** @type {{ page: string, source: string, id: string, impact: string, message: string }[]} */
  const issues = [];
  for (const r of reports) {
    const page = /** @type {any} */ (r).label || r.rel;
    for (const v of r.structural) {
      if (v.impact === 'critical' || v.impact === 'serious') {
        issues.push({
          page,
          source: 'structural',
          id: v.id,
          impact: v.impact,
          message: v.message,
        });
      }
    }
    for (const v of r.axe.violations) {
      if (v.impact === 'critical' || v.impact === 'serious') {
        issues.push({
          page,
          source: 'axe',
          id: v.id,
          impact: v.impact || 'serious',
          message: v.help || v.description,
        });
      }
    }
  }
  return issues;
}

export { root as A11Y_ROOT };
