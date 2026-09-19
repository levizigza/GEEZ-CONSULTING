import { mkdir, writeFile, cp, rm, readFile, open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocaleBundle, readDataJson } from '../content/lib/load.mjs';
import { applyProductionGate } from '../content/lib/production-gate.mjs';
import { buildHomepageModel, renderHomepageHtml } from './homepage/render.mjs';
import {
  renderServicesOverview,
  renderServiceDetail,
  listServiceDetailIds,
} from './services/render.mjs';
import { renderTechnologySupport } from './technology/render.mjs';
import {
  renderClientResultsIndex,
  renderCaseStudyPage,
  listCaseStudyPagesForBuild,
} from './client-results/render.mjs';
import {
  renderServiceFinderPage,
  renderFitFormPage,
  renderThankYouPage,
} from './intake/render.mjs';
import {
  renderResourcesIndex,
  renderArticlePage,
  listArticlePagesForBuild,
} from './resources/render.mjs';
import {
  renderPrivacyPage,
  renderDisclaimersPage,
  renderTermsPage,
  renderUnsubscribePage,
} from './privacy/render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const buildLockPath = path.join(root, '.dist-build.lock');
const locales = ['en', 'am', 'ti'];

async function withBuildLock(fn) {
  for (let attempt = 1; attempt <= 80; attempt += 1) {
    try {
      const handle = await open(buildLockPath, 'wx');
      try {
        return await fn();
      } finally {
        await handle.close();
        await unlink(buildLockPath).catch(() => {});
      }
    } catch (err) {
      const code = /** @type {NodeJS.ErrnoException} */ (err).code;
      if (code !== 'EEXIST') throw err;
      await new Promise((resolve) => setTimeout(resolve, 100 + attempt * 10));
    }
  }
  throw new Error('Timed out waiting for dist build lock');
}

async function copyDesignAssets() {
  const dest = path.join(dist, 'assets');
  await mkdir(dest, { recursive: true });
  const files = [
    ['design/css/fonts.css', 'fonts.css'],
    ['design/css/fonts-latin.css', 'fonts-latin.css'],
    ['design/css/fonts-ethiopic.css', 'fonts-ethiopic.css'],
    ['site/homepage/homepage.css', 'homepage.css'],
    ['site/homepage/intro.js', 'intro.js'],
    ['site/audio/ambient.js', 'ambient.js'],
    ['site/motion/motion.js', 'motion.js'],
    ['site/services/services.css', 'services.css'],
    ['site/client-results/client-results.css', 'client-results.css'],
    ['site/resources/resources.css', 'resources.css'],
    ['site/privacy/privacy.css', 'privacy.css'],
    ['site/privacy/consent.js', 'consent.js'],
    ['site/privacy/analytics.js', 'analytics.js'],
    ['site/intake/intake.css', 'intake.css'],
    ['site/intake/fit-form.js', 'fit-form.js'],
    ['site/intake/service-finder.js', 'service-finder.js'],
    ['site/intake/service-finder-model.mjs', 'service-finder-model.mjs'],
    ['site/locale/locale-preference.js', 'locale-preference.js'],
    ['site/perf/web-vitals-rum.js', 'web-vitals-rum.js'],
  ];
  for (const [from, to] of files) {
    await cp(path.join(root, from), path.join(dest, to));
  }

  // One render-blocking core stylesheet (tokens + base + primitives + atmosphere)
  const coreParts = await Promise.all(
    ['tokens.css', 'base.css', 'primitives.css', 'atmosphere.css'].map((f) =>
      readFile(path.join(root, 'design/css', f), 'utf8'),
    ),
  );
  await writeFile(
    path.join(dest, 'site-core.css'),
    `/* site-core: tokens + base + primitives + atmosphere */\n${coreParts.join('\n')}`,
    'utf8',
  );

  await cp(
    path.join(root, 'site/perf/_headers'),
    path.join(dist, '_headers'),
  );

  // Client portrait + atmosphere photography for homepage CSS/HTML
  await cp(path.join(root, 'media'), path.join(dist, 'media'), {
    recursive: true,
  });
}

function assertNoTodo(html, label) {
  if (/TODO_VERIFICATION/i.test(html)) {
    throw new Error(`${label} contains TODO_VERIFICATION public text`);
  }
  if (/Navigate Technology Solutions/i.test(html)) {
    throw new Error(
      `${label} publicly names Navigate Technology Solutions before verification`,
    );
  }
}

/**
 * @param {string} locale
 * @param {string} relPath e.g. services/index.html or services/start-a-business/index.html
 * @param {string} html
 */
async function writeLocalePage(locale, relPath, html) {
  assertNoTodo(html, `${locale}:${relPath}`);
  const base = locale === 'en' ? dist : path.join(dist, locale);
  const full = path.join(base, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, html, 'utf8');
}

async function cleanDist() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await rm(dist, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
      return;
    } catch (err) {
      const code = /** @type {NodeJS.ErrnoException} */ (err).code;
      if (attempt === 5 || (code !== 'ENOTEMPTY' && code !== 'EBUSY' && code !== 'EPERM')) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
    }
  }
}

