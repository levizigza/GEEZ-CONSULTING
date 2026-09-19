/**
 * GeezAnalytics — first-party, consent-gated measurement client.
 * Platform: repository-approved first-party sink (no third-party vendor).
 * Requires analytics consent via GeezConsent (data-geez-consent="analytics").
 *
 * Debug: ?geez_debug_analytics=1 or localStorage geez_analytics_debug=1
 *        (console sink; on non-localhost still requires analytics consent).
 */
(function () {
  var SCHEMA_VERSION = '1.0.0';
  var SID_KEY = 'geez_measure_sid_v1';
  var ATTR_KEY = 'geez_measure_attr_v1';
  var DEDUPE_KEY = 'geez_measure_dedupe_v1';
  var DEBUG_KEY = 'geez_analytics_debug';
  var ENDPOINT = '/api/analytics/';

  var VIEW_BY_TYPE = {
    service: 'service_page_view',
    article: 'article_view',
    case_study: 'case_study_view',
  };

  var CTA_ALLOW = {
    header: 1,
    hero: 1,
    footer: 1,
    inline: 1,
    service_body: 1,
    article_body: 1,
    case_study_body: 1,
    finder_result: 1,
    thank_you: 1,
    nav: 1,
    unknown: 1,
  };

  var PROP_ALLOW = {
    article_slug: 1,
    case_study_slug: 1,
    from_locale: 1,
    to_locale: 1,
    recommended_service: 1,
    finder_stage: 1,
    finder_goal: 1,
    help_category: 1,
    business_stage: 1,
    partner_id: 1,
    outbound_host: 1,
    submit_ok: 1,
    deduped: 1,
  };

  /** @type {Array<Record<string, unknown>>} */
  var debugLog = [];
  /** @type {Record<string, number>} */
  var memoryDedupe = {};

  function isDebug() {
    try {
      if (window.__GEEZ_ANALYTICS_DEBUG__ === true) return true;
      if (/[?&]geez_debug_analytics=1(?:&|$)/.test(location.search)) {
        localStorage.setItem(DEBUG_KEY, '1');
        return true;
      }
      return localStorage.getItem(DEBUG_KEY) === '1';
    } catch (e) {
      return Boolean(window.__GEEZ_ANALYTICS_DEBUG__);
    }
  }

  function isLocalhost() {
    var h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }

  function analyticsAllowed() {
    try {
      if (window.GeezConsent && typeof window.GeezConsent.read === 'function') {
        return Boolean(window.GeezConsent.read().analytics);
      }
    } catch (e) {
      /* ignore */
    }
    // Script only activates after consent gate; treat as allowed once running.
    return true;
  }

  function canRun() {
    if (analyticsAllowed()) return true;
    // Local debug without network still needs an explicit debug flag.
    return isDebug() && isLocalhost();
  }

  function readConfig() {
    var el = document.getElementById('geez-measure-config');
    if (!el) return {};
    try {
      return JSON.parse(el.textContent || '{}');
    } catch (e) {
      return {};
    }
  }

  function localeFromDom() {
    var lang = (document.documentElement.lang || 'en').toLowerCase();
    if (lang.indexOf('am') === 0) return 'am';
    if (lang.indexOf('ti') === 0) return 'ti';
    return 'en';
  }

  function pagePath() {
    return (location.pathname || '/').split('?')[0].split('#')[0] || '/';
  }

  function safeCode(v) {
    if (v == null || v === '') return null;
    var s = String(v).slice(0, 80);
    if (!/^[a-z0-9][a-z0-9_./-]{0,79}$/i.test(s)) return null;
    return s;
  }

  function sanitizeProps(props) {
    var out = {};
    if (!props || typeof props !== 'object') return out;
    for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      if (!PROP_ALLOW[k]) continue;
      var v = props[k];
      if (typeof v === 'boolean') out[k] = v;
      else if (typeof v === 'number' && isFinite(v)) out[k] = v;
      else if (typeof v === 'string') {
        var s = v.slice(0, 80);
        if (s.indexOf('@') === -1 && !/^[+()\d\s.-]{7,20}$/.test(s)) out[k] = s;
      }
    }
    return out;
  }

  function parseAttribution() {
    var out = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      referrer_host: null,
    };
    try {
      var u = new URL(location.href);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(
        function (key) {
          var v = u.searchParams.get(key);
          if (v && v.length <= 80 && v.indexOf('@') === -1) out[key] = v.slice(0, 80);
        },
      );
    } catch (e) {
      /* ignore */
    }
    try {
      if (document.referrer) {
        out.referrer_host = new URL(document.referrer).hostname.slice(0, 120) || null;
      }
    } catch (e2) {
      out.referrer_host = null;
    }
    return out;
  }

  function readJson(key) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* private mode */
    }
  }

  function getOrCreateSid() {
    try {
      var existing = localStorage.getItem(SID_KEY);
      if (existing && /^[a-z0-9-]{8,64}$/i.test(existing)) return existing;
      var sid =
        's' +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36).slice(-6);
      localStorage.setItem(SID_KEY, sid);
      return sid;
    } catch (e) {
      return null;
    }
  }

  function mergeAttribution() {
    var fresh = parseAttribution();
    var prior = readJson(ATTR_KEY) || {};
    var merged = {
      utm_source: fresh.utm_source || prior.utm_source || null,
      utm_medium: fresh.utm_medium || prior.utm_medium || null,
      utm_campaign: fresh.utm_campaign || prior.utm_campaign || null,
      utm_content: fresh.utm_content || prior.utm_content || null,
      utm_term: fresh.utm_term || prior.utm_term || null,
      referrer_host: prior.referrer_host || fresh.referrer_host || null,
    };
    if (fresh.utm_source || fresh.utm_medium || fresh.utm_campaign) {
      writeJson(ATTR_KEY, merged);
    } else if (!prior.utm_source && fresh.referrer_host) {
      writeJson(ATTR_KEY, merged);
    }
    return merged;
  }

  function dedupeSeen(key) {
    if (memoryDedupe[key]) return true;
    var map = readJson(DEDUPE_KEY) || {};
    if (map[key]) {
      memoryDedupe[key] = 1;
      return true;
    }
    return false;
  }

  function dedupeMark(key) {
    memoryDedupe[key] = 1;
    var map = readJson(DEDUPE_KEY) || {};
    map[key] = Date.now();
    // Cap map size
    var keys = Object.keys(map);
    if (keys.length > 40) {
      keys
        .sort(function (a, b) {
          return map[a] - map[b];
        })
        .slice(0, keys.length - 40)
        .forEach(function (k) {
          delete map[k];
        });
    }
    writeJson(DEDUPE_KEY, map);
  }

  function stripPiiKeys(obj) {
    var deny = {
      name: 1,
      email: 1,
      phone: 1,
      telephone: 1,
      mobile: 1,
      goalProblem: 1,
      goal: 1,
      message: 1,
      body: 1,
      company: 1,
      organization: 1,
      address: 1,
      streetAddress: 1,
      postalCode: 1,
      sin: 1,
      password: 1,
      referralSource: 1,
      timeline: 1,
      ip: 1,
      clientIp: 1,
      userAgent: 1,
      fullName: 1,
      firstName: 1,
      lastName: 1,
    };
    if (!obj || typeof obj !== 'object') return obj;
    var out = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach(function (k) {
      if (deny[k]) return;
      var v = obj[k];
      if (typeof v === 'string') {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[+()\d\s.-]{7,20}$/.test(v)) {
          return;
        }
      }
      out[k] = typeof v === 'object' && v !== null ? stripPiiKeys(v) : v;
    });
    return out;
  }

  /**
   * @param {string} eventName
   * @param {Record<string, unknown>} [opts]
   */
  function track(eventName, opts) {
    opts = opts || {};
    if (!canRun()) return { ok: false, reason: 'consent' };
    if (!eventName || typeof eventName !== 'string') {
      return { ok: false, reason: 'event' };
    }

    var config = readConfig();
    var path = pagePath();
    var dedupeExtra = typeof opts.dedupeKey === 'string' ? opts.dedupeKey : '';
    var once = opts.once !== false;
    var key = eventName + '|' + path + '|' + dedupeExtra;

    if (once && dedupeSeen(key)) {
      if (isDebug()) {
        console.info('[GeezAnalytics] deduped', eventName, key);
      }
      return { ok: true, deduped: true };
    }

    var cta = opts.cta_location;
    if (cta && !CTA_ALLOW[cta]) cta = 'unknown';

    var payload = stripPiiKeys({
      event: eventName,
      schema_version: SCHEMA_VERSION,
      ts: new Date().toISOString(),
      page: {
        path: path,
        page_type: config.page_type || opts.page_type || 'other',
      },
      locale: config.locale || localeFromDom(),
      service: safeCode(opts.service != null ? opts.service : config.service),
      cta_location: cta || null,
      session: { sid: getOrCreateSid() },
      attribution: mergeAttribution(),
      props: sanitizeProps(opts.props || {}),
    });

    if (once) dedupeMark(key);

    if (isDebug()) {
      debugLog.push(payload);
      console.info('[GeezAnalytics]', payload);
    }

    if (typeof window.__GEEZ_ANALYTICS_TRANSPORT__ === 'function') {
      try {
        window.__GEEZ_ANALYTICS_TRANSPORT__(payload);
      } catch (e) {
        /* ignore */
      }
      return { ok: true, event: payload };
    }

    // Production first-party beacon (no-op if endpoint missing).
    if (analyticsAllowed() && !(isDebug() && isLocalhost() && !analyticsAllowed())) {
      try {
        var body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
        } else {
          fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: body,
            credentials: 'same-origin',
            keepalive: true,
          }).catch(function () {});
        }
      } catch (e2) {
        /* ignore */
      }
    }

    return { ok: true, event: payload };
  }

  function autoPageView() {
    var config = readConfig();
    var pageType = config.page_type;
    var eventName = VIEW_BY_TYPE[pageType];
    if (eventName) {
      var props = {};
      if (pageType === 'article' && config.slug) props.article_slug = config.slug;
      if (pageType === 'case_study' && config.slug) props.case_study_slug = config.slug;
      track(eventName, {
        service: config.service,
        props: props,
        once: true,
      });
    }
    if (pageType === 'thank_you') {
      track('booking_complete', { once: true, dedupeKey: 'thanks' });
    }
  }

  function onCtaClick(event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[data-geez-cta]');
    if (!a) return;
    track('cta_click', {
      cta_location: a.getAttribute('data-geez-cta') || 'unknown',
      once: false,
      dedupeKey: (a.getAttribute('href') || '') + '|' + (a.getAttribute('data-geez-cta') || ''),
    });
  }

  function onPhoneClick(event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[href^="tel:"]');
    if (!a) return;
    // Never include the telephone number in the payload.
    track('phone_click', { once: true, dedupeKey: 'tel' });
  }

  function onOutboundClick(event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[data-geez-outbound="partner"]');
    if (!a) return;
    var host = null;
    try {
      host = new URL(a.href, location.href).hostname.slice(0, 120);
    } catch (e) {
      host = null;
    }
    track('outbound_partner_click', {
      once: false,
      dedupeKey: host || 'partner',
      props: {
        partner_id: safeCode(a.getAttribute('data-geez-partner')) || null,
        outbound_host: host,
      },
    });
  }

  function onLanguageClick(event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var link = t.closest('nav.geez-lang a[hreflang]');
    if (!link) return;
    var to = link.getAttribute('hreflang');
    if (to !== 'en' && to !== 'am' && to !== 'ti') return;
    track('language_select', {
      once: false,
      dedupeKey: localeFromDom() + '>' + to,
      props: { from_locale: localeFromDom(), to_locale: to },
    });
  }

  function bind() {
    document.addEventListener('click', onCtaClick, true);
    document.addEventListener('click', onPhoneClick, true);
    document.addEventListener('click', onOutboundClick, true);
    document.addEventListener('click', onLanguageClick, true);
  }

  var api = {
    track: track,
    debugLog: function () {
      return debugLog.slice();
    },
    resetDedupe: function () {
      memoryDedupe = {};
      try {
        sessionStorage.removeItem(DEDUPE_KEY);
      } catch (e) {
        /* ignore */
      }
    },
    isDebug: isDebug,
    version: SCHEMA_VERSION,
  };

  window.GeezAnalytics = api;

  if (!canRun()) return;
  bind();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoPageView);
  } else {
    autoPageView();
  }
})();
