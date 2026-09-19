/**
 * Safe intake UI strings (en/am/ti). No TODO_VERIFICATION in public copy.
 * AM/TI longer legal lines may still use English with an explicit note.
 */

const sharedOptions = {
  businessStage: {
    idea: { en: 'Idea / exploring', am: 'Idea / exploring', ti: 'Idea / exploring' },
    pre_launch: { en: 'Pre-launch', am: 'Pre-launch', ti: 'Pre-launch' },
    early_operating: {
      en: 'Early operating',
      am: 'Early operating',
      ti: 'Early operating',
    },
    growing: { en: 'Growing', am: 'Growing', ti: 'Growing' },
    unsure: { en: 'Not sure', am: 'Not sure', ti: 'Not sure' },
  },
  primaryGoal: {
    launch_register: {
      en: 'Launch or register a business',
      am: 'Launch or register a business',
      ti: 'Launch or register a business',
    },
    plan_funding: {
      en: 'Plan and funding readiness',
      am: 'Plan and funding readiness',
      ti: 'Plan and funding readiness',
    },
    books_payroll: {
      en: 'Bookkeeping and payroll systems',
      am: 'Bookkeeping and payroll systems',
      ti: 'Bookkeeping and payroll systems',
    },
    systems_growth: {
      en: 'Growth and operations systems',
      am: 'Growth and operations systems',
      ti: 'Growth and operations systems',
    },
    unsure: { en: 'Not sure yet', am: 'Not sure yet', ti: 'Not sure yet' },
  },
  currentObstacle: {
    dont_know_steps: {
      en: 'I do not know the steps',
      am: 'I do not know the steps',
      ti: 'I do not know the steps',
    },
    funding_confusion: {
      en: 'Funding options feel confusing',
      am: 'Funding options feel confusing',
      ti: 'Funding options feel confusing',
    },
    messy_numbers: {
      en: 'Books or payroll feel messy',
      am: 'Books or payroll feel messy',
      ti: 'Books or payroll feel messy',
    },
    too_many_hats: {
      en: 'I am wearing too many hats',
      am: 'I am wearing too many hats',
      ti: 'I am wearing too many hats',
    },
    language_support: {
      en: 'I want language support',
      am: 'I want language support',
      ti: 'I want language support',
    },
    other: { en: 'Something else', am: 'Something else', ti: 'Something else' },
  },
  preferredLanguage: {
    en: { en: 'English', am: 'English', ti: 'English' },
    am: { en: 'Amharic', am: 'አማርኛ', ti: 'Amharic' },
    ti: { en: 'Tigrinya', am: 'Tigrinya', ti: 'ትግርኛ' },
    other: { en: 'Other', am: 'Other', ti: 'Other' },
  },
  desiredTiming: {
    asap: { en: 'As soon as practical', am: 'As soon as practical', ti: 'As soon as practical' },
    '1_to_3_months': {
      en: 'In the next 1–3 months',
      am: 'In the next 1–3 months',
      ti: 'In the next 1–3 months',
    },
    exploring: { en: 'Just exploring', am: 'Just exploring', ti: 'Just exploring' },
    unsure: { en: 'Not sure', am: 'Not sure', ti: 'Not sure' },
  },
  helpCategory: {
    'start-a-business': {
      en: 'Start a Business',
      am: 'Start a Business',
      ti: 'Start a Business',
    },
    'business-plans-funding-readiness': {
      en: 'Business Plans & Funding Readiness',
      am: 'Business Plans & Funding Readiness',
      ti: 'Business Plans & Funding Readiness',
    },
    'bookkeeping-payroll': {
      en: 'Bookkeeping & Payroll',
      am: 'Bookkeeping & Payroll',
      ti: 'Bookkeeping & Payroll',
    },
    'growth-operations': {
      en: 'Growth & Operations',
      am: 'Growth & Operations',
      ti: 'Growth & Operations',
    },
    'not-sure': { en: 'Not sure', am: 'Not sure', ti: 'Not sure' },
  },
};

/**
 * @param {string} locale
 */
