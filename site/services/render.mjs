import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
  withExplicitEnglish,
} from '../templates/chrome.mjs';
import { renderPageBand } from '../templates/atmosphere.mjs';
import { servicesCatalogEn, servicesLocaleChrome } from './safe-copy.mjs';
import { buildChromeModel } from './chrome-model.mjs';
import { htmlLangFor } from '../../content/lib/locale.mjs';
import {
  buildServiceJsonLd,
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
  buildWebPageJsonLd,
} from '../../content/lib/jsonld.mjs';
import { buildDocumentTitle } from '../../content/lib/seo.mjs';
import {
  renderServiceIcon,
  renderServiceShowcase,
  SERVICE_ICON_BY_PATH,
} from '../templates/service-icons.mjs';

const DETAIL_IDS = [
  'start-a-business',
  'business-plans-funding-readiness',
  'bookkeeping-payroll',
  'growth-operations',
];

export { buildServiceJsonLd };

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 */
export function renderServicesOverview(locale, ui, navigation) {
  const overview = servicesCatalogEn.overview;
  const path = locale === 'en' ? overview.path : `/${locale}${overview.path}`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const labels = servicesLocaleChrome[locale] || servicesLocaleChrome.en;
  const e = escapeHtml;
  const assetPrefix = chrome.assetPrefix;

  const cards = overview.cards
    .map((c) => {
      const href = chrome.localizeHref(c.href);
      const iconId = SERVICE_ICON_BY_PATH[c.id] || 'start';
      return `<li class="geez-card geez-svc-card" data-geez-motion data-geez-showcase="1">
        <div class="geez-svc-card__icon" aria-hidden="true">${renderServiceIcon(iconId)}</div>
        <h2><a href="${e(href)}">${e(c.title)}</a></h2>
        <p>${e(c.text)}</p>
      </li>`;
    })
    .join('\n');

  const techHref = chrome.localizeHref(overview.techCard.href);
  const crumbItems = [
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    { label: labels.breadcrumbServices, href: path, current: true },
  ];
  const crumbs = renderBreadcrumbs(crumbItems);

  const translationPending = locale !== 'en';
  const title = buildDocumentTitle({
    pageTitle: overview.h1,
    brand: chrome.brand,
  });
  const absolutePage = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: overview.metaDescription,
      url: absolutePage,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
  ]);

  const mainInner = `
      ${crumbs}
      ${renderPageBand({
        key: 'services',
        title: overview.h1,
        lead: overview.intro,
        kicker: labels.breadcrumbServices || 'Services',
      })}
      <header class="geez-svc__header geez-svc__header--after-band">
        ${
          labels.translationNote
            ? `<p class="geez-svc__note">${e(labels.translationNote)}</p>`
            : ''
        }
      </header>
      <ul class="geez-svc-grid geez-svc-grid--animate">
        ${cards}
        <li class="geez-card geez-svc-card geez-svc-card--tech" data-geez-motion data-geez-showcase="1">
          <div class="geez-svc-card__icon" aria-hidden="true">${renderServiceIcon('tech')}</div>
          <h2><a href="${e(techHref)}">${e(overview.techCard.title)}</a></h2>
          <p>${e(overview.techCard.text)}</p>
        </li>
      </ul>
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(chrome.ctaPrimary)}</a>
        <a class="geez-btn-link geez-btn-link--secondary" href="${e(
          chrome.localizeHref('/find-your-service/'),
        )}">${e(labels.findService || 'Find your service')}</a>
      </p>`;

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-svc--overview">
    <div class="geez-container">
      ${withExplicitEnglish(mainInner, locale)}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: htmlLangFor(locale),
    locale,
    title,
    description: overview.metaDescription,
    robots: 'noindex, nofollow',
    assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['services.css'],
    barePath: overview.path,
    translationPending,
  });
}

