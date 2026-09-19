/**
 * Evidence-based JSON-LD builders.
 * Emit only visible and/or production-approved facts.
 * Never AggregateRating / Review unless policy-eligible (not implemented).
 */

import { SITE_ORIGIN, absoluteUrl } from './locale.mjs';
import { isProductionRenderableClaim } from './claim.mjs';
import { approvedClaimValue } from './seo.mjs';

/**
 * @param {unknown} field
 */
function claimVal(field) {
  return approvedClaimValue(/** @type {any} */ (field));
}

/**
 * Most appropriate LocalBusiness subtype for a consulting practice.
 * ProfessionalService ⊂ LocalBusiness. Use Organization until local NAP is approved.
 */
export const LOCAL_BUSINESS_TYPE = 'ProfessionalService';

/**
 * Build Organization / ProfessionalService from approved business claims only.
 * @param {object} business from shared/business.json
 * @param {object} [serviceArea] from shared/service-area.json
 * @param {object} [languages] from shared/languages.json
 * @param {{ logoUrl?: string | null, services?: { name: string, url: string }[] }} [opts]
 */
export function buildOrganizationJsonLd(
  business,
  serviceArea = null,
  languages = null,
  { logoUrl = null, services = [] } = {},
) {
  if (!business || typeof business !== 'object') return null;

  const brand = claimVal(business.brandName);
  const legal = claimVal(business.legalName);
  const name = brand || legal;
  // Without an approved name, do not invent Organization markup.
  if (!name) return null;

  const street = claimVal(business.streetAddress);
  const locality = claimVal(business.addressLocality);
  const region = claimVal(business.addressRegion);
  const postal = claimVal(business.postalCode);
  const country = claimVal(business.addressCountry);
  const email = claimVal(business.email);
  const phone = claimVal(business.telephoneE164) || claimVal(business.telephoneDisplay);
  const sameAsRaw = claimVal(business.sameAs);
  const sameAs = Array.isArray(sameAsRaw)
    ? sameAsRaw.filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u))
    : [];

  const hasLocalNap =
    Boolean(street && locality && region && country) || Boolean(phone);

  /** @type {Record<string, unknown>} */
  const org = {
    '@type': hasLocalNap ? LOCAL_BUSINESS_TYPE : 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name,
    url: SITE_ORIGIN,
  };

  if (legal && legal !== name) org.legalName = legal;
  if (email) org.email = email;
  if (phone) org.telephone = phone;
  if (logoUrl) {
    org.logo = {
      '@type': 'ImageObject',
      url: logoUrl,
    };
    org.image = logoUrl;
  }
  if (sameAs.length) org.sameAs = sameAs;

  if (street && locality && region && country) {
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: locality,
      addressRegion: region,
      addressCountry: country,
    };
    if (postal) {
      /** @type {Record<string, unknown>} */ (org.address).postalCode = postal;
    }
  }

  if (serviceArea && typeof serviceArea === 'object') {
    const primary = claimVal(serviceArea.primaryMarket);
    const regions = claimVal(serviceArea.regions);
    if (primary) {
      org.areaServed = {
        '@type': 'AdministrativeArea',
        name: primary,
      };
    } else if (Array.isArray(regions) && regions.length) {
      org.areaServed = regions.map((r) => ({
        '@type': 'AdministrativeArea',
        name: String(r),
      }));
    }
  }

  if (languages?.supported && Array.isArray(languages.supported)) {
    // Structural site languages (not a ClaimField) — safe as availableLanguage.
    org.availableLanguage = languages.supported.map((code) => ({
      '@type': 'Language',
      name: languages.labels?.[code] || code,
      alternateName: code,
    }));
  }

  if (Array.isArray(services) && services.length) {
    org.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: services.map((s, i) => ({
        '@type': 'OfferCatalog',
        name: s.name,
        url: s.url,
        position: i + 1,
      })),
    };
  }

  // Explicitly never emit ratings.
  return org;
}

