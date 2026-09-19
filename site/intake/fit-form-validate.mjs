/**
 * Fit-form field contract, validation, and sensitive-content guards.
 * Keep financial, identity, immigration, banking, and payroll details out.
 * Marketing consent is optional and never required for a service inquiry.
 */

import { buildMarketingConsentRecord } from '../../content/lib/privacy.mjs';

export const HELP_CATEGORIES = [
  'start-a-business',
  'business-plans-funding-readiness',
  'bookkeeping-payroll',
  'growth-operations',
  'not-sure',
];

export const BUSINESS_STAGES = [
  'idea',
  'pre_launch',
  'early_operating',
  'growing',
  'unsure',
];

export const CONTACT_METHODS = ['email', 'phone'];
export const LANGUAGES = ['en', 'am', 'ti'];

/** Honeypot field name — must stay empty. */
export const HONEYPOT_FIELD = 'company_website';

/**
 * Patterns that suggest sensitive data we refuse to accept via public form.
 * Deliberately broad; false positives ask the user to rephrase.
 */
const SENSITIVE_PATTERNS = [
  /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/, // SIN-like
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // card-like
  /\b(sin|social insurance|passport|pr card|study permit|work permit)\b/i,
  /\b(routing|transit|institution)\s*(number|#|no\.?)?\b/i,
  /\b(password|pin\b|cvv|cvc)\b/i,
  /\b(payroll\s*file|direct\s*deposit|bank\s*login)\b/i,
  /\b(immigration\s*file|uci\b|unique\s*client)\b/i,
];

/**
 * @param {string} text
 */
export function containsSensitiveContent(text) {
  const s = String(text || '');
  return SENSITIVE_PATTERNS.some((re) => re.test(s));
}

/**
 * @param {unknown} value
 */
function str(value) {
  return String(value ?? '').trim();
}

/**
 * Normalize a raw body (object or URLSearchParams) into fit-form fields.
 * @param {URLSearchParams | Record<string, unknown>} raw
 */
export function normalizeFitFormInput(raw) {
  const get =
    raw instanceof URLSearchParams
      ? (k) => raw.get(k) ?? ''
      : (k) => raw?.[k] ?? '';

  return {
    name: str(get('name')),
    email: str(get('email')),
    phone: str(get('phone')),
    preferredContactMethod: str(get('preferredContactMethod')),
    preferredLanguage: str(get('preferredLanguage')),
    businessStage: str(get('businessStage')),
    helpCategory: str(get('helpCategory')),
    goalProblem: str(get('goalProblem')),
    timeline: str(get('timeline')),
    company: str(get('company')),
    consentResponsePurpose: ['1', 'true', 'on', 'yes'].includes(
      str(get('consentResponsePurpose')).toLowerCase(),
    ),
    /** Optional CASL-style marketing — never required for inquiry. */
    consentMarketing: ['1', 'true', 'on', 'yes'].includes(
      str(get('consentMarketing')).toLowerCase(),
    ),
    [HONEYPOT_FIELD]: str(get(HONEYPOT_FIELD)),
    locale: str(get('locale')) || 'en',
  };
}

/**
 * Server-side validation. Returns field errors + optional summary code.
 * @param {ReturnType<typeof normalizeFitFormInput>} data
 * @param {{ messages?: Record<string, string> }} [opts]
 */
export function validateFitForm(data, { messages = {} } = {}) {
  const m = {
    requiredName: messages.requiredName || 'Enter your name.',
    contactRequired:
      messages.contactRequired || 'Provide an email or a phone number.',
    emailInvalid: messages.emailInvalid || 'Enter a valid email address.',
    phoneInvalid: messages.phoneInvalid || 'Enter a valid phone number.',
    methodRequired:
      messages.methodRequired || 'Choose how you prefer to be contacted.',
    methodMismatch:
      messages.methodMismatch ||
      'Preferred contact method must match a value you provided.',
    languageRequired: messages.languageRequired || 'Choose a preferred language.',
    stageRequired: messages.stageRequired || 'Choose a business stage.',
    helpRequired: messages.helpRequired || 'Choose a help category.',
    goalRequired:
      messages.goalRequired || 'Briefly describe your goal or problem.',
    goalTooLong:
      messages.goalTooLong || 'Keep your goal/problem under 500 characters.',
    consentRequired:
      messages.consentRequired ||
      'Confirm you agree we may use this information to respond to your request.',
    sensitiveContent:
      messages.sensitiveContent ||
      'Remove financial, identity, immigration, banking, or payroll details. We will ask for sensitive information later through a safer channel if needed.',
    honeypot: messages.honeypot || 'Submission could not be processed.',
  };

  /** @type {{ field: string, message: string }[]} */
  const errors = [];

  if (data[HONEYPOT_FIELD]) {
    return {
      ok: false,
      spam: true,
      errors: [{ field: HONEYPOT_FIELD, message: m.honeypot }],
    };
  }

  if (!data.name || data.name.length < 2) {
    errors.push({ field: 'name', message: m.requiredName });
  }

  const hasEmail = Boolean(data.email);
  const hasPhone = Boolean(data.phone);
  if (!hasEmail && !hasPhone) {
    errors.push({ field: 'email', message: m.contactRequired });
    errors.push({ field: 'phone', message: m.contactRequired });
  }
  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: m.emailInvalid });
  }
  if (hasPhone && !/^[+()\d\s.-]{7,20}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: m.phoneInvalid });
  }

  if (!CONTACT_METHODS.includes(data.preferredContactMethod)) {
    errors.push({ field: 'preferredContactMethod', message: m.methodRequired });
  } else if (data.preferredContactMethod === 'email' && !hasEmail) {
    errors.push({ field: 'preferredContactMethod', message: m.methodMismatch });
  } else if (data.preferredContactMethod === 'phone' && !hasPhone) {
    errors.push({ field: 'preferredContactMethod', message: m.methodMismatch });
  }

  if (!LANGUAGES.includes(data.preferredLanguage)) {
    errors.push({ field: 'preferredLanguage', message: m.languageRequired });
  }
  if (!BUSINESS_STAGES.includes(data.businessStage)) {
    errors.push({ field: 'businessStage', message: m.stageRequired });
  }
  if (!HELP_CATEGORIES.includes(data.helpCategory)) {
    errors.push({ field: 'helpCategory', message: m.helpRequired });
  }

  if (!data.goalProblem) {
    errors.push({ field: 'goalProblem', message: m.goalRequired });
  } else if (data.goalProblem.length > 500) {
    errors.push({ field: 'goalProblem', message: m.goalTooLong });
  }

  if (!data.consentResponsePurpose) {
    errors.push({ field: 'consentResponsePurpose', message: m.consentRequired });
  }

  const textBlob = [data.name, data.goalProblem, data.company, data.timeline].join(
    ' ',
  );
  if (containsSensitiveContent(textBlob)) {
    errors.push({ field: 'goalProblem', message: m.sensitiveContent });
  }

  if (errors.length) {
    return { ok: false, spam: false, errors };
  }

  const submittedAt = new Date().toISOString();
  return {
    ok: true,
    spam: false,
    errors: [],
    /** Sanitized payload safe to hand to a provider (still PII — never log). */
    payload: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      preferredContactMethod: data.preferredContactMethod,
      preferredLanguage: data.preferredLanguage,
      businessStage: data.businessStage,
      helpCategory: data.helpCategory,
      goalProblem: data.goalProblem,
      timeline: data.timeline || null,
      company: data.company || null,
      consentResponsePurpose: true,
      marketingConsent: buildMarketingConsentRecord({
        granted: Boolean(data.consentMarketing),
        source: 'fit-call-form',
        now: new Date(submittedAt),
      }),
      locale: data.locale,
      submittedAt,
    },
  };
}

/**
 * Redact PII for logs/analytics — only codes and booleans.
 * @param {Record<string, unknown>} data
 */
export function redactFitFormForLogs(data) {
  return {
    preferredContactMethod: data.preferredContactMethod || null,
    preferredLanguage: data.preferredLanguage || null,
    businessStage: data.businessStage || null,
    helpCategory: data.helpCategory || null,
    hasEmail: Boolean(data.email),
    hasPhone: Boolean(data.phone),
    hasCompany: Boolean(data.company),
    hasTimeline: Boolean(data.timeline),
    consentResponsePurpose: Boolean(data.consentResponsePurpose),
    marketingConsentGranted: Boolean(
      data.consentMarketing ?? data.marketingConsent?.granted,
    ),
    locale: data.locale || null,
    goalProblemLength: String(data.goalProblem || '').length,
  };
}
