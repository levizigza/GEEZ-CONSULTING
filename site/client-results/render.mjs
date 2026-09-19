import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
} from '../templates/chrome.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import { clientResultsChrome } from './safe-copy.mjs';
import {
  buildCaseStudyJsonLd,
  buildPublicCaseStudyView,
  filterProductionCaseStudies,
  isCaseStudyProductionReady,
  resolveCaseStudiesForLocale,
  RELATED_SERVICE_PATHS,
} from '../../content/lib/case-studies.mjs';
import {
  buildJsonLdGraph,
  buildBreadcrumbListJsonLd,
  buildWebPageJsonLd,
} from '../../content/lib/jsonld.mjs';
import { buildDocumentTitle } from '../../content/lib/seo.mjs';
import { renderResponsiveImage } from '../../content/lib/images.mjs';

const SERVICE_LABELS = {
  'start-strong': 'Start a Business',
  'plan-funding-readiness': 'Business Plans & Funding Readiness',
  'books-payroll': 'Bookkeeping & Payroll',
  'grow-with-a-system': 'Growth & Operations',
};

/**
 * @param {string} locale
 */
function labelsFor(locale) {
  return clientResultsChrome[locale] || clientResultsChrome.en;
}

/**
 * @param {unknown[]} list
 */
function asList(list) {
  return Array.isArray(list) ? list : [];
}

/**
 * Media block: approved image or graceful placeholder (never a broken img).
 * Explicit dimensions / aspect ratio avoid CLS; below-fold lazy by default.
 * @param {{ src: string, alt: string, sources?: object[], srcset?: string } | null} image
 * @param {string} pendingLabel
 */
export function renderCaseStudyMedia(image, pendingLabel) {
  const e = escapeHtml;
  if (image?.src) {
    return `<figure class="geez-cr__media">
      ${renderResponsiveImage(
        {
          src: image.src,
          width: 1200,
          height: 675,
          alt: image.alt,
          priority: false,
          sizes: '(max-width: 48rem) 100vw, 720px',
          sources: /** @type {any} */ (image).sources,
          srcset: /** @type {any} */ (image).srcset,
        },
        e,
      )}
    </figure>`;
  }
  return `<div class="geez-cr__media geez-cr__media--pending" role="img" aria-label="${e(pendingLabel)}" style="aspect-ratio:16/9">
    <span>${e(pendingLabel)}</span>
  </div>`;
}

/**
 * @param {ReturnType<typeof buildPublicCaseStudyView>} view
 * @param {object} chrome
 * @param {object} labels
 * @param {boolean} usedFallback
 */
