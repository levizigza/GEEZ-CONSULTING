import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const todo = (value = null, notes) => ({
  value,
  source: 'TODO_VERIFICATION',
  approvalStatus: value == null || value === '' ? 'todo_verification' : 'draft',
  lastReviewed: null,
  ledgerId: 'CL-009',
  ...(notes ? { notes } : {}),
});

const person = (name, role, notes) => ({
  name: todo(name, notes),
  role: todo(role),
});

const ctaFit = { label: 'Book a Fit Call', href: '/book-a-fit-call/' };

const cite = (id, label, status = 'needs_verification', notes = '') => ({
  id,
  label,
  url: null,
  accessed: null,
  status,
  ...(notes ? { notes } : {}),
});

const item = (text, reviewFlags = [], sourceNeeded = true) => ({
  text,
  ...(reviewFlags.length ? { reviewFlags } : {}),
  sourceNeeded,
});

const section = (id, heading, items, intro) => ({
  id,
  heading,
  ...(intro ? { intro } : {}),
  items,
});

const outlineBase = {
  locale: 'en',
  translationOf: null,
  recordStatus: 'draft',
  localeStatus: 'outline',
  showToc: true,
  author: person(null, null, 'Assign author after editorial plan'),
  reviewer: person(null, null, 'Qualified reviewer required before publish'),
  datePublished: todo(null, 'Set on first approved publish'),
  dateModified: todo(null, 'Update when outline becomes full article'),
  cta: ctaFit,
  downloads: [],
  roadmapAction: 'new',
};

