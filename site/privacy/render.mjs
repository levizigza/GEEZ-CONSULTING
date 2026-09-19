/**
 * Privacy, terms, and disclaimers pages (draft / noindex until claims approved).
 * Public copy never emits the literal TODO_VERIFICATION token.
 */

import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
  withExplicitEnglish,
} from '../templates/chrome.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import { buildDocumentTitle } from '../../content/lib/seo.mjs';
import {
  buildJsonLdGraph,
  buildWebPageJsonLd,
  buildBreadcrumbListJsonLd,
} from '../../content/lib/jsonld.mjs';
import { privacyClaimDisplay } from '../../content/lib/privacy.mjs';
import { legalPagesCopy } from './safe-copy.mjs';

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {Record<string, unknown>} privacyPolicy
 */
export function renderPrivacyPage(locale, ui, navigation, privacyPolicy) {
  const labels = legalPagesCopy[locale] || legalPagesCopy.en;
  const path = locale === 'en' ? '/privacy/' : `/${locale}/privacy/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const pending = labels.pendingVerification;

  const sectionDefs = [
    { key: 'notLegalAdviceNotice', title: labels.sections.notLegalAdviceNotice },
    { key: 'controller', title: labels.sections.controller },
    { key: 'contact', title: labels.sections.contact },
    { key: 'purposes', title: labels.sections.purposes },
    { key: 'processors', title: labels.sections.processors },
    { key: 'locations', title: labels.sections.locations },
    { key: 'retention', title: labels.sections.retention },
    { key: 'accessCorrection', title: labels.sections.accessCorrection },
    { key: 'safeguards', title: labels.sections.safeguards },
    { key: 'breaches', title: labels.sections.breaches },
    { key: 'deletion', title: labels.sections.deletion },
    { key: 'marketing', title: labels.sections.marketing },
    { key: 'cookiesAndStorage', title: labels.sections.cookiesAndStorage },
  ];

  const sections = sectionDefs
    .map((s) => {
      const field = privacyPolicy?.[s.key];
      const body = privacyClaimDisplay(field, pending);
      const id = `privacy-${s.key}`;
      return `<section aria-labelledby="${e(id)}">
        <h2 id="${e(id)}">${e(s.title)}</h2>
        <p>${e(body)}</p>
      </section>`;
    })
    .join('\n');

  const crumbItems = [
    { label: labels.home, href: chrome.homeHref },
    { label: labels.privacyH1, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: labels.privacyH1,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: labels.privacyMeta,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-legal">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(labels.privacyH1)}</h1>
        <p>${e(labels.privacyIntro)}</p>
        <p class="geez-svc__note">${e(labels.draftBanner)}</p>
      </header>
      ${sections}
      <p><a href="${e(chrome.localizeHref('/unsubscribe/'))}">${e(
          labels.unsubscribeLink,
        )}</a></p>`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: labels.privacyMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['services.css', 'privacy.css'],
    barePath: '/privacy/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {Record<string, unknown>} disclaimers
 */
export function renderDisclaimersPage(locale, ui, navigation, disclaimers) {
  const labels = legalPagesCopy[locale] || legalPagesCopy.en;
  const path = locale === 'en' ? '/disclaimers/' : `/${locale}/disclaimers/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const pending = labels.pendingVerification;

  const blocks = [
    { key: 'scopeOfAdvice', title: labels.disclaimerTitles.scopeOfAdvice },
    {
      key: 'consultingVsRegulatedAdvice',
      title: labels.disclaimerTitles.consultingVsRegulatedAdvice,
    },
    {
      key: 'notLegalTaxImmigrationAdvice',
      title: labels.disclaimerTitles.notLegalTaxImmigrationAdvice,
    },
    {
      key: 'notRegistryOrLicensingDecisions',
      title: labels.disclaimerTitles.notRegistryOrLicensingDecisions,
    },
    {
      key: 'notFundingOrLenderDecisions',
      title: labels.disclaimerTitles.notFundingOrLenderDecisions,
    },
    {
      key: 'noGuaranteedOutcomes',
      title: labels.disclaimerTitles.noGuaranteedOutcomes,
    },
  ];

  const sections = blocks
    .map((b) => {
      const body = privacyClaimDisplay(disclaimers?.[b.key], pending);
      const id = `disc-${b.key}`;
      return `<section aria-labelledby="${e(id)}">
        <h2 id="${e(id)}">${e(b.title)}</h2>
        <p>${e(body)}</p>
      </section>`;
    })
    .join('\n');

  const crumbItems = [
    { label: labels.home, href: chrome.homeHref },
    { label: labels.disclaimersH1, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: labels.disclaimersH1,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: labels.disclaimersMeta,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-legal">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(labels.disclaimersH1)}</h1>
        <p>${e(labels.disclaimersIntro)}</p>
        <p class="geez-svc__note">${e(labels.draftBanner)}</p>
      </header>
      ${sections}`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: labels.disclaimersMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['services.css', 'privacy.css'],
    barePath: '/disclaimers/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 */
export function renderTermsPage(locale, ui, navigation) {
  const labels = legalPagesCopy[locale] || legalPagesCopy.en;
  const path = locale === 'en' ? '/terms/' : `/${locale}/terms/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;

  const crumbItems = [
    { label: labels.home, href: chrome.homeHref },
    { label: labels.termsH1, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: labels.termsH1,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: labels.termsMeta,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
  ]);

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-legal">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(labels.termsH1)}</h1>
        <p>${e(labels.termsIntro)}</p>
        <p class="geez-svc__note">${e(labels.draftBanner)}</p>
      </header>
      <section aria-labelledby="terms-use">
        <h2 id="terms-use">${e(labels.termsUseHeading)}</h2>
        <p>${e(labels.termsUseBody)}</p>
      </section>
      <p><a href="${e(chrome.localizeHref('/disclaimers/'))}">${e(
          labels.seeDisclaimers,
        )}</a> · <a href="${e(chrome.localizeHref('/privacy/'))}">${e(
          labels.seePrivacy,
        )}</a></p>`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: labels.termsMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['services.css', 'privacy.css'],
    barePath: '/terms/',
    translationPending: locale !== 'en',
  });
}

/**
 * Marketing unsubscribe landing (CASL-informed process stub).
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 */
export function renderUnsubscribePage(locale, ui, navigation) {
  const labels = legalPagesCopy[locale] || legalPagesCopy.en;
  const path = locale === 'en' ? '/unsubscribe/' : `/${locale}/unsubscribe/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;

  const crumbItems = [
    { label: labels.home, href: chrome.homeHref },
    { label: labels.unsubscribeH1, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: labels.unsubscribeH1,
    brand: chrome.brand,
  });

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-legal">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${renderBreadcrumbs(crumbItems)}
      <header class="geez-svc__header">
        <h1>${e(labels.unsubscribeH1)}</h1>
        <p>${e(labels.unsubscribeIntro)}</p>
        <p class="geez-svc__note">${e(labels.draftBanner)}</p>
      </header>
      <ol>
        ${labels.unsubscribeSteps.map((s) => `<li>${e(s)}</li>`).join('\n')}
      </ol>
      <p>${e(labels.unsubscribeNote)}</p>`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title,
    description: labels.unsubscribeMeta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    extraCss: ['services.css', 'privacy.css'],
    barePath: '/unsubscribe/',
    translationPending: locale !== 'en',
  });
}
