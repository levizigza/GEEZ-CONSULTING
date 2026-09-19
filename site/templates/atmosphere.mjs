/** Page atmosphere helpers — imagery bands + shared media map (base-path aware). */

import { withBase } from '../../content/lib/base-path.mjs';

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
 * Map of atmosphere keys → files under /media/atmosphere/
 * Decorative only — never invent outcomes from captions.
 */
export const ATMOSPHERE = {
  services: {
    file: 'services-overview.jpg',
    alt: 'Colleagues collaborating around a laptop in a bright office',
    pattern: 'tibeb',
  },
  'start-a-business': {
    file: 'start-business.jpg',
    alt: 'Hands reviewing business documents on a desk',
    pattern: 'geometry',
  },
  'business-plans-funding-readiness': {
    file: 'funding-readiness.jpg',
    alt: 'Calculator and financial paperwork on a wooden desk',
    pattern: 'star',
  },
  'bookkeeping-payroll': {
    file: 'bookkeeping.jpg',
    alt: 'Accounting ledgers and a calculator beside a laptop',
    pattern: 'tibeb',
  },
  'growth-operations': {
    file: 'growth-ops.jpg',
    alt: 'Team meeting around a conference table',
    pattern: 'geometry',
  },
  technology: {
    file: 'technology.jpg',
    alt: 'Close view of a circuit board and technology hardware',
    pattern: 'star',
  },
  'client-results': {
    file: 'client-results.jpg',
    alt: 'Boutique retail interior suggesting a small local business',
    pattern: 'tibeb',
  },
  resources: {
    file: 'resources.jpg',
    alt: 'Open books on a table suggesting learning resources',
    pattern: 'geometry',
  },
  'fit-call': {
    file: 'fit-call.jpg',
    alt: 'Professional conversation across a desk',
    pattern: 'star',
  },
  finder: {
    file: 'service-finder.jpg',
    alt: 'Mountain path through trees suggesting choosing a direction',
    pattern: 'geometry',
  },
  legal: {
    file: 'legal-quiet.jpg',
    alt: '',
    pattern: 'geometry',
    quiet: true,
  },
  calgary: {
    file: 'calgary-skyline.jpg',
    alt: 'Calgary city skyline at dusk',
    pattern: 'tibeb',
  },
  about: {
    file: 'multicultural-team.jpg',
    alt: 'Professionals collaborating in a bright workspace',
    pattern: 'geometry',
  },
};

/**
 * @param {keyof typeof ATMOSPHERE | string} key
 */
export function atmosphereUrl(key) {
  const entry = ATMOSPHERE[key] || ATMOSPHERE.calgary;
  return withBase(`/media/atmosphere/${entry.file}`);
}

/**
 * Decorative page band with photography + gradient veil.
 * Patterns and vines stay on empty surfaces, not on stock photos.
 * @param {{
 *   key: string,
 *   title: string,
 *   lead?: string,
 *   kicker?: string,
 *   quiet?: boolean,
 * }} opts
 */
export function renderPageBand({ key, title, lead = '', kicker = '', quiet = false }) {
  const e = escapeHtml;
  const entry = ATMOSPHERE[key] || ATMOSPHERE.calgary;
  const isQuiet = quiet || entry.quiet;
  const src = withBase(`/media/atmosphere/${entry.file}`);
  const alt = entry.alt ? e(entry.alt) : '';
  const imgAttrs = alt
    ? `alt="${alt}"`
    : `alt="" role="presentation"`;

  return `<div class="geez-page-band${isQuiet ? ' geez-page-band--quiet' : ''} geez-reveal" data-geez-atmosphere="${e(key)}" data-geez-motion>
  <img class="geez-page-band__media" src="${e(src)}" ${imgAttrs} width="1600" height="900" loading="eager" decoding="async" />
  <div class="geez-page-band__veil" aria-hidden="true"></div>
  <div class="geez-page-band__inner">
    ${kicker ? `<p class="geez-page-band__kicker">${e(kicker)}</p>` : ''}
    <h1>${e(title)}</h1>
    ${lead ? `<p class="geez-page-band__lead">${e(lead)}</p>` : ''}
  </div>
</div>`;
}