async function main() {
  await withBuildLock(async () => {
    await cleanDist();
    await mkdir(dist, { recursive: true });
    await copyDesignAssets();

  const navigation = await readDataJson('shared/navigation.json');
  /** @type {string[]} */
  const omitted = [];
  /** @type {string[]} */
  const pages = [];

  /** @type {Record<string, unknown[]>} */
  const caseStudiesByLocale = {};
  for (const locale of locales) {
    caseStudiesByLocale[locale] = /** @type {unknown[]} */ (
      (await loadLocaleBundle(locale)).caseStudies
    );
  }

  for (const locale of locales) {
    const rawBundle = await loadLocaleBundle(locale);
    const bundle = applyProductionGate(rawBundle);

    const homeModel = buildHomepageModel(locale, bundle.ui, navigation, {
      business: bundle.business,
      serviceArea: bundle.serviceArea,
      languages: bundle.languages,
      founder: bundle.founder,
    });
    if (!homeModel.trust?.render) omitted.push(`${locale}:home:trust`);
    const homeHtml = renderHomepageHtml(homeModel);
    assertNoTodo(homeHtml, `${locale}:home`);
    if (locale === 'en') {
      await writeFile(path.join(dist, 'index.html'), homeHtml, 'utf8');
      pages.push('/index.html');
    } else {
      await mkdir(path.join(dist, locale), { recursive: true });
      await writeFile(path.join(dist, locale, 'index.html'), homeHtml, 'utf8');
      pages.push(`/${locale}/index.html`);
    }

    const overviewHtml = renderServicesOverview(locale, bundle.ui, navigation);
    await writeLocalePage(locale, path.join('services', 'index.html'), overviewHtml);
    pages.push(locale === 'en' ? '/services/' : `/${locale}/services/`);

    for (const id of listServiceDetailIds()) {
      const html = renderServiceDetail(id, locale, bundle.ui, navigation);
      await writeLocalePage(
        locale,
        path.join('services', id, 'index.html'),
        html,
      );
      pages.push(
        locale === 'en' ? `/services/${id}/` : `/${locale}/services/${id}/`,
      );
      omitted.push(`${locale}:${id}:proof`);
    }

    const techHtml = renderTechnologySupport(locale, bundle.ui, navigation);
    await writeLocalePage(locale, path.join('technology-support', 'index.html'), techHtml);
    pages.push(
      locale === 'en' ? '/technology-support/' : `/${locale}/technology-support/`,
    );
    omitted.push(`${locale}:technology-support:partner-facts`);

    const enCases = caseStudiesByLocale.en || [];
    const localeCases = caseStudiesByLocale[locale] || [];
    const crIndex = renderClientResultsIndex(
      locale,
      bundle.ui,
      navigation,
      localeCases,
      enCases,
    );
    await writeLocalePage(locale, path.join('client-results', 'index.html'), crIndex);
    pages.push(
      locale === 'en' ? '/client-results/' : `/${locale}/client-results/`,
    );

    for (const { item, usedFallback } of listCaseStudyPagesForBuild(
      locale,
      localeCases,
      enCases,
    )) {
      const html = renderCaseStudyPage(item, locale, bundle.ui, navigation, {
        usedFallback,
      });
      await writeLocalePage(
        locale,
        path.join('client-results', String(item.slug), 'index.html'),
        html,
      );
      pages.push(
        locale === 'en'
          ? `/client-results/${item.slug}/`
          : `/${locale}/client-results/${item.slug}/`,
      );
      if (/** @type {any} */ (item).recordStatus !== 'approved') {
        omitted.push(`${locale}:case-study:${item.slug}:unapproved`);
      }
    }

    const finderHtml = renderServiceFinderPage(locale, bundle.ui, navigation);
    await writeLocalePage(
      locale,
      path.join('find-your-service', 'index.html'),
      finderHtml,
    );
    pages.push(
      locale === 'en' ? '/find-your-service/' : `/${locale}/find-your-service/`,
    );

    const fitHtml = renderFitFormPage(locale, bundle.ui, navigation);
    await writeLocalePage(
      locale,
      path.join('book-a-fit-call', 'index.html'),
      fitHtml,
    );
    pages.push(
      locale === 'en' ? '/book-a-fit-call/' : `/${locale}/book-a-fit-call/`,
    );

    const thanksHtml = renderThankYouPage(locale, bundle.ui, navigation);
    await writeLocalePage(locale, path.join('thank-you', 'index.html'), thanksHtml);
    pages.push(locale === 'en' ? '/thank-you/' : `/${locale}/thank-you/`);

    // Use pre-gate article records so outline/draft titles remain for noindex
    // Resources pages (gate nulls non-approved ClaimField values).
    const articles = Array.isArray(rawBundle.articles) ? rawBundle.articles : [];
    const resIndex = renderResourcesIndex(
      locale,
      bundle.ui,
      navigation,
      articles,
    );
    await writeLocalePage(locale, path.join('resources', 'index.html'), resIndex);
    pages.push(locale === 'en' ? '/resources/' : `/${locale}/resources/`);

    for (const { item } of listArticlePagesForBuild(locale, articles)) {
      const html = renderArticlePage(
        item,
        locale,
        bundle.ui,
        navigation,
        articles,
      );
      await writeLocalePage(
        locale,
        path.join('resources', String(item.slug), 'index.html'),
        html,
      );
      pages.push(
        locale === 'en'
          ? `/resources/${item.slug}/`
          : `/${locale}/resources/${item.slug}/`,
      );
      if (item.localeStatus === 'outline' || item.recordStatus !== 'approved') {
        omitted.push(`${locale}:article:${item.slug}:not-production`);
      }
    }

    const privacyPolicy = await readDataJson('shared/privacy-policy.json');
    const disclaimers = await readDataJson('shared/disclaimers.json');
    const privacyHtml = renderPrivacyPage(
      locale,
      bundle.ui,
      navigation,
      privacyPolicy,
    );
    await writeLocalePage(locale, path.join('privacy', 'index.html'), privacyHtml);
    pages.push(locale === 'en' ? '/privacy/' : `/${locale}/privacy/`);
    omitted.push(`${locale}:privacy:draft-claims`);

    const discHtml = renderDisclaimersPage(
      locale,
      bundle.ui,
      navigation,
      disclaimers,
    );
    await writeLocalePage(
      locale,
      path.join('disclaimers', 'index.html'),
      discHtml,
    );
    pages.push(locale === 'en' ? '/disclaimers/' : `/${locale}/disclaimers/`);
    omitted.push(`${locale}:disclaimers:draft-claims`);

    const termsHtml = renderTermsPage(locale, bundle.ui, navigation);
    await writeLocalePage(locale, path.join('terms', 'index.html'), termsHtml);
    pages.push(locale === 'en' ? '/terms/' : `/${locale}/terms/`);
    omitted.push(`${locale}:terms:draft`);

    const unsubHtml = renderUnsubscribePage(locale, bundle.ui, navigation);
    await writeLocalePage(
      locale,
      path.join('unsubscribe', 'index.html'),
      unsubHtml,
    );
    pages.push(locale === 'en' ? '/unsubscribe/' : `/${locale}/unsubscribe/`);
  }

  const manifest = {
    builtAt: new Date().toISOString(),
    locales,
    pages,
    omittedSections: omitted,
    notes: [
      'All service and technology pages are noindex until claims are approved.',
      'Technology Support omits Navigate Technology Solutions name until CL-016 verified.',
      'Service JSON-LD includes only name, description, url, provider, audience — no offers/prices.',
      'Organization/ProfessionalService JSON-LD emits only production-approved NAP (CL-006–013).',
      'Proof sections omitted (no approved case studies/testimonials).',
      'Client Results lists only production-ready case studies; drafts emit noindex detail shells without Article JSON-LD.',
      'Migrated live testimonials are qualitative drafts only — no inferred financing/revenue/profit metrics.',
      'Service finder + Fit Call form use progressive enhancement; intake API is documented in docs/geez-redesign/intake-data-flow.md.',
      'sitemap.xml excludes drafts/noindex; robots.txt blocks thank-you confirmation URLs.',
      'Resources outlines are noindex until approved; not fabricated expert advice.',
      'Privacy/consent inventory: docs/geez-redesign/privacy-review.md — not legal advice.',
      'Non-essential scripts use type=text/plain data-geez-consent until opt-in (consent.js).',
      'Perf: site-core.css concatenates tokens/base/primitives; fonts split latin/ethiopic; see docs/geez-redesign/performance-report.md.',
    ],
  };
  await writeFile(path.join(dist, 'build-manifest.json'), JSON.stringify(manifest, null, 2));

  const { loadRoutingDocs, resolveIndexability } = await import(
    '../content/lib/routes.mjs'
  );
  const { collectSitemapEntries, renderSitemapXml, renderRobotsTxt } =
    await import('../content/lib/sitemap.mjs');
  const { isCaseStudyProductionReady } = await import(
    '../content/lib/case-studies.mjs'
  );
  const routing = await loadRoutingDocs();
  /** @type {{ locale: string, path: string }[]} */
  const caseStudyUrls = [];
  for (const locale of locales) {
    for (const cs of caseStudiesByLocale[locale] || []) {
      if (
        cs &&
        typeof cs === 'object' &&
        isCaseStudyProductionReady(/** @type {Record<string, unknown>} */ (cs))
      ) {
        const slug = /** @type {any} */ (cs).slug;
        caseStudyUrls.push({
          locale,
          path:
            locale === 'en'
              ? `/client-results/${slug}/`
              : `/${locale}/client-results/${slug}/`,
        });
      }
    }
  }
  const sitemapEntries = collectSitemapEntries(routing.routes, {
    caseStudyUrls,
    isRouteIndexable: (route) =>
      resolveIndexability(route, { hasApprovedContent: false }).indexable,
  });
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    renderSitemapXml(sitemapEntries),
    'utf8',
  );
  await writeFile(path.join(dist, 'robots.txt'), renderRobotsTxt(), 'utf8');

  console.log(
    `Built ${pages.length} pages → dist/ (sitemap URLs: ${sitemapEntries.length})`,
  );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