const outlines = [
  {
    ...outlineBase,
    id: 'article-starting-business-alberta-newcomer',
    slug: 'starting-a-business-in-alberta-newcomer-checklist',
    topics: ['startup', 'newcomer', 'alberta'],
    disclaimerCategory: 'registration',
    relatedServiceId: 'start-strong',
    title: todo(
      'Starting a Business in Alberta: Newcomer Checklist',
      'Outline only — not final registration advice',
    ),
    excerpt: todo(
      'A practical checklist of questions and preparation steps for newcomers exploring business start-up in Alberta. Not legal, tax, or immigration advice.',
    ),
    citations: [
      cite(
        'ab-corporations',
        'Alberta Corporate Registry / Service Alberta naming & registration guidance',
        'needs_verification',
        'Confirm current official URL + access date',
      ),
      cite('cra-business', 'CRA business registration / GST overview', 'needs_verification'),
      cite(
        'municipal-calgary',
        'City of Calgary business licence information (if applicable)',
        'needs_verification',
      ),
    ],
    downloads: [
      {
        id: 'newcomer-checklist',
        label: 'Newcomer start-up checklist (planned PDF)',
        href: null,
        format: 'pdf',
        status: 'planned',
        accessible: {
          hasTaggedStructure: false,
          textAlternativeHref: null,
          notes: 'Publish only with tagged PDF or HTML/text alternative',
        },
      },
    ],
    sections: [
      section('who-this-is-for', 'Who this outline is for', [
        item('Newcomers exploring whether and how to start a business in Alberta.', [], false),
        item('Owners who need a sequencing checklist—not a guarantee of approval.', [], false),
      ]),
      section('before-you-file', 'Questions before you file anything', [
        item('What problem will the business solve, and for whom?', [], false),
        item('Which legal structure might fit (sole prop, partnership, corporation)?', [
          'legal',
          'registration',
        ]),
        item(
          'Do you need immigration advice about work authorization before operating?',
          ['immigration', 'legal'],
        ),
      ]),
      section('name-and-registration', 'Name search and registration path', [
        item(
          'Confirm naming rules and NUANS / Alberta name search requirements with a dated official source.',
          ['registration', 'legal'],
        ),
        item(
          'List documents typically required for registration—verify against current Alberta guidance.',
          ['registration'],
        ),
        item(
          'Note municipal business licence triggers separately from provincial registration.',
          ['registration', 'program'],
        ),
      ]),
      section('tax-and-numbers', 'Tax accounts and numbers (flagged)', [
        item(
          'When a BN / GST / payroll account may be required—verify CRA thresholds with current CRA pages.',
          ['tax', 'payroll'],
        ),
        item('Do not invent rates, thresholds, or filing deadlines in the final article.', [
          'tax',
        ]),
      ]),
      section('banking-and-insurance', 'Banking, insurance, and risk', [
        item(
          'What banks typically ask for when opening a business account (checklist questions only).',
          ['financing'],
        ),
        item(
          'Insurance topics to discuss with a licensed broker—not product recommendations.',
          ['legal'],
        ),
      ]),
      section('next-steps', 'Next steps with Ge’ez', [
        item(
          'Use the service finder or Fit Call to clarify which advisory support fits—no outcome promises.',
          [],
          false,
        ),
      ]),
    ],
  },
  {
    ...outlineBase,
    id: 'article-sole-prop-vs-corporation-alberta',
    slug: 'sole-proprietorship-vs-corporation-in-alberta-questions',
    topics: ['startup', 'legal-structure', 'alberta'],
    disclaimerCategory: 'legal',
    relatedServiceId: 'start-strong',
    title: todo(
      'Sole Proprietorship vs Corporation in Alberta: Questions to Ask',
      'Outline — lawyer/accountant review required before publish',
    ),
    excerpt: todo(
      'Decision questions to discuss with a lawyer and accountant—not a recommendation of either structure.',
    ),
    citations: [
      cite('ab-corp-types', 'Alberta guidance on business structures', 'needs_verification'),
      cite('cra-structure', 'CRA information on business types', 'needs_verification'),
    ],
    sections: [
      section('purpose', 'Purpose of this outline', [
        item('Help owners prepare better questions for qualified professionals.', [], false),
        item('This is not legal or tax advice and does not recommend a structure.', [
          'legal',
          'tax',
        ]),
      ]),
      section('questions-liability', 'Liability and risk questions', [
        item(
          'What personal liability exposure exists under each structure for your activities?',
          ['legal'],
        ),
        item('Are there industry licences that assume a particular structure?', [
          'legal',
          'registration',
        ]),
      ]),
      section('questions-tax', 'Tax and bookkeeping questions', [
        item(
          'How might income, losses, and filing complexity differ—ask a CPA with Alberta context.',
          ['tax'],
        ),
        item(
          'What bookkeeping cadence does each structure usually imply for year one?',
          ['tax', 'payroll'],
        ),
      ]),
      section('questions-cost', 'Cost and administration questions', [
        item(
          'What are current incorporation / annual filing fee ranges from official sources (date-stamp them)?',
          ['registration', 'program'],
        ),
        item('Who will maintain minute books, annual returns, or equivalent records?', [
          'legal',
          'registration',
        ]),
      ]),
      section('immigration-note', 'Immigration-sensitive situations', [
        item(
          'If status depends on employment or ownership rules, consult an immigration professional before structuring.',
          ['immigration', 'legal'],
        ),
      ]),
    ],
  },
  {
    ...outlineBase,
    id: 'article-lender-ready-business-plan',
    slug: 'what-a-lender-ready-business-plan-needs',
    topics: ['funding', 'planning'],
    disclaimerCategory: 'financing',
    relatedServiceId: 'plan-funding-readiness',
    title: todo('What a Lender-Ready Business Plan Needs'),
    excerpt: todo(
      'A readiness checklist for planning documents used in funding conversations. Not a promise of loan or grant approval.',
    ),
    citations: [
      cite(
        'bdc-plan',
        'BDC or similar public guidance on business plans (verify URL)',
        'needs_verification',
      ),
      cite(
        'lender-generic',
        'Generic Canadian lender readiness themes—replace with dated primary sources',
        'planned',
      ),
    ],
    downloads: [
      {
        id: 'plan-section-checklist',
        label: 'Plan section checklist (planned)',
        href: null,
        format: 'pdf',
        status: 'planned',
        accessible: {
          hasTaggedStructure: false,
          textAlternativeHref: null,
          notes: 'HTML checklist on-page is the accessible primary; PDF optional',
        },
      },
    ],
    sections: [
      section('readiness-mindset', 'Readiness mindset', [
        item('A plan supports a conversation; it does not guarantee financing.', ['financing'], false),
        item(
          'Ask who the audience is (bank, BDC, grant program, partner) before drafting.',
          ['financing', 'program'],
        ),
      ]),
      section('core-sections', 'Core sections to prepare', [
        item('Problem, offer, and customer: clear without hype.', [], false),
        item('Operations: how work gets done in the first 6–12 months.', [], false),
        item(
          'Financial story: assumptions listed; no invented revenue guarantees.',
          ['financing', 'tax'],
        ),
      ]),
      section('evidence', 'Evidence lenders often ask about', [
        item(
          'Personal and business credit context—discuss carefully; no DIY credit-repair claims.',
          ['credit', 'financing'],
        ),
        item(
          'Collateral, guarantees, and covenants—questions for the lender and your advisor.',
          ['financing', 'legal'],
        ),
      ]),
      section('gaps', 'Common gaps to close before a meeting', [
        item('Missing market sources, undated stats, or unexplained cash needs.', ['financing']),
        item('Unclear use of funds and repayment capacity narrative.', ['financing']),
      ]),
    ],
  },
  {
    ...outlineBase,
    id: 'article-bookkeeping-first-year',
    slug: 'bookkeeping-setup-for-the-first-year',
    topics: ['bookkeeping', 'operations'],
    disclaimerCategory: 'payroll',
    relatedServiceId: 'books-payroll',
    title: todo('Bookkeeping Setup for the First Year'),
    excerpt: todo(
      'A first-year bookkeeping setup outline: systems, cadence, and questions for your bookkeeper or accountant. Not accounting advice.',
    ),
    citations: [
      cite('cra-recordkeeping', 'CRA record-keeping guidance', 'needs_verification'),
      cite(
        'payroll-accounts',
        'CRA payroll / source deductions overview if hiring',
        'needs_verification',
      ),
    ],
    sections: [
      section('purpose', 'Purpose', [
        item('Help new owners set a simple, reviewable system—not to replace a CPA.', ['tax'], false),
      ]),
      section('chart-and-tools', 'Chart of accounts and tools', [
        item('Choose a tool you will actually update; list must-have reports.', [], false),
        item('Separate personal and business spending from day one.', ['tax']),
      ]),
      section('cadence', 'Weekly / monthly cadence', [
        item('Receipt capture, bank reconciliation rhythm, and who owns each step.', [], false),
        item(
          'Sales tax collection/remittance checkpoints—verify current CRA rules.',
          ['tax'],
        ),
      ]),
      section('payroll', 'If you hire or contractor-pay', [
        item(
          'Employee vs contractor classification is a legal/tax question for professionals.',
          ['legal', 'payroll', 'tax'],
        ),
        item(
          'Payroll account setup steps—confirm against CRA, do not invent deadlines.',
          ['payroll', 'tax'],
        ),
      ]),
      section('year-end', 'Year-end readiness', [
        item('Document list to give your accountant; timeline questions to ask them.', ['tax']),
      ]),
    ],
  },
  {
    ...outlineBase,
    id: 'article-bdc-or-bank-conversation',
    slug: 'preparing-for-a-bdc-or-bank-conversation',
    topics: ['funding', 'banking'],
    disclaimerCategory: 'financing',
    relatedServiceId: 'plan-funding-readiness',
    title: todo('Preparing for a BDC or Bank Conversation'),
    excerpt: todo(
      'Preparation questions and document lists for lender conversations. Not credit repair advice and not a financing offer.',
    ),
    citations: [
      cite('bdc-public', 'BDC public small-business financing overview', 'needs_verification'),
      cite('bank-public', 'Major bank small-business pages (sample; verify)', 'planned'),
    ],
    roadmapNotes:
      'Candidate merge target for legacy credit post themes (without credit-repair claims).',
    sections: [
      section('scope', 'Scope and limits', [
        item('Ge’ez does not guarantee loan approval or rates.', ['financing'], false),
        item(
          'Credit decisions belong to lenders; avoid promising score improvements.',
          ['credit', 'financing'],
        ),
      ]),
      section('documents', 'Documents to assemble', [
        item(
          'ID, registration proof, financial statements or projections (as applicable).',
          ['financing', 'registration'],
        ),
        item(
          'Personal net-worth or guarantor forms—only if the lender requests them.',
          ['financing', 'credit'],
        ),
      ]),
      section('story', 'Your story in one page', [
        item('Why the funds, how much, use of funds, repayment capacity narrative.', [
          'financing',
        ]),
        item('Risks and mitigations—honest, not promotional.', ['financing']),
      ]),
      section('questions-to-ask', 'Questions to ask the lender', [
        item('Product fit, fees, covenants, timeline, and information still needed.', [
          'financing',
          'program',
        ]),
      ]),
    ],
  },
  {
    ...outlineBase,
    id: 'article-calgary-newcomer-resource-map',
    slug: 'calgary-alberta-newcomer-entrepreneur-resource-map',
    topics: ['newcomer', 'calgary', 'resources'],
    disclaimerCategory: 'program',
    relatedServiceId: 'start-strong',
    title: todo('Calgary/Alberta Newcomer Entrepreneur Resource Map'),
    excerpt: todo(
      'A curated map of public and community resource categories for newcomer entrepreneurs. Links require dated verification before publish.',
    ),
    citations: [
      cite(
        'settlement',
        'Local settlement / newcomer entrepreneurship programs',
        'planned',
        'Name only after verification',
      ),
      cite('ab-supports', 'Alberta small-business support portals', 'needs_verification'),
      cite('calgary-econ', 'City or civic entrepreneur resources', 'planned'),
    ],
    sections: [
      section('how-to-use', 'How to use this map', [
        item(
          'Treat listings as starting points; confirm eligibility and hours on the source site.',
          ['program'],
          false,
        ),
        item('Programs change—every link needs an accessed-on date before go-live.', [
          'program',
        ]),
      ]),
      section('categories', 'Resource categories to populate', [
        item('Settlement and language supports relevant to business owners.', [
          'immigration',
          'program',
        ]),
        item('Municipal licensing and permits information.', ['registration', 'program']),
        item('Provincial registration and naming.', ['registration']),
        item('Federal tax / BN starting points (CRA).', ['tax']),
        item('Financing education (not lender offers).', ['financing', 'program']),
        item(
          'Community networks for Black and newcomer entrepreneurs (permission before naming partners).',
          ['program'],
        ),
      ]),
      section('gaps', 'Editorial gaps before publish', [
        item(
          'No partner logos or endorsements until CL-002 style permission exists.',
          ['program'],
          false,
        ),
        item(
          'Do not list fees or eligibility as facts without a dated primary source.',
          ['program'],
        ),
      ]),
    ],
  },
];

