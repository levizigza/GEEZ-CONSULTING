/**
 * Technology Support page — draft/noindex until partner facts are verified.
 * Do not invent Navigate Technology Solutions relationship details in public HTML.
 * Candidate partner name is tracked in claims ledger CL-016 / technology-partner.json.
 */

export const technologySupportCopy = {
  en: {
    path: '/technology-support/',
    h1: 'Technology Support',
    metaDescription:
      'Draft disclosure page for Ge’ez Consulting technology support relationships. Partner, contracting, delivery, and data-handling facts publish only after verification.',
    intro:
      'This page is reserved for a clear disclosure of any technology support relationship that Ge’ez Consulting offers or refers—including partner identity, who contracts with you, who delivers support, and how data is handled.',
    statusNote:
      'Status: draft. No partner relationship, contracting party, delivery responsibility, or data-handling claim is published until verified (see claims ledger CL-016).',
    sections: [
      {
        id: 'relationship',
        title: 'Relationship disclosure',
        body: 'Named technology partners and the nature of the relationship (referral, reseller, subcontractor, or affiliate) appear here only after verification. A candidate name is under review and is not stated on this public page until approved.',
      },
      {
        id: 'contracting',
        title: 'Contracting party',
        body: 'Who you contract with for technology products or support will be stated here once verified. Until then, do not assume Ge’ez Consulting or any third party is the contracting entity.',
      },
      {
        id: 'delivery',
        title: 'Delivery and support responsibility',
        body: 'Who delivers implementation and ongoing support will be disclosed here after verification. Unverified responsibility claims are omitted.',
      },
      {
        id: 'data',
        title: 'Data handling',
        body: 'How business or personal data is collected, stored, and shared for technology support will be described here and linked to the Privacy page once verified. Do not submit sensitive payroll or identity data through the public contact form.',
      },
    ],
    exclusions: [
      'This page does not currently assert a partnership with any named vendor.',
      'Technology support does not replace legal, tax, or cybersecurity advice from qualified professionals.',
      'No uptime, security, or implementation outcomes are guaranteed on this site.',
    ],
    faqs: [
      {
        q: 'Who is the technology partner?',
        a: 'A public partner name will appear here only after verification. Until then, no partner is claimed on this page.',
      },
      {
        q: 'Who do I contract with?',
        a: 'Contracting party details publish after verification. Ask in a Fit Call for the current status—nothing on this page invents that fact.',
      },
    ],
    related: [
      { label: 'Bookkeeping & Payroll', href: '/services/bookkeeping-payroll/' },
      { label: 'Privacy', href: '/privacy/' },
      { label: 'Services overview', href: '/services/' },
    ],
    ctaLabel: 'Book a Fit Call',
    indexable: false,
    draft: true,
  },
};
