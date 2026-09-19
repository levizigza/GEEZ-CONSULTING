/**
 * Safe homepage copy that may render without ClaimField approval.
 * Rules: no invented proof, no SLAs, no outcomes, no TODO_* in public strings.
 * "20-minute" fit-call duration is NOT included (CL-024) until verified.
 */

/** @typedef {'en'|'am'|'ti'} Locale */

/**
 * @param {string | null | undefined} value
 * @param {string} fallback
 */
export function publicText(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || /TODO_VERIFICATION/i.test(trimmed)) return fallback;
  return trimmed;
}

/** @type {Record<Locale, object>} */
export const homepageSafeCopy = {
  en: {
    brand: "Ge'ez Consulting",
    slogan: 'More than paperwork',
    sloganSupport: 'Clear counsel for the path ahead—without guaranteed outcomes.',
    skip: 'Skip to content',
    skipIntro: 'Skip intro',
    menuLabel: 'Menu',
    langAria: 'Language',
    primaryNavAria: 'Primary',
    seoTitle: 'Business launch and growth support in Calgary',
    ctaPrimary: 'Book a Fit Call',
    ctaSecondary: 'Find the right service',
    heroH1: 'Business launch and growth support for Calgary and Alberta entrepreneurs',
    heroLead:
      'Clear next steps for newcomer and Black business owners—without guaranteed loan, grant, or legal outcomes.',
    heroReassure:
      'We do not guarantee funding, registration, immigration, tax, or legal results. You stay in control of every decision.',
    logo: {
      src: '/media/logo/geez-wordmark-light.png',
      width: 220,
      height: 80,
      alt: "Ge'ez Consulting",
    },
    logoMark: {
      src: '/media/logo/geez-mark-192.png',
      width: 40,
      height: 40,
      alt: '',
    },
    heroImageOmitted: false,
    heroImage: {
      src: '/media/founder/saba-teklu.jpg',
      width: 900,
      height: 1125,
      alt: 'Saba Teklu, Founder and Director of Ge’ez Consulting, smiling in a professional portrait',
    },
    audience: [
      {
        label: 'Newcomers',
        text: 'Translate Canadian systems into a practical sequence you can act on.',
      },
      {
        label: 'Black-owned businesses',
        text: 'Support that respects your context—without locking you into a single market.',
      },
      {
        label: 'Calgary & Alberta',
        text: 'Local knowledge for registration, planning, books, and growth conversations.',
      },
    ],
    trust: {
      render: true,
      heading: 'Client reflections',
      note: 'Quotes published on geezconsulting.com. Individual experiences vary—results are not guaranteed.',
      logos: [
        {
          src: '/media/logo/geez-mark-192.png',
          alt: "Ge'ez Consulting mark",
          width: 56,
          height: 56,
        },
      ],
    },
    socialsAria: 'Ge’ez Consulting on social media',
    socials: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/geez-consulting/',
      },
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/geezconsulting',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://www.instagram.com/geez.consulting',
      },
      {
        id: 'youtube',
        label: 'YouTube',
        href: 'https://www.youtube.com/@geez.consulting',
      },
    ],
    pathwaysHeading: 'Where are you now?',
    pathwaysIntro: 'Pick the path that matches your stage. Each page explains scope and limits.',
    pathways: [
      {
        id: 'start',
        title: 'Start a Business',
        text: 'Explore registration and launch sequencing for Alberta.',
        href: '/services/start-a-business/',
        mediaClass: 'start',
      },
      {
        id: 'funding',
        title: 'Plans & Funding Readiness',
        text: 'Prepare planning materials for funding conversations—decisions stay with lenders and programs.',
        href: '/services/business-plans-funding-readiness/',
        mediaClass: 'funding',
      },
      {
        id: 'books',
        title: 'Bookkeeping & Payroll',
        text: 'Set up clearer books and payroll routines with qualified professionals when needed.',
        href: '/services/bookkeeping-payroll/',
        mediaClass: 'books',
      },
      {
        id: 'grow',
        title: 'Growth & Operations',
        text: 'Build simple operating rhythms so growth is not left to memory alone.',
        href: '/services/growth-operations/',
        mediaClass: 'grow',
      },
    ],
    caseStudy: { render: false, reason: 'No approved case study' },
    processHeading: 'How a fit call works',
    processIntro: 'A simple website path—not a promise of business results.',
    process: [
      { title: 'Share your stage', text: 'Tell us where you are and what you need clarified.' },
      { title: 'Match a service path', text: 'We point you to the service page that fits—or say when we are not the right fit.' },
      { title: 'Book a Fit Call', text: 'Use the contact form to request a conversation. Response times are not guaranteed until verified.' },
    ],
    servicesHeading: 'Services at a glance',
    servicesIntro: 'Outcome-led summaries without invented metrics. Full scope and limits live on each service page.',
    services: [
      {
        title: 'Start a Business',
        text: 'Clarity on startup sequencing in Alberta.',
        href: '/services/start-a-business/',
      },
      {
        title: 'Plans & Funding Readiness',
        text: 'Stronger planning documents for funding discussions.',
        href: '/services/business-plans-funding-readiness/',
      },
      {
        title: 'Bookkeeping & Payroll',
        text: 'Practical record-keeping and payroll routines.',
        href: '/services/bookkeeping-payroll/',
      },
      {
        title: 'Growth & Operations',
        text: 'Simple systems and cadence as you grow.',
        href: '/services/growth-operations/',
      },
    ],
    whyHeading: 'Why Ge’ez',
    whyText:
      'We focus on practical support for entrepreneurs in Calgary and Alberta, including newcomers and Black business owners.',
    founder: {
      render: true,
      heading: 'Meet the founder',
      name: 'Saba Teklu',
      role: 'Founder and Director',
      bio: 'Saba Teklu is Founder and Director of Ge’ez Consulting. She supports newcomers, startups, and Black-owned businesses in Calgary and Alberta with clear, practical guidance.',
      href: '/about-saba/',
      linkLabel: 'About Saba',
      image: {
        src: '/media/founder/saba-teklu.jpg',
        width: 720,
        height: 900,
        alt: 'Portrait of Saba Teklu, Founder and Director of Ge’ez Consulting',
      },
    },
    testimonials: {
      render: true,
      heading: 'What clients share',
      intro:
        'Reflections from geezconsulting.com. Quotes are client voices—individual experiences vary.',
      items: [
        {
          quote:
            'Working with Saba has been a game-changer for our business. Her expertise provided valuable insights and guidance that helped us navigate complex challenges and capitalize on opportunities. We\'ve seen significant improvements in our operations, profitability, and overall business performance.',
          name: 'Yonas Hila',
          org: 'Jonas Driving School',
          photo: {
            src: '/media/reviews/yonas-profile.png',
            width: 488,
            height: 488,
            alt: 'Portrait of Yonas Hila',
          },
          logo: {
            src: '/media/reviews/jonas-driving-school.png',
            width: 200,
            height: 80,
            alt: 'Jonas Driving School logo',
          },
        },
        {
          quote:
            'Saba has been pivotal in helping us understand how the bank (BDC) system works and has taken us every step of the loan process to make sure it succeeds. She had good knowledge of the business environment in Canada and we received valuable advice.',
          name: 'Yordanos Tewoldebrahan',
          org: 'US1 General Import Export and Wholesale INC',
          photo: {
            src: '/media/reviews/yordanos-profile.jpg',
            width: 998,
            height: 998,
            alt: 'Portrait of Yordanos Tewoldebrahan',
          },
          logo: {
            src: '/media/reviews/us1-logo.png',
            width: 200,
            height: 80,
            alt: 'US1 General Import Export and Wholesale logo',
          },
        },
        {
          quote:
            'We are extremely pleased with the services Ge\'ez Consulting provided for us. Saba\'s professional expertise and assistance in setting up Ashu Africa Import Export LTD was invaluable. Saba helped our company\'s goal reach to a higher result and exceeded our expectatons.',
          name: 'Ashenafi Kassi',
          org: 'Ashu Africa Import Export LTD',
          photo: {
            src: '/media/reviews/ashenafi-profile.png',
            width: 400,
            height: 400,
            alt: 'Portrait of Ashenafi Kassi',
          },
          logo: {
            src: '/media/reviews/ashu-africa-logo.png',
            width: 200,
            height: 80,
            alt: 'Ashu Africa Import Export LTD logo',
          },
        },
      ],
    },
    faqHeading: 'Common questions',
    faqIntro: 'Straight answers—especially about what we do not promise.',
    faqs: [
      {
        q: 'What services do you offer?',
        a: 'Support spans new business registration assistance, business-plan writing, bookkeeping and payroll for smaller teams, growth and expansion guidance, and technology integration through a partner when appropriate. Each service page lists scope and limits.',
      },
      {
        q: 'Can you guarantee a loan, grant, or registration?',
        a: 'No. We help with planning and readiness. Approvals belong to lenders, programs, and authorities.',
      },
      {
        q: 'Do you give legal, tax, or immigration advice?',
        a: 'No. We provide business advisory support and encourage qualified professionals for legal, tax, or immigration matters.',
      },
      {
        q: 'How does pricing work?',
        a: 'Every engagement is scoped to your needs. Contact us for a conversation and quote—we do not publish fixed package prices here.',
      },
      {
        q: 'What about timelines and availability?',
        a: 'We discuss mutually acceptable timelines based on your situation and capacity. No fixed turnaround SLA is published until verified.',
      },
      {
        q: 'What languages does this website support?',
        a: 'English, Amharic, and Tigrinya—each as a full journey, not a partial translation.',
      },
      {
        q: 'What should I avoid sending in the contact form?',
        a: 'Do not include SIN, banking passwords, full card numbers, or immigration file numbers.',
      },
    ],
    finalHeading: 'Ready to talk through your next step?',
    finalText: 'Request a Fit Call. We will respond when we can—without a published response SLA until one is verified.',
    finalCta: 'Book a Fit Call',
    footerLegalNote:
      'Consulting and preparation support is not legal, tax, accounting, immigration, registry, funding, or lender decision-making.',
    footerLegalHeading: 'Legal',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
    footerDisclaimers: 'Disclaimers',
    techSupportLabel: 'Technology Support',
    clientResultsLabel: 'Client Results',
  },
  am: {
    brand: "Ge'ez Consulting",
    slogan: 'ከወረቀት በላይ',
    sloganSupport: 'ለመንገዱ ግልጽ ምክር—ያለ የተረጋገጠ ውጤት ዋስትና።',
    skip: 'ወደ ይዘት ዝለል',
    skipIntro: 'መግቢያን ዝለል',
    menuLabel: 'ምናሌ',
    langAria: 'ቋንቋ',
    primaryNavAria: 'ዋና ምናሌ',
    seoTitle: 'በካልጋሪ የንግድ ማስጀመር እና እድገት ድጋፍ',
    ctaPrimary: 'ያግኙን',
    ctaSecondary: 'አገልግሎት ይምረጡ',
    heroH1: 'በካልጋሪ እና አልበርታ ለንግድ ባለቤቶች የንግድ ማስጀመሪያ እና እድገት ድጋፍ',
    heroLead:
      'ለአዲስ መጤ እና ጥቁር ንግድ ባለቤቶች ግልጽ የሚቀጥሉ እርምጃዎች—ያለ የብድር፣ የእርዳታ ወይም የሕግ ውጤት ዋስትና።',
    heroReassure:
      'የፋይናንስ፣ ምዝገባ፣ ኢሚግሬሽን፣ ግብር ወይም የሕግ ውጤቶችን አንረጋገጥም። ውሳኔዎች የእርስዎ ናቸው።',
    logo: {
      src: '/media/logo/geez-wordmark-light.png',
      width: 220,
      height: 80,
      alt: "Ge'ez Consulting",
    },
    logoMark: {
      src: '/media/logo/geez-mark-192.png',
      width: 40,
      height: 40,
      alt: '',
    },
    heroImageOmitted: false,
    heroImage: {
      src: '/media/founder/saba-teklu.jpg',
      width: 900,
      height: 1125,
      alt: 'ሳባ ተክሉ፣ የግዕዝ ኮንሰልቲንግ መስራች እና ዳይሬክተር',
    },
    audience: [
      { label: 'አዲስ መጤዎች', text: 'የካናዳ ስርዓቶችን ወደ ተግባራዊ ቅደም ተከተል ይቀይሩ።' },
      { label: 'ጥቁር ባለቤትነት ያላቸው ንግዶች', text: 'አውድዎን የሚያከብር ድጋፍ።' },
      { label: 'ካልጋሪ እና አልበርታ', text: 'ለምዝገባ፣ እቅድ እና እድገት የአካባቢ እውቀት።' },
    ],
    trust: {
      render: true,
      heading: 'የደንበኛ አስተያየቶች',
      note: 'ከ geezconsulting.com የተገኙ ጥቅሶች። ውጤቶች አይረጋገጡም።',
      logos: [
        {
          src: '/media/logo/geez-mark-192.png',
          alt: "Ge'ez Consulting",
          width: 56,
          height: 56,
        },
      ],
    },
    socialsAria: 'Ge’ez Consulting ማህበራዊ ሚዲያ',
    socials: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/geez-consulting/',
      },
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/geezconsulting',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://www.instagram.com/geez.consulting',
      },
      {
        id: 'youtube',
        label: 'YouTube',
        href: 'https://www.youtube.com/@geez.consulting',
      },
    ],
    pathwaysHeading: 'አሁን የት ነዎት?',
    pathwaysIntro: 'ከደረጃዎ ጋር የሚስማማውን መንገድ ይምረጡ።',
    pathways: [
      {
        id: 'start',
        title: 'ንግድ ማስጀመር',
        text: 'በአልበርታ ለማስጀመር ቅደም ተከተልን ያስሱ።',
        href: '/am/services/start-a-business/',
        mediaClass: 'start',
      },
      {
        id: 'funding',
        title: 'እቅድ እና የፋይናንስ ዝግጁነት',
        text: 'ለፋይናንስ ውይይቶች የእቅድ ቁሳቁስ ያዘጋጁ።',
        href: '/am/services/business-plans-funding-readiness/',
        mediaClass: 'funding',
      },
      {
        id: 'books',
        title: 'መዝገብ እና የደመወዝ ክፍያ',
        text: 'ግልጽ የመዝገብ እና የደመወዝ ልማዶች።',
        href: '/am/services/bookkeeping-payroll/',
        mediaClass: 'books',
      },
      {
        id: 'grow',
        title: 'እድገት እና ክወና',
        text: 'ቀላል የአሰራር ስርዓቶች።',
        href: '/am/services/growth-operations/',
        mediaClass: 'grow',
      },
    ],
    caseStudy: { render: false },
    processHeading: 'የFit Call መንገድ',
    processIntro: 'የድረ-ገጽ መንገድ ነው—የንግድ ውጤት ዋስትና አይደለም።',
    process: [
      { title: 'ደረጃዎን ያጋሩ', text: 'የት እንዳሉ እና ምን ማብራሪያ እንደሚፈልጉ ይንገሩን።' },
      { title: 'መንገድ ያዛምዱ', text: 'ተስማሚውን የአገልግሎት ገጽ እናሳይዎታለን።' },
      { title: 'ያግኙን', text: 'በቅጹ ጥሪ ይጠይቁ። የምላሽ ጊዜ እስከ ማረጋገጫ ድረስ አይታወቅም።' },
    ],
    servicesHeading: 'አገልግሎቶች',
    servicesIntro: 'ያለ የተፈጠሩ ቁጥሮች አጭር ማጠቃለያ።',
    services: [
      {
        title: 'ንግድ ማስጀመር',
        text: 'በአልበርታ የማስጀመሪያ ቅደም ተከተል።',
        href: '/am/services/start-a-business/',
      },
      {
        title: 'እቅድ እና የፋይናንስ ዝግጁነት',
        text: 'ለፋይናንስ ውይይት ጠንካራ እቅድ።',
        href: '/am/services/business-plans-funding-readiness/',
      },
      {
        title: 'መዝገብ እና የደመወዝ ክፍያ',
        text: 'ተግባራዊ የመዝገብ ልማዶች።',
        href: '/am/services/bookkeeping-payroll/',
      },
      {
        title: 'እድገት እና ክወና',
        text: 'ቀላል ስርዓቶች።',
        href: '/am/services/growth-operations/',
      },
    ],
    whyHeading: 'ግዕዝ ለምን',
    whyText:
      'በካልጋሪ እና አልበርታ ላይ ላሉ ንግድ ባለቤቶች ተግባራዊ ድጋፍ።',
    founder: {
      render: true,
      heading: 'ስለ መስራቹ',
      name: 'ሳባ ተክሉ',
      role: 'መስራች እና ዳይሬክተር',
      bio: 'ሳባ ተክሉ የግዕዝ ኮንሰልቲንግ መስራች እና ዳይሬክተር ናቸው። አዲስ ስደተኞችን፣ አዳዲስ ንግዶችን እና የጥቁር ማህበረሰብ ንግዶችን በካልጋሪ እና አልበርታ ይደግፋሉ።',
      href: '/am/about-saba/',
      linkLabel: 'ስለኛ',
      image: {
        src: '/media/founder/saba-teklu.jpg',
        width: 720,
        height: 900,
        alt: 'ሳባ ተክሉ፣ የግዕዝ ኮንሰልቲንግ መስራች',
      },
    },
    testimonials: {
      render: true,
      heading: 'የደንበኛ ድምጾች',
      intro: 'ከ geezconsulting.com — እንግሊዝኛ ጥቅሶች። ውጤት ዋስትና አይደለም።',
      items: [
        {
          quote:
            'Working with Saba has been a game-changer for our business. Her expertise provided valuable insights and guidance that helped us navigate complex challenges and capitalize on opportunities. We\'ve seen significant improvements in our operations, profitability, and overall business performance.',
          name: 'Yonas Hila',
          org: 'Jonas Driving School',
        },
        {
          quote:
            'Saba has been pivotal in helping us understand how the bank (BDC) system works and has taken us every step of the loan process to make sure it succeeds. She had good knowledge of the business environment in Canada and we received valuable advice.',
          name: 'Yordanos Tewoldebrahan',
          org: 'US1 General Import Export and Wholesale INC',
        },
        {
          quote:
            'We are extremely pleased with the services Ge\'ez Consulting provided for us. Saba\'s professional expertise and assistance in setting up Ashu Africa Import Export LTD was invaluable. Saba helped our company\'s goal reach to a higher result and exceeded our expectatons.',
          name: 'Ashenafi Kassi',
          org: 'Ashu Africa Import Export LTD',
        },
      ],
    },
    faqHeading: 'ተደጋጋሚ ጥያቄዎች',
    faqIntro: 'ግልጽ መልሶች—በተለይ ምን እንደማንረጋገጥ።',
    faqs: [
      {
        q: 'ምን አገልግሎቶች ትሰጣላችሁ?',
        a: 'ምዝገባ ድጋፍ፣ የንግድ እቅድ፣ መዝገብ/ደመወዝ፣ እድገት መመሪያ እና ቴክኖሎጂ ውህደት (በአጋር)። ዝርዝር በእያንዳንዱ ገጽ።',
      },
      {
        q: 'ብድር፣ እርዳታ ወይም ምዝገባ ማረጋገጥ ትችላላችሁ?',
        a: 'አይደለም። ለዝግጅት እንረዳለን። ውሳኔዎች የባለሥልጣናት ናቸው።',
      },
      {
        q: 'የሕግ፣ ግብር ወይም ኢሚግሬሽን ምክር ትሰጣላችሁ?',
        a: 'አይደለም። የንግድ ድጋፍ ነው፤ ለሕግ/ግብር/ኢሚግሬሽን ብቁ ባለሙያ ይጠይቁ።',
      },
      {
        q: 'ዋጋ እንዴት ነው?',
        a: 'እያንዳንዱ ሥራ በፍላጎትዎ ይዘጋጃል። ለውይይት ያግኙን—ቋሚ ዋጋ እዚህ አልታተመም።',
      },
      {
        q: 'ድረ-ገጹ ምን ቋንቋዎችን ይደግፋል?',
        a: 'እንግሊዝኛ፣ አማርኛ እና ትግርኛ—እያንዳንዱ ሙሉ ጉዞ።',
      },
      {
        q: 'በቅጹ ምን ማስገባት የለብኝም?',
        a: 'SIN፣ የባንክ የይለፍ ቃል፣ ሙሉ ካርድ ቁጥር ወይም የኢሚግሬሽን ፋይል ቁጥር አያስገቡ።',
      },
    ],
    finalHeading: 'ቀጣዩን እርምጃ ለመወያየት ዝግጁ ነዎት?',
    finalText: 'Fit Call ይጠይቁ። የምላሽ SLA እስከ ማረጋገጫ ድረስ አይታተምም።',
    finalCta: 'ያግኙን',
    footerLegalNote: 'ይህ ጣቢያ የሕግ፣ ግብር፣ ሂሳብ ወይም ኢሚግሬሽን ምክር አይደለም።',
    footerLegalHeading: 'ሕጋዊ',
    footerPrivacy: 'ግላዊነት',
    footerTerms: 'ውሎች',
    footerDisclaimers: 'ማስተባበያዎች',
    techSupportLabel: 'የቴክኖሎጂ ድጋፍ',
    clientResultsLabel: 'የደንበኛ ውጤቶች',
  },
  ti: {
    brand: "Ge'ez Consulting",
    slogan: 'ካብ ወረቐት ልዕሊ',
    sloganSupport: 'ንመንገዲ ግልጺ ምኽሪ—ብዘይ ዋሕስ ውጽኢት።',
    skip: 'ናብ ትሕዝቶ ዝለል',
    skipIntro: 'መእተዊ ዝለል',
    menuLabel: 'ዝርዝር',
    langAria: 'ቋንቋ',
    primaryNavAria: 'ቀንዲ ዝርዝር',
    seoTitle: 'ኣብ ካልጋሪ ንግዲ ምጅማርን ዕብየትን ድጋፍ',
    ctaPrimary: 'ኣድራሻ',
    ctaSecondary: 'ኣገልግሎት ምረጽ',
    heroH1: 'ንካልጋሪን ኣልበርታን ንግዲ ዋናታት ድጋፍ ምጅማርን ዕብየትን',
    heroLead:
      'ንሓደስቲ መጻእቲን ጸሊም ንግዲ ዋናታትን ግልጺ ስጉምትታት—ብዛዕባ ብድር፣ ዕርዳታ ወይ ሕጊ ውጽኢት ዋሕስ የለን።',
    heroReassure:
      'ፋይናንስ፣ ምዝገባ፣ ኢሚግረሽን፣ ግብሪ ወይ ሕጋዊ ውጽኢታት ኣይንረጋገጽን። ውሳኔታት ናትኩም እዩ።',
    logo: {
      src: '/media/logo/geez-wordmark-light.png',
      width: 220,
      height: 80,
      alt: "Ge'ez Consulting",
    },
    logoMark: {
      src: '/media/logo/geez-mark-192.png',
      width: 40,
      height: 40,
      alt: '',
    },
    heroImageOmitted: false,
    heroImage: {
      src: '/media/founder/saba-teklu.jpg',
      width: 900,
      height: 1125,
      alt: 'ሳባ ተክሉ፣ መስራቲትን ዳይረክተርን ግዕዝ ኮንሰልቲንግ',
    },
    audience: [
      { label: 'ሓደስቲ መጻእቲ', text: 'ናይ ካናዳ ስርዓታት ናብ ተግባራዊ ተኸታታሊ ቀይሩ።' },
      { label: 'ጸሊም ባለቤትነት ዘለዎም ንግድታት', text: 'ኩነታትኩም ዝኽብር ድጋፍ።' },
      { label: 'ካልጋሪን ኣልበርታን', text: 'ንምዝገባ፣ ውጥንን ዕብየትን ናይ ከባቢ ፍልጠት።' },
    ],
    trust: {
      render: true,
      heading: 'ናይ ዓሚላት ርእይቶታት',
      note: 'ካብ geezconsulting.com ዝመጹ ጥቕስታት። ውጽኢታት ኣይረጋገጹን።',
      logos: [
        {
          src: '/media/logo/geez-mark-192.png',
          alt: "Ge'ez Consulting",
          width: 56,
          height: 56,
        },
      ],
    },
    socialsAria: 'Ge’ez Consulting ማሕበራዊ ሚድያ',
    socials: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/geez-consulting/',
      },
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/geezconsulting',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        href: 'https://www.instagram.com/geez.consulting',
      },
      {
        id: 'youtube',
        label: 'YouTube',
        href: 'https://www.youtube.com/@geez.consulting',
      },
    ],
    pathwaysHeading: 'ሕጂ ኣበየናይ ደረጃ ኣለኹም?',
    pathwaysIntro: 'ምስ ደረጃኹም ዝሰማማእ መንገዲ ምረጹ።',
    pathways: [
      {
        id: 'start',
        title: 'ንግዲ ምጅማር',
        text: 'ኣብ ኣልበርታ ንምጅማር ተኸታታሊ ስርዓት ኣስሱ።',
        href: '/ti/services/start-a-business/',
        mediaClass: 'start',
      },
      {
        id: 'funding',
        title: 'ውጥንን ፋይናንስ ድልዱልነትን',
        text: 'ንፋይናንስ ዝርርብ ውጥን ኣዳልዩ።',
        href: '/ti/services/business-plans-funding-readiness/',
        mediaClass: 'funding',
      },
      {
        id: 'books',
        title: 'መዝገብን ደሞዝን',
        text: 'ንጹር መዝገብን ደሞዝ ልምድታት።',
        href: '/ti/services/bookkeeping-payroll/',
        mediaClass: 'books',
      },
      {
        id: 'grow',
        title: 'ዕብየትን ኣሰራርሓን',
        text: 'ቀሊል ናይ ኣሰራርሓ ስርዓታት።',
        href: '/ti/services/growth-operations/',
        mediaClass: 'grow',
      },
    ],
    caseStudy: { render: false },
    processHeading: 'ናይ Fit Call መንገዲ',
    processIntro: 'ናይ ወብሳይት መንገዲ እዩ—ናይ ንግዲ ውጽኢት ዋሕስ ኣይኮነን።',
    process: [
      { title: 'ደረጃኹም ኣካፍሉ', text: 'ኣበየናይ ከምዘለኹምን እንታይ ከምዘድልየኩምን ንገሩና።' },
      { title: 'መንገዲ ኣዛምዱ', text: 'ዝሰማማእ ኣገልግሎት ገጽ ንመርሕ።' },
      { title: 'ኣድራሻ', text: 'ብፎርም ጻውዒት ሕተቱ። ናይ መልሲ ግዜ ክሳብ ምርግጋጽ ኣይፍለጥን።' },
    ],
    servicesHeading: 'ኣገልግሎታት',
    servicesIntro: 'ብዘይ ዝተፈጥረ ቁጽሪ ሓጺር መግለጺ።',
    services: [
      {
        title: 'ንግዲ ምጅማር',
        text: 'ኣብ ኣልበርታ ናይ ምጅማር ተኸታታሊ።',
        href: '/ti/services/start-a-business/',
      },
      {
        title: 'ውጥንን ፋይናንስ ድልዱልነትን',
        text: 'ንፋይናንስ ዝርርብ ጽኑዕ ውጥን።',
        href: '/ti/services/business-plans-funding-readiness/',
      },
      {
        title: 'መዝገብን ደሞዝን',
        text: 'ተግባራዊ መዝገብ ልምድታት።',
        href: '/ti/services/bookkeeping-payroll/',
      },
      {
        title: 'ዕብየትን ኣሰራርሓን',
        text: 'ቀሊል ስርዓታት።',
        href: '/ti/services/growth-operations/',
      },
    ],
    whyHeading: 'ግዕዝ ስለምንታይ',
    whyText: 'ኣብ ካልጋሪን ኣልበርታን ንንግዲ ዋናታት ተግባራዊ ድጋፍ።',
    founder: {
      render: true,
      heading: 'ብዛዕባ መስራቲት',
      name: 'ሳባ ተክሉ',
      role: 'መስራቲትን ዳይረክተርን',
      bio: 'ሳባ ተክሉ መስራቲትን ዳይረክተርን ግዕዝ ኮንሰልቲንግ እያ። ንሓደስቲ ስደተኛታት፣ ሓደስቲ ንግድታትን ናይ ጸሊም ማሕበረሰብ ንግድታትን ኣብ ካልጋሪን ኣልበርታን ትድግፍ።',
      href: '/ti/about-saba/',
      linkLabel: 'ብዛዕባና',
      image: {
        src: '/media/founder/saba-teklu.jpg',
        width: 720,
        height: 900,
        alt: 'ሳባ ተክሉ፣ መስራቲት ግዕዝ ኮንሰልቲንግ',
      },
    },
    testimonials: {
      render: true,
      heading: 'ናይ ዓሚላት ድምጽታት',
      intro: 'ካብ geezconsulting.com — እንግሊዝኛ ጥቕስታት። ውጽኢት ዋሕስ ኣይኮነን።',
      items: [
        {
          quote:
            'Working with Saba has been a game-changer for our business. Her expertise provided valuable insights and guidance that helped us navigate complex challenges and capitalize on opportunities. We\'ve seen significant improvements in our operations, profitability, and overall business performance.',
          name: 'Yonas Hila',
          org: 'Jonas Driving School',
        },
        {
          quote:
            'Saba has been pivotal in helping us understand how the bank (BDC) system works and has taken us every step of the loan process to make sure it succeeds. She had good knowledge of the business environment in Canada and we received valuable advice.',
          name: 'Yordanos Tewoldebrahan',
          org: 'US1 General Import Export and Wholesale INC',
        },
        {
          quote:
            'We are extremely pleased with the services Ge\'ez Consulting provided for us. Saba\'s professional expertise and assistance in setting up Ashu Africa Import Export LTD was invaluable. Saba helped our company\'s goal reach to a higher result and exceeded our expectatons.',
          name: 'Ashenafi Kassi',
          org: 'Ashu Africa Import Export LTD',
        },
      ],
    },
    faqHeading: 'ተደጋጋሚ ሕቶታት',
    faqIntro: 'ቀጥታ መልስታት—ብፍላይ እንታይ ከምዘይንረጋገጽ።',
    faqs: [
      {
        q: 'እንታይ ኣገልግሎታት ትህቡ?',
        a: 'ምዝገባ ድጋፍ፣ ንግዲ ውጥን፣ መዝገብ/ደሞዝ፣ ዕብየት መምርሒን ቴክኖሎጂ ውህደትን። ዝርዝር ኣብ ነፍሲ ወከፍ ገጽ።',
      },
      {
        q: 'ብድር፣ ዕርዳታ ወይ ምዝገባ ክትረጋግጹ ትኽእሉ ዲኹም?',
        a: 'ኣይፋል። ንድልዱልነት ንሕግዝ። ውሳኔታት ናይ ትካላት እዩ።',
      },
      {
        q: 'ሕጋዊ፣ ግብሪ ወይ ኢሚግረሽን ምኽሪ ትህቡ ዲኹም?',
        a: 'ኣይፋል። ናይ ንግዲ ድጋፍ እዩ፤ ንሕጊ/ግብሪ/ኢሚግረሽን ብቑዕ ክኢላ ሕተቱ።',
      },
      {
        q: 'ዋጋ ከመይ እዩ?',
        a: 'ነፍሲ ወከፍ ስራሕ ምስ ድሌትኩም ይዳሎ። ንዝርርብ ርኸቡና—ቐዋሚ ዋጋ ኣብዚ ኣይተሓትመን።',
      },
      {
        q: 'እዚ ወብሳይት እንታይ ቋንቋታት ይድግፍ?',
        a: 'እንግሊዝኛ፣ ኣምሓርኛን ትግርኛን—ነፍሲ ወከፍ ምሉእ ጉዕዞ።',
      },
      {
        q: 'ኣብ ፎርም እንታይ ኣይእቱን?',
        a: 'SIN፣ ናይ ባንኪ መሕለፊ ቃል፣ ምሉእ ካርድ ቁጽሪ ወይ ኢሚግረሽን ፋይል ቁጽሪ ኣይእቱ።',
      },
    ],
    finalHeading: 'ናይቲ ዝቕጽል ስጉምቲ ክትዛረቡ ድሉዋት ዲኹም?',
    finalText: 'Fit Call ሕተቱ። ናይ መልሲ SLA ክሳብ ምርግጋጽ ኣይሕተምን።',
    finalCta: 'ኣድራሻ',
    footerLegalNote: 'እዚ ገጽ ሕጋዊ፣ ግብሪ፣ ሕሳብ ወይ ኢሚግረሽን ምኽሪ ኣይኮነን።',
    footerLegalHeading: 'ሕጋዊ',
    footerPrivacy: 'ብሕታውነት',
    footerTerms: 'ውዕላት',
    footerDisclaimers: 'መግለጺታት',
    techSupportLabel: 'ናይ ቴክኖሎጂ ድጋፍ',
    clientResultsLabel: 'ናይ ዓሚል ውጽኢታት',
  },
};
