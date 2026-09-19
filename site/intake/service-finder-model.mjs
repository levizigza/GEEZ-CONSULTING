/**
 * Service finder decision model — max five questions.
 * Recommends one primary service with a plain-language reason.
 * Does NOT diagnose legal/tax/financial eligibility or promise outcomes.
 */

export const SERVICE_PATHS = {
  'start-a-business': '/services/start-a-business/',
  'business-plans-funding-readiness':
    '/services/business-plans-funding-readiness/',
  'bookkeeping-payroll': '/services/bookkeeping-payroll/',
  'growth-operations': '/services/growth-operations/',
};

export const SERVICE_TITLES = {
  'start-a-business': 'Start a Business',
  'business-plans-funding-readiness': 'Business Plans & Funding Readiness',
  'bookkeeping-payroll': 'Bookkeeping & Payroll',
  'growth-operations': 'Growth & Operations',
};

/** @type {const} */
export const FINDER_QUESTIONS = [
  {
    id: 'businessStage',
    options: [
      'idea',
      'pre_launch',
      'early_operating',
      'growing',
      'unsure',
    ],
  },
  {
    id: 'primaryGoal',
    options: [
      'launch_register',
      'plan_funding',
      'books_payroll',
      'systems_growth',
      'unsure',
    ],
  },
  {
    id: 'currentObstacle',
    options: [
      'dont_know_steps',
      'funding_confusion',
      'messy_numbers',
      'too_many_hats',
      'language_support',
      'other',
    ],
  },
  {
    id: 'preferredLanguage',
    options: ['en', 'am', 'ti', 'other'],
  },
  {
    id: 'desiredTiming',
    options: ['asap', '1_to_3_months', 'exploring', 'unsure'],
  },
];

/**
 * @param {Record<string, string>} answers
 * @returns {{ ok: true, recommendation: object } | { ok: false, errors: { field: string, message: string }[] }}
 */
export function recommendService(answers) {
  /** @type {{ field: string, message: string }[]} */
  const errors = [];
  for (const q of FINDER_QUESTIONS) {
    const value = answers?.[q.id];
    if (!value || !q.options.includes(value)) {
      errors.push({
        field: q.id,
        message: `Choose an option for ${q.id}.`,
      });
    }
  }
  if (errors.length) return { ok: false, errors };

  const stage = answers.businessStage;
  const goal = answers.primaryGoal;
  const obstacle = answers.currentObstacle;

  /** @type {keyof typeof SERVICE_PATHS} */
  let serviceId = 'start-a-business';
  /** @type {string[]} */
  const reasons = [];

  if (goal === 'books_payroll' || obstacle === 'messy_numbers') {
    serviceId = 'bookkeeping-payroll';
    reasons.push(
      'Your goal or obstacle points to clearer books and payroll processes.',
    );
  } else if (goal === 'plan_funding' || obstacle === 'funding_confusion') {
    serviceId = 'business-plans-funding-readiness';
    reasons.push(
      'Your answers focus on planning and funding readiness — not a loan or grant decision.',
    );
  } else if (
    goal === 'systems_growth' ||
    obstacle === 'too_many_hats' ||
    stage === 'growing'
  ) {
    serviceId = 'growth-operations';
    reasons.push(
      'You described growth or juggling many roles, which fits systems and operations support.',
    );
  } else if (
    goal === 'launch_register' ||
    stage === 'idea' ||
    stage === 'pre_launch' ||
    obstacle === 'dont_know_steps'
  ) {
    serviceId = 'start-a-business';
    reasons.push(
      'You are early in the journey or focused on launch steps, which fits Start a Business.',
    );
  } else {
    serviceId = 'start-a-business';
    reasons.push(
      'When the path is still open, we start with Start a Business as a practical first conversation.',
    );
  }

  if (answers.preferredLanguage === 'am' || answers.preferredLanguage === 'ti') {
    reasons.push(
      'You can ask for Amharic or Tigrinya support on the Fit Call — availability is confirmed in conversation, not promised here.',
    );
  }
  if (answers.desiredTiming === 'asap' || answers.desiredTiming === '1_to_3_months') {
    reasons.push(
      'Your timing preference helps us prepare for the Fit Call; it is not a scheduling guarantee.',
    );
  }

  reasons.push(
    'This tool suggests a starting service only. It does not check legal, tax, immigration, or financing eligibility, and it does not promise outcomes.',
  );

  return {
    ok: true,
    recommendation: {
      serviceId,
      title: SERVICE_TITLES[serviceId],
      path: SERVICE_PATHS[serviceId],
      reasons,
      fitCallPath: '/book-a-fit-call/',
      disclaimer:
        'Not legal, tax, accounting, immigration, registry, funding, or lender advice. Authorities and lenders make their own decisions.',
      answers: { ...answers },
    },
  };
}

/**
 * Parse categorical finder answers from a URLSearchParams or form body.
 * Safe for no-JS GET fallback — codes only, no free-text PII.
 * @param {URLSearchParams | Record<string, string>} input
 */
export function parseFinderAnswers(input) {
  const get =
    input instanceof URLSearchParams
      ? (k) => input.get(k) || ''
      : (k) => String(input?.[k] || '');
  /** @type {Record<string, string>} */
  const answers = {};
  for (const q of FINDER_QUESTIONS) {
    answers[q.id] = get(q.id).trim();
  }
  return answers;
}
