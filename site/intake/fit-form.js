/**
 * Progressive enhancement for the Fit Call form.
 * Posts JSON to /api/fit-call/ when available; falls back to native POST.
 */

function readConfig() {
  const el = document.getElementById('geez-fit-form-config');
  if (!el) return { locale: 'en', copy: {} };
  try {
    return JSON.parse(el.textContent || '{}');
  } catch {
    return { locale: 'en', copy: {} };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clearFieldErrors(form) {
  for (const el of form.querySelectorAll('[aria-invalid]')) {
    el.removeAttribute('aria-invalid');
  }
  for (const el of form.querySelectorAll('.geez-field__error')) {
    el.hidden = true;
    el.textContent = '';
  }
  const summary = document.getElementById('fit-error-summary');
  if (summary) summary.remove();
  const host = document.getElementById('fit-error-summary-host');
  if (host) host.innerHTML = '';
}

function showErrorSummary(form, title, errors) {
  clearFieldErrors(form);
  const items = errors
    .map(
      (err) =>
        `<li><a href="#${CSS.escape(err.field)}">${escapeHtml(err.message)}</a></li>`,
    )
    .join('');
  const html = `<div class="geez-error-summary" role="alert" tabindex="-1" id="fit-error-summary">
    <h2>${escapeHtml(title)}</h2>
    <ul>${items}</ul>
  </div>`;
  const host = document.getElementById('fit-error-summary-host');
  if (host) host.innerHTML = html;
  else form.insertAdjacentHTML('beforebegin', html);

  for (const err of errors) {
    const field = form.querySelector(`#${CSS.escape(err.field)}`);
    if (field) field.setAttribute('aria-invalid', 'true');
    const errEl = document.getElementById(`${err.field}-error`);
    if (errEl) {
      errEl.hidden = false;
      errEl.textContent = err.message;
    }
  }
  document.getElementById('fit-error-summary')?.focus();
}

function formToObject(form) {
  const data = new FormData(form);
  /** @type {Record<string, string>} */
  const out = {};
  for (const [k, v] of data.entries()) out[k] = String(v);
  if (!out.consentResponsePurpose) out.consentResponsePurpose = '';
  else out.consentResponsePurpose = '1';
  if (!out.consentMarketing) out.consentMarketing = '';
  else out.consentMarketing = '1';
  return out;
}

function init() {
  const form = document.getElementById('geez-fit-form');
  if (!form) return;
  form.dataset.enhanced = 'true';
  const config = readConfig();
  const status = document.getElementById('fit-form-status');
  const submitBtn = form.querySelector('[data-fit-submit]');
  const endpoint = form.getAttribute('data-endpoint') || '/api/fit-call/';
  let started = false;
  let submitLocked = false;

  function track(name, opts) {
    try {
      if (window.GeezAnalytics && typeof window.GeezAnalytics.track === 'function') {
        window.GeezAnalytics.track(name, opts || {});
      }
    } catch (e) {
      /* ignore */
    }
  }

  form.addEventListener(
    'focusin',
    () => {
      if (started) return;
      started = true;
      track('fit_form_start', { once: true });
    },
    true,
  );

  form.addEventListener('submit', async (event) => {
    if (!window.fetch) return;
    event.preventDefault();
    if (submitLocked) return;
    submitLocked = true;
    clearFieldErrors(form);
    if (status) status.textContent = config.copy?.sending || 'Sending…';
    if (submitBtn) submitBtn.disabled = true;

    const payload = formToObject(form);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 429) {
        if (status) {
          status.textContent =
            body.message || 'Too many attempts. Please wait and try again.';
        }
        if (submitBtn) submitBtn.disabled = false;
        submitLocked = false;
        return;
      }

      if (!body.ok && body.errors?.length) {
        showErrorSummary(
          form,
          config.copy?.errorSummaryTitle || 'There is a problem',
          body.errors,
        );
        if (status) status.textContent = '';
        if (submitBtn) submitBtn.disabled = false;
        submitLocked = false;
        return;
      }

      if (!body.ok) {
        if (status) {
          status.textContent =
            body.message || config.copy?.errorGeneric || 'Something went wrong.';
        }
        if (submitBtn) submitBtn.disabled = false;
        submitLocked = false;
        return;
      }

      track('fit_form_submit', {
        once: true,
        props: {
          submit_ok: true,
          help_category: payload.helpCategory || null,
          business_stage: payload.businessStage || null,
        },
      });

      if (status) status.textContent = config.copy?.successInline || 'Request sent.';
      window.location.assign(body.redirectTo || '/thank-you/');
    } catch {
      if (status) {
        status.textContent =
          config.copy?.errorGeneric || 'Something went wrong. Please try again.';
      }
      if (submitBtn) submitBtn.disabled = false;
      submitLocked = false;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