/**
 * @param {string} serviceKey
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 */
export function renderServiceDetail(serviceKey, locale, ui, navigation) {
  const service = servicesCatalogEn[serviceKey];
  if (!service || serviceKey === 'overview') {
    throw new Error(`Unknown service key: ${serviceKey}`);
  }
  const path = locale === 'en' ? service.path : `/${locale}${service.path}`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const assetPrefix =
    locale === 'en' ? chrome.assetPrefix : chrome.assetPrefixNested;
  const labels = servicesLocaleChrome[locale] || servicesLocaleChrome.en;
  const e = escapeHtml;
  const absolutePageUrl = `https://geezconsulting.com${path}`;

  const deliverables = service.deliverables
    .map((d) => `<li>${e(d)}</li>`)
    .join('\n');
  const process = service.process
    .map(
      (step, i) => `<li class="geez-home-step">
      <p class="geez-home-step__num" aria-hidden="true">${i + 1}</p>
      <h3>${e(step.title)}</h3>
      <p>${e(step.text)}</p>
    </li>`,
    )
    .join('\n');
  const clientProvides = service.clientProvides
    .map((d) => `<li>${e(d)}</li>`)
    .join('\n');
  const exclusions = service.exclusions
    .map((d) => `<li>${e(d)}</li>`)
    .join('\n');
  const faqs = service.faqs
    .map(
      (f) => `<details class="geez-accordion">
      <summary>${e(f.q)}</summary>
      <div class="geez-accordion__panel"><p>${e(f.a)}</p></div>
    </details>`,
    )
    .join('\n');
  const related = service.relatedResources
    .map((r) => {
      const href = chrome.localizeHref(r.href);
      return `<li><a href="${e(href)}">${e(r.label)}</a>${
        r.note ? ` — ${e(r.note)}` : ''
      }</li>`;
    })
    .join('\n');

  const siblings = DETAIL_IDS.filter((id) => id !== serviceKey)
    .map((id) => {
      const s = servicesCatalogEn[id];
      return `<li><a href="${e(chrome.localizeHref(s.path))}">${e(s.h1)}</a></li>`;
    })
    .join('\n');

  const proofHtml = service.proof?.render
    ? `<section aria-labelledby="proof-heading"><h2 id="proof-heading">${e(
        labels.sectionProof,
      )}</h2></section>`
    : `<section aria-labelledby="proof-heading">
        <h2 id="proof-heading">${e(labels.sectionProof)}</h2>
        <p>${e(labels.proofOmitted)}</p>
      </section>`;

  const crumbItems = [
    { label: labels.breadcrumbHome, href: chrome.homeHref },
    { label: labels.breadcrumbServices, href: chrome.servicesHref },
    { label: service.h1, href: path, current: true },
  ];
  const crumbs = renderBreadcrumbs(crumbItems);

  const title = buildDocumentTitle({
    pageTitle: service.h1,
    brand: chrome.brand,
  });
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: service.metaDescription,
      url: absolutePageUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
    buildServiceJsonLd(service, absolutePageUrl, chrome.brand),
  ]);
  const translationPending = locale !== 'en';
  const iconId = SERVICE_ICON_BY_PATH[serviceKey] || 'start';

  const articleInner = `
      ${crumbs}
      ${renderPageBand({
        key: serviceKey,
        title: service.h1,
        kicker: labels.breadcrumbServices || 'Services',
      })}
      <header class="geez-svc__header geez-svc__header--after-band">
        ${renderServiceShowcase(iconId)}
        ${
          labels.translationNote
            ? `<p class="geez-svc__note">${e(labels.translationNote)}</p>`
            : ''
        }
      </header>

      <section class="geez-svc-section geez-svc-section--rise" aria-labelledby="audience-heading">
        <h2 id="audience-heading">${e(labels.sectionAudience)}</h2>
        <p>${e(service.audience)}</p>
      </section>

      <section class="geez-svc-section geez-svc-section--rise" aria-labelledby="problem-heading" style="--geez-rise-delay: 60ms">
        <h2 id="problem-heading">${e(labels.sectionProblem)}</h2>
        <p>${e(service.problem)}</p>
      </section>

      <section class="geez-svc-section geez-svc-section--rise" aria-labelledby="outcome-heading" style="--geez-rise-delay: 120ms">
        <h2 id="outcome-heading">${e(labels.sectionOutcome)}</h2>
        <p>${e(service.outcome)}</p>
      </section>

      <section class="geez-svc-section geez-svc-section--check" aria-labelledby="deliverables-heading">
        <h2 id="deliverables-heading">${e(labels.sectionDeliverables)}</h2>
        <ul class="geez-svc-check">${deliverables}</ul>
      </section>

      <section class="geez-svc-section geez-svc-section--process" aria-labelledby="process-heading">
        <h2 id="process-heading">${e(labels.sectionProcess)}</h2>
        <ol class="geez-home-process__list geez-svc-process">${process}</ol>
      </section>

      <section class="geez-svc-section" aria-labelledby="client-heading">
        <h2 id="client-heading">${e(labels.sectionClientProvides)}</h2>
        <ul>${clientProvides}</ul>
      </section>

      <section class="geez-svc-section" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">${e(labels.sectionTimeline)}</h2>
        <p>${e(service.timelinePricing)}</p>
      </section>

      <section class="geez-svc-section" aria-labelledby="exclusions-heading">
        <h2 id="exclusions-heading">${e(labels.sectionExclusions)}</h2>
        <ul>${exclusions}</ul>
      </section>

      ${proofHtml}

      <section class="geez-svc-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">${e(labels.sectionFaq)}</h2>
        ${faqs}
      </section>

      <section class="geez-svc-section" aria-labelledby="related-heading">
        <h2 id="related-heading">${e(labels.sectionRelated)}</h2>
        <ul>${related}</ul>
        <h3>${e(labels.otherServices || 'Other services')}</h3>
        <ul>${siblings}</ul>
      </section>

      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="service_body">${e(
          service.ctaLabel,
        )}</a>
      </p>`;

  const body = `${renderHeader({ ...chrome, assetPrefix })}
  <main id="main" class="geez-svc geez-svc--detail geez-svc--${e(serviceKey)}">
    <article class="geez-container geez-container--content">
      ${withExplicitEnglish(articleInner, locale)}
    </article>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: htmlLangFor(locale),
    locale,
    title,
    description: service.metaDescription,
    robots: 'noindex, nofollow',
    assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['homepage.css', 'services.css'],
    barePath: service.path,
    translationPending,
  });
}

export function listServiceDetailIds() {
  return DETAIL_IDS;
}
