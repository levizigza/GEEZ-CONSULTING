import { readDataJson } from './load.mjs';
import { isProductionRenderableClaim, collectClaimFields } from './claim.mjs';
import { isCaseStudyProductionReady } from './case-studies.mjs';
import { withBase } from './base-path.mjs';

export const LOCALES = ['en', 'am', 'ti'];

/**
 * @param {string} locale
 * @param {string} path absolute path starting with / ; may include :slug
 */
export function localizePath(locale, path) {
  if (!LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  if (!path.startsWith('/')) {
    throw new Error(`Path must start with /: ${path}`);
  }
  // Hash-only or passthrough
  if (path.startsWith('/#')) {
    if (locale === 'en') return withBase(path);
    return withBase(`/${locale}${path}`);
  }
  if (locale === 'en') return withBase(path);
  if (path === '/') return withBase(`/${locale}/`);
  return withBase(`/${locale}${path}`);
}

/**
 * Expand a route path template with a slug.
 * @param {string} pathTemplate
 * @param {string} [slug]
 */
export function materializePath(pathTemplate, slug) {
  if (!pathTemplate.includes(':slug')) return pathTemplate;
  if (!slug) {
    throw new Error(`Slug required for template path ${pathTemplate}`);
  }
  return pathTemplate.replace(':slug', slug);
}

/**
 * @param {{ status: string, indexable: boolean, id: string }} route
 * @param {{ hasApprovedContent?: boolean }} [contentState]
 */
export function resolveIndexability(route, contentState = {}) {
  const hasApprovedContent = contentState.hasApprovedContent === true;
  if (route.status !== 'published') {
    return {
      indexable: false,
      robots: 'noindex, nofollow',
      reason: `status=${route.status}`,
    };
  }
  if (!hasApprovedContent) {
    return {
      indexable: false,
      robots: 'noindex, nofollow',
      reason: 'published flag set but required claims not approved',
    };
  }
  if (route.id === 'thank-you') {
    return {
      indexable: false,
      robots: 'noindex, nofollow',
      reason: 'confirmation page always noindex',
    };
  }
  return {
    indexable: true,
    robots: 'index, follow',
    reason: 'published with approved content',
  };
}

/**
 * Heuristic: for static pages, treat as having approved content only when
 * caller supplies true. Default false — no empty indexable pages.
 * @param {object} route
 * @param {Record<string, unknown>} [bundle]
 */
export function detectApprovedContent(route, bundle) {
  if (!bundle) return false;
  if (route.id === 'thank-you') return false;

  if (route.id === 'client-results') {
    const cases = Array.isArray(bundle.caseStudies) ? bundle.caseStudies : [];
    const testimonials = Array.isArray(bundle.testimonials)
      ? bundle.testimonials
      : [];
    const okCase = cases.some(
      (c) =>
        c &&
        typeof c === 'object' &&
        isCaseStudyProductionReady(/** @type {Record<string, unknown>} */ (c)),
    );
    const okT = testimonials.some((t) =>
      collectClaimFields(t).some(({ field }) => isProductionRenderableClaim(field)),
    );
    return okCase || okT;
  }

  // Default: redesign pages stay non-indexable until an explicit publish checklist passes.
  return false;
}

/**
 * @param {object} routesDoc
 * @param {string} locale
 */
export function expandLocaleRoutes(routesDoc, locale) {
  return routesDoc.routes.map((route) => {
    const path = localizePath(locale, route.path);
    const indexability = resolveIndexability(route, {
      hasApprovedContent: false,
    });
    return {
      ...route,
      locale,
      localizedPath: path,
      robots: indexability.robots,
      effectivelyIndexable: indexability.indexable,
      indexabilityReason: indexability.reason,
    };
  });
}

/**
 * All locale × page routes (templates included as patterns).
 * @param {object} routesDoc
 */
export function allLocalizedRouteTable(routesDoc) {
  /** @type {object[]} */
  const rows = [];
  for (const locale of LOCALES) {
    rows.push(...expandLocaleRoutes(routesDoc, locale));
  }
  return rows;
}

/**
 * @param {object} routesDoc
 * @param {string} routeId
 */
export function getRouteById(routesDoc, routeId) {
  const route = routesDoc.routes.find((r) => r.id === routeId);
  if (!route) throw new Error(`Unknown route id: ${routeId}`);
  return route;
}

/**
 * Build breadcrumb trail for a route id.
 * @param {object} routesDoc
 * @param {object} navigationDoc
 * @param {string} locale
 * @param {string} routeId
 * @param {{ slug?: string, leafLabel?: string }} [opts]
 */
export function buildBreadcrumbs(
  routesDoc,
  navigationDoc,
  locale,
  routeId,
  opts = {},
) {
  const labels = navigationDoc.labels[locale] || navigationDoc.labels.en;
  const chain = [];
  let current = getRouteById(routesDoc, routeId);
  while (current) {
    chain.unshift(current);
    current = current.parentId
      ? getRouteById(routesDoc, current.parentId)
      : null;
  }

  if (!navigationDoc.breadcrumbs.includeHome) {
    // still include for now per includeHome true
  }

  return chain
    .filter((r) => !(r.id === 'home' && !navigationDoc.breadcrumbs.includeHome))
    .filter((r) => !(r.id === 'home' && routeId === 'home' && !navigationDoc.breadcrumbs.showOnHome))
    .map((r, index, arr) => {
      const isLast = index === arr.length - 1;
      let path = localizePath(locale, materializePath(r.path, opts.slug));
      let label =
        labels[r.breadcrumbLabelKey] ||
        r.title?.[locale] ||
        r.title?.en ||
        r.id;
      if (isLast && opts.leafLabel) label = opts.leafLabel;
      return {
        routeId: r.id,
        label,
        href: path,
        current: isLast,
      };
    });
}

/**
 * Header nav for a locale — only essential items + CTA metadata.
 * Draft routes remain in IA but `promoted` is false until published+approved.
 * @param {object} routesDoc
 * @param {object} navigationDoc
 * @param {string} locale
 */
export function buildHeaderNavigation(routesDoc, navigationDoc, locale) {
  const labels = navigationDoc.labels[locale] || navigationDoc.labels.en;
  const items = navigationDoc.header.items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const route = getRouteById(routesDoc, item.routeId);
      const indexability = resolveIndexability(route, {
        hasApprovedContent: false,
      });
      return {
        routeId: route.id,
        href: localizePath(locale, route.path),
        label: labels[route.breadcrumbLabelKey] || route.title[locale] || route.title.en,
        status: route.status,
        promoted: route.status === 'published' && indexability.indexable,
        inHeader: true,
      };
    });

  const ctaRoute = getRouteById(
    routesDoc,
    navigationDoc.header.primaryCta.routeId,
  );
  const primaryCta = {
    routeId: ctaRoute.id,
    href: localizePath(locale, ctaRoute.path),
    label:
      labels[navigationDoc.header.primaryCta.labelKey] ||
      ctaRoute.title[locale] ||
      ctaRoute.title.en,
    status: ctaRoute.status,
  };

  const languageSelector = {
    ...navigationDoc.header.languageSelector,
    ariaLabel: labels[navigationDoc.header.languageSelector.ariaLabelKey],
    options: LOCALES.map((code) => ({
      locale: code,
      label: code === 'en' ? 'English' : code === 'am' ? 'አማርኛ' : 'ትግርኛ',
      // Equivalent path resolution is route-aware at render time
      homeHref: localizePath(code, '/'),
    })),
  };

  return { locale, items, primaryCta, languageSelector };
}

