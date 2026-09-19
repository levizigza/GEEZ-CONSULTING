/**
 * Thank-you page + notification email contract.
 * No unverified response SLA (CL-024 related — do not promise minutes/hours).
 */

/**
 * @param {string} locale
 */
export function thankYouPageContract(locale = 'en') {
  const copy = {
    en: {
      h1: 'Thank you',
      meta: 'We received your Fit Call request. Next steps without a promised response time.',
      lead: 'We received your request to talk about working with Ge’ez Consulting.',
      nextStepsHeading: 'What happens next',
      nextSteps: [
        'We review the details you shared so we can prepare for a Fit Call conversation.',
        'We contact you using the method you preferred (email or phone).',
        'Together we clarify fit, scope, and whether to move forward — without guaranteed outcomes.',
      ],
      noSla:
        'We do not publish a guaranteed response time yet. If your matter is urgent, email or call using the contact details on this site.',
      privacy:
        'Do not send SIN, banking passwords, immigration file numbers, or payroll files in follow-up email unless we ask through a safer channel.',
      backHome: 'Back to home',
      bookAgain: 'Submit another request',
    },
    am: {
      h1: 'Thank you',
      meta: 'We received your Fit Call request.',
      lead: 'We received your request to talk about working with Ge’ez Consulting.',
      nextStepsHeading: 'What happens next',
      nextSteps: [
        'We review what you shared to prepare for a Fit Call.',
        'We contact you by your preferred method (email or phone).',
        'We clarify fit and scope together — without guaranteed outcomes.',
      ],
      noSla:
        'We do not publish a guaranteed response time yet. For urgent matters, use the contact details on this site.',
      privacy:
        'Do not send SIN, banking passwords, immigration file numbers, or payroll files unless we ask through a safer channel.',
      backHome: 'Home',
      bookAgain: 'Submit another request',
      translationNote: 'Amharic translation pending for longer legal wording.',
    },
    ti: {
      h1: 'Thank you',
      meta: 'We received your Fit Call request.',
      lead: 'We received your request to talk about working with Ge’ez Consulting.',
      nextStepsHeading: 'What happens next',
      nextSteps: [
        'We review what you shared to prepare for a Fit Call.',
        'We contact you by your preferred method (email or phone).',
        'We clarify fit and scope together — without guaranteed outcomes.',
      ],
      noSla:
        'We do not publish a guaranteed response time yet. For urgent matters, use the contact details on this site.',
      privacy:
        'Do not send SIN, banking passwords, immigration file numbers, or payroll files unless we ask through a safer channel.',
      backHome: 'Home',
      bookAgain: 'Submit another request',
      translationNote: 'Tigrinya translation pending for longer legal wording.',
    },
  };
  return copy[locale] || copy.en;
}

/**
 * Internal notification + optional auto-reply shapes.
 * Bodies must never include full PII when mirrored to analytics.
 * @param {{ preferredLanguage?: string, helpCategory?: string, businessStage?: string }} redactedMeta
 */
export function notificationEmailContract(redactedMeta = {}) {
  return {
    subject: 'New Fit Call request (Ge’ez Consulting)',
    // Staff notification may include PII in the secure inbox only — not documented as logged.
    staffBodyOutline: [
      'New Fit Call request received over HTTPS.',
      `Preferred language code: ${redactedMeta.preferredLanguage || 'n/a'}`,
      `Help category: ${redactedMeta.helpCategory || 'n/a'}`,
      `Business stage: ${redactedMeta.businessStage || 'n/a'}`,
      'Open the secure form/provider record for contact details — do not paste PII into tickets or chat.',
    ],
    autoReply: {
      enabled: true,
      subject: 'We received your Fit Call request — Ge’ez Consulting',
      mustInclude: [
        'confirmation that the request was received',
        'next steps without a timed SLA',
        'reminder not to send sensitive IDs in email',
      ],
      mustNotInclude: [
        'guaranteed response minutes or hours',
        'loan/grant/registration outcome promises',
        'legal/tax/immigration advice',
      ],
    },
  };
}
