/**
 * Progressive enhancement only. Native <details>, links, and form validation work without this.
 * No nested interactive widgets.
 */

export function initErrorSummary(form) {
  if (!form) return;
  form.addEventListener('submit', (event) => {
    const invalid = [...form.querySelectorAll('input, textarea, select')].filter(
      (el) => typeof el.checkValidity === 'function' && !el.checkValidity(),
    );
    if (!invalid.length) return;
    event.preventDefault();
    invalid.forEach((el) => {
      el.setAttribute('aria-invalid', 'true');
    });
    const summary = form.querySelector('.geez-error-summary');
    if (summary) {
      summary.hidden = false;
      if (!summary.hasAttribute('tabindex')) summary.setAttribute('tabindex', '-1');
      summary.focus();
    }
  });
}

export function initPrimitives(root = document) {
  root.querySelectorAll('form.geez-form').forEach((form) => initErrorSummary(form));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initPrimitives());
}
