/**
 * Production-build performance audit helpers (file weight + request shape).
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {string} dir
 * @param {(name: string) => boolean} [filter]
 */
export async function sumAssetBytes(dir, filter = () => true) {
  let total = 0;
  /** @type {{ name: string, bytes: number }[]} */
  const files = [];
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return { total: 0, files: [] };
  }
  for (const name of entries) {
    if (!filter(name)) continue;
    const full = path.join(dir, name);
    const s = await stat(full);
    if (!s.isFile()) continue;
    files.push({ name, bytes: s.size });
    total += s.size;
  }
  return { total, files };
}

/**
 * Count stylesheet/script tags in HTML (request shape).
 * @param {string} html
 */
export function analyzeHtmlRequests(html) {
  const stylesheets = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)];
  const blockingStyles = stylesheets.filter((m) => {
    const tag = m[0];
    return !/media=["']print["']/i.test(tag);
  });
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';
  const syncScripts = [
    ...head.matchAll(/<script(?![^>]*\bdefer\b)(?![^>]*\basync\b)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*src=/gi),
  ];
  const deferredScripts = [
    ...html.matchAll(/<script[^>]+src=[^>]*\bdefer\b/gi),
    ...html.matchAll(/<script[^>]+\bdefer\b[^>]*src=/gi),
  ];
  // Dedupe by full tag match index
  const deferredUnique = new Set(deferredScripts.map((m) => m[0]));
  const moduleScripts = [...html.matchAll(/<script[^>]+type=["']module["'][^>]*src=/gi)];
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imagesMissingDims = images.filter(
    (tag) => !/\bwidth=/i.test(tag) || !/\bheight=/i.test(tag),
  );
  const eagerImages = images.filter((tag) => /fetchpriority=["']high["']/i.test(tag));
  const lazyImages = images.filter((tag) => /loading=["']lazy["']/i.test(tag));

  return {
    stylesheetCount: stylesheets.length,
    blockingStylesheetCount: blockingStyles.length,
    syncScriptsInHead: syncScripts.length,
    deferredScriptCount: deferredUnique.size + moduleScripts.length,
    imageCount: images.length,
    imagesMissingDims: imagesMissingDims.length,
    eagerImages: eagerImages.length,
    lazyImages: lazyImages.length,
    htmlBytes: Buffer.byteLength(html, 'utf8'),
  };
}

/**
 * @param {string} distDir
 * @param {object} budgetDoc
 */
export async function auditRepresentativePages(distDir, budgetDoc) {
  const budgets = budgetDoc.budgets;
  const assetsDir = path.join(distDir, 'assets');
  const js = await sumAssetBytes(assetsDir, (n) => /\.(js|mjs)$/i.test(n));
  const css = await sumAssetBytes(assetsDir, (n) => /\.css$/i.test(n));

  /** @type {string[]} */
  const violations = [];
  if (js.total > budgets.totalJsBytes) {
    violations.push(
      `total JS ${js.total} > budget ${budgets.totalJsBytes}`,
    );
  }
  if (css.total > budgets.totalCssBytes) {
    violations.push(
      `total CSS ${css.total} > budget ${budgets.totalCssBytes}`,
    );
  }
  for (const f of js.files) {
    if (f.bytes > budgets.maxSingleJsBytes) {
      violations.push(`JS ${f.name} ${f.bytes} > ${budgets.maxSingleJsBytes}`);
    }
  }
  for (const f of css.files) {
    if (f.bytes > budgets.maxSingleCssBytes) {
      violations.push(`CSS ${f.name} ${f.bytes} > ${budgets.maxSingleCssBytes}`);
    }
  }

  /** @type {Record<string, ReturnType<typeof analyzeHtmlRequests>>} */
  const pages = {};
  for (const page of budgetDoc.representativePages || []) {
    const html = await readFile(path.join(distDir, page.rel), 'utf8');
    const analysis = analyzeHtmlRequests(html);
    pages[page.id] = analysis;
    if (analysis.htmlBytes > budgets.maxHtmlBytes) {
      violations.push(
        `${page.id} HTML ${analysis.htmlBytes} > ${budgets.maxHtmlBytes}`,
      );
    }
    if (analysis.blockingStylesheetCount > budgets.maxRenderBlockingStylesheets) {
      violations.push(
        `${page.id} blocking CSS links ${analysis.blockingStylesheetCount} > ${budgets.maxRenderBlockingStylesheets}`,
      );
    }
    if (analysis.syncScriptsInHead > budgets.maxSyncScriptsInHead) {
      violations.push(
        `${page.id} sync head scripts ${analysis.syncScriptsInHead} > ${budgets.maxSyncScriptsInHead}`,
      );
    }
    if (analysis.imagesMissingDims > 0) {
      violations.push(
        `${page.id} has ${analysis.imagesMissingDims} img(s) without width/height`,
      );
    }
  }

  return {
    summary: {
      jsBytes: js.total,
      cssBytes: css.total,
      jsFiles: js.files,
      cssFiles: css.files,
      pages,
    },
    violations,
  };
}
