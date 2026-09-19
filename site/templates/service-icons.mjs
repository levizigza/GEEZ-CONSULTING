/**
 * Distinct service-theme SVG icons — stroke-draw + light motif motion on .geez-motion--in.
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
 */
export function renderServiceIcon(id) {
  const key = /** @type {ServiceIconId} */ (
    ['start', 'funding', 'books', 'grow', 'tech'].includes(id) ? id : 'start'
  );
  const icons = {
    start: `<svg class="geez-svc-icon geez-svc-icon--start" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle class="geez-svc-icon__draw" cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__motif" d="M32 18v20M24 30l8 8 8-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
    funding: `<svg class="geez-svc-icon geez-svc-icon--funding" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect class="geez-svc-icon__draw" x="14" y="12" width="36" height="44" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--1" d="M22 24h20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--2" d="M22 34h16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path class="geez-svc-icon__line geez-svc-icon__line--3" d="M22 44h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,
    books: `<svg class="geez-svc-icon geez-svc-icon--books" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path class="geez-svc-icon__draw geez-svc-icon__book-l" d="M12 16h18c4 0 6 2 6 6v30c0-4-2-6-6-6H12V16z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path class="geez-svc-icon__draw geez-svc-icon__book-r" d="M52 16H34c-4 0-6 2-6 6v30c0-4 2-6 6-6h18V16z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`,
    grow: `<svg class="geez-svc-icon geez-svc-icon--grow" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path class="geez-svc-icon__draw" d="M14 46l12-14 8 8 16-20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle class="geez-svc-icon__motif" cx="50" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>`,
    tech: `<svg class="geez-svc-icon geez-svc-icon--tech" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <rect class="geez-svc-icon__draw" x="12" y="16" width="40" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path class="geez-svc-icon__motif" d="M24 52h16M32 44v8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle class="geez-svc-icon__pulse" cx="32" cy="30" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
</svg>`,
  };
  return icons[key];
}
