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
    sloganSupport:
      'Expert advice and guidance to help you navigate challenges, capitalize on opportunities, and improve overall business performance.',
    skip: 'Skip to content',
    skipIntro: 'Skip intro',
    menuLabel: 'Menu',
    langAria: 'Language',
    primaryNavAria: 'Primary',
    seoTitle: 'Business launch and growth support in Calgary',
    ctaPrimary: 'Book a Fit Call',
    ctaSecondary: 'Find the right service',
    heroH1: 'Working for your company’s future',
    heroLead:
      'Whether you are a startup looking to scale or an established organization seeking to optimize performance, Ge’ez Consulting provides expert advice and guidance to help you achieve your strategic objectives.',
    heroReassure:
      'We serve newcomers, startups, and Black-owned businesses in Calgary and Alberta—with clear counsel that is not a substitute for legal, tax, or immigration advice.',
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
        text: 'Guidance rooted in the unique needs of immigrant entrepreneurs building a life and a business in Canada.',
      },
      {
        label: 'Black-owned businesses',
        text: 'Dedicated support for startups and established businesses within the Black community.',
      },
      {
        label: 'Calgary & Alberta',
        text: 'Local counsel for registration, planning, books, growth, and day-to-day business decisions.',
      },
    ],
    trust: {
      render: true,
      heading: 'Client reflections',
      note: 'What clients share on geezconsulting.com. Individual experiences vary.',
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
    pathwaysIntro:
      'From strategy to implementation, choose the path that matches your stage. Each service page explains how we help.',
    pathways: [
      {
        id: 'start',
        title: 'Start a Business',
        text: 'New business registration assistance and launch sequencing for Alberta.',
        href: '/services/start-a-business/',
        mediaClass: 'start',
      },
      {
        id: 'funding',
        title: 'Plans & Funding Readiness',
        text: 'Business plan writing and planning materials for funding conversations.',
        href: '/services/business-plans-funding-readiness/',
        mediaClass: 'funding',
      },
      {
        id: 'books',
        title: 'Bookkeeping & Payroll',
        text: 'Bookkeeping and payroll support for teams of up to 10 employees.',
        href: '/services/bookkeeping-payroll/',
        mediaClass: 'books',
      },
      {
        id: 'grow',
        title: 'Growth & Operations',
        text: 'Guidance on growth opportunities, expansion, and stronger day-to-day operations.',
        href: '/services/growth-operations/',
        mediaClass: 'grow',
      },
    ],
    caseStudy: { render: false, reason: 'No approved case study' },
    processHeading: 'How a fit call works',
    processIntro: 'A simple path to start the conversation—then we scope work that fits your needs and budget.',
    process: [
      { title: 'Share your stage', text: 'Tell us where you are and what you need clarified.' },
      {
        title: 'Match a service path',
        text: 'We point you to the service that fits—or say when we are not the right partner.',
      },
      {
        title: 'Book a Fit Call',
        text: 'Request a conversation. We are committed to being responsive by email, phone, or virtual meeting.',
      },
    ],
    servicesHeading: 'Services at a glance',
    servicesIntro:
      'Ge’ez Consulting offers tailored services—from strategy to implementation—so you can navigate consulting with confidence.',
    services: [
      {
        title: 'Start a Business',
        text: 'New business registration assistance and startup sequencing in Alberta.',
        href: '/services/start-a-business/',
      },
      {
        title: 'Plans & Funding Readiness',
        text: 'Business plan writing and funding-readiness materials.',
        href: '/services/business-plans-funding-readiness/',
      },
      {
        title: 'Bookkeeping & Payroll',
        text: 'Bookkeeping and payroll for teams of up to 10 employees.',
        href: '/services/bookkeeping-payroll/',
      },
      {
        title: 'Growth & Operations',
        text: 'Guidance on growth opportunities and expansion.',
        href: '/services/growth-operations/',
      },
    ],
    whyHeading: 'Why Ge’ez',
    whyText:
      'Our personalized approach, industry expertise, and track record of supporting entrepreneurs make Ge’ez Consulting a strong partner for your business—especially newcomers, startups, and Black-owned businesses in Calgary and Alberta.',
    founder: {
      render: true,
      heading: 'Meet the founder',
      name: 'Saba Teklu',
      role: 'Founder and Director',
      bio: 'Saba is a dedicated professional who has devoted her career to aiding individuals and contributing positively to the entrepreneurial landscape—with a focus on newcomers, startups, and Black-owned businesses.',
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
      intro: 'Client reflections published on geezconsulting.com. Individual experiences vary.',
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
    faqIntro: 'Straight answers drawn from how Ge’ez Consulting presents its work.',
    faqs: [
      {
        q: 'What services do you offer?',
        a: 'Our services are tailored to new business registration assistance; business plan writing; bookkeeping and payroll for up to 10 employees; guidance on growth opportunities and expansion; and specialized expertise in digital adoption and technology integration through our technology partner.',
      },
      {
        q: 'How does pricing work?',
        a: 'Our prices are competitive and reasonable. Because every client’s needs are unique, we customize pricing to fit your requirements. Contact us for a free quote.',
      },
      {
        q: 'What about timelines and availability?',
        a: 'Ge’ez Consulting is happy to discuss a scope of work with mutually acceptable timelines based on your unique needs and budget. Contact us for a free consultation.',
      },
      {
        q: 'Do you have references from previous clients?',
        a: 'We are proud of the relationships we have built with our clients, and we would be happy to provide references upon request.',
      },
      {
        q: 'How do you communicate and support clients?',
        a: 'Communication is key to our success. Whether through email, phone calls, or virtual meetings, we are here to address questions or concerns during and after the project.',
      },
      {
        q: 'Do you give legal, tax, or immigration advice?',
        a: 'No. We provide business consulting and preparation support. Engage a regulated professional for legal, tax, CPA, or immigration matters.',
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
    finalHeading: 'Contact us for a consultation',
    finalText:
      'Request a Fit Call to talk through your next step. We customize scope and pricing to your needs—and welcome you to ask for a free quote.',
    finalCta: 'Book a Fit Call',
    footerLegalNote:
      'Consulting and preparation support is not legal, tax, accounting, immigration, registry, funding, or lender decision-making.',
    footerLegalHeading: 'Legal',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
    footerDisclaimers: 'Disclaimers',
    footerContactHeading: 'Contact',
    footerAddress: '5235 28 Ave SE, Calgary, AB',
    footerEmail: 'info@geezconsulting.com',
    footerPhone: '1 (403) 700-2065',
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
    footerContactHeading: 'Contact',
    footerAddress: '5235 28 Ave SE, Calgary, AB',
    footerEmail: 'info@geezconsulting.com',
    footerPhone: '1 (403) 700-2065',
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
    footerContactHeading: 'Contact',
    footerAddress: '5235 28 Ave SE, Calgary, AB',
    footerEmail: 'info@geezconsulting.com',
    footerPhone: '1 (403) 700-2065',
    techSupportLabel: 'ናይ ቴክኖሎጂ ድጋፍ',
    clientResultsLabel: 'ናይ ዓሚል ውጽኢታት',
  },
};