const legacy = [
  {
    id: 'article-how-to-name-your-business',
    slug: 'how-to-name-your-business',
    locale: 'en',
    translationOf: null,
    legacyWpUrl: 'https://geezconsulting.com/how-to-name-your-business/',
    recordStatus: 'draft',
    localeStatus: 'draft',
    topics: ['startup', 'branding'],
    disclaimerCategory: 'registration',
    relatedServiceId: 'start-strong',
    roadmapAction: 'update',
    roadmapNotes:
      'Keep URL under /resources/; rewrite as naming + registration questions checklist; align with newcomer checklist; verify Alberta naming rules with dated sources.',
    title: todo('How to Name Your Business', 'Legacy 2024 post — rewrite before production'),
    excerpt: todo(
      'Legacy article on business naming. Rewrite pending; do not treat live WP body as verified advice.',
    ),
    author: person(null, null, 'Confirm original author credit'),
    reviewer: person(null, null),
    datePublished: todo(null, 'Pull original WP publish date when rewriting'),
    dateModified: todo(null),
    cta: ctaFit,
    citations: [
      cite('ab-naming', 'Alberta business naming / NUANS guidance', 'needs_verification'),
    ],
    showToc: true,
    downloads: [],
    sections: [
      section('rewrite-plan', 'Rewrite plan (outline)', [
        item(
          'Replace generic tips with Alberta-specific questions and official source links.',
          ['registration', 'legal'],
        ),
        item('Remove any implied trademark or registration outcomes.', [
          'legal',
          'registration',
        ]),
        item(
          'Cross-link to the newcomer checklist and sole-prop vs corporation outline.',
          [],
          false,
        ),
      ]),
    ],
  },
  {
    id: 'article-credit-financial-situation',
    slug: 'steps-to-improve-your-credit-and-financial-situation',
    locale: 'en',
    translationOf: null,
    legacyWpUrl:
      'https://geezconsulting.com/steps-to-improve-your-credit-and-financial-situation/',
    recordStatus: 'draft',
    localeStatus: 'draft',
    topics: ['finance', 'credit'],
    disclaimerCategory: 'credit',
    relatedServiceId: 'plan-funding-readiness',
    roadmapAction: 'merge',
    roadmapNotes:
      'High outcome-language risk. Merge useful preparedness themes into “Preparing for a BDC or Bank Conversation”; redirect legacy URL; do not keep credit-repair framing.',
    title: todo(
      'Steps to Improve Your Credit and Financial Situation',
      'Legacy 2024 — merge/redirect recommended',
    ),
    excerpt: todo(
      'Legacy credit/finance post. Not suitable for production without major rewrite; prefer merge into lender-prep article.',
    ),
    author: person(null, null),
    reviewer: person(null, null),
    datePublished: todo(null),
    dateModified: todo(null),
    cta: ctaFit,
    citations: [],
    showToc: false,
    downloads: [],
    sections: [
      section('risks', 'Known risks', [
        item(
          'Implied credit improvement or financial outcomes are not allowed without evidence and disclaimers.',
          ['credit', 'financing'],
        ),
        item(
          'Any retained tips must be questions/checklists, not DIY credit repair advice.',
          ['credit', 'legal'],
        ),
      ]),
    ],
  },
  {
    id: 'article-partnerships',
    slug: 'unlocking-the-power-of-partnerships-for-your-small-business',
    locale: 'en',
    translationOf: null,
    legacyWpUrl:
      'https://geezconsulting.com/unlocking-the-power-of-partnerships-for-your-small-business/',
    recordStatus: 'draft',
    localeStatus: 'draft',
    topics: ['growth', 'partnerships'],
    disclaimerCategory: 'legal',
    relatedServiceId: 'grow-with-a-system',
    roadmapAction: 'update',
    roadmapNotes:
      'Keep under /resources/ with toned-down title; rewrite as partnership due-diligence questions; legal review for agreement topics; optional later merge into growth guide.',
    title: todo(
      'Unlocking the Power of Partnerships for Your Small Business',
      'Legacy 2024 — update title/tone',
    ),
    excerpt: todo(
      'Legacy partnerships post. Rewrite as practical questions before partnering—not motivational guarantees.',
    ),
    author: person(null, null),
    reviewer: person(null, null),
    datePublished: todo(null),
    dateModified: todo(null),
    cta: ctaFit,
    citations: [
      cite(
        'legal-partner',
        'Lawyer-reviewed partnership agreement topics (to source)',
        'planned',
      ),
    ],
    showToc: true,
    downloads: [],
    sections: [
      section('rewrite-plan', 'Rewrite plan (outline)', [
        item(
          'Retitle to something like “Questions to Ask Before a Business Partnership”.',
          ['legal'],
          false,
        ),
        item('Cover roles, money, IP, exit—and flag lawyer review.', ['legal']),
        item('No revenue or growth promises from “partnerships”.', ['financing'], false),
      ]),
    ],
  },
];

const doc = { schemaVersion: '1.0.0', items: [...outlines, ...legacy] };
const out = path.join(root, 'content/data/locales/en/articles.json');
await writeFile(out, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log('Wrote', doc.items.length, 'EN articles →', out);
