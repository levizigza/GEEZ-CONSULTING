/**
 * Short, skippable brand opening — respects prefers-reduced-motion.
 * Does not trap focus; Esc / Skip dismisses immediately.
 * Gold vines draw in sync with the brand rise (full hold ~2.2s).
 */
(function () {
  var root = document.getElementById('geez-intro');
  if (!root) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var done = false;
  /** Match CSS vine draw + brand rise; do not extend past this. */
  var HOLD_MS = 2200;
  var REDUCE_HOLD_MS = 700;

  function finish() {
    if (done) return;
    done = true;
    root.classList.add('geez-intro--done');
    root.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 420);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') finish();
  }

  var skip = root.querySelector('[data-geez-intro-skip]');
  if (skip) skip.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);

  if (reduce) {
    root.classList.add('geez-intro--static');
    window.setTimeout(finish, REDUCE_HOLD_MS);
    return;
  }

  root.classList.add('geez-intro--animate');
  window.setTimeout(finish, HOLD_MS);
})();
