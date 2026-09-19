/**
 * Privacy-safe Web Vitals beacon (opt-in).
 * Sends only metric name, value, id, navigation type — no URLs with query PII,
 * no form fields, no user identifiers.
 * Enabled only when:
 *   1) window.__GEEZ_RUM__ === true (build/feature approval), and
 *   2) GeezConsent analytics category is granted (or no consent gate present).
 */
(function () {
  if (!window.__GEEZ_RUM__) return;

  function analyticsAllowed() {
    try {
      if (window.GeezConsent && typeof window.GeezConsent.read === 'function') {
        return Boolean(window.GeezConsent.read().analytics);
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function send(metric) {
    if (!analyticsAllowed()) return;
    var body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value),
      id: metric.id,
      rating: metric.rating || '',
      navigationType: metric.navigationType || '',
    });
    var url = '/api/rum/';
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    }
  }

  function observe(type, name) {
    try {
      if (!PerformanceObserver.supportedEntryTypes ||
          PerformanceObserver.supportedEntryTypes.indexOf(type) === -1) {
        return;
      }
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          var value =
            name === 'CLS'
              ? entry.value
              : name === 'LCP'
                ? entry.startTime
                : entry.duration || entry.processingStart || entry.startTime;
          send({
            name: name,
            value: value,
            id: entry.id || name + '-' + Date.now(),
            rating: '',
            navigationType: (performance.getEntriesByType('navigation')[0] || {}).type || '',
          });
        });
      });
      po.observe({ type: type, buffered: true });
    } catch (e) {
      /* older browsers */
    }
  }

  if (analyticsAllowed()) {
    observe('largest-contentful-paint', 'LCP');
    observe('layout-shift', 'CLS');
    observe('event', 'INP');
  }
})();
