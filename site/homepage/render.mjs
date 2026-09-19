import { homepageSafeCopy, publicText } from './safe-copy.mjs';
import { localizePath } from '../../content/lib/routes.mjs';
import { getBasePath, withBase } from '../../content/lib/base-path.mjs';
import { htmlLangFor } from '../../content/lib/locale.mjs';
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
import { renderVinePair } from '../templates/vines.mjs';
import { renderServiceIcon } from '../templates/service-icons.mjs';

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
 * Prefix absolute site paths for GitHub Pages project sites.
 * External http(s) URLs and hash links pass through.
 * @param {string} path
 */
function assetUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith('#')) return path;
  if (path.startsWith('/')) return withBase(path);
  return withBase(`/${path}`);
}

/** Inline social icons (stroke) — accessible via aria-label on parent link. */
const SOCIAL_PATHS = {
  linkedin:
    'M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zm7.5 0h3.84v1.98h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V23h-4v-6.6c0-1.57-.03-3.6-2.19-3.6-2.2 0-2.53 1.71-2.53 3.48V23h-4V8.5z',
  facebook:
    'M14 8h3V4.5C16.4 4.17 15.1 4 13.6 4 10.5 4 8.4 5.9 8.4 9.4V12H5v4h3.4v8h4v-8H16l.6-4h-4.2V9.7c0-1.2.3-1.7 1.6-1.7z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.6 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9C2.4 3.9 4 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-2.2.1-3.3 1.2-3.4 3.4-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 2.2 1.2 3.3 3.4 3.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c2.2-.1 3.3-1.2 3.4-3.4.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-2.2-1.2-3.3-3.4-3.4-1.2-.1-1.6-.1-4.7-.1zm0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6zm0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.9-2.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
  youtube:
    'M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z',
};

/**
 * @param {string} id
 */
