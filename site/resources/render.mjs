import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
} from '../templates/chrome.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import {
  resourcesChrome,
  SERVICE_LABELS,
  DISCLAIMER_LABELS,
} from './safe-copy.mjs';
import {
  buildPublicArticleView,
  buildArticleJsonLd,
  filterIndexArticles,
  filterBuildArticles,
  downloadIsRenderable,
  RELATED_SERVICE_PATHS,
} from '../../content/lib/articles.mjs';
import {
  buildJsonLdGraph,
  buildBreadcrumbListJsonLd,
  buildWebPageJsonLd,
} from '../../content/lib/jsonld.mjs';
import { buildDocumentTitle } from '../../content/lib/seo.mjs';

/**
 * @param {string} locale
 */
function labelsFor(locale) {
  return resourcesChrome[locale] || resourcesChrome.en;
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {unknown[]} articles
 */
export function renderResourcesIndex(locale, ui, navigation, articles) {
  const labels = labelsFor(locale);
  const path = locale === 'en' ? '/resources/' : `/${locale}/resources/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const list = filterIndexArticles(articles).map((raw) =>
    buildPublicArticleView(/** @type {Record<string, unknown>} */ (raw)),
  );

  const cards = list.length
    ? `<ul class="geez-res-list">
      ${list
        .map((a) => {
          const href = chrome.localizeHref(`/resources/${a.slug}/`);
          const badge = a.isOutline
            ? `<span class="geez-res-badge">${e(labels.outlineBadge)}</span>`
            : a.productionReady
              ? ''
              : `<span class="geez-res-badge">${e(labels.draftBadge)}</span>`;
          return `<li class="geez-res-card">
          <h2><a href="${e(href)}">${e(a.title)}</a> ${badge}</h2>
          <p>${e(a.excerpt)}</p>
        </li>`;
        })
        .join('\n')}
    </ul>`
    : `<p class="geez-res__empty">${e(labels.emptyState)}</p>`;

  const crumbItems = [
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    { label: labels.breadcrumbResources, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: labels.indexH1,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: labels.indexMeta,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-res">
    <div class="geez-container">
      ${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(labels.indexH1)}</h1>
        <p>${e(labels.indexIntro)}</p>
      </header>
      ${cards}
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(chrome.ctaPrimary)}</a>
      </p>
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: labels.indexMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['services.css', 'resources.css'],
    barePath: '/resources/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {Record<string, unknown>} article
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {unknown[]} [allArticles]
 */
export function renderArticlePage(
  article,
  locale,
  ui,
  navigation,
  allArticles = [],
) {
  const labels = labelsFor(locale);
  const view = buildPublicArticleView(article);
  const path =
    locale === 'en'
      ? `/resources/${view.slug}/`
      : `/${locale}/resources/${view.slug}/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const ready = view.productionReady;

  const crumbItems = [
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    {
      label: labels.breadcrumbResources,
      href: chrome.localizeHref('/resources/'),
    },
    { label: view.title, href: path, current: true },
  ];

  const toc =
    view.showToc && view.sections.length > 1
      ? `<nav class="geez-res-toc" aria-label="${e(labels.tocHeading)}">
      <h2>${e(labels.tocHeading)}</h2>
      <ol>
        ${view.sections
          .map(
            (s) =>
              `<li><a href="#${e(/** @type {any} */ (s).id)}">${e(
                /** @type {any} */ (s).heading,
              )}</a></li>`,
          )
          .join('\n')}
      </ol>
    </nav>`
      : '';

  const sectionsHtml = view.sections
    .map((sec) => {
      const s = /** @type {any} */ (sec);
      const items = (s.items || [])
        .map((it) => {
          const flags = (it.reviewFlags || [])
            .map(
              (f) =>
                `<span class="geez-res-flag" title="${e(
                  DISCLAIMER_LABELS[f] || f,
                )}">${e(f)}</span>`,
            )
            .join(' ');
          const source = it.sourceNeeded
            ? `<span class="geez-res-flag geez-res-flag--source">source</span>`
            : '';
          return `<li><span class="geez-res-item__text">${e(it.text)}</span> ${flags}${source}</li>`;
        })
        .join('\n');
      const intro = s.intro ? `<p>${e(s.intro)}</p>` : '';
      return `<section class="geez-res-section" id="${e(s.id)}" aria-labelledby="${e(
        s.id,
      )}-h">
        <h2 id="${e(s.id)}-h">${e(s.heading)}</h2>
        ${intro}
        <ul>${items}</ul>
      </section>`;
    })
    .join('\n');

  const metaBits = [];
  if (view.authorName) {
    metaBits.push(
      `<p><span class="geez-res-meta__label">${e(labels.authorLabel)}</span> ${e(
        view.authorName,
      )}${view.authorRole ? ` — ${e(view.authorRole)}` : ''}</p>`,
    );
  }
  if (view.reviewerName) {
    metaBits.push(
      `<p><span class="geez-res-meta__label">${e(labels.reviewerLabel)}</span> ${e(
        view.reviewerName,
      )}</p>`,
    );
  }
  if (view.datePublished) {
    metaBits.push(
      `<p><span class="geez-res-meta__label">${e(labels.publishedLabel)}</span> <time datetime="${e(
        String(view.datePublished),
      )}">${e(String(view.datePublished))}</time></p>`,
    );
  }
  if (view.dateModified) {
    metaBits.push(
      `<p><span class="geez-res-meta__label">${e(labels.updatedLabel)}</span> <time datetime="${e(
        String(view.dateModified),
      )}">${e(String(view.dateModified))}</time></p>`,
    );
  }

  const updateNotice = `<p class="geez-res-update" role="note">${e(
    labels.updateNoticePrefix,
  )} ${e(String(view.localeStatus))}${
    view.isOutline ? ` — ${e(labels.outlineBadge)}` : ''
  }</p>`;

  const outlineBanner = view.isOutline
    ? `<p class="geez-svc__note" role="status">${e(labels.outlineNotice)}</p>`
    : '';

  const flagsHtml = view.reviewFlags.length
    ? `<section aria-labelledby="flags-h">
      <h2 id="flags-h">${e(labels.reviewFlagsHeading)}</h2>
      <ul class="geez-res-flags">${view.reviewFlags
        .map((f) => `<li>${e(DISCLAIMER_LABELS[f] || f)}</li>`)
        .join('\n')}</ul>
    </section>`
    : '';

  const citationsHtml =
    view.citations.length > 0
      ? `<section aria-labelledby="sources-h">
      <h2 id="sources-h">${e(labels.sourcesHeading)}</h2>
      <ul>
        ${view.citations
          .map((c) => {
            const cite = /** @type {any} */ (c);
            const status = cite.status ? ` (${e(cite.status)})` : '';
            if (cite.url && cite.status === 'verified') {
              return `<li><a href="${e(cite.url)}" rel="noopener noreferrer">${e(
                cite.label,
              )}</a>${status}</li>`;
            }
            return `<li>${e(cite.label)}${status}</li>`;
          })
          .join('\n')}
      </ul>
    </section>`
      : `<section aria-labelledby="sources-h">
      <h2 id="sources-h">${e(labels.sourcesHeading)}</h2>
      <p>${e(labels.sourcesPending)}</p>
    </section>`;

  const servicePath =
    RELATED_SERVICE_PATHS[/** @type {string} */ (view.relatedServiceId)];
  const serviceLabel =
    SERVICE_LABELS[/** @type {string} */ (view.relatedServiceId)] ||
    view.relatedServiceId;
  const relatedService = servicePath
    ? `<section aria-labelledby="svc-h">
      <h2 id="svc-h">${e(labels.relatedServiceHeading)}</h2>
      <p><a href="${e(chrome.localizeHref(servicePath))}">${e(serviceLabel)}</a></p>
    </section>`
    : '';

  const downloads = view.downloads || [];
  const downloadsHtml = downloads.length
    ? `<section aria-labelledby="dl-h">
      <h2 id="dl-h">${e(labels.downloadsHeading)}</h2>
      <ul class="geez-res-downloads">
        ${downloads
          .map((d) => {
            const dl = /** @type {any} */ (d);
            if (downloadIsRenderable(dl)) {
              const alt = dl.accessible?.textAlternativeHref
                ? ` <a href="${e(dl.accessible.textAlternativeHref)}">(text alternative)</a>`
                : '';
              return `<li><a class="geez-res-download" href="${e(
                dl.href,
              )}" download>${e(dl.label)}</a> <span class="geez-res-download__fmt">${e(
                String(dl.format).toUpperCase(),
              )}</span>${alt}</li>`;
            }
            return `<li><span>${e(dl.label)}</span> — ${e(
              labels.downloadUnavailable,
            )}</li>`;
          })
          .join('\n')}
      </ul>
    </section>`
    : '';

  const related = filterIndexArticles(allArticles)
    .map((raw) => buildPublicArticleView(/** @type {Record<string, unknown>} */ (raw)))
    .filter(
      (a) =>
        a.slug !== view.slug &&
        a.relatedServiceId === view.relatedServiceId,
    )
    .slice(0, 3);
  const relatedHtml = related.length
    ? `<section aria-labelledby="rel-h">
      <h2 id="rel-h">${e(labels.relatedArticlesHeading)}</h2>
      <ul>
        ${related
          .map(
            (a) =>
              `<li><a href="${e(
                chrome.localizeHref(`/resources/${a.slug}/`),
              )}">${e(a.title)}</a></li>`,
          )
          .join('\n')}
      </ul>
    </section>`
    : '';

  const ctaHref = chrome.localizeHref(
    typeof view.cta?.href === 'string' ? view.cta.href : '/book-a-fit-call/',
  );
  const ctaLabel =
    typeof view.cta?.label === 'string' ? view.cta.label : labels.ctaFallback;

  const title = buildDocumentTitle({
    pageTitle: view.title,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const articleLd = ready
    ? buildArticleJsonLd(view, absoluteUrl, chrome.brand)
    : null;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: view.excerpt,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
    articleLd,
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-res">
    <article class="geez-container geez-container--content">
      ${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(view.title)}</h1>
        <p>${e(view.excerpt)}</p>
        ${outlineBanner}
        ${updateNotice}
        <div class="geez-res-meta">${metaBits.join('\n')}</div>
        <p class="geez-res-disclaimer">${e(labels.disclaimerGeneral)} (${e(
          DISCLAIMER_LABELS[/** @type {string} */ (view.disclaimerCategory)] ||
            String(view.disclaimerCategory),
        )})</p>
      </header>
      ${toc}
      ${sectionsHtml}
      ${flagsHtml}
      ${citationsHtml}
      ${downloadsHtml}
      ${relatedService}
      ${relatedHtml}
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(ctaHref)}" data-geez-cta="article_body">${e(ctaLabel)}</a>
      </p>
    </article>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: view.excerpt,
    robots: ready ? 'index, follow' : 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    ogType: 'article',
    extraCss: ['services.css', 'resources.css'],
    barePath: `/resources/${view.slug}/`,
    translationPending: locale !== 'en' || view.isOutline,
  });
}

/**
 * @param {string} locale
 * @param {unknown[]} items
 */
export function listArticlePagesForBuild(locale, items) {
  return filterBuildArticles(items).map((item) => ({
    item: /** @type {Record<string, unknown>} */ (item),
  }));
}