/**
 * Person JSON-LD for founder — approved fields only.
 * @param {object} founder from locales founder.json
 * @param {string} [aboutUrl]
 */
export function buildPersonJsonLd(founder, aboutUrl = `${SITE_ORIGIN}/about-saba/`) {
  if (!founder || typeof founder !== 'object') return null;
  const name = claimVal(founder.displayName);
  if (!name) return null;

  /** @type {Record<string, unknown>} */
  const person = {
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}/#person-founder`,
    name,
    url: aboutUrl,
  };

  const role = claimVal(founder.roleTitle);
  if (role) person.jobTitle = role;

  const bio = claimVal(founder.bio);
  if (bio) person.description = bio;

  const photoSrc = claimVal(founder.photo?.src);
  const photoAlt = claimVal(founder.photo?.alt);
  if (photoSrc && photoAlt) {
    person.image = {
      '@type': 'ImageObject',
      url: photoSrc.startsWith('http') ? photoSrc : `${SITE_ORIGIN}${photoSrc}`,
      description: photoAlt,
    };
  }

  person.worksFor = { '@id': `${SITE_ORIGIN}/#organization` };
  return person;
}

/**
 * Service JSON-LD from visible page facts only (no Offer / price / rating).
 * @param {object} service
 * @param {string} absolutePath
 * @param {string} brand
 */
export function buildServiceJsonLd(service, absolutePath, brand) {
  /** @type {Record<string, unknown>} */
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    description: service.metaDescription,
    url: absolutePath,
    provider: {
      '@type': 'Organization',
      name: brand,
      url: SITE_ORIGIN,
    },
  };
  if (service.audience) {
    data.audience = {
      '@type': 'Audience',
      audienceType: service.audience,
    };
  }
  return data;
}

/**
 * BreadcrumbList from visible breadcrumb trail.
 * @param {{ label: string, href?: string, current?: boolean }[]} crumbs
 * @param {string} locale
 */
export function buildBreadcrumbListJsonLd(crumbs, locale) {
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null;
  const itemListElement = crumbs.map((c, i) => {
    /** @type {Record<string, unknown>} */
    const listItem = {
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
    };
    if (c.href && !c.current) {
      listItem.item = c.href.startsWith('http')
        ? c.href
        : `${SITE_ORIGIN}${c.href.startsWith('/') ? c.href : `/${c.href}`}`;
    } else if (c.href) {
      listItem.item = c.href.startsWith('http')
        ? c.href
        : `${SITE_ORIGIN}${c.href.startsWith('/') ? c.href : `/${c.href}`}`;
    }
    return listItem;
  });
  return {
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * WebPage node for the current URL.
 * @param {{ name: string, description: string, url: string, locale: string }} opts
 */
export function buildWebPageJsonLd({ name, description, url, locale }) {
  /** @type {Record<string, unknown>} */
  const page = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale,
  };
  return page;
}

/**
 * WebSite node (no SearchAction — site has no public site search).
 * @param {string} [name] approved or visible brand
 */
export function buildWebSiteJsonLd(name = "Ge'ez Consulting") {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name,
    inLanguage: ['en', 'am', 'ti'],
  };
}

/**
 * Assemble @graph, dropping nulls. Omits AggregateRating / Review always.
 * @param {unknown[]} nodes
 */
export function buildJsonLdGraph(nodes) {
  const graph = nodes.filter(Boolean);
  if (!graph.length) return null;
  // Strip any accidental rating keys
  for (const node of graph) {
    if (node && typeof node === 'object') {
      delete /** @type {any} */ (node).aggregateRating;
      delete /** @type {any} */ (node).review;
    }
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Load shared business facts and build org when possible.
 * @param {object} sharedBundle { business, serviceArea, languages }
 */
export function organizationFromShared(sharedBundle, opts = {}) {
  return buildOrganizationJsonLd(
    sharedBundle?.business,
    sharedBundle?.serviceArea,
    sharedBundle?.languages,
    opts,
  );
}

export { absoluteUrl, isProductionRenderableClaim };
