/**
 * Safe service-page copy. No invented prices, timelines, proof, or partner claims.
 * EN is complete; AM/TI reuse structure with localized chrome strings.
 */

/** @typedef {'en'|'am'|'ti'} Locale */

const sharedProcess = {
  en: [
    {
      title: 'Fit conversation',
      text: 'Share your stage and goals. We confirm whether this service is a fit—or say when it is not.',
    },
    {
      title: 'Scoped workplan',
      text: 'Agree on deliverables, what you will provide, and how you will work together. No published fee table until verified.',
    },
    {
      title: 'Delivery and review',
      text: 'Complete the agreed work, review outputs together, and identify next steps you control.',
    },
  ],
};

const timelinePricingEn =
  'Our prices are competitive and reasonable. Because every client’s needs are unique, we customize pricing to fit your requirements. Ge’ez Consulting is happy to discuss a scope of work with mutually acceptable timelines based on your needs and budget—contact us for a free quote or consultation.';

const exclusionsBaseEn = [
  'We do not guarantee loans, grants, registrations, licenses, or program acceptance—those decisions belong to lenders, programs, and authorities.',
  'We do not provide legal, tax, CPA, or immigration advice. Engage a regulated professional for those matters.',
  'Corporate registry, licensing, and permit decisions belong to the authorities—not to our consulting work.',
  'You remain responsible for filings, applications, and decisions you make.',
];

