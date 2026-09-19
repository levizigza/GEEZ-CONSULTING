import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
} from '../templates/chrome.mjs';
import { renderPageBand } from '../templates/atmosphere.mjs';
import { technologySupportCopy } from './safe-copy.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import { servicesLocaleChrome } from '../services/safe-copy.mjs';

/**
 * Technology Support page — always draft/noindex until CL-016 facts are approved.
 * JSON-LD omitted while no verified Service facts are shown beyond a draft placeholder.
 */
export function renderTechnologySupport(locale, ui, navigation) {
  const copy = technologySupportCopy.en;
  const path = locale === 'en' ? copy.path : `/${locale}${copy.path}`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const labels = servicesLocaleChrome[locale] || servicesLocaleChrome.en;
  const e = escapeHtml;
  const assetPrefix = chrome.assetPrefix;

  const sections = copy.sections
    .map(
      (s) => `<section aria-labelledby="${e(s.id)}-heading">
      <h2 id="${e(s.id)}-heading">${e(s.title)}</h2>
      <p>${e(s.body)}</p>
    </section>`,
    )
    .join('\n');

  const exclusions = copy.exclusions.map((x) => `<li>${e(x)}</li>`).join('\n');
  const faqs = copy.faqs
    .map(
      (f) => `<details class="geez-accordion">
      <summary>${e(f.q)}</summary>
      <div class="geez-accordion__panel"><p>${e(f.a)}</p></div>
    </details>`,
    )
    .join('\n');
  const related = copy.related
    .map((r) => {
      const href = chrome.localizeHref(r.href);
      return `<li><a href="${e(href)}">${e(r.label)}</a></li>`;
    })
    .join('\n');

  const crumbs = renderBreadcrumbs([
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    { label: labels.breadcrumbServices, href: chrome.servicesHref },
    { label: copy.h1, current: true },
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-svc--technology">
    <article class="geez-container geez-container--content">
      ${crumbs}
      ${renderPageBand({
        key: 'technology',
        title: copy.h1,
        lead: copy.intro,
        kicker: labels.breadcrumbServices || 'Services',
      })}
      <header class="geez-svc__header geez-svc__header--after-band">
        <p class="geez-svc__draft" role="status">${e(copy.statusNote)}</p>
      </header>
      ${sections}
      <section aria-labelledby="tech-exclusions-heading">
        <h2 id="tech-exclusions-heading">${e(labels.sectionExclusions)}</h2>
        <ul>${exclusions}</ul>
      </section>
      <section aria-labelledby="tech-faq-heading">
        <h2 id="tech-faq-heading">${e(labels.sectionFaq)}</h2>
        ${faqs}
      </section>
      <section aria-labelledby="tech-related-heading">
        <h2 id="tech-related-heading">${e(labels.sectionRelated)}</h2>
        <ul>${related}</ul>
      </section>
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(copy.ctaLabel)}</a>
      </p>
    </article>
  </main>
  ${renderFooter(chrome)}`;

  // No Service JSON-LD: draft page asserts no offerable verified service facts.
  return renderDocument({
    lang: chrome.lang,
    locale,
    title: `${copy.h1} | ${chrome.brand}`,
    description: copy.metaDescription,
    robots: 'noindex, nofollow',
    assetPrefix,
    bodyHtml: body,
    jsonLd: null,
    extraCss: ['services.css'],
    barePath: '/technology-support/',
    translationPending: locale !== 'en',
  });
}
