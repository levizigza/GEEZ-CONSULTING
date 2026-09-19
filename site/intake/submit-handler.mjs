/**
 * Intake submission orchestrator: validate → spam → provider → result.
 */

import {
  normalizeFitFormInput,
  validateFitForm,
  redactFitFormForLogs,
  HONEYPOT_FIELD,
} from './fit-form-validate.mjs';
import { createRateLimiter, isHoneypotTriggered } from './spam-guard.mjs';
import {
  notificationEmailContract,
  thankYouPageContract,
} from './thank-you-contract.mjs';

/**
 * @typedef {object} IntakeProvider
 * @property {(payload: object) => Promise<{ ok: boolean, id?: string, error?: string }>} submit
 */

/**
 * @param {object} [opts]
 * @param {IntakeProvider} opts.provider
 * @param {ReturnType<typeof createRateLimiter>} [opts.rateLimiter]
 * @param {(event: object) => void} [opts.onLog] must receive redacted events only
 */
export function createIntakeHandler({
  provider,
  rateLimiter = createRateLimiter(),
  onLog = () => {},
} = {}) {
  if (!provider || typeof provider.submit !== 'function') {
    throw new Error('Intake handler requires a provider.submit function');
  }

  /**
   * @param {URLSearchParams | Record<string, unknown>} raw
   * @param {{ clientKey?: string, requireHttps?: boolean, secureTransport?: boolean }} [ctx]
   */
  async function handle(raw, ctx = {}) {
    const secureTransport = ctx.secureTransport !== false;
    if (ctx.requireHttps && !secureTransport) {
      onLog({ type: 'reject', reason: 'insecure_transport' });
      return {
        status: 403,
        body: {
          ok: false,
          code: 'insecure_transport',
          message: 'Submit this form over HTTPS.',
          errors: [],
        },
      };
    }

    const data = normalizeFitFormInput(raw);
    const redacted = redactFitFormForLogs(data);

    if (isHoneypotTriggered(data[HONEYPOT_FIELD])) {
      onLog({ type: 'spam', reason: 'honeypot', meta: redacted });
      // Soft success to avoid tipping bots; no provider call.
      return {
        status: 200,
        body: {
          ok: true,
          code: 'accepted',
          spamSilent: true,
          redirectTo: thankYouPath(data.locale),
          thankYou: thankYouPageContract(data.locale),
        },
      };
    }

    const rate = rateLimiter.check(ctx.clientKey || 'anonymous');
    if (!rate.ok) {
      onLog({ type: 'spam', reason: 'rate_limit', meta: redacted });
      return {
        status: 429,
        body: {
          ok: false,
          code: 'rate_limited',
          message: 'Too many attempts. Please wait and try again.',
          retryAfterSec: rate.retryAfterSec,
          errors: [],
        },
      };
    }

    const validated = validateFitForm(data);
    if (!validated.ok) {
      onLog({
        type: 'validation_failed',
        meta: redacted,
        errorCount: validated.errors.length,
      });
      return {
        status: 400,
        body: {
          ok: false,
          code: 'validation_failed',
          message: 'There is a problem with your submission.',
          errors: validated.errors,
          values: preserveValues(data),
        },
      };
    }

    let result;
    try {
      result = await provider.submit(validated.payload);
    } catch (err) {
      onLog({
        type: 'provider_failure',
        meta: redacted,
        error: 'provider_threw',
      });
      return {
        status: 502,
        body: {
          ok: false,
          code: 'provider_failure',
          message:
            'We could not send your request right now. Please try again, or email us using the address on this site.',
          errors: [],
          values: preserveValues(data),
          retry: true,
        },
      };
    }

    if (!result?.ok) {
      onLog({
        type: 'provider_failure',
        meta: redacted,
        error: result?.error || 'provider_rejected',
      });
      return {
        status: 502,
        body: {
          ok: false,
          code: 'provider_failure',
          message:
            'We could not send your request right now. Please try again, or email us using the address on this site.',
          errors: [],
          values: preserveValues(data),
          retry: true,
        },
      };
    }

    onLog({ type: 'success', meta: redacted, idPresent: Boolean(result.id) });
    const thankYou = thankYouPageContract(data.locale);
    const email = notificationEmailContract(redacted);

    return {
      status: 200,
      body: {
        ok: true,
        code: 'accepted',
        id: result.id || null,
        redirectTo: thankYouPath(data.locale),
        thankYou,
        emailContract: email,
      },
    };
  }

  return { handle, rateLimiter };
}

/**
 * @param {string} locale
 */
function thankYouPath(locale) {
  if (locale === 'am') return '/am/thank-you/';
  if (locale === 'ti') return '/ti/thank-you/';
  return '/thank-you/';
}

/**
 * Preserve user input for redisplay — still PII, only returned to the same user.
 * @param {ReturnType<typeof normalizeFitFormInput>} data
 */
function preserveValues(data) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    preferredContactMethod: data.preferredContactMethod,
    preferredLanguage: data.preferredLanguage,
    businessStage: data.businessStage,
    helpCategory: data.helpCategory,
    goalProblem: data.goalProblem,
    timeline: data.timeline,
    company: data.company,
    consentResponsePurpose: data.consentResponsePurpose,
    consentMarketing: data.consentMarketing,
    locale: data.locale,
  };
}

export function createMemoryProvider({ fail = false } = {}) {
  /** @type {object[]} */
  const store = [];
  return {
    store,
    async submit(payload) {
      if (fail) return { ok: false, error: 'forced_failure' };
      const id = `mem_${store.length + 1}`;
      store.push({ id, payload });
      return { ok: true, id };
    },
  };
}
