/** HTML fixtures for primitives. Used by tests; not a public Storybook/route. */

export const buttonPrimary = `<button type="submit" class="geez-btn">Book a Fit Call</button>`;

export const linkButton = `<a class="geez-btn-link geez-btn-link--secondary" href="/services/">Explore services</a>`;

export const header = `<header class="geez-header">
  <a class="geez-skip" href="#main">Skip to content</a>
  <div class="geez-header__inner geez-container">
    <a class="geez-header__brand" href="/">Ge'ez Consulting</a>
    <nav class="geez-header__nav" aria-label="Primary">
      <ul>
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li><a href="/resources/">Resources</a></li>
        <li><a href="/about-saba/">About Saba</a></li>
      </ul>
    </nav>
    <nav class="geez-lang" aria-label="Language">
      <ul>
        <li><a href="/" hreflang="en" lang="en" aria-current="true">English</a></li>
        <li><a href="/am/" hreflang="am" lang="am">አማርኛ</a></li>
        <li><a href="/ti/" hreflang="ti" lang="ti">ትግርኛ</a></li>
      </ul>
    </nav>
    <div class="geez-header__cta">
      <a class="geez-btn-link" href="/book-a-fit-call/">Book a Fit Call</a>
    </div>
  </div>
</header>`;

export const footer = `<footer class="geez-footer">
  <div class="geez-container geez-footer__grid">
    <nav aria-label="Services">
      <h2>Services</h2>
      <ul>
        <li><a href="/services/">Overview</a></li>
        <li><a href="/services/start-a-business/">Start a Business</a></li>
      </ul>
    </nav>
    <nav aria-label="Company">
      <h2>Company</h2>
      <ul>
        <li><a href="/about-saba/">About Saba</a></li>
        <li><a href="/resources/">Resources</a></li>
      </ul>
    </nav>
    <nav aria-label="Legal">
      <h2>Legal</h2>
      <ul>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/terms/">Terms</a></li>
        <li><a href="/disclaimers/">Disclaimers</a></li>
      </ul>
    </nav>
  </div>
</footer>`;

export const languageSelector = `<nav class="geez-lang" aria-label="Language">
  <ul>
    <li><a href="/" hreflang="en" lang="en" aria-current="true">English</a></li>
    <li><a href="/am/" hreflang="am" lang="am">አማርኛ</a></li>
    <li><a href="/ti/" hreflang="ti" lang="ti">ትግርኛ</a></li>
  </ul>
</nav>`;

export const card = `<article class="geez-card">
  <h2><a href="/services/start-a-business/">Start a Business</a></h2>
  <p>Launch-ready guidance for opening a business in Alberta.</p>
</article>`;

export const accordion = `<details class="geez-accordion">
  <summary>Can you guarantee a loan or grant?</summary>
  <div class="geez-accordion__panel">
    <p>No. We help with planning and funding readiness. Lenders and programs make their own decisions.</p>
  </div>
</details>`;

export const formField = `<div class="geez-field">
  <label for="geez-email">Email</label>
  <p id="geez-email-hint" class="geez-field__hint">We use this only to reply.</p>
  <input id="geez-email" name="email" type="email" autocomplete="email" required aria-describedby="geez-email-hint geez-email-error">
  <p id="geez-email-error" class="geez-field__error" hidden>Enter a valid email.</p>
</div>`;

export const errorSummary = `<div class="geez-error-summary" role="alert" tabindex="-1">
  <h2>There is a problem</h2>
  <ul>
    <li><a href="#geez-email">Enter a valid email</a></li>
  </ul>
</div>`;

export const testimonial = `<figure class="geez-testimonial">
  <blockquote><p>Quote is omitted until permission is approved.</p></blockquote>
  <figcaption>Attribution withheld pending verification.</figcaption>
</figure>`;

export const caseStudyPreview = `<article class="geez-card geez-case-preview">
  <h2><a href="/client-results/example/">Case study title</a></h2>
  <p>Summary is omitted until the case is approved.</p>
</article>`;

export const breadcrumbs = `<nav class="geez-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/services/">Services</a></li>
    <li><span aria-current="page">Start a Business</span></li>
  </ol>
</nav>`;

export const section = `<section class="geez-section" aria-labelledby="services-heading">
  <header class="geez-section__header geez-container">
    <p class="geez-section__kicker">Services</p>
    <h2 id="services-heading">How we can help</h2>
  </header>
  <div class="geez-container"></div>
</section>`;

export const nestedInteractiveAntiPattern = `<button type="button">Outer<button type="button">Inner</button></button>`;

export const allPrimitives = {
  buttonPrimary,
  linkButton,
  header,
  footer,
  languageSelector,
  card,
  accordion,
  formField,
  errorSummary,
  testimonial,
  caseStudyPreview,
  breadcrumbs,
  section,
};
