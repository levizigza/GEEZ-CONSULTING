/**
 * Service showcase SVGs — narrative icons with continuous motion once in view.
 * Themes: start (launch steps), funding (plan pages), books (ledgers), grow (ops rise), tech (systems).
 */

/** @typedef {'start' | 'funding' | 'books' | 'grow' | 'tech'} ServiceIconId */

/** @type {Record<string, ServiceIconId>} */
export const SERVICE_ICON_BY_PATH = {
  'start-a-business': 'start',
  'business-plans-funding-readiness': 'funding',
  'bookkeeping-payroll': 'books',
  'growth-operations': 'grow',
  technology: 'tech',
  'technology-support': 'tech',
};

/**
 * @param {ServiceIconId | string} id
 * @param {{ size?: 'sm' | 'lg' }} [opts]
 */
export function renderServiceIcon(id, opts = {}) {
  const key = /** @type {ServiceIconId} */ (
    ['start', 'funding', 'books', 'grow', 'tech'].includes(id) ? id : 'start'
  );
  const sizeClass = opts.size === 'lg' ? ' geez-svc-icon--lg' : '';

  const icons = {
    /* Launch path: compass ring + stepping stones that light in sequence + arrow that travels */
    start: `<svg class="geez-svc-icon geez-svc-icon--start${sizeClass}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <circle class="geez-svc-icon__ring" cx="48" cy="48" r="34" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.35"/>
  <circle class="geez-svc-icon__orbit" cx="48" cy="14" r="3.2" fill="currentColor"/>
  <circle class="geez-svc-icon__step geez-svc-icon__step--1" cx="28" cy="58" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle class="geez-svc-icon__step geez-svc-icon__step--2" cx="48" cy="66" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle class="geez-svc-icon__step geez-svc-icon__step--3" cx="68" cy="58" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path class="geez-svc-icon__path" d="M28 58c8 10 22 12 40 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>
  <path class="geez-svc-icon__arrow" d="M60 34l12 0M66 28l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

    /* Plan / funding readiness: document with writing lines + seal that pulses */
    funding: `<svg class="geez-svc-icon geez-svc-icon--funding${sizeClass}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <rect class="geez-svc-icon__page" x="26" y="16" width="44" height="62" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--1" d="M34 32h28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--2" d="M34 44h22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--3" d="M34 56h18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <circle class="geez-svc-icon__seal" cx="62" cy="64" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__check" d="M58 64l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

    /* Books / payroll: open ledger with columns that fill + tally mark */
    books: `<svg class="geez-svc-icon geez-svc-icon--books${sizeClass}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <path class="geez-svc-icon__book geez-svc-icon__book-l" d="M18 22h26c5 0 8 3 8 8v42c0-5-3-8-8-8H18V22z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path class="geez-svc-icon__book geez-svc-icon__book-r" d="M78 22H52c-5 0-8 3-8 8v42c0-5 3-8 8-8h26V22z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path class="geez-svc-icon__col geez-svc-icon__col--1" d="M26 36v22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <path class="geez-svc-icon__col geez-svc-icon__col--2" d="M36 42v16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <path class="geez-svc-icon__col geez-svc-icon__col--3" d="M60 38v20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <path class="geez-svc-icon__col geez-svc-icon__col--4" d="M70 44v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>`,

    /* Growth / operations: rising bars + moving trend tip */
    grow: `<svg class="geez-svc-icon geez-svc-icon--grow${sizeClass}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <path class="geez-svc-icon__axis" d="M18 74h60M18 74V22" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.35"/>
  <rect class="geez-svc-icon__bar geez-svc-icon__bar--1" x="26" y="54" width="10" height="20" rx="1" fill="currentColor" opacity="0.55"/>
  <rect class="geez-svc-icon__bar geez-svc-icon__bar--2" x="42" y="42" width="10" height="32" rx="1" fill="currentColor" opacity="0.7"/>
  <rect class="geez-svc-icon__bar geez-svc-icon__bar--3" x="58" y="30" width="10" height="44" rx="1" fill="currentColor" opacity="0.85"/>
  <path class="geez-svc-icon__trend" d="M24 60l16-12 14 6 22-24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle class="geez-svc-icon__tip" cx="76" cy="30" r="3.5" fill="currentColor"/>
</svg>`,

    /* Technology support: nodes with traveling signal */
    tech: `<svg class="geez-svc-icon geez-svc-icon--tech${sizeClass}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <rect class="geez-svc-icon__screen" x="20" y="22" width="56" height="38" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__stand" d="M38 72h20M48 60v12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle class="geez-svc-icon__node geez-svc-icon__node--a" cx="34" cy="40" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle class="geez-svc-icon__node geez-svc-icon__node--b" cx="48" cy="36" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle class="geez-svc-icon__node geez-svc-icon__node--c" cx="62" cy="42" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__wire" d="M38 40h6M52 37h6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.5"/>
  <circle class="geez-svc-icon__signal" cx="34" cy="40" r="2.2" fill="currentColor"/>
</svg>`,
  };

  return icons[key];
}

/**
 * Larger interactive stage used on service detail pages.
 * @param {ServiceIconId | string} id
 * @param {string} [caption]
 */
export function renderServiceShowcase(id, caption = '') {
  const icon = renderServiceIcon(id, { size: 'lg' });
  const cap = caption
    ? `<p class="geez-svc-stage__caption">${caption}</p>`
    : '';
  return `<div class="geez-svc-stage" data-geez-motion data-geez-showcase="1">
  <div class="geez-svc-stage__frame" aria-hidden="true">${icon}</div>
  ${cap}
</div>`;
}
