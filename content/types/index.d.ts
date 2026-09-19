/**
 * Ge'ez Consulting content model types.
 * Compatible with content/schema/*.json and WordPress/Polylang mapping later.
 */

export type LocaleCode = 'en' | 'am' | 'ti';

export type ApprovalStatus =
  | 'todo_verification'
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'remove';

/** Required wrapper for any claim-bearing field. */
export interface ClaimField<T = string> {
  value: T;
  /** Evidence pointer; use TODO_VERIFICATION when unknown. */
  source: string;
  approvalStatus: ApprovalStatus;
  /** ISO date YYYY-MM-DD, or null if never reviewed. */
  lastReviewed: string | null;
  ledgerId?: string | null;
  notes?: string;
}

/** Non-claim UI chrome (nav labels, button verbs) — still locale-scoped. */
export type UiString = string;

export interface LocalizedRef {
  id: string;
}

export interface NapBlock {
  legalName: ClaimField<string>;
  brandName: ClaimField<string>;
  streetAddress: ClaimField<string>;
  addressLocality: ClaimField<string>;
  addressRegion: ClaimField<string>;
  postalCode: ClaimField<string | null>;
  addressCountry: ClaimField<string>;
  email: ClaimField<string>;
  telephoneDisplay: ClaimField<string>;
  telephoneE164: ClaimField<string>;
  sameAs: ClaimField<string[]>;
}

export interface ServiceArea {
  primaryMarket: ClaimField<string>;
  regions: ClaimField<string[]>;
  remoteNotes: ClaimField<string | null>;
}

export interface CtaDefinition {
  id: string;
  kind: 'primary' | 'secondary';
  label: ClaimField<string> | UiString;
  href: string;
  /** If true, label is claim-governed (e.g. promises a response SLA). */
  claimBearing: boolean;
}

export interface ServiceOffering {
  id:
    | 'start-strong'
    | 'plan-funding-readiness'
    | 'books-payroll'
    | 'grow-with-a-system';
  sortOrder: number;
  name: ClaimField<string>;
  summary: ClaimField<string>;
  outcomes: ClaimField<string[]>;
  audienceNotes: ClaimField<string | null>;
  /** Explicit: never imply guaranteed loan/grant/legal outcomes. */
  scopeLimits: ClaimField<string>;
}

export interface TechnologyPartnerDisclosure {
  hasTechnologyPartner: ClaimField<boolean>;
  partnerName: ClaimField<string | null>;
  relationshipSummary: ClaimField<string | null>;
  publicDisclosureCopy: ClaimField<string | null>;
}

export interface ProcessStep {
  id: string;
  sortOrder: number;
  title: ClaimField<string>;
  description: ClaimField<string>;
}

export interface FounderProfile {
  id: string;
  displayName: ClaimField<string>;
  roleTitle: ClaimField<string>;
  bio: ClaimField<string>;
  credentials: ClaimField<string[]>;
  yearsExperience: ClaimField<number | null>;
  photo: {
    src: ClaimField<string | null>;
    alt: ClaimField<string | null>;
  };
}

export interface Testimonial {
  id: string;
  quote: ClaimField<string>;
  attributionName: ClaimField<string>;
  attributionRole: ClaimField<string | null>;
  attributionOrg: ClaimField<string | null>;
  permissionConfirmed: ClaimField<boolean>;
  locale: LocaleCode;
}

export interface CaseStudyOutcome {
  kind: 'qualitative' | 'quantitative';
  statement: ClaimField<string>;
  metricDefinition: ClaimField<string | null>;
  baseline: ClaimField<string | null>;
  resultValue: ClaimField<string | null>;
  window: ClaimField<string | null>;
  metricSource: ClaimField<string | null>;
}

export type CaseStudyPermission =
  | 'none'
  | 'pending'
  | 'story_anonymized'
  | 'named_public';

