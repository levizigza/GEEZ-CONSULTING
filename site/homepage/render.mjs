import { homepageSafeCopy, publicText } from './safe-copy.mjs';
import { localizePath } from '../../content/lib/routes.mjs';
import { getBasePath } from '../../content/lib/base-path.mjs';
import {
  htmlLangFor,
} from '../../content/lib/locale.mjs';
import {
  buildDocumentTitle,
  buildPageSeo,
  renderSocialMeta,
  resolveImageAlt,
} from '../../content/lib/seo.mjs';
import {
  buildJsonLdGraph,
  buildWebPageJsonLd,
  buildBreadcrumbListJsonLd,
  buildOrganizationJsonLd,
  buildPersonJsonLd,
} from '../../content/lib/jsonld.mjs';
import {
  renderStylesheetLinks,
  renderDeferredScripts,
} from '../templates/perf-head.mjs';
import { renderResponsiveImage } from '../../content/lib/images.mjs';

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {import('../../content/lib/routes.mjs').LOCALES[number]} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {{ business?: object, serviceArea?: object, languages?: object, founder?: object }} [shared]
 */
export function buildHomepageModel(locale, ui, navigation, shared = {}) {
  const safe = homepageSafeCopy[locale] || homepageSafeCopy.en;
  const labels = navigation.labels?.[locale] || navigation.labels.en;
  const homeHref = localizePath(locale, '/');
  const servicesHref = localizePath(locale, '/services/');
  const resourcesHref = localizePath(locale, '/resources/');
  const aboutHref = localizePath(locale, '/about-saba/');
  const bookHref = localizePath(locale, '/book-a-fit-call/');
  const privacyHref = localizePath(locale, '/privacy/');
  const termsHref = localizePath(locale, '/terms/');
  const disclaimersHref = localizePath(locale, '/disclaimers/');
  const clientResultsHref = localizePath(locale, '/client-results/');

  const nav = {
    home: publicText(ui?.nav?.home, labels['nav.home'] || 'Home'),
    services: publicText(ui?.nav?.services, labels['nav.services'] || 'Services'),
    resources: publicText(ui?.nav?.resources, labels['nav.resources'] || 'Resources'),
    about: publicText(ui?.nav?.about, labels['nav.about'] || 'About'),
    contact: publicText(
      ui?.nav?.contact,
      publicText(safe.ctaPrimary, labels['cta.bookFitCall'] || 'Book a Fit Call'),
    ),
    clientResults: publicText(
      labels['nav.clientResults'],
      safe.clientResultsLabel || 'Client Results',
    ),
  };

  return {
    locale,
    lang: locale === 'en' ? 'en' : locale,
    dir: 'ltr',
    brand: safe.brand,
    seoTitle: safe.seoTitle || safe.heroH1,
    skip: safe.skip,
    langAria: publicText(labels['a11y.languageSelector'], safe.langAria),
    primaryNavAria: safe.primaryNavAria,
    homeHref,
    servicesHref,
    resourcesHref,
    aboutHref,
    bookHref,
    privacyHref,
    termsHref,
    disclaimersHref,
    clientResultsHref,
    nav,
    ctaPrimary: publicText(safe.ctaPrimary, nav.contact),
    ctaSecondary: safe.ctaSecondary,
    hero: {
      h1: safe.heroH1,
      lead: safe.heroLead,
      reassure: safe.heroReassure,
      image:
        safe.heroImageOmitted === true || !safe.heroImage ? null : safe.heroImage,
    },
    audience: Array.isArray(safe.audience) ? safe.audience : [],
    trust: safe.trust,
    pathways: safe.pathways,
    pathwaysHeading: safe.pathwaysHeading,
    pathwaysIntro: safe.pathwaysIntro,
    caseStudy: safe.caseStudy,
    process: safe.process,
    processHeading: safe.processHeading,
    processIntro: safe.processIntro,
    services: safe.services,
    servicesHeading: safe.servicesHeading,
    servicesIntro: safe.servicesIntro,
    whyHeading: safe.whyHeading,
    whyText: safe.whyText,
    founder: safe.founder,
    testimonials: safe.testimonials,
    faqHeading: safe.faqHeading,
    faqIntro: safe.faqIntro || '',
    faqs: safe.faqs,
    finalHeading: safe.finalHeading,
    finalText: safe.finalText,
    finalCta: safe.finalCta,
    footerLegalNote: safe.footerLegalNote,
    footerLegalHeading: safe.footerLegalHeading || 'Legal',
    footerPrivacy: publicText(labels['nav.privacy'], safe.footerPrivacy || 'Privacy'),
    footerTerms: publicText(labels['nav.terms'], safe.footerTerms || 'Terms'),
    footerDisclaimers: publicText(
      labels['nav.disclaimers'],
      safe.footerDisclaimers || 'Disclaimers',
    ),
    techSupportLabel: publicText(
      labels['nav.technologySupport'],
      safe.techSupportLabel || 'Technology Support',
    ),
    languages: [
      { code: 'en', label: 'English', href: '/', current: locale === 'en' },
      { code: 'am', label: 'አማርኛ', href: '/am/', current: locale === 'am' },
      { code: 'ti', label: 'ትግርኛ', href: '/ti/', current: locale === 'ti' },
    ],
    assetPrefix: locale === 'en' ? 'assets' : '../assets',
    shared,
  };
}

