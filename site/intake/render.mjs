import {
  renderDocument,
  renderHeader,
  renderFooter,
  renderBreadcrumbs,
  escapeHtml,
  withExplicitEnglish,
} from '../templates/chrome.mjs';
import { buildChromeModel } from '../services/chrome-model.mjs';
import { withBase } from '../../content/lib/base-path.mjs';
import { intakeCopy, optionLabel } from './i18n.mjs';
import {
  FINDER_QUESTIONS,
  parseFinderAnswers,
  recommendService,
} from './service-finder-model.mjs';
import { thankYouPageContract } from './thank-you-contract.mjs';
import {
  HELP_CATEGORIES,
  BUSINESS_STAGES,
  CONTACT_METHODS,
  LANGUAGES,
  HONEYPOT_FIELD,
} from './fit-form-validate.mjs';

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {{ answers?: Record<string, string> }} [opts]
 */
export function renderServiceFinderPage(locale, ui, navigation, opts = {}) {
  const copy = intakeCopy(locale);
  const path =
    locale === 'en' ? '/find-your-service/' : `/${locale}/find-your-service/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const answers = opts.answers || {};
  const result = Object.keys(answers).length
    ? recommendService(answers)
    : null;

  const fields = FINDER_QUESTIONS.map((q) => {
    const label = copy.finder.questions[q.id];
    const optionsMap = copy.finder.options[q.id];
    const optsHtml = q.options
      .map((opt) => {
        const selected = answers[q.id] === opt ? ' selected' : '';
        return `<option value="${e(opt)}"${selected}>${e(
          optionLabel(optionsMap, copy.locale, opt),
        )}</option>`;
      })
      .join('\n');
    return `<div class="geez-field">
      <label for="finder-${e(q.id)}">${e(label)}</label>
      <select id="finder-${e(q.id)}" name="${e(q.id)}" required>
        <option value="">${e('—')}</option>
        ${optsHtml}
      </select>
      <p id="finder-${e(q.id)}-error" class="geez-field__error" hidden></p>
    </div>`;
  }).join('\n');

  let resultHtml = '';
  if (result?.ok) {
    const r = result.recommendation;
    const reasons = r.reasons.map((x) => `<li>${e(x)}</li>`).join('\n');
    const detailHref = chrome.localizeHref(r.path);
    const fitHref = chrome.localizeHref(r.fitCallPath);
    resultHtml = `<section class="geez-finder__result" id="finder-result" tabindex="-1" aria-labelledby="finder-result-heading">
      <h2 id="finder-result-heading">${e(copy.finder.resultHeading)}</h2>
      <p class="geez-finder__pick"><strong>${e(r.title)}</strong></p>
      <h3>${e(copy.finder.whyHeading)}</h3>
      <ul>${reasons}</ul>
      <p>${e(r.disclaimer)}</p>
      <p class="geez-svc__cta geez-finder__actions">
        <a class="geez-btn-link" href="${e(detailHref)}">${e(copy.finder.detailsCta)}</a>
        <a class="geez-btn-link geez-btn-link--secondary" href="${e(fitHref)}">${e(copy.finder.fitCta)}</a>
      </p>
    </section>`;
  } else if (result && !result.ok) {
    const items = result.errors
      .map((err) => `<li><a href="#finder-${e(err.field)}">${e(err.message)}</a></li>`)
      .join('\n');
    resultHtml = `<div class="geez-error-summary" role="alert" tabindex="-1">
      <h2>${e('There is a problem')}</h2>
      <ul>${items}</ul>
    </div>`;
  }

  const crumbs = renderBreadcrumbs([
    { label: 'Home', href: chrome.homeHref },
    { label: copy.finder.h1, current: true },
  ]);

  const action = chrome.localizeHref('/find-your-service/');

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-intake">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${crumbs}
      <header class="geez-svc__header">
        <h1>${e(copy.finder.h1)}</h1>
        <p>${e(copy.finder.intro)}</p>
        ${
          copy.translationNote
            ? `<p class="geez-svc__note">${e(copy.translationNote)}</p>`
            : ''
        }
        <p class="geez-svc__note">${e(copy.finder.noscriptHint)}</p>
      </header>
      <div id="finder-error-summary-host"></div>
      <form class="geez-form geez-finder" id="geez-service-finder" method="get" action="${e(action)}" data-enhanced="false">
        ${fields}
        <p>
          <button type="submit" class="geez-btn-link">${e(copy.finder.submit)}</button>
        </p>
      </form>
      ${resultHtml}`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}
  <script type="application/json" id="geez-finder-config">${JSON.stringify({
    locale: copy.locale,
    copy: {
      resultHeading: copy.finder.resultHeading,
      whyHeading: copy.finder.whyHeading,
      detailsCta: copy.finder.detailsCta,
      fitCta: copy.finder.fitCta,
      changeAnswers: copy.finder.changeAnswers,
      questions: copy.finder.questions,
    },
  }).replace(/</g, '\\u003c')}</script>
  <noscript>
    <div class="geez-svc__note" lang="en">
      <p>Without JavaScript, submit the form (GET) on a server that supports the finder, or open a service directly:</p>
      <ul>
        <li><a href="${e(chrome.localizeHref('/services/start-a-business/'))}">Start a Business</a></li>
        <li><a href="${e(chrome.localizeHref('/services/business-plans-funding-readiness/'))}">Business Plans &amp; Funding Readiness</a></li>
        <li><a href="${e(chrome.localizeHref('/services/bookkeeping-payroll/'))}">Bookkeeping &amp; Payroll</a></li>
        <li><a href="${e(chrome.localizeHref('/services/growth-operations/'))}">Growth &amp; Operations</a></li>
        <li><a href="${e(chrome.bookHref)}">Book a Fit Call</a></li>
      </ul>
    </div>
  </noscript>
  <script type="module" src="${withBase('/assets/service-finder.js')}"></script>`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title: `${copy.finder.h1} | ${chrome.brand}`,
    description: copy.finder.meta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    extraCss: ['services.css', 'intake.css'],
    barePath: '/find-your-service/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 * @param {{ values?: Record<string, unknown>, errors?: { field: string, message: string }[], status?: string }} [state]
 */
export function renderFitFormPage(locale, ui, navigation, state = {}) {
  const copy = intakeCopy(locale);
  const path =
    locale === 'en' ? '/book-a-fit-call/' : `/${locale}/book-a-fit-call/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const values = state.values || {};
  const errors = state.errors || [];
  const errorMap = Object.fromEntries(errors.map((x) => [x.field, x.message]));

  /**
   * @param {string} id
   * @param {string} label
   * @param {string} controlHtml
   * @param {string} [hint]
   */
  function field(id, label, controlHtml, hint = '') {
    const err = errorMap[id];
    const describedBy = [
      hint ? `${id}-hint` : '',
      `${id}-error`,
    ]
      .filter(Boolean)
      .join(' ');
    return `<div class="geez-field">
      <label for="${e(id)}">${e(label)}</label>
      ${hint ? `<p id="${e(id)}-hint" class="geez-field__hint">${e(hint)}</p>` : ''}
      ${controlHtml.replace('ARIA_DESC', `aria-describedby="${e(describedBy)}"${err ? ' aria-invalid="true"' : ''}`)}
      <p id="${e(id)}-error" class="geez-field__error"${err ? '' : ' hidden'}>${err ? e(err) : ''}</p>
    </div>`;
  }

  const v = (key) => e(String(values[key] ?? ''));
  const selected = (key, opt) =>
    String(values[key] ?? '') === opt ? ' selected' : '';

  const stageOpts = BUSINESS_STAGES.map(
    (opt) =>
      `<option value="${e(opt)}"${selected('businessStage', opt)}>${e(
        optionLabel(copy.form.options.businessStage, copy.locale, opt),
      )}</option>`,
  ).join('\n');

  const helpOpts = HELP_CATEGORIES.map(
    (opt) =>
      `<option value="${e(opt)}"${selected('helpCategory', opt)}>${e(
        optionLabel(copy.form.options.helpCategory, copy.locale, opt),
      )}</option>`,
  ).join('\n');

  const langOpts = LANGUAGES.map(
    (opt) =>
      `<option value="${e(opt)}"${selected('preferredLanguage', opt) || (opt === copy.locale && !values.preferredLanguage ? ' selected' : '')}>${e(
        copy.form.language[opt],
      )}</option>`,
  ).join('\n');

  const methodRadios = CONTACT_METHODS.map((opt) => {
    const isChecked = String(values.preferredContactMethod ?? '') === opt;
    const id = `preferredContactMethod-${opt}`;
    return `<label class="geez-choice" for="${e(id)}"><input id="${e(id)}" type="radio" name="preferredContactMethod" value="${e(opt)}"${isChecked ? ' checked' : ''}${errorMap.preferredContactMethod ? ' aria-invalid="true"' : ''}> ${e(copy.form.contactMethod[opt])}</label>`;
  }).join('\n');

  const errorSummary =
    errors.length > 0
      ? `<div class="geez-error-summary" role="alert" tabindex="-1" id="fit-error-summary">
      <h2>${e(copy.form.errorSummaryTitle)}</h2>
      <ul>
        ${errors
          .map(
            (err) =>
              `<li><a href="#${e(err.field)}">${e(err.message)}</a></li>`,
          )
          .join('\n')}
      </ul>
    </div>`
      : `<div id="fit-error-summary-host"></div>`;

  const statusHtml =
    state.status === 'retry'
      ? `<div class="geez-form__status" role="alert">${e(copy.form.errorGeneric)} <button type="button" class="geez-text-btn" data-fit-retry>${e(copy.form.retry)}</button></div>`
      : '';

  const crumbs = renderBreadcrumbs([
    { label: 'Home', href: chrome.homeHref },
    { label: copy.form.h1, current: true },
  ]);

  const action = chrome.localizeHref('/book-a-fit-call/');
  const consentChecked = values.consentResponsePurpose ? ' checked' : '';
  /* Marketing must remain unchecked unless the user previously opted in on redisplays. */
  const marketingChecked = values.consentMarketing ? ' checked' : '';

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-intake">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${crumbs}
      <header class="geez-svc__header">
        <h1>${e(copy.form.h1)}</h1>
        <p>${e(copy.form.intro)}</p>
        ${
          copy.translationNote
            ? `<p class="geez-svc__note">${e(copy.translationNote)}</p>`
            : ''
        }
        <p class="geez-svc__note">${e(copy.form.privacyHint)}</p>
        <p class="geez-svc__note"><a href="${e(chrome.localizeHref('/privacy/'))}">${e('Privacy')}</a> · <a href="${e(chrome.localizeHref('/disclaimers/'))}">${e('Disclaimers')}</a></p>
      </header>
      ${errorSummary}
      ${statusHtml}
      <form class="geez-form geez-fit-form" id="geez-fit-form" method="post" action="${e(action)}" novalidate data-endpoint="/api/fit-call/" data-enhanced="false">
        <input type="hidden" name="locale" value="${e(copy.locale)}">
        <div class="geez-hp" aria-hidden="true">
          <input type="text" id="${e(HONEYPOT_FIELD)}" name="${e(HONEYPOT_FIELD)}" tabindex="-1" autocomplete="off" aria-hidden="true">
        </div>
        ${field(
          'name',
          copy.form.fields.name,
          `<input id="name" name="name" type="text" autocomplete="name" required value="${v('name')}" ARIA_DESC>`,
        )}
        ${field(
          'email',
          copy.form.fields.email,
          `<input id="email" name="email" type="email" autocomplete="email" value="${v('email')}" ARIA_DESC>`,
          copy.form.jitContact,
        )}
        ${field(
          'phone',
          copy.form.fields.phone,
          `<input id="phone" name="phone" type="tel" autocomplete="tel" value="${v('phone')}" ARIA_DESC>`,
        )}
        <fieldset class="geez-field" id="preferredContactMethod">
          <legend id="preferredContactMethod-label">${e(copy.form.fields.preferredContactMethod)}</legend>
          <div role="radiogroup" aria-labelledby="preferredContactMethod-label">
            ${methodRadios}
          </div>
          <p id="preferredContactMethod-error" class="geez-field__error"${errorMap.preferredContactMethod ? '' : ' hidden'}>${errorMap.preferredContactMethod ? e(errorMap.preferredContactMethod) : ''}</p>
        </fieldset>
        ${field(
          'preferredLanguage',
          copy.form.fields.preferredLanguage,
          `<select id="preferredLanguage" name="preferredLanguage" required ARIA_DESC>
            <option value="">—</option>
            ${langOpts}
          </select>`,
        )}
        ${field(
          'businessStage',
          copy.form.fields.businessStage,
          `<select id="businessStage" name="businessStage" required ARIA_DESC>
            <option value="">—</option>
            ${stageOpts}
          </select>`,
        )}
        ${field(
          'helpCategory',
          copy.form.fields.helpCategory,
          `<select id="helpCategory" name="helpCategory" required ARIA_DESC>
            <option value="">—</option>
            ${helpOpts}
          </select>`,
        )}
        ${field(
          'goalProblem',
          copy.form.fields.goalProblem,
          `<textarea id="goalProblem" name="goalProblem" rows="4" maxlength="500" required ARIA_DESC>${v('goalProblem')}</textarea>`,
          copy.form.jitGoal,
        )}
        ${field(
          'timeline',
          copy.form.fields.timeline,
          `<input id="timeline" name="timeline" type="text" value="${v('timeline')}" ARIA_DESC>`,
        )}
        ${field(
          'company',
          copy.form.fields.company,
          `<input id="company" name="company" type="text" autocomplete="organization" value="${v('company')}" ARIA_DESC>`,
        )}
        <div class="geez-field geez-field--consent">
          <label class="geez-choice" for="consentResponsePurpose">
            <input id="consentResponsePurpose" name="consentResponsePurpose" type="checkbox" value="1" required${consentChecked}${errorMap.consentResponsePurpose ? ' aria-invalid="true"' : ''} aria-describedby="consentResponsePurpose-error">
            ${e(copy.form.consentLabel)}
          </label>
          <p id="consentResponsePurpose-error" class="geez-field__error"${errorMap.consentResponsePurpose ? '' : ' hidden'}>${errorMap.consentResponsePurpose ? e(errorMap.consentResponsePurpose) : ''}</p>
        </div>
        <div class="geez-field geez-field--marketing">
          <label class="geez-choice" for="consentMarketing">
            <input id="consentMarketing" name="consentMarketing" type="checkbox" value="1"${marketingChecked} aria-describedby="consentMarketing-hint">
            ${e(copy.form.marketingConsentLabel)}
          </label>
          <p id="consentMarketing-hint" class="geez-jit-notice">${e(copy.form.marketingConsentHint)}</p>
        </div>
        <p>
          <button type="submit" class="geez-btn-link" data-fit-submit>${e(copy.form.submit)}</button>
        </p>
        <p class="geez-form__live" id="fit-form-status" role="status" aria-live="polite"></p>
      </form>
      <p><a href="${e(chrome.localizeHref('/find-your-service/'))}">${e('Not sure where to start? Try the service finder.')}</a></p>`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}
  <script type="application/json" id="geez-fit-form-config">${JSON.stringify({
    locale: copy.locale,
    copy: {
      sending: copy.form.sending,
      successInline: copy.form.successInline,
      errorGeneric: copy.form.errorGeneric,
      errorSummaryTitle: copy.form.errorSummaryTitle,
      retry: copy.form.retry,
      errors: copy.form.errors,
    },
  }).replace(/</g, '\\u003c')}</script>
  <script src="${withBase('/assets/fit-form.js')}" defer></script>`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title: `${copy.form.h1} | ${chrome.brand}`,
    description: copy.form.meta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    extraCss: ['services.css', 'intake.css'],
    barePath: '/book-a-fit-call/',
    translationPending: locale !== 'en',
  });
}

