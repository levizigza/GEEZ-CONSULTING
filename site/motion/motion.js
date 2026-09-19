/**
 * Sitewide viewport motion — gold vine stroke-draw + service icon showcases.
 * One-shot grow via Intersection Observer. prefers-reduced-motion → static.
 * On the homepage, waits for brand intro dismissal so hero vines are visible.
 */
(function () {
  var reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = document.querySelectorAll('[data-geez-motion]');
  if (!nodes.length) return;

  function activate(el) {
    el.classList.add('geez-motion--in');
  }

  function activateAllStatic() {
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.add('geez-motion--in', 'geez-vine--static');
    }
  }

  function observe() {
    if (reduce) {
      activateAllStatic();
      return;
    }

    if (typeof IntersectionObserver !== 'function') {
      for (var j = 0; j < nodes.length; j++) activate(nodes[j]);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          if (!entry.isIntersecting) continue;
          activate(entry.target);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );

    for (var n = 0; n < nodes.length; n++) {
      io.observe(nodes[n]);
    }
  }

  var intro = document.getElementById('geez-intro');
  if (!intro) {
    observe();
    return;
  }

  /* Re-query nodes after intro removal; start observing once splash is gone. */
  function afterIntro() {
    nodes = document.querySelectorAll('[data-geez-motion]');
    if (!nodes.length) return;
    observe();
  }

  if (intro.classList.contains('geez-intro--done') || !intro.parentNode) {
    afterIntro();
    return;
  }

  var mo = new MutationObserver(function () {
    if (
      !intro.parentNode ||
      intro.classList.contains('geez-intro--done')
    ) {
      mo.disconnect();
      window.setTimeout(afterIntro, 80);
    }
  });
  mo.observe(intro, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
  if (intro.parentNode) {
    mo.observe(intro.parentNode, { childList: true });
  }

  /* Safety: never block motion if intro hangs */
  window.setTimeout(function () {
    mo.disconnect();
    afterIntro();
  }, 4500);
})();
