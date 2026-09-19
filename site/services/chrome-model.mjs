import { localizePath } from '../../content/lib/routes.mjs';
import { withBase } from '../../content/lib/base-path.mjs';
import { homepageSafeCopy, publicText } from '../homepage/safe-copy.mjs';
import { servicesCatalogEn } from './safe-copy.mjs';

/**
 * Shared chrome model for service and technology pages.
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {string} currentPath localized current path
 */
export function buildChromeModel(locale, ui, navigation, currentPath) {
  const safe = homepageSafeCopy[locale] || homepageSafeCopy.en;
  const labels = navigation.labels?.[locale] || navigation.labels.en;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const nav = {
    home: publicText(ui?.nav?.home, labels['nav.home'] || 'Home'),
    services: publicText(ui?.nav?.services, labels['nav.services'] || 'Services'),
    resources: publicText(ui?.nav?.resources, labels['nav.resources'] || 'Resources'),
    about: publicText(ui?.nav?.about, labels['nav.about'] || 'About'),
  };

  const ctaPrimary = publicText(
    ui?.nav?.contact,
    publicText(safe.ctaPrimary, labels['cta.bookFitCall'] || 'Book a Fit Call'),
  );

  const localizeHref = (path) => localizePath(locale, path);

  return {
    locale,
    lang: locale === 'en' ? 'en' : locale,
    brand: safe.brand,
    skip: safe.skip,
    menuLabel: safe.menuLabel || 'Menu',
    langAria: publicText(labels['a11y.languageSelector'], safe.langAria),
    primaryNavAria: safe.primaryNavAria,
    homeHref: localizeHref('/'),
    servicesHref: localizeHref('/services/'),
    resourcesHref: localizeHref('/resources/'),
    aboutHref: localizeHref('/about-saba/'),
    bookHref: localizeHref('/book-a-fit-call/'),
    privacyHref: localizeHref('/privacy/'),
    termsHref: localizeHref('/terms/'),
    disclaimersHref: localizeHref('/disclaimers/'),
    clientResultsHref: localizeHref('/client-results/'),
    nav: {
      ...nav,
      clientResults: publicText(
        labels['nav.clientResults'],
        safe.clientResultsLabel || 'Client Results',
      ),
    },
    ctaPrimary,
    currentPath,
    assetPrefix: withBase('/assets'),
    assetPrefixNested: withBase('/assets'),
    footerLegalNote: safe.footerLegalNote,
    footerLegalHeading: safe.footerLegalHeading || 'Legal',
    footerPrivacy: publicText(labels['nav.privacy'], safe.footerPrivacy || 'Privacy'),
    footerTerms: publicText(labels['nav.terms'], safe.footerTerms || 'Terms'),
    footerDisclaimers: publicText(
      labels['nav.disclaimers'],
      safe.footerDisclaimers || 'Disclaimers',
    ),
    languages: [
      {
        code: 'en',
        label: 'English',
        href: localePathFor('en', currentPath),
        current: locale === 'en',
      },
      {
        code: 'am',
        label: 'አማርኛ',
        href: localePathFor('am', currentPath),
        current: locale === 'am',
      },
      {
        code: 'ti',
        label: 'ትግርኛ',
        href: localePathFor('ti', currentPath),
        current: locale === 'ti',
      },
    ],
    footerServiceLinks: [
      { label: nav.services, href: localizeHref('/services/') },
      ...servicesCatalogEn.overview.cards.map((c) => ({
        label: c.title,
        href: localizeHref(c.href),
      })),
      {
        label: publicText(
          labels['nav.technologySupport'],
          safe.techSupportLabel || 'Technology Support',
        ),
        href: localizeHref('/technology-support/'),
      },
    ],
    localizeHref,
    prefix,
  };
}

/**
 * @param {string} targetLocale
 * @param {string} currentPath
 */
function localePathFor(targetLocale, currentPath) {
  const bare = currentPath.replace(/^\/(am|ti)(?=\/|$)/, '') || '/';
  if (targetLocale === 'en') {
    const path = bare.startsWith('/') ? bare : `/${bare}`;
    return localizePath('en', path === '' ? '/' : path);
  }
  if (bare === '/') return localizePath(targetLocale, '/');
  return localizePath(
    targetLocale,
    bare.startsWith('/') ? bare : `/${bare}`,
  );
}
