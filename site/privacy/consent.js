/**
 * Browser consent gate for non-essential scripts (analytics, marketing, embeds).
 * Essential scripts (locale preference, forms) are not gated.
 * Not legal advice — see docs/geez-redesign/privacy-review.md.
 */
(function () {
  var STORAGE_KEY = 'geez_script_consent_v1';
  var VERSION = '2026-09-18.1';
  var BANNER_ID = 'geez-consent-banner';

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          version: VERSION,
          analytics: false,
          marketing: false,
          embedded: false,
          updatedAt: null,
        };
      }
      var data = JSON.parse(raw);
      return {
        version: String(data.version || VERSION),
        analytics: Boolean(data.analytics),
        marketing: Boolean(data.marketing),
        embedded: Boolean(data.embedded),
        updatedAt: data.updatedAt || null,
      };
    } catch (e) {
      return {
        version: VERSION,
        analytics: false,
        marketing: false,
        embedded: false,
        updatedAt: null,
      };
    }
  }

  function writeConsent(partial) {
    var next = Object.assign(readConsent(), partial, {
      version: VERSION,
      updatedAt: new Date().toISOString(),
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      /* private mode */
    }
    return next;
  }

  function categoryAllowed(consent, category) {
    if (category === 'essential') return true;
    return Boolean(consent[category]);
  }

  /**
   * Activate blocked script tags: type="text/plain" data-geez-consent="analytics|marketing|embedded"
   */
  function activateScripts(consent) {
    var nodes = document.querySelectorAll(
      'script[type="text/plain"][data-geez-consent]',
    );
    nodes.forEach(function (node) {
      var category = node.getAttribute('data-geez-consent') || '';
      if (!categoryAllowed(consent, category)) return;
      var s = document.createElement('script');
      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        if (attr.name === 'type' || attr.name === 'data-geez-consent') continue;
        s.setAttribute(attr.name, attr.value);
      }
      s.type = node.getAttribute('data-geez-type') || 'text/javascript';
      if (node.src) s.src = node.src;
      else s.textContent = node.textContent;
      node.parentNode.replaceChild(s, node);
    });
  }

  function dismissBanner() {
    var el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }

  function showBannerIfNeeded(consent) {
    if (consent.updatedAt) return;
    if (document.getElementById(BANNER_ID)) return;
    /* Banner only when a page ships gated non-essential scripts. */
    if (!document.querySelector('script[type="text/plain"][data-geez-consent]')) {
      return;
    }

    var bar = document.createElement('div');
    bar.id = BANNER_ID;
    bar.className = 'geez-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Optional cookies and scripts');
    bar.removeAttribute('aria-modal');
    bar.innerHTML =
      '<div class="geez-consent__inner geez-container">' +
      '<p>We use essential storage for language preference and form function. Optional analytics or marketing tools stay off until you choose.</p>' +
      '<p class="geez-consent__actions">' +
      '<button type="button" class="geez-btn-link" data-consent-essential>Essential only</button> ' +
      '<button type="button" class="geez-text-btn" data-consent-analytics>Allow analytics</button> ' +
      '<a class="geez-text-btn" href="' +
      (function () {
        var meta = document.querySelector('meta[name="geez-base-path"]');
        var base = meta ? meta.getAttribute('content') || '' : '';
        return base ? base + '/privacy/' : '/privacy/';
      })() +
      '">Privacy</a>' +
      '</p></div>';
    document.body.appendChild(bar);

    bar
      .querySelector('[data-consent-essential]')
      ?.addEventListener('click', function () {
        var c = writeConsent({
          analytics: false,
          marketing: false,
          embedded: false,
        });
        activateScripts(c);
        dismissBanner();
      });
    bar
      .querySelector('[data-consent-analytics]')
      ?.addEventListener('click', function () {
        var c = writeConsent({
          analytics: true,
          marketing: false,
          embedded: false,
        });
        activateScripts(c);
        dismissBanner();
      });
  }

  var consent = readConsent();
  activateScripts(consent);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      showBannerIfNeeded(readConsent());
    });
  } else {
    showBannerIfNeeded(consent);
  }

  window.GeezConsent = {
    read: readConsent,
    write: writeConsent,
    activate: activateScripts,
    version: VERSION,
  };
})();
