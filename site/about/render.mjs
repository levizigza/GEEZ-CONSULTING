/**
 * About Saba page — live-site bio + client reflections with review photography.
 */

import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
  withExplicitEnglish,
} from '../templates/chrome.mjs';
import { renderPageBand } from '../templates/atmosphere.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import { htmlLangFor } from '../../content/lib/locale.mjs';
import {
  buildJsonLdGraph,
  buildWebPageJsonLd,
  buildBreadcrumbListJsonLd,
  buildPersonJsonLd,
} from '../../content/lib/jsonld.mjs';
import { buildDocumentTitle } from '../../content/lib/seo.mjs';
import { withBase } from '../../content/lib/base-path.mjs';
import { ABOUT_SABA_EN, CLIENT_REFLECTIONS } from './safe-copy.mjs';

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {object} [founder]
 */
export function renderAboutSabaPage(locale, ui, navigation, founder) {
  const copy = ABOUT_SABA_EN;
  const barePath = '/about-saba/';
  const path = locale === 'en' ? barePath : `/${locale}${barePath}`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const asset = (src) => withBase(src);
  const translationPending = locale !== 'en';

  const paras = copy.paragraphs.map((p) => `<p>${e(p)}</p>`).join('\n');

  const reflections = CLIENT_REFLECTIONS.map((t) => {
    const photo = t.photo
      ? `<img class="geez-about-quote__photo" src="${e(asset(t.photo.src))}" alt="${e(
          t.photo.alt,
        )}" width="${e(String(t.photo.width))}" height="${e(
          String(t.photo.height),
        )}" loading="lazy" decoding="async">`
      : '';
    const logo = t.logo
      ? `<img class="geez-about-quote__logo" src="${e(asset(t.logo.src))}" alt="${e(
          t.logo.alt,
        )}" width="${e(String(t.logo.width))}" height="${e(
          String(t.logo.height),
        )}" loading="lazy" decoding="async">`
      : '';
    return `<li class="geez-about-quote">
      <div class="geez-about-quote__media">
        ${photo}
        ${logo}
      </div>
      <blockquote>
        <p>${e(t.quote)}</p>
        <footer>
          <cite>
            <span class="geez-about-quote__name">${e(t.name)}</span>
            <span class="geez-about-quote__org">${e(t.org)}</span>
          </cite>
        </footer>
      </blockquote>
    </li>`;
  }).join('\n');

  const portrait = `<img class="geez-about__portrait" src="${e(
    asset(copy.portrait.src),
  )}" alt="${e(copy.portrait.alt)}" width="${e(String(copy.portrait.width))}" height="${e(
    String(copy.portrait.height),
  )}" decoding="async">`;

  const crumbItems = [
    { label: copy.breadcrumbHome, href: chrome.homeHref },
    { label: copy.breadcrumbAbout, href: path, current: true },
  ];
  const title = buildDocumentTitle({
    pageTitle: copy.h1,
    brand: chrome.brand,
  });
  const absoluteUrl = `https://geezconsulting.com${path}`;
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: title,
      description: copy.metaDescription,
      url: absoluteUrl,
      locale,
    }),
    buildBreadcrumbListJsonLd(crumbItems, locale),
    buildPersonJsonLd(founder, absoluteUrl),
  ]);

  const mainInner = `
      ${renderBreadcrumbs(crumbItems)}
      ${renderPageBand({
        key: 'about',
        title: copy.h1,
        lead: copy.lead,
        kicker: copy.kicker,
      })}
      <div class="geez-about__layout">
        <figure class="geez-about__figure">
          ${portrait}
          <figcaption>
            <p class="geez-about__name">${e(copy.name)}</p>
            <p class="geez-about__role">${e(copy.role)}</p>
          </figcaption>
        </figure>
        <div class="geez-about__body">
          ${paras}
          <p class="geez-about__cta">
            <a class="geez-btn-link" href="${e(chrome.bookHref)}" data-geez-cta="inline">${e(
              chrome.ctaPrimary,
            )}</a>
          </p>
        </div>
      </div>
      <section class="geez-about-reflections" aria-labelledby="about-reflections-heading">
        <header class="geez-section__header">
          <h2 id="about-reflections-heading">${e(copy.reflectionsHeading)}</h2>
          <p>${e(copy.reflectionsIntro)}</p>
        </header>
        <ul class="geez-about-reflections__list">
          ${reflections}
        </ul>
      </section>`;

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-about">
    <div class="geez-container">
      ${withExplicitEnglish(mainInner, locale)}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: htmlLangFor(locale),
    locale,
    title,
    description: copy.metaDescription,
    robots: translationPending ? 'noindex, follow' : 'index, follow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    jsonLd,
    extraCss: ['about.css'],
    barePath,
    translationPending,
    measure: { page_type: 'about' },
  });
}