function socialIconSvg(id) {
  const d = SOCIAL_PATHS[id];
  if (!d) return '';
  return `<svg class="geez-social__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}

/** Service line-art icons — see templates/service-icons.mjs */

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

  const pathways = (Array.isArray(safe.pathways) ? safe.pathways : []).map((p) => ({
    ...p,
    href: assetUrl(p.href),
  }));
  const services = (Array.isArray(safe.services) ? safe.services : []).map((s) => ({
    ...s,
    href: assetUrl(s.href),
  }));

  return {
    locale,
    lang: locale === 'en' ? 'en' : locale,
    dir: 'ltr',
    brand: safe.brand,
    slogan: safe.slogan || 'More than paperwork',
    sloganSupport:
      safe.sloganSupport ||
      'Clear counsel for the path ahead—without guaranteed outcomes.',
    seoTitle: safe.seoTitle || safe.heroH1,
    skip: safe.skip,
    skipIntro: safe.skipIntro || 'Skip intro',
    menuLabel: safe.menuLabel || 'Menu',
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
    logo: safe.logo ? { ...safe.logo, src: assetUrl(safe.logo.src) } : null,
    logoMark: safe.logoMark
      ? { ...safe.logoMark, src: assetUrl(safe.logoMark.src) }
      : null,
    hero: {
      h1: safe.heroH1,
      lead: safe.heroLead,
      reassure: safe.heroReassure,
      image:
        safe.heroImageOmitted === true || !safe.heroImage
          ? null
          : { ...safe.heroImage, src: assetUrl(safe.heroImage.src) },
    },
    audience: Array.isArray(safe.audience) ? safe.audience : [],
    trust: safe.trust
      ? {
          ...safe.trust,
          logos: Array.isArray(safe.trust.logos)
            ? safe.trust.logos.map((l) => ({ ...l, src: assetUrl(l.src) }))
            : [],
        }
      : { render: false },
    socialsAria: safe.socialsAria || 'Social media',
    socials: Array.isArray(safe.socials) ? safe.socials : [],
    pathways,
    pathwaysHeading: safe.pathwaysHeading,
    pathwaysIntro: safe.pathwaysIntro,
    caseStudy: safe.caseStudy,
    process: safe.process,
    processHeading: safe.processHeading,
    processIntro: safe.processIntro,
    services,
    servicesHeading: safe.servicesHeading,
    servicesIntro: safe.servicesIntro,
    whyHeading: safe.whyHeading,
    whyText: safe.whyText,
    founder: safe.founder
      ? {
          ...safe.founder,
          href: assetUrl(safe.founder.href),
          image: safe.founder.image
            ? { ...safe.founder.image, src: assetUrl(safe.founder.image.src) }
            : null,
        }
      : { render: false },
    testimonials: safe.testimonials
      ? {
          ...safe.testimonials,
          items: Array.isArray(safe.testimonials.items)
            ? safe.testimonials.items.map((t) => ({
                ...t,
                photo: t.photo
                  ? { ...t.photo, src: assetUrl(t.photo.src) }
                  : null,
                logo: t.logo
                  ? { ...t.logo, src: assetUrl(t.logo.src) }
                  : null,
              }))
            : [],
        }
      : { render: false },
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
    footerContactHeading: safe.footerContactHeading || 'Contact',
    footerAddress: safe.footerAddress || '',
    footerEmail: safe.footerEmail || '',
    footerPhone: safe.footerPhone || '',
    techSupportLabel: publicText(
      labels['nav.technologySupport'],
      safe.techSupportLabel || 'Technology Support',
    ),
    languages: [
      {
        code: 'en',
        label: 'English',
        href: localizePath('en', '/'),
        current: locale === 'en',
      },
      {
        code: 'am',
        label: 'አማርኛ',
        href: localizePath('am', '/'),
        current: locale === 'am',
      },
      {
        code: 'ti',
        label: 'ትግርኛ',
        href: localizePath('ti', '/'),
        current: locale === 'ti',
      },
    ],
    assetPrefix: withBase('/assets'),
    shared,
  };
}

/**
 * @param {ReturnType<typeof buildHomepageModel>} m
 * @param {(s: string) => string} e
 * @param {string} [className]
 */
function renderSocialNav(m, e, className = 'geez-social') {
  if (!Array.isArray(m.socials) || !m.socials.length) return '';
  return `<nav class="${e(className)}" aria-label="${e(m.socialsAria)}">
    <ul>
      ${m.socials
        .map(
          (s) => `<li>
        <a href="${e(s.href)}" target="_blank" rel="noopener noreferrer" aria-label="${e(
          s.label,
        )}">${socialIconSvg(s.id)}<span class="geez-visually-hidden">${e(
          s.label,
        )}</span></a>
      </li>`,
        )
        .join('\n')}
    </ul>
  </nav>`;
}

/**
 * @param {ReturnType<typeof buildHomepageModel>} m
 */
export function renderHomepageHtml(m) {
  const e = escapeHtml;
  const asset = m.assetPrefix;

  const testimonialsHtml =
    m.testimonials?.render && Array.isArray(m.testimonials.items)
      ? `<section class="geez-section geez-home-quotes" aria-labelledby="testimonials-heading">
      <div class="geez-container">
        <header class="geez-section__header">
          <h2 id="testimonials-heading">${e(m.testimonials.heading)}</h2>
        </header>
        <ul class="geez-home-quotes__list">
          ${m.testimonials.items
            .map((t) => {
              const photo = t.photo
                ? `<img class="geez-home-quote__photo" src="${e(t.photo.src)}" alt="${e(
                    t.photo.alt || '',
                  )}" width="${e(String(t.photo.width || 96))}" height="${e(
                    String(t.photo.height || 96),
                  )}" loading="lazy" decoding="async">`
                : '';
              const logo = t.logo
                ? `<img class="geez-home-quote__logo" src="${e(t.logo.src)}" alt="${e(
                    t.logo.alt || '',
                  )}" width="${e(String(t.logo.width || 120))}" height="${e(
                    String(t.logo.height || 48),
                  )}" loading="lazy" decoding="async">`
                : '';
              return `<li class="geez-home-quote" lang="en">
            <div class="geez-home-quote__media">${photo}${logo}</div>
            <blockquote>
              <p>${e(t.quote)}</p>
              <footer>
                <cite>
                  <span class="geez-home-quote__name">${e(t.name)}</span>
                  <span class="geez-home-quote__org">${e(t.org)}</span>
                </cite>
              </footer>
            </blockquote>
          </li>`;
            })
            .join('\n')}
        </ul>
      </div>
    </section>`
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
      const icon = renderServiceIcon(p.id || 'start');
      const media = p.mediaClass
        ? `<div class="geez-home-card__media geez-home-card__media--${e(
            p.mediaClass,
          )}" aria-hidden="true"></div>`
        : '';
      return `<li class="geez-home-card geez-reveal" data-geez-motion data-geez-showcase="1">
        ${media}
        <div class="geez-home-card__body">
          <div class="geez-home-card__icon">${icon}</div>
          <h3><a href="${e(p.href)}">${e(p.title)}</a></h3>
          <p>${e(p.text)}</p>
        </div>
      </li>`;
    })
    .join('\n');

  const process = m.process
    .map(
      (step, i) => `<li class="geez-home-step geez-reveal" data-geez-motion>
        <p class="geez-home-step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
        <h3>${e(step.title)}</h3>
        <p>${e(step.text)}</p>
      </li>`,
    )
    .join('\n');

  const serviceIds = ['start', 'funding', 'books', 'grow'];
  const services = m.services
    .map((s, i) => {
      const id = serviceIds[i] || 'start';
      const icon = renderServiceIcon(id);
      return `<li class="geez-home-service geez-reveal" data-geez-motion data-geez-showcase="1">
        <div class="geez-home-service__icon" aria-hidden="true">${icon}</div>
        <div class="geez-home-service__body">
          <h3><a href="${e(s.href)}">${e(s.title)}</a></h3>
          <p>${e(s.text)}</p>
        </div>
      </li>`;
    })
    .join('\n');

  const faqs = m.faqs
    .map(
      (f) => `<details class="geez-accordion" data-geez-motion>
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

  const homeCrumbs = [{ label: m.nav.home, href: m.homeHref, current: true }];
  const org = buildOrganizationJsonLd(
    m.shared?.business,
    m.shared?.serviceArea,
    m.shared?.languages,
  );
  const person = buildPersonJsonLd(
    m.shared?.founder,
    `https://geezconsulting.com${m.aboutHref.replace(getBasePath(), '')}`,
  );
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
  const deferred = `${renderDeferredScripts({
    assetPrefix: asset,
    escapeHtml: e,
    enableRum: false,
    locale: m.locale,
    pageType: 'home',
    service: null,
    slug: null,
  })}
  <script src="${e(asset)}/intro.js" defer></script>`;

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

  const brandInner = m.logo
    ? `<img class="geez-header__logo" src="${e(m.logo.src)}" alt="${e(
        m.logo.alt || m.brand,
      )}" width="${e(String(m.logo.width || 180))}" height="${e(
        String(m.logo.height || 66),
      )}" decoding="async" />`
    : e(m.brand);

  const favicon = m.logoMark
    ? `<link rel="icon" href="${e(m.logoMark.src)}" sizes="192x192">
  <link rel="apple-touch-icon" href="${e(m.logoMark.src)}">`
    : '';

  const headerSocials = renderSocialNav(m, e, 'geez-social geez-social--header');
  const footerSocials = renderSocialNav(m, e, 'geez-social geez-social--footer');

  /* Full-page intro canopy: vines emerge from edges and frame the brand (splash only). */
  const introCanopy = `<svg class="geez-intro__vine geez-intro__canopy" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g class="geez-intro__vine-arm geez-intro__vine-arm--sw" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="4.2" d="M-20 820 C80 700, 40 580, 140 520 C240 460, 220 360, 340 320 C440 290, 480 220, 560 190"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="2.1" d="M-20 820 C80 700, 40 580, 140 520 C240 460, 220 360, 340 320 C440 290, 480 220, 560 190"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.45" d="M140 520 C110 470, 150 430, 185 455 C210 472, 200 510, 175 520"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.45" d="M340 320 C310 280, 350 245, 385 270 C408 288, 398 320, 372 330"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.4" d="M480 240 C510 210, 545 235, 530 270 C520 292, 495 285, 485 260"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M60 740 C78 722, 98 738, 84 758 C72 772, 54 758, 60 740Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M220 430 C238 412, 258 428, 244 448 C232 462, 214 448, 220 430Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M400 280 C418 262, 438 278, 424 298 C412 312, 394 298, 400 280Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="140" cy="520" r="2.4"/><circle cx="340" cy="320" r="2.2"/><circle cx="480" cy="240" r="2"/></g>
    </g>
    <g class="geez-intro__vine-arm geez-intro__vine-arm--se" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="4.2" d="M1220 820 C1120 700, 1160 580, 1060 520 C960 460, 980 360, 860 320 C760 290, 720 220, 640 190"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="2.1" d="M1220 820 C1120 700, 1160 580, 1060 520 C960 460, 980 360, 860 320 C760 290, 720 220, 640 190"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.45" d="M1060 520 C1090 470, 1050 430, 1015 455 C990 472, 1000 510, 1025 520"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.45" d="M860 320 C890 280, 850 245, 815 270 C792 288, 802 320, 828 330"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.4" d="M720 240 C690 210, 655 235, 670 270 C680 292, 705 285, 715 260"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M1140 740 C1122 722, 1102 738, 1116 758 C1128 772, 1146 758, 1140 740Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M980 430 C962 412, 942 428, 956 448 C968 462, 986 448, 980 430Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.25" d="M800 280 C782 262, 762 278, 776 298 C788 312, 806 298, 800 280Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="1060" cy="520" r="2.4"/><circle cx="860" cy="320" r="2.2"/><circle cx="720" cy="240" r="2"/></g>
    </g>
    <g class="geez-intro__vine-arm geez-intro__vine-arm--nw" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="3.8" d="M-30 -20 C90 60, 50 150, 150 200 C250 250, 230 340, 330 380 C400 405, 430 460, 500 490"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="1.95" d="M-30 -20 C90 60, 50 150, 150 200 C250 250, 230 340, 330 380 C400 405, 430 460, 500 490"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.35" d="M150 200 C120 160, 155 125, 190 150 C212 168, 200 205, 175 210"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.35" d="M330 380 C300 345, 335 310, 370 335 C390 352, 382 385, 355 392"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.2" d="M40 40 C56 24, 76 40, 62 58 C50 72, 34 58, 40 40Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.2" d="M230 280 C246 264, 266 280, 252 298 C240 312, 224 298, 230 280Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="150" cy="200" r="2.2"/><circle cx="330" cy="380" r="2"/><circle cx="430" cy="460" r="1.8"/></g>
    </g>
    <g class="geez-intro__vine-arm geez-intro__vine-arm--ne" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="3.8" d="M1230 -20 C1110 60, 1150 150, 1050 200 C950 250, 970 340, 870 380 C800 405, 770 460, 700 490"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="1.95" d="M1230 -20 C1110 60, 1150 150, 1050 200 C950 250, 970 340, 870 380 C800 405, 770 460, 700 490"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.35" d="M1050 200 C1080 160, 1045 125, 1010 150 C988 168, 1000 205, 1025 210"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.35" d="M870 380 C900 345, 865 310, 830 335 C810 352, 818 385, 845 392"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.2" d="M1160 40 C1144 24, 1124 40, 1138 58 C1150 72, 1166 58, 1160 40Z"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.2" d="M970 280 C954 264, 934 280, 948 298 C960 312, 976 298, 970 280Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="1050" cy="200" r="2.2"/><circle cx="870" cy="380" r="2"/><circle cx="770" cy="460" r="1.8"/></g>
    </g>
    <g class="geez-intro__vine-arm geez-intro__vine-arm--west" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="3.2" d="M-10 400 C70 360, 90 300, 170 290 C250 280, 280 340, 360 350 C420 356, 450 310, 510 300"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="1.7" d="M-10 400 C70 360, 90 300, 170 290 C250 280, 280 340, 360 350 C420 356, 450 310, 510 300"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.3" d="M170 290 C145 255, 185 230, 210 255 C226 270, 215 300, 190 305"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.15" d="M90 340 C106 324, 126 340, 112 358 C100 372, 84 358, 90 340Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="170" cy="290" r="2"/><circle cx="360" cy="350" r="1.8"/></g>
    </g>
    <g class="geez-intro__vine-arm geez-intro__vine-arm--east" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="geez-intro__vine-glow" pathLength="1" stroke-width="3.2" d="M1210 400 C1130 360, 1110 300, 1030 290 C950 280, 920 340, 840 350 C780 356, 750 310, 690 300"/>
      <path class="geez-intro__vine-stem" pathLength="1" stroke-width="1.7" d="M1210 400 C1130 360, 1110 300, 1030 290 C950 280, 920 340, 840 350 C780 356, 750 310, 690 300"/>
      <path class="geez-intro__vine-tendril" pathLength="1" stroke-width="1.3" d="M1030 290 C1055 255, 1015 230, 990 255 C974 270, 985 300, 1010 305"/>
      <path class="geez-intro__vine-leaf" pathLength="1" stroke-width="1.15" d="M1110 340 C1094 324, 1074 340, 1088 358 C1100 372, 1116 358, 1110 340Z"/>
      <g class="geez-intro__vine-nodes" fill="#c9a227"><circle cx="1030" cy="290" r="2"/><circle cx="840" cy="350" r="1.8"/></g>
    </g>
  </svg>`;

  const intro = `<div id="geez-intro" class="geez-intro" role="dialog" aria-modal="true" aria-label="${e(
    m.brand,
  )}">
    ${introCanopy}
    <div class="geez-intro__panel">
      ${
        m.logoMark
          ? `<img class="geez-intro__mark" src="${e(m.logoMark.src)}" alt="" width="64" height="64" decoding="async" />`
          : ''
      }
      <p class="geez-intro__brand">${e(m.brand)}</p>
      <p class="geez-intro__slogan">${e(m.slogan)}</p>
      <button type="button" class="geez-intro__skip" data-geez-intro-skip>${e(
        m.skipIntro,
      )}</button>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="${e(htmlLang)}" dir="${e(m.dir)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
  <title>${e(pageTitle)}</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="${e(m.hero.lead)}">
  <meta name="geez-base-path" content="${e(getBasePath())}">
  <link rel="canonical" href="${e(seo.canonical)}">
  ${favicon}
  ${hreflangLinks}
  ${socialMeta}
  ${pendingMeta}
  ${cssLinks}
  ${ldScript}
</head>
<body class="${bodyClass}" data-geez-page-type="home">
  ${intro}
  <a class="geez-skip" href="#main">${e(m.skip)}</a>
  <header class="geez-header geez-home-header" data-geez-motion>
    <div class="geez-header__inner geez-container">
      <a class="geez-header__brand" href="${e(m.homeHref)}" aria-label="${e(
        m.brand,
      )}">${brandInner}</a>
      <details class="geez-nav-drawer">
        <summary class="geez-nav-drawer__summary">${e(m.menuLabel)}</summary>
        <div class="geez-nav-drawer__panel">
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
          ${headerSocials}
        </div>
      </details>
      <nav class="geez-header__nav geez-header__nav--desktop" aria-label="${e(
        m.primaryNavAria,
      )}">
        <ul>
          <li><a href="${e(m.homeHref)}" aria-current="page">${e(m.nav.home)}</a></li>
          <li><a href="${e(m.servicesHref)}">${e(m.nav.services)}</a></li>
          <li><a href="${e(m.resourcesHref)}">${e(m.nav.resources)}</a></li>
          <li><a href="${e(m.aboutHref)}">${e(m.nav.about)}</a></li>
        </ul>
      </nav>
      <nav class="geez-lang geez-lang--desktop" aria-label="${e(m.langAria)}">
        <ul>
          ${langItems}
        </ul>
      </nav>
      <div class="geez-header__cta">
        <div class="geez-header__socials-desktop">${headerSocials}</div>
        <a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="header">${e(
          m.ctaPrimary,
        )}</a>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="geez-home-hero" aria-labelledby="home-hero-heading" data-geez-motion>
      <div class="geez-home-hero__grid">
        <div class="geez-home-hero__copy">
          <p class="geez-home-hero__brand">${e(m.brand)}</p>
          <p class="geez-home-hero__slogan">${e(m.slogan)}</p>
          <h1 id="home-hero-heading">${e(m.hero.h1)}</h1>
          <p class="geez-home-hero__lead">${e(m.hero.lead)}</p>
          <p class="geez-home-hero__reassure">${e(m.hero.reassure)}</p>
          <p class="geez-home-hero__actions">
            <a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="hero">${e(
              m.ctaPrimary,
            )}</a>
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
        <ul class="geez-home-services">
          ${services}
        </ul>
      </div>
    </section>

    <section class="geez-section geez-home-why" aria-labelledby="why-heading">
      <div class="geez-container geez-container--narrow">
        <p class="geez-section__kicker">${e(m.slogan)}</p>
        <h2 id="why-heading">${e(m.whyHeading)}</h2>
        <p>${e(m.whyText)}</p>
      </div>
    </section>

    <section class="geez-section geez-home-founder" aria-labelledby="founder-heading" data-geez-motion>
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

    <section class="geez-section geez-home-final geez-vine-host" aria-labelledby="final-heading" data-geez-motion>
      ${renderVinePair('band')}
      <div class="geez-container geez-container--narrow">
        <p class="geez-home-final__slogan">${e(m.slogan)}</p>
        <h2 id="final-heading">${e(m.finalHeading)}</h2>
        <p>${e(m.finalText)}</p>
        <p><a class="geez-btn-link" href="${e(m.bookHref)}" data-geez-cta="inline">${e(
          m.finalCta,
        )}</a></p>
      </div>
    </section>
  </main>

  <footer class="geez-footer geez-vine-host" data-geez-motion>
    ${renderVinePair('band')}
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
        ${footerSocials}
      </nav>
      ${
        m.footerAddress || m.footerEmail || m.footerPhone
          ? `<nav aria-label="${e(m.footerContactHeading || 'Contact')}">
        <h2>${e(m.footerContactHeading || 'Contact')}</h2>
        <ul>
          ${m.footerAddress ? `<li>${e(m.footerAddress)}</li>` : ''}
          ${
            m.footerEmail
              ? `<li><a href="mailto:${e(m.footerEmail)}">${e(m.footerEmail)}</a></li>`
              : ''
          }
          ${
            m.footerPhone
              ? `<li><a href="tel:${e(String(m.footerPhone).replace(/[^\d+]/g, ''))}">${e(
                  m.footerPhone,
                )}</a></li>`
              : ''
          }
        </ul>
      </nav>`
          : ''
      }
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