export function intakeCopy(locale = 'en') {
  const L = locale === 'am' || locale === 'ti' ? locale : 'en';
  const note =
    L === 'am'
      ? 'Amharic professional translation pending for some longer lines.'
      : L === 'ti'
        ? 'Tigrinya professional translation pending for some longer lines.'
        : '';

  return {
    locale: L,
    translationNote: note,
    finder: {
      h1: 'Find a starting service',
      meta: 'Answer five short questions to see one recommended Ge’ez Consulting service. Not advice or eligibility screening.',
      intro:
        'Five questions. One suggested starting point. This is not a diagnosis of legal, tax, immigration, or financing eligibility, and it does not promise outcomes.',
      submit: 'See recommendation',
      changeAnswers: 'Change answers',
      resultHeading: 'Suggested starting service',
      whyHeading: 'Why this suggestion',
      detailsCta: 'View service details',
      fitCta: 'Book a Fit Call',
      noscriptHint:
        'JavaScript is optional. Submit the form to see a recommendation on this page.',
      questions: {
        businessStage: 'Where is the business today?',
        primaryGoal: 'What is your primary goal right now?',
        currentObstacle: 'What is getting in the way most?',
        preferredLanguage: 'Preferred language for support?',
        desiredTiming: 'When do you hope to start?',
      },
      options: sharedOptions,
    },
    form: {
      h1: 'Book a Fit Call',
      meta: 'Request a Fit Call. We collect only what we need to respond — no sensitive financial or identity details.',
      intro:
        'Tell us how to reach you and what you want help with. Do not include SIN, banking passwords, immigration file numbers, or payroll files.',
      submit: 'Send request',
      sending: 'Sending…',
      successInline: 'Request sent. Opening confirmation…',
      errorGeneric:
        'Something went wrong. Please try again or email us using the address on this site.',
      errorSummaryTitle: 'There is a problem',
      retry: 'Try again',
      privacyHint:
        'Just-in-time notice: we use your contact details and answers only to respond to this Fit Call. Do not include SIN, banking passwords, immigration file numbers, or payroll files. See Privacy for retention and your rights (draft until verified).',
      jitContact:
        'Email or phone is used to reach you about this request—not for marketing unless you opt in below.',
      jitGoal:
        'Keep this short. No sensitive IDs, account numbers, or immigration file details.',
      consentLabel:
        'I agree that Ge’ez Consulting may use the information I submit to respond to this request.',
      marketingConsentLabel:
        'Optional: send me occasional emails about Ge’ez Consulting services and resources. Not required to send this request. You can unsubscribe anytime.',
      marketingConsentHint:
        'Leave unchecked unless you want marketing messages. Response to this inquiry does not depend on this box.',
      fields: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        preferredContactMethod: 'Preferred contact method',
        preferredLanguage: 'Preferred language',
        businessStage: 'Business stage',
        helpCategory: 'Help category',
        goalProblem: 'Short goal or problem',
        timeline: 'Timeline (optional)',
        company: 'Company or project name (optional)',
        consentResponsePurpose: 'Response-purpose consent',
        consentMarketing: 'Optional marketing consent',
      },
      contactMethod: {
        email: 'Email',
        phone: 'Phone',
      },
      language: {
        en: 'English',
        am: 'Amharic (አማርኛ)',
        ti: 'Tigrinya (ትግርኛ)',
      },
      options: sharedOptions,
      errors: {
        requiredName: 'Enter your name.',
        contactRequired: 'Provide an email or a phone number.',
        emailInvalid: 'Enter a valid email address.',
        phoneInvalid: 'Enter a valid phone number.',
        methodRequired: 'Choose how you prefer to be contacted.',
        methodMismatch:
          'Preferred contact method must match a value you provided.',
        languageRequired: 'Choose a preferred language.',
        stageRequired: 'Choose a business stage.',
        helpRequired: 'Choose a help category.',
        goalRequired: 'Briefly describe your goal or problem.',
        goalTooLong: 'Keep your goal/problem under 500 characters.',
        consentRequired:
          'Confirm you agree we may use this information to respond to your request.',
        sensitiveContent:
          'Remove financial, identity, immigration, banking, or payroll details.',
      },
    },
  };
}

/**
 * @param {object} optionsMap
 * @param {string} locale
 * @param {string} key
 */
export function optionLabel(optionsMap, locale, key) {
  const row = optionsMap?.[key];
  if (!row) return key;
  return row[locale] || row.en || key;
}
