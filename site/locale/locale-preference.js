/**
 * Persistent but non-forced language preference.
 * Remembers the user's last explicit language choice; never auto-redirects
 * away from the URL they opened.
 */
(function () {
  var KEY = 'geez_lang_pref';
  var bannerId = 'geez-lang-pref-banner';

  function currentLocale() {
    var lang = (document.documentElement.lang || 'en').toLowerCase();
    if (lang.indexOf('am') === 0) return 'am';
    if (lang.indexOf('ti') === 0) return 'ti';
    return 'en';
  }

  function pathForLocale(locale) {
    var baseMeta = document.querySelector('meta[name="geez-base-path"]');
    var base = baseMeta ? baseMeta.getAttribute('content') || '' : '';
    var path = window.location.pathname || '/';
    if (base && path.indexOf(base) === 0) {
      path = path.slice(base.length) || '/';
    }
    var bare = path.replace(/^\/(am|ti)(?=\/|$)/, '') || '/';
    var localized;
    if (locale === 'en') localized = bare;
    else if (bare === '/') localized = '/' + locale + '/';
    else localized = '/' + locale + (bare.charAt(0) === '/' ? bare : '/' + bare);
    if (!base) return localized;
    if (localized === '/') return base + '/';
    return base + localized;
  }

  function storePref(locale) {
    try {
      window.localStorage.setItem(KEY, locale);
    } catch (e) {
      /* private mode */
    }
  }

  function readPref() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function dismissBanner() {
    var el = document.getElementById(bannerId);
    if (el) el.remove();
  }

  function showOffer(pref) {
    if (document.getElementById(bannerId)) return;
    var labels = {
      am: 'Continue in አማርኛ?',
      ti: 'Continue in ትግርኛ?',
      en: 'Continue in English?',
    };
    var bar = document.createElement('div');
    bar.id = bannerId;
    bar.className = 'geez-lang-pref';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Language preference');
    bar.innerHTML =
      '<p>' +
      (labels[pref] || labels.en) +
      '</p>' +
      '<p class="geez-lang-pref__actions">' +
      '<a class="geez-btn-link" href="' +
      pathForLocale(pref) +
      '">Switch</a> ' +
      '<button type="button" class="geez-text-btn" data-lang-dismiss>Stay</button>' +
      '</p>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('[data-lang-dismiss]')?.addEventListener('click', function () {
      storePref(currentLocale());
      dismissBanner();
    });
  }

  document.addEventListener(
    'click',
    function (event) {
      var t = event.target;
      if (!t || !t.closest) return;
      var link = t.closest('nav.geez-lang a[hreflang]');
      if (!link) return;
      var code = link.getAttribute('hreflang');
      if (code === 'en' || code === 'am' || code === 'ti') storePref(code);
    },
    true,
  );

  var pref = readPref();
  var here = currentLocale();
  if (pref && pref !== here && (pref === 'en' || pref === 'am' || pref === 'ti')) {
    showOffer(pref);
  }
})();