function renderCaseStudyBody(view, chrome, labels, usedFallback) {
  const e = escapeHtml;
  const s = labels.sections;
  const deliverables = Array.isArray(view.deliverables)
    ? view.deliverables.map((d) => `<li>${e(String(d))}</li>`).join('\n')
    : '';

  const outcomes = view.outcomes
    .map((o) => {
      if (o.kind === 'quantitative') {
        return `<li>
          <p>${e(o.statement)}</p>
          <dl class="geez-cr__metric">
            <div><dt>Metric</dt><dd>${e(String(o.metricDefinition))}</dd></div>
            <div><dt>Baseline</dt><dd>${e(String(o.baseline))}</dd></div>
            <div><dt>Result</dt><dd>${e(String(o.resultValue))}</dd></div>
            <div><dt>Window</dt><dd>${e(String(o.window))}</dd></div>
            <div><dt>Source</dt><dd>${e(String(o.metricSource))}</dd></div>
          </dl>
        </li>`;
      }
      return `<li><p>${e(o.statement)}</p></li>`;
    })
    .join('\n');

  const quoteHtml = view.quote
    ? `<figure class="geez-testimonial">
        <blockquote><p>${e(view.quote.text)}</p></blockquote>
        <figcaption>
          ${e(view.quote.approverName)}${
            view.quote.approverRole ? `, ${e(view.quote.approverRole)}` : ''
          }
        </figcaption>
      </figure>`
    : '';

  const relatedHref = chrome.localizeHref(view.relatedServicePath);
  const relatedLabel =
    SERVICE_LABELS[/** @type {string} */ (view.relatedServiceId)] ||
    view.relatedServiceId;
  const ctaHref = chrome.localizeHref(/** @type {any} */ (view.cta).href);
  const ctaLabel = /** @type {any} */ (view.cta).label || labels.ctaDefault;

  const identityNote =
    view.identity.mode === 'anonymized'
      ? `<p class="geez-cr__anon">${e(s.identityAnon)}</p>`
      : '';

  return `
    ${renderCaseStudyMedia(view.image, labels.imagePending)}
    ${identityNote}
    ${
      usedFallback
        ? `<p class="geez-svc__note">${e(labels.fallbackNote)}</p>`
        : ''
    }
    <p class="geez-cr__lede"><strong>${e(view.identity.label || 'Client')}</strong> · ${e(view.sector)}</p>
    <section aria-labelledby="cr-stage">
      <h2 id="cr-stage">${e(s.stage)}</h2>
      <p>${e(view.businessStage)}</p>
    </section>
    <section aria-labelledby="cr-situation">
      <h2 id="cr-situation">${e(s.situation)}</h2>
      <p>${e(view.situation)}</p>
    </section>
    <section aria-labelledby="cr-constraint">
      <h2 id="cr-constraint">${e(s.constraint)}</h2>
      <p>${e(view.constraint)}</p>
    </section>
    <section aria-labelledby="cr-goal">
      <h2 id="cr-goal">${e(s.goal)}</h2>
      <p>${e(view.goal)}</p>
    </section>
    <section aria-labelledby="cr-work">
      <h2 id="cr-work">${e(s.work)}</h2>
      <p>${e(view.workPerformed)}</p>
    </section>
    <section aria-labelledby="cr-deliverables">
      <h2 id="cr-deliverables">${e(s.deliverables)}</h2>
      <ul>${deliverables}</ul>
    </section>
    ${
      view.timeline
        ? `<section aria-labelledby="cr-timeline">
      <h2 id="cr-timeline">${e(s.timeline)}</h2>
      <p>${e(view.timeline)}</p>
    </section>`
        : ''
    }
    <section aria-labelledby="cr-outcomes">
      <h2 id="cr-outcomes">${e(s.outcomes)}</h2>
      <ul class="geez-cr__outcomes">${outcomes}</ul>
    </section>
    ${
      quoteHtml
        ? `<section aria-labelledby="cr-quote">
      <h2 id="cr-quote">${e(s.quote)}</h2>
      ${quoteHtml}
    </section>`
        : ''
    }
    <section aria-labelledby="cr-caveat">
      <h2 id="cr-caveat">${e(s.caveat)}</h2>
      <p>${e(view.scopeCaveat)}</p>
    </section>
    <section aria-labelledby="cr-related">
      <h2 id="cr-related">${e(s.related)}</h2>
      <p><a href="${e(relatedHref)}">${e(relatedLabel)}</a></p>
    </section>
    <p class="geez-svc__cta">
      <a class="geez-btn-link" href="${e(ctaHref)}" data-geez-cta="case_study_body">${e(ctaLabel)}</a>
    </p>`;
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {unknown[]} localeCaseStudies
 * @param {unknown[]} enCaseStudies
 */
export function renderClientResultsIndex(
  locale,
  ui,
  navigation,
  localeCaseStudies,
  enCaseStudies,
) {
  const labels = labelsFor(locale);
  const path = locale === 'en' ? '/client-results/' : `/${locale}/client-results/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;

  const resolved = resolveCaseStudiesForLocale(
    locale,
    asList(localeCaseStudies),
    asList(enCaseStudies),
    { productionOnly: true },
  );

  const cards = resolved
    .map(({ item, usedFallback }) => {
      const view = buildPublicCaseStudyView(item, { usedFallback });
      const href = chrome.localizeHref(`/client-results/${view.slug}/`);
      return `<li class="geez-card geez-svc-card">
        <h2><a href="${e(href)}">${e(view.title)}</a></h2>
        <p>${e(view.summary)}</p>
        <p class="geez-cr__card-meta">${e(view.identity.label || '')} · ${e(view.sector)}</p>
        ${
          usedFallback
            ? `<p class="geez-svc__note">${e(labels.fallbackNote)}</p>`
            : ''
        }
      </li>`;
    })
    .join('\n');

  const listHtml = resolved.length
    ? `<ul class="geez-svc-grid">${cards}</ul>`
    : `<div class="geez-cr__empty">
        <h2>${e(labels.emptyTitle)}</h2>
        <p>${e(labels.emptyBody)}</p>
      </div>`;

  const crumbs = renderBreadcrumbs([
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    { label: labels.breadcrumbResults, current: true },
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-cr">
    <div class="geez-container">
      ${crumbs}
      <header class="geez-svc__header">
        <h1>${e(labels.indexH1)}</h1>
        <p>${e(labels.indexIntro)}</p>
        <p class="geez-svc__draft">${e(labels.draftBanner)}</p>
        ${
          labels.translationNote
            ? `<p class="geez-svc__note">${e(labels.translationNote)}</p>`
            : ''
        }
      </header>
      ${listHtml}
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(chrome.ctaPrimary)}</a>
      </p>
    </div>
  </main>
  ${renderFooter(chrome)}`;

  // Redesign + incomplete AM/TI stay noindex until locale surface approved.
  return renderDocument({
    lang: chrome.lang,
    locale,
    title: `${labels.indexH1} | ${chrome.brand}`,
    description: labels.indexMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    extraCss: ['services.css', 'client-results.css'],
    barePath: '/client-results/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {Record<string, unknown>} caseStudy
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {{ usedFallback?: boolean }} [meta]
 */
export function renderCaseStudyPage(
  caseStudy,
  locale,
  ui,
  navigation,
  meta = {},
) {
  const labels = labelsFor(locale);
  const ready = isCaseStudyProductionReady(caseStudy);
  const view = ready
    ? buildPublicCaseStudyView(caseStudy, meta)
    : null;

  const slug = String(caseStudy.slug || 'draft');
  const path =
    locale === 'en'
      ? `/client-results/${slug}/`
      : `/${locale}/client-results/${slug}/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;

  const title = view
    ? view.title
    : String(/** @type {any} */ (caseStudy.title)?.value || 'Case study draft');
  const description = view
    ? view.summary
    : 'Draft client story — not approved for public metrics or indexing.';

  const crumbs = renderBreadcrumbs([
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    {
      label: labels.breadcrumbResults,
      href: chrome.localizeHref('/client-results/'),
    },
    { label: title, current: true },
  ]);

  let mainInner;
  if (view) {
    mainInner = `<header class="geez-svc__header">
        <h1>${e(view.title)}</h1>
        <p>${e(view.summary)}</p>
      </header>
      ${renderCaseStudyBody(view, chrome, labels, Boolean(meta.usedFallback))}`;
  } else {
    mainInner = `<header class="geez-svc__header">
        <h1>${e(title)}</h1>
        <p class="geez-svc__draft">${e(labels.draftBanner)}</p>
        <p>${e(description)}</p>
      </header>
      ${renderCaseStudyMedia(null, labels.imagePending)}
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(chrome.ctaPrimary)}</a>
      </p>`;
  }

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-cr geez-container--content">
    <div class="geez-container geez-container--content">
      ${crumbs}
      ${mainInner}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  const absoluteUrl = `https://geezconsulting.com${path}`;
  const crumbItems = [
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    {
      label: labels.breadcrumbResults,
      href: chrome.localizeHref('/client-results/'),
    },
    { label: title, href: path, current: true },
  ];
  const pageTitle = buildDocumentTitle({ pageTitle: title, brand: chrome.brand });
  const articleLd =
    view && ready ? buildCaseStudyJsonLd(view, absoluteUrl, chrome.brand) : null;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: pageTitle,
      description,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
    articleLd,
  ]);

  return renderDocument({
    lang: chrome.lang,
    locale,
    title: pageTitle,
    description,
    robots: ready && locale === 'en' ? 'index, follow' : 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    ogType: 'article',
    extraCss: ['services.css', 'client-results.css'],
    barePath: `/client-results/${slug}/`,
    translationPending: locale !== 'en',
  });
}

/**
 * @param {string} locale
 * @param {unknown[]} localeItems
 * @param {unknown[]} enItems
 */
export function listCaseStudyPagesForBuild(locale, localeItems, enItems) {
  // Emit locale drafts only — no silent EN shells on AM/TI.
  const local = asList(localeItems);
  /** @type {{ item: Record<string, unknown>, usedFallback: boolean }[]} */
  const pages = [];
  const seen = new Set();

  for (const item of local) {
    if (!item || typeof item !== 'object') continue;
    const slug = /** @type {any} */ (item).slug;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    pages.push({
      item: /** @type {Record<string, unknown>} */ (item),
      usedFallback: false,
    });
  }

  if (locale === 'en') {
    // Optionally include production-ready only already in local
    return pages;
  }

  // AM/TI: do not invent EN detail URLs under /am/ or /ti/
  return pages;
}

export {
  filterProductionCaseStudies,
  isCaseStudyProductionReady,
  RELATED_SERVICE_PATHS,
};
