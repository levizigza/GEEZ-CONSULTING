/**
 * Progressive enhancement for the service finder.
 * Uses the same ESM model as the server (copied to /assets/).
 */
import {
  recommendService,
  parseFinderAnswers,
} from './service-finder-model.mjs';

function siteBasePath() {
  const meta = document.querySelector('meta[name="geez-base-path"]');
  return meta ? meta.getAttribute('content') || '' : '';
}

function withBase(path) {
  const base = siteBasePath();
  if (!base) return path;
  if (path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function localizePath(locale, path) {
  if (locale === 'en') return withBase(path);
  if (path === '/') return withBase(`/${locale}/`);
  return withBase(`/${locale}${path.startsWith('/') ? path : `/${path}`}`);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readConfig() {
  const el = document.getElementById('geez-finder-config');
  if (!el) return { locale: 'en', copy: {} };
  try {
    return JSON.parse(el.textContent || '{}');
  } catch {
    return { locale: 'en', copy: {} };
  }
}

function renderResult(host, recommendation, copy, locale) {
  const reasons = recommendation.reasons
    .map((r) => `<li>${escapeHtml(r)}</li>`)
    .join('');
  const detail = localizePath(locale, recommendation.path);
  const fit = localizePath(locale, recommendation.fitCallPath);
  host.innerHTML = `<section class="geez-finder__result" id="finder-result" tabindex="-1" aria-labelledby="finder-result-heading">
    <h2 id="finder-result-heading">${escapeHtml(copy.resultHeading || 'Suggested starting service')}</h2>
    <p class="geez-finder__pick"><strong>${escapeHtml(recommendation.title)}</strong></p>
    <h3>${escapeHtml(copy.whyHeading || 'Why this suggestion')}</h3>
    <ul>${reasons}</ul>
    <p>${escapeHtml(recommendation.disclaimer)}</p>
    <p class="geez-svc__cta geez-finder__actions">
      <a class="geez-btn-link" href="${escapeHtml(detail)}" data-geez-cta="finder_result">${escapeHtml(copy.detailsCta || 'View service details')}</a>
      <a class="geez-btn-link geez-btn-link--secondary" href="${escapeHtml(fit)}" data-geez-cta="finder_result">${escapeHtml(copy.fitCta || 'Book a Fit Call')}</a>
    </p>
  </section>`;
  const result = host.querySelector('#finder-result');
  result?.focus();
}

function renderErrors(host, errors) {
  const items = errors
    .map(
      (err) =>
        `<li><a href="#finder-${escapeHtml(err.field)}">${escapeHtml(err.message)}</a></li>`,
    )
    .join('');
  host.innerHTML = `<div class="geez-error-summary" role="alert" tabindex="-1">
    <h2>There is a problem</h2>
    <ul>${items}</ul>
  </div>`;
  host.querySelector('.geez-error-summary')?.focus();
}

function init() {
  const form = document.getElementById('geez-service-finder');
  if (!form) return;
  form.dataset.enhanced = 'true';
  const config = readConfig();
  let started = false;

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
      track('service_finder_start', { once: true });
    },
    true,
  );

  const summaryHost =
    document.getElementById('finder-error-summary-host') || form.parentElement;
  let resultHost = document.getElementById('finder-result')?.parentElement;
  if (!resultHost) {
    resultHost = document.createElement('div');
    resultHost.id = 'finder-result-host';
    form.insertAdjacentElement('afterend', resultHost);
  } else {
    resultHost = document.getElementById('finder-result')?.parentElement || summaryHost;
  }

  // Dedicated host after form
  let host = document.getElementById('finder-result-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'finder-result-host';
    form.insertAdjacentElement('afterend', host);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    /** @type {Record<string, string>} */
    const answers = {};
    for (const [k, v] of data.entries()) {
      answers[k] = String(v);
    }
    const parsed = parseFinderAnswers(answers);
    const outcome = recommendService(parsed);
    if (!outcome.ok) {
      renderErrors(summaryHost, outcome.errors);
      host.innerHTML = '';
      for (const err of outcome.errors) {
        const el = form.querySelector(`#finder-${err.field}`);
        if (el) {
          el.setAttribute('aria-invalid', 'true');
          const errEl = document.getElementById(`finder-${err.field}-error`);
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = err.message;
          }
        }
      }
      return;
    }
    summaryHost.innerHTML = '';
    for (const el of form.querySelectorAll('[aria-invalid]')) {
      el.removeAttribute('aria-invalid');
    }
    for (const el of form.querySelectorAll('.geez-field__error')) {
      el.hidden = true;
      el.textContent = '';
    }
    track('service_finder_complete', {
      once: true,
      dedupeKey: outcome.recommendation?.id || 'complete',
      props: {
        recommended_service: outcome.recommendation?.id || null,
        finder_stage: answers.businessStage || null,
        finder_goal: answers.primaryGoal || null,
      },
    });
    renderResult(host, outcome.recommendation, config.copy || {}, config.locale || 'en');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