export interface CaseStudy {
  id: string;
  slug: string;
  locale: LocaleCode;
  /** Record-level gate — must be approved before any public listing or JSON-LD. */
  recordStatus: ApprovalStatus;
  migratedFrom?: string;
  title: ClaimField<string>;
  summary: ClaimField<string>;
  clientName: ClaimField<string | null>;
  clientSector: ClaimField<string>;
  /** Used when permissionStatus is story_anonymized. */
  anonymizedLabel: ClaimField<string | null>;
  permissionStatus: ClaimField<CaseStudyPermission>;
  businessStage: ClaimField<string | null>;
  situation: ClaimField<string | null>;
  constraint: ClaimField<string | null>;
  goal: ClaimField<string | null>;
  workPerformed: ClaimField<string | null>;
  deliverables: ClaimField<string[]>;
  /** Render only when claim is production-approved. */
  timeline: ClaimField<string | null>;
  outcomes: CaseStudyOutcome[];
  quote: ClaimField<string | null>;
  quoteApproverName: ClaimField<string | null>;
  quoteApproverRole: ClaimField<string | null>;
  scopeCaveat: ClaimField<string>;
  relatedServiceId:
    | 'start-strong'
    | 'plan-funding-readiness'
    | 'books-payroll'
    | 'grow-with-a-system';
  cta: { label: string; href: string };
  image?: {
    src: ClaimField<string | null>;
    alt: ClaimField<string | null>;
  } | null;
}

export interface FaqItem {
  id: string;
  question: ClaimField<string>;
  answer: ClaimField<string>;
  category?: string;
}

export interface ArticleResource {
  id: string;
  slug: string;
  title: ClaimField<string>;
  excerpt: ClaimField<string>;
  bodyPath: ClaimField<string | null>;
  legacyWpUrl: string | null;
  locale: LocaleCode;
  translationOf: string | null;
  topics: string[];
  disclaimerRequired: boolean;
}

export interface Disclaimers {
  privacySummary: ClaimField<string>;
  privacyPolicyUrl: ClaimField<string | null>;
  scopeOfAdvice: ClaimField<string>;
  consultingVsRegulatedAdvice: ClaimField<string>;
  noGuaranteedOutcomes: ClaimField<string>;
  notLegalTaxImmigrationAdvice: ClaimField<string>;
  notRegistryOrLicensingDecisions: ClaimField<string>;
  notFundingOrLenderDecisions: ClaimField<string>;
}

export interface SeoPageMeta {
  path: string;
  title: ClaimField<string>;
  description: ClaimField<string>;
  canonicalPath: string;
  ogImage: ClaimField<string | null>;
  noindex: boolean;
}

export type RouteStatus = 'draft' | 'published' | 'retired';

export interface RouteDefinition {
  id: string;
  path: string;
  type: 'page' | 'template';
  navGroup: string;
  status: RouteStatus;
  indexable: boolean;
  breadcrumbLabelKey: string;
  parentId: string | null;
  contentRefs?: string[];
  serviceId?: string;
  title: Record<LocaleCode, string>;
  aliases?: string[];
  notes?: string;
}

export interface SiteContentBundle {
  meta: {
    schemaVersion: string;
    locale: LocaleCode;
    productionSafe: boolean;
    generatedAt?: string;
  };
  business: NapBlock;
  languages: {
    defaultLocale: LocaleCode;
    supported: LocaleCode[];
    labels: Record<LocaleCode, UiString>;
  };
  serviceArea: ServiceArea;
  ctas: {
    primary: CtaDefinition;
    secondary: CtaDefinition[];
  };
  services: ServiceOffering[];
  technologyPartner: TechnologyPartnerDisclosure;
  process: { steps: ProcessStep[] };
  founder: FounderProfile;
  testimonials: Testimonial[];
  caseStudies: CaseStudy[];
  faqs: FaqItem[];
  articles: ArticleResource[];
  disclaimers: Disclaimers;
  seo: { pages: SeoPageMeta[] };
}

/** First-party measurement (see content/lib/measurement.mjs). */
export type MeasurementEventName =
  | 'service_page_view'
  | 'article_view'
  | 'language_select'
  | 'case_study_view'
  | 'service_finder_start'
  | 'service_finder_complete'
  | 'cta_click'
  | 'fit_form_start'
  | 'fit_form_submit'
  | 'booking_complete'
  | 'phone_click'
  | 'outbound_partner_click';

export type CrmStage =
  | 'contacted'
  | 'booked'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export interface MeasurementEventEnvelope {
  event: MeasurementEventName;
  schema_version: string;
  ts: string;
  page: { path: string; page_type: string };
  locale: LocaleCode;
  service: string | null;
  cta_location: string | null;
  session: { sid: string | null };
  attribution: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    referrer_host: string | null;
  };
  props: Record<string, string | number | boolean>;
}
