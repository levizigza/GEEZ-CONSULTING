/**
 * Short, skippable brand opening — respects prefers-reduced-motion.
 * Does not trap focus; Esc / Skip dismisses immediately.
 */
(function () {
  var root = document.getElementById('geez-intro');
  if (!root) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var done = false;

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
    finish();
    return;
  }

  window.setTimeout(finish, 2200);
})();