/** @type {Record<string, object>} */
export const servicesCatalogEn = {
  overview: {
    id: 'services',
    path: '/services/',
    h1: 'Services for launching and growing a business in Alberta',
    metaDescription:
      'Explore Start a Business, Plans & Funding Readiness, Bookkeeping & Payroll, Growth & Operations, and Technology Support with Navigate Technology Solutions Inc.',
    intro:
      'Ge’ez Consulting offers a wide range of services tailored to your business—from strategy to implementation. Choose a path below to see fit, deliverables, process, and how to book a Fit Call.',
    cards: [
      {
        id: 'start-a-business',
        title: 'Start a Business',
        text: 'New business registration assistance and launch sequencing for Alberta.',
        href: '/services/start-a-business/',
      },
      {
        id: 'business-plans-funding-readiness',
        title: 'Business Plans & Funding Readiness',
        text: 'Business plan writing and planning materials for funding conversations.',
        href: '/services/business-plans-funding-readiness/',
      },
      {
        id: 'bookkeeping-payroll',
        title: 'Bookkeeping & Payroll',
        text: 'Bookkeeping and payroll for teams of up to 10 employees.',
        href: '/services/bookkeeping-payroll/',
      },
      {
        id: 'growth-operations',
        title: 'Growth & Operations',
        text: 'Guidance on growth opportunities, expansion, and stronger operations.',
        href: '/services/growth-operations/',
      },
    ],
    techCard: {
      title: 'Technology Support',
      text: 'Digital adoption and technology integration with Navigate Technology Solutions Inc., a consulting and managed service provider (MSP).',
      href: '/technology-support/',
    },
  },
  'start-a-business': {
    id: 'start-a-business',
    serviceId: 'start-strong',
    path: '/services/start-a-business/',
    h1: 'Start a Business',
    metaDescription:
      'Advisory support for entrepreneurs starting in Alberta: fit, deliverables, process, exclusions, and Fit Call CTA. No guaranteed registration outcomes.',
    audience:
      'Entrepreneurs—including newcomers and Black business owners—who are preparing to start or newly starting a business in Calgary or Alberta.',
    problem:
      'You know you want to start, but the order of steps—name, structure, registration, banking, and basic records—feels unclear or overwhelming.',
    outcome:
      'A clearer startup sequence and practical next actions you can take. Registration and approvals remain with the relevant authorities.',
    deliverables: [
      'Startup sequencing checklist tailored to your situation',
      'Guidance on documents and questions to prepare for registration and banking conversations',
      'Written summary of agreed next steps after engagement',
    ],
    process: sharedProcess.en,
    clientProvides: [
      'Honest description of your business idea and stage',
      'Any existing registrations, drafts, or advisor notes',
      'Time to review materials and make decisions',
    ],
    timelinePricing: timelinePricingEn,
    exclusions: [
      ...exclusionsBaseEn,
      'We do not file registrations or act as your lawyer or accountant.',
    ],
    proof: { render: false, reason: 'No approved case study or testimonial' },
    faqs: [
      {
        q: 'Will you register my business for me?',
        a: 'No. We help you prepare and sequence. Filings stay with you or a qualified professional you hire.',
      },
      {
        q: 'Can you guarantee approval?',
        a: 'No. Authorities and institutions make their own decisions.',
      },
    ],
    relatedResources: [
      {
        label: 'Resources',
        href: '/resources/',
        note: 'Articles publish per locale only when approved.',
      },
      {
        label: 'Business Plans & Funding Readiness',
        href: '/services/business-plans-funding-readiness/',
      },
    ],
    ctaLabel: 'Book a Fit Call',
  },
  'business-plans-funding-readiness': {
    id: 'business-plans-funding-readiness',
    serviceId: 'plan-funding-readiness',
    path: '/services/business-plans-funding-readiness/',
    h1: 'Business Plans & Funding Readiness',
    metaDescription:
      'Planning and funding-readiness advisory for Alberta entrepreneurs. No guaranteed loans, grants, or investment outcomes.',
    audience:
      'Owners who need a clearer plan and materials before speaking with lenders, grant programs, or partners.',
    problem:
      'You are asked for a plan, numbers, or a “funding story,” but the documents feel incomplete or unconvincing.',
    outcome:
      'Stronger planning documents and a coherent narrative for funding conversations. Funding decisions stay with lenders and programs.',
    deliverables: [
      'Structured business plan outline or refinement of your draft',
      'Support organizing financial assumptions you provide',
      'Preparation checklist for funding or partner conversations',
    ],
    process: sharedProcess.en,
    clientProvides: [
      'Goals, constraints, and target programs or lenders if known',
      'Available financial figures and historical records',
      'Feedback on drafts within agreed review windows',
    ],
    timelinePricing: timelinePricingEn,
    exclusions: [
      ...exclusionsBaseEn,
      'We do not broker loans, underwrite credit, or guarantee funding.',
    ],
    proof: { render: false, reason: 'No approved case study or testimonial' },
    faqs: [
      {
        q: 'Do you guarantee a loan or grant?',
        a: 'No. We help with readiness. Approvals belong to lenders and programs.',
      },
      {
        q: 'Is this investment advice?',
        a: 'No. It is business planning support, not securities or investment advice.',
      },
    ],
    relatedResources: [
      { label: 'Start a Business', href: '/services/start-a-business/' },
      { label: 'Resources', href: '/resources/' },
    ],
    ctaLabel: 'Book a Fit Call',
  },
  'bookkeeping-payroll': {
    id: 'bookkeeping-payroll',
    serviceId: 'books-payroll',
    path: '/services/bookkeeping-payroll/',
    h1: 'Bookkeeping & Payroll',
    metaDescription:
      'Bookkeeping and payroll system setup and coaching for small Alberta businesses. Not a substitute for a CPA or payroll lawyer.',
    audience:
      'Owners who need reliable books and payroll routines for teams of up to 10 employees—without claiming tax or legal coverage.',
    problem:
      'Records are scattered, payroll feels risky, and you are unsure what “good enough” looks like day to day.',
    outcome:
      'Clearer bookkeeping and payroll routines you can run—or hand to a bookkeeper—while tax and legal advice stay with regulated professionals.',
    deliverables: [
      'Recommended chart-of-accounts and record-keeping rhythm for small teams (up to 10 employees)',
      'Payroll process checklist appropriate to your team size',
      'Handoff notes if you engage a bookkeeper or accountant',
    ],
    process: sharedProcess.en,
    clientProvides: [
      'Access to current records or exports you choose to share',
      'Payroll details needed for process design (not via public web form if sensitive)',
      'Confirmation of any accountant or payroll provider already engaged',
    ],
    timelinePricing: timelinePricingEn,
    exclusions: [
      ...exclusionsBaseEn,
      'We are not your CPA, PA, or payroll lawyer and do not file taxes or CRA elections for you.',
    ],
    proof: { render: false, reason: 'No approved case study or testimonial' },
    faqs: [
      {
        q: 'Will you file my taxes?',
        a: 'No. Engage a qualified tax professional. We focus on routines and readiness.',
      },
      {
        q: 'Should I send payroll data in the website form?',
        a: 'No. Do not send SINs, banking passwords, or full payroll files through the public form.',
      },
    ],
    relatedResources: [
      { label: 'Technology Support', href: '/technology-support/' },
      { label: 'Growth & Operations', href: '/services/growth-operations/' },
    ],
    ctaLabel: 'Book a Fit Call',
  },
  'growth-operations': {
    id: 'growth-operations',
    serviceId: 'grow-with-a-system',
    path: '/services/growth-operations/',
    h1: 'Growth & Operations',
    metaDescription:
      'Operating cadence and simple systems for Alberta small businesses. No guaranteed revenue or market results.',
    audience:
      'Owners who have started and need repeatable weekly or monthly rhythms to grow without chaos.',
    problem:
      'Everything lives in your head. Priorities slip, and growth depends on memory instead of a simple system.',
    outcome:
      'A practical operating cadence and visibility into what to fix next. Revenue and market results are not guaranteed.',
    deliverables: [
      'Agreed weekly/monthly operating rhythm',
      'Simple KPI or scorecard using measures you choose',
      'Issue list and ownership for the next review cycle',
    ],
    process: sharedProcess.en,
    clientProvides: [
      'Current priorities and constraints',
      'Access to operational facts you are willing to share',
      'Commitment to run the cadence after setup',
    ],
    timelinePricing: timelinePricingEn,
    exclusions: [
      ...exclusionsBaseEn,
      'We do not guarantee revenue growth, market share, or funding outcomes.',
    ],
    proof: { render: false, reason: 'No approved case study or testimonial' },
    faqs: [
      {
        q: 'Do you guarantee growth?',
        a: 'No. We help install systems. Results depend on your market and execution.',
      },
      {
        q: 'Is this fractional COO employment?',
        a: 'Engagements are advisory unless a separate written agreement says otherwise. Details are confirmed in a Fit Call.',
      },
    ],
    relatedResources: [
      { label: 'Bookkeeping & Payroll', href: '/services/bookkeeping-payroll/' },
      { label: 'Resources', href: '/resources/' },
    ],
    ctaLabel: 'Book a Fit Call',
  },
};