/**
 * @param {string} locale
 * @param {object} ui
 * @param {object} navigation
 */
export function renderThankYouPage(locale, ui, navigation) {
  const copy = thankYouPageContract(locale);
  const path = locale === 'en' ? '/thank-you/' : `/${locale}/thank-you/`;
  const chrome = buildChromeModel(locale, ui, navigation, path);
  const e = escapeHtml;
  const steps = copy.nextSteps.map((s) => `<li>${e(s)}</li>`).join('\n');

  const body = `${renderHeader(chrome)}
  <main id="main" class="geez-svc geez-intake">
    <div class="geez-container geez-container--content">
      ${withExplicitEnglish(
        `${renderBreadcrumbs([
        { label: 'Home', href: chrome.homeHref },
        { label: copy.h1, current: true },
      ])}
      <header class="geez-svc__header">
        <h1>${e(copy.h1)}</h1>
        <p>${e(copy.lead)}</p>
        ${
          copy.translationNote
            ? `<p class="geez-svc__note">${e(copy.translationNote)}</p>`
            : ''
        }
      </header>
      <section aria-labelledby="next-steps-heading">
        <h2 id="next-steps-heading">${e(copy.nextStepsHeading)}</h2>
        <ol>${steps}</ol>
      </section>
      <p>${e(copy.noSla)}</p>
      <p>${e(copy.privacy)}</p>
      <p class="geez-svc__cta">
        <a class="geez-btn-link" href="${e(chrome.homeHref)}">${e(copy.backHome)}</a>
        <a class="geez-btn-link geez-btn-link--secondary" href="${e(chrome.bookHref)}" data-geez-cta="thank_you">${e(copy.bookAgain)}</a>
      </p>`,
        locale,
      )}
    </div>
  </main>
  ${renderFooter(chrome)}`;

  return renderDocument({
    lang: chrome.lang,
    locale,
    title: `${copy.h1} | ${chrome.brand}`,
    description: copy.meta,
    robots: 'noindex, nofollow',
    assetPrefix: chrome.assetPrefix,
    bodyHtml: body,
    extraCss: ['services.css', 'intake.css'],
    barePath: '/thank-you/',
    translationPending: locale !== 'en',
  });
}

export { parseFinderAnswers, recommendService };