/**
 * @param {ReturnType<typeof buildHomepageModel>} m
 */
export function renderHomepageHtml(m) {
  const e = escapeHtml;
  const asset = m.assetPrefix;

  const trustHtml = m.trust?.render
    ? `<section class="geez-section geez-home-trust" aria-label="${e('Trust')}">…</section>`
    : '';

  const caseHtml = m.caseStudy?.render
    ? `<section class="geez-section" aria-labelledby="case-heading">…</section>`
    : '';

  const testimonialsHtml = m.testimonials?.render
    ? `<section class="geez-section" aria-labelledby="testimonials-heading">…</section>`
    : '';

  const audience =
    Array.isArray(m.audience) && m.audience.length
      ? `<section class="geez-home-audience">
      <div class="geez-container">
        <ul class="geez-home-audience__list">
          ${m.audience
            .map(
              (a) => `<li>
            <strong>${e(a.label)}</strong>
            <p>${e(a.text)}</p>
          </li>`,
            )
            .join('\n')}
        </ul>
      </div>
    </section>`
      : '';

  const pathways = m.pathways
    .map((p) => {
      const media = p.mediaClass
        ? `<div class="geez-home-card__media geez-home-card__media--${e(
            p.mediaClass,
          )}" aria-hidden="true"></div>`
        : '';
      return `<li class="geez-home-card">
        ${media}
        <div class="geez-home-card__body">
          <h3><a href="${e(p.href)}">${e(p.title)}</a></h3>
          <p>${e(p.text)}</p>
        </div>
      </li>`;
    })
    .join('\n');

  const process = m.process
    .map(
      (step, i) => `<li class="geez-home-step">
        <p class="geez-home-step__num" aria-hidden="true">${i + 1}</p>
        <h3>${e(step.title)}</h3>
        <p>${e(step.text)}</p>
      </li>`,
    )
    .join('\n');

  const services = m.services
    .map(
      (s) => `<li class="geez-home-card">
        <div class="geez-home-card__body">
          <h3><a href="${e(s.href)}">${e(s.title)}</a></h3>
          <p>${e(s.text)}</p>
        </div>
      </li>`,
    )
    .join('\n');

  const faqs = m.faqs
    .map(
      (f) => `<details class="geez-accordion">
        <summary>${e(f.q)}</summary>
        <div class="geez-accordion__panel"><p>${e(f.a)}</p></div>
      </details>`,
    )
    .join('\n');

  const faqIntro = m.faqIntro
    ? `<p class="geez-home-faq__intro">${e(m.faqIntro)}</p>`
    : '';

  const langItems = m.languages
    .map(
      (l) => `<li>
        <a href="${e(l.href)}" hreflang="${e(l.code)}" lang="${e(l.code)}"${
          l.current ? ' aria-current="true"' : ''
        }>${e(l.label)}</a>
      </li>`,
    )
    .join('\n');

  const founderImage = (() => {
    if (!m.founder.image) {
      return `<div class="geez-home-founder__placeholder" role="img" aria-label="${e(
        'Founder photo forthcoming after verification',
      )}"></div>`;
    }
    const altInfo = resolveImageAlt(m.founder.image.alt);
    if (altInfo.omitUntilVerified) {
      return `<div class="geez-home-founder__placeholder" role="img" aria-label="${e(
        'Founder photo forthcoming after verification',
      )}"></div>`;
    }
    return `<img class="geez-home-founder__img" src="${e(m.founder.image.src)}" alt="${e(
      altInfo.alt || '',
    )}" width="${e(String(m.founder.image.width))}" height="${e(
      String(m.founder.image.height),
    )}" loading="lazy" decoding="async" />`;
  })();

  const founderName = m.founder.name
    ? `<p class="geez-home-founder__name">${e(m.founder.name)}</p>`
    : '';
  const founderRole = m.founder.role
    ? `<p class="geez-home-founder__role">${e(m.founder.role)}</p>`
    : '';

  const pageTitle = buildDocumentTitle({
    pageTitle: m.seoTitle,
    brand: m.brand,
  });
  const seo = buildPageSeo({
    locale: m.locale,
    barePath: '/',
    title: pageTitle,
    description: m.hero.lead,
    robots: 'noindex, nofollow',
  });
  const hreflangLinks = seo.alternates
    .map(
      (a) =>
        `<link rel="alternate" hreflang="${e(a.hreflang)}" href="${e(a.href)}">`,
    )
    .join('\n  ');
  const socialMeta = renderSocialMeta(seo, e);
  const htmlLang = htmlLangFor(m.locale);
  const translationPending = m.locale !== 'en';
  const pendingMeta = translationPending
    ? `<meta name="geez:translation-status" content="pending">`
    : '';
  const bodyClass = [
    'geez-home',
    `geez-locale-${e(m.locale)}`,
    translationPending ? 'geez-translation-pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const homeCrumbs = [
    { label: m.nav.home, href: m.homeHref, current: true },
  ];
  const org = buildOrganizationJsonLd(
    m.shared?.business,
    m.shared?.serviceArea,
    m.shared?.languages,
  );
  const person = buildPersonJsonLd(m.shared?.founder, `https://geezconsulting.com${m.aboutHref}`);
  const jsonLd = buildJsonLdGraph([
    buildWebPageJsonLd({
      name: pageTitle,
      description: m.hero.lead,
      url: seo.canonical,
      locale: m.locale,
    }),
    buildBreadcrumbListJsonLd(homeCrumbs, m.locale),
    org,
    person,
  ]);
  const ldScript = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : '';

  const cssLinks = renderStylesheetLinks({
    assetPrefix: asset,
    locale: m.locale,
    extraCss: ['homepage.css'],
    escapeHtml: e,
  });
  const deferred = renderDeferredScripts({
    assetPrefix: asset,
    escapeHtml: e,
    enableRum: false,
    locale: m.locale,
    pageType: 'home',
    service: null,
    slug: null,
  });

  const heroMedia = m.hero.image
    ? renderResponsiveImage(
        {
          src: m.hero.image.src,
          width: Number(m.hero.image.width) || 1200,
          height: Number(m.hero.image.height) || 900,
          alt: m.hero.image.alt,
          priority: true,
          className: 'geez-home-hero__portrait',
          sizes: '(max-width: 48rem) 100vw, 560px',
          sources: m.hero.image.sources,
          srcset: m.hero.image.srcset,
        },
        e,
      )
    : `<div class="geez-home-hero__mark" role="img" aria-label="${e(
        m.brand,
      )}"></div>`;

  return `<!DOCTYPE html>
<html lang="${e(htmlLang)}" dir="${e(m.dir)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(pageTitle)}</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="${e(m.hero.lead)}">
  <meta name="geez-base-path" content="${e(getBasePath())}">
  <link rel="canonical" href="${e(seo.canonical)}">
  ${hreflangLinks}
  ${socialMeta}
  ${pendingMeta}
  ${cssLinks}
  ${ldScript}
</head>
<body class="${bodyClass}" data-geez-page-type="home">
  <a class="geez-skip" href="#main">${e(m.skip)}</a>
  <header class="geez-header geez-home-header">
    <div class="geez-header__inner geez-container">
      <a class="geez-header__brand" href="${e(m.homeHref)}">${e(m.brand)}</a>
      <nav class="geez-header__nav" aria-label="${e(m.primaryNavAria)}">
        <ul>
          <li><a href="${e(m.homeHref)}" aria-current="page">${e(m.nav.home)}</a></li>
          <li><a href="${e(m.servicesHref)}">${e(m.nav.services)}</a></li>
          <li><a href="${e(m.resourcesHref)}">${e(m.nav.resources)}</a></li>
          <li><a href="${e(m.aboutHref)}">${e(m.nav.about)}</a></li>
        </ul>
      </nav>
      <nav class="geez-lang" aria-label="${e(m.langAria)}">
        <ul>
          ${langItems}
        </ul>
      </nav>
      <div class="geez-header__cta">
        <a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="header">${e(m.ctaPrimary)}</a>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="geez-home-hero" aria-labelledby="home-hero-heading">
      <div class="geez-home-hero__grid">
        <div class="geez-home-hero__copy">
          <p class="geez-home-hero__brand">${e(m.brand)}</p>
          <h1 id="home-hero-heading">${e(m.hero.h1)}</h1>
          <p class="geez-home-hero__lead">${e(m.hero.lead)}</p>
          <p class="geez-home-hero__reassure">${e(m.hero.reassure)}</p>
          <p class="geez-home-hero__actions">
            <a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="hero">${e(m.ctaPrimary)}</a>
            <a class="geez-btn-link geez-btn-link--secondary" href="#pathways">${e(
              m.ctaSecondary,
            )}</a>
          </p>
        </div>
        <div class="geez-home-hero__media">
          ${heroMedia}
        </div>
      </div>
    </section>

    ${audience}

    ${trustHtml}

    <section class="geez-section" id="pathways" aria-labelledby="pathways-heading">
      <div class="geez-container">
        <header class="geez-section__header">
          <p class="geez-section__kicker">${e(m.ctaSecondary)}</p>
          <h2 id="pathways-heading">${e(m.pathwaysHeading)}</h2>
          <p>${e(m.pathwaysIntro)}</p>
        </header>
        <ul class="geez-home-grid">
          ${pathways}
        </ul>
      </div>
    </section>

    ${caseHtml}

    <section class="geez-section geez-home-process" aria-labelledby="process-heading">
      <div class="geez-container">
        <header class="geez-section__header">
          <h2 id="process-heading">${e(m.processHeading)}</h2>
          <p>${e(m.processIntro)}</p>
        </header>
        <ol class="geez-home-process__list">
          ${process}
        </ol>
      </div>
    </section>

    <section class="geez-section" id="services" aria-labelledby="services-heading">
      <div class="geez-container">
        <header class="geez-section__header">
          <h2 id="services-heading">${e(m.servicesHeading)}</h2>
          <p>${e(m.servicesIntro)}</p>
        </header>
        <ul class="geez-home-grid">
          ${services}
        </ul>
      </div>
    </section>

    <section class="geez-section geez-home-why" aria-labelledby="why-heading">
      <div class="geez-container geez-container--narrow">
        <h2 id="why-heading">${e(m.whyHeading)}</h2>
        <p>${e(m.whyText)}</p>
      </div>
    </section>

    <section class="geez-section geez-home-founder" aria-labelledby="founder-heading">
      <div class="geez-container geez-home-founder__grid">
        ${founderImage}
        <div>
          <h2 id="founder-heading">${e(m.founder.heading)}</h2>
          ${founderName}
          ${founderRole}
          <p>${e(m.founder.bio)}</p>
          <p><a href="${e(m.founder.href)}">${e(m.founder.linkLabel)}</a></p>
        </div>
      </div>
    </section>

    ${testimonialsHtml}

    <section class="geez-section geez-home-faq" id="faq" aria-labelledby="faq-heading">
      <div class="geez-container geez-container--narrow">
        <h2 id="faq-heading">${e(m.faqHeading)}</h2>
        ${faqIntro}
        ${faqs}
      </div>
    </section>

    <section class="geez-section geez-home-final" aria-labelledby="final-heading">
      <div class="geez-container geez-container--narrow">
        <h2 id="final-heading">${e(m.finalHeading)}</h2>
        <p>${e(m.finalText)}</p>
        <p><a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="inline">${e(m.finalCta)}</a></p>
      </div>
    </section>
  </main>

  <footer class="geez-footer">
    <div class="geez-container geez-footer__grid">
      <nav aria-label="${e(m.nav.services)}">
        <h2>${e(m.nav.services)}</h2>
        <ul>
          <li><a href="${e(m.servicesHref)}">${e(m.nav.services)}</a></li>
          <li><a href="${e(localizePath(m.locale, '/services/start-a-business/'))}">${e(
            m.pathways[0].title,
          )}</a></li>
          <li><a href="${e(
            localizePath(m.locale, '/services/business-plans-funding-readiness/'),
          )}">${e(m.pathways[1].title)}</a></li>
          <li><a href="${e(localizePath(m.locale, '/services/bookkeeping-payroll/'))}">${e(
            m.pathways[2].title,
          )}</a></li>
          <li><a href="${e(localizePath(m.locale, '/services/growth-operations/'))}">${e(
            m.pathways[3].title,
          )}</a></li>
          <li><a href="${e(localizePath(m.locale, '/technology-support/'))}">${e(
            m.techSupportLabel,
          )}</a></li>
        </ul>
      </nav>
      <nav aria-label="${e(m.brand)}">
        <h2>${e(m.brand)}</h2>
        <ul>
          <li><a href="${e(m.aboutHref)}">${e(m.nav.about)}</a></li>
          <li><a href="${e(m.resourcesHref)}">${e(m.nav.resources)}</a></li>
          <li><a href="${e(m.clientResultsHref)}">${e(m.nav.clientResults)}</a></li>
          <li><a href="${e(m.bookHref)}" data-geez-cta="footer">${e(m.ctaPrimary)}</a></li>
        </ul>
      </nav>
      <nav aria-label="${e(m.footerLegalHeading)}">
        <h2>${e(m.footerLegalHeading)}</h2>
        <ul>
          <li><a href="${e(m.privacyHref)}">${e(m.footerPrivacy)}</a></li>
          <li><a href="${e(m.termsHref)}">${e(m.footerTerms)}</a></li>
          <li><a href="${e(m.disclaimersHref)}">${e(m.footerDisclaimers)}</a></li>
        </ul>
        <p class="geez-footer__note">${e(m.footerLegalNote)}</p>
      </nav>
    </div>
  </footer>
  ${deferred}
</body>
</html>
`;
}