/** Localized chrome for AM/TI; detail bodies use EN until translations are approved. */
export const servicesLocaleChrome = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbServices: 'Services',
    sectionAudience: 'Who it is for',
    sectionProblem: 'The problem',
    sectionOutcome: 'Desired outcome',
    sectionDeliverables: 'Deliverables',
    sectionProcess: 'How engagement works',
    sectionClientProvides: 'What you provide',
    sectionTimeline: 'Timeline and pricing',
    sectionExclusions: 'Scope exclusions and professional boundaries',
    sectionProof: 'Proof',
    sectionFaq: 'FAQ',
    sectionRelated: 'Related resources',
    otherServices: 'Other services',
    findService: 'Find your service',
    proofOmitted: 'Verified client results appear here after approval.',
    translationNote: null,
  },
  am: {
    breadcrumbHome: 'መነሻ ገጽ',
    breadcrumbServices: 'አገልግሎቶች',
    sectionAudience: 'ለማን ነው',
    sectionProblem: 'ችግሩ',
    sectionOutcome: 'የሚፈለገው ውጤት',
    sectionDeliverables: 'ሚሰጡ',
    sectionProcess: 'እንዴት እንሰራለን',
    sectionClientProvides: 'እርስዎ የሚያቀርቡት',
    sectionTimeline: 'ጊዜ እና ዋጋ',
    sectionExclusions: 'ወሰን እና የባለሙያ ወሰኖች',
    sectionProof: 'ማስረጃ',
    sectionFaq: 'ጥያቄዎች',
    sectionRelated: 'ተዛማጅ ሀብቶች',
    otherServices: 'ሌሎች አገልግሎቶች',
    findService: 'አገልግሎት ፈልግ',
    proofOmitted: 'የተረጋገጡ ውጤቶች ከማረጋገጫ በኋላ ይታያሉ።',
    translationNote:
      'Detailed service copy is shown in English until Amharic translations are approved.',
  },
  ti: {
    breadcrumbHome: 'ዋና ገጽ',
    breadcrumbServices: 'ኣገልግሎታት',
    sectionAudience: 'ንመን',
    sectionProblem: 'ጸገም',
    sectionOutcome: 'ዝድለ ውጽኢት',
    sectionDeliverables: 'ዝወሃብ',
    sectionProcess: 'ከመይ ንሰርሕ',
    sectionClientProvides: 'ንስኹም ትህቡ',
    sectionTimeline: 'ግዜን ዋጋን',
    sectionExclusions: 'ደረትን ክኢላታትን',
    sectionProof: 'መርትዖ',
    sectionFaq: 'ሕቶታት',
    sectionRelated: 'ተዛማዲ ጸጋታት',
    otherServices: 'ካልኦት ኣገልግሎታት',
    findService: 'ኣገልግሎት ርከብ',
    proofOmitted: 'ዝተረጋገጸ ውጽኢታት ድሕሪ ምርግጋጽ ይረአ።',
    translationNote:
      'Detailed service copy is shown in English until Tigrinya translations are approved.',
  },
};