/**
 * Language alternatives for a given route + locale.
 * @param {object} routesDoc
 * @param {string} routeId
 * @param {string} [slug]
 */
export function languageAlternates(routesDoc, routeId, slug) {
  const route = getRouteById(routesDoc, routeId);
  const bare = materializePath(route.path, slug);
  const alts = LOCALES.map((locale) => ({
    locale,
    href: localizePath(locale, bare),
    hreflang: locale,
    absoluteHref: `https://geezconsulting.com${localizePath(locale, bare)}`,
  }));
  alts.push({
    locale: 'x-default',
    href: localizePath('en', bare),
    hreflang: 'x-default',
    absoluteHref: `https://geezconsulting.com${localizePath('en', bare)}`,
  });
  return alts;
}

/**
 * Resolve redirect `to` for locale-aware entries.
 * @param {object} redirect
 * @param {string} locale
 */
export function localizeRedirectTarget(redirect, locale) {
  if (redirect.passthrough) return redirect.to;
  if (redirect.localeAware) {
    return localizePath(locale, redirect.to);
  }
  // If `from` already includes locale prefix, `to` should too (as authored)
  return redirect.to;
}

/**
 * Validate routes + redirects consistency.
 * @param {object} routesDoc
 * @param {object} redirectsDoc
 * @param {object} navigationDoc
 */
export function validateRoutingDocs(routesDoc, redirectsDoc, navigationDoc) {
  /** @type {string[]} */
  const errors = [];
  const ids = new Set();

  for (const route of routesDoc.routes) {
    if (ids.has(route.id)) errors.push(`duplicate route id ${route.id}`);
    ids.add(route.id);
    if (!route.path?.startsWith('/')) errors.push(`${route.id}: bad path`);
    if (!['draft', 'published', 'retired'].includes(route.status)) {
      errors.push(`${route.id}: bad status`);
    }
    if (route.status === 'draft' && route.indexable === true) {
      errors.push(`${route.id}: draft routes must not set indexable true`);
    }
    if (route.parentId && !routesDoc.routes.some((r) => r.id === route.parentId)) {
      errors.push(`${route.id}: missing parent ${route.parentId}`);
    }
    for (const locale of LOCALES) {
      try {
        localizePath(locale, route.path);
      } catch (e) {
        errors.push(`${route.id} ${locale}: ${e.message}`);
      }
    }
  }

  for (const item of navigationDoc.header.items) {
    if (!ids.has(item.routeId)) {
      errors.push(`header references unknown route ${item.routeId}`);
    }
  }
  if (!ids.has(navigationDoc.header.primaryCta.routeId)) {
    errors.push('primary CTA route missing');
  }

  const fromSet = new Set();
  for (const redirect of redirectsDoc.redirects) {
    if (fromSet.has(redirect.from)) {
      errors.push(`duplicate redirect from ${redirect.from}`);
    }
    fromSet.add(redirect.from);
    if (!redirect.to) errors.push(`${redirect.id}: missing to`);
    if (redirect.passthrough) continue;
    // Target should map to a known path pattern when not hash
    if (redirect.to.includes(':')) continue;
  }

  // Required IA pages present
  const required = [
    'home',
    'services',
    'service-start-a-business',
    'service-business-plans-funding',
    'service-bookkeeping-payroll',
    'service-growth-operations',
    'technology-support',
    'client-results',
    'case-study',
    'resources',
    'article',
    'about-saba',
    'book-a-fit-call',
    'thank-you',
    'service-finder',
    'privacy',
    'terms',
    'disclaimers',
  ];
  for (const id of required) {
    if (!ids.has(id)) errors.push(`missing required route ${id}`);
  }

  return errors;
}

export async function loadRoutingDocs() {
  const routes = await readDataJson('shared/routes.json');
  const redirects = await readDataJson('shared/redirects.json');
  const navigation = await readDataJson('shared/navigation.json');
  return { routes, redirects, navigation };
}
