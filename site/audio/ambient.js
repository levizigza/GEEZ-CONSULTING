/**
 * Ethiopian/Tigrinya cultural ambience — default ON (with mute control).
 * Attempts autoplay; if blocked by browser policy, keeps “on” intent in the UI
 * and starts on the first user gesture. Persists mute preference in localStorage.
 * Pauses when the tab is hidden (Page Visibility API).
 */
(function () {
  var MUTED_KEY = 'geez-ambient-muted';
  var LEGACY_UNMUTED_KEY = 'geez-ambient-unmuted';
  var CUE_KEY = 'geez-audio-cue-dismissed';
  var VOLUME = 0.28;
  var CUE_MS = 6500;

  function basePath() {
    var meta = document.querySelector('meta[name="geez-base-path"]');
    var raw = meta && meta.getAttribute('content');
    if (!raw || raw === '/') return '';
    return String(raw).replace(/\/+$/, '');
  }

  function audioSrc() {
    return basePath() + '/media/audio/ethiopian-azmari-krar-ambient.mp3';
  }

  function readMutedPreference() {
    try {
      if (localStorage.getItem(MUTED_KEY) === '1') return true;
      return false;
    } catch (_) {
      return false;
    }
  }

  function writeMutedPreference(muted) {
    try {
      if (muted) {
        localStorage.setItem(MUTED_KEY, '1');
        localStorage.removeItem(LEGACY_UNMUTED_KEY);
      } else {
        localStorage.removeItem(MUTED_KEY);
        localStorage.setItem(LEGACY_UNMUTED_KEY, '1');
      }
    } catch (_) {
      /* ignore quota / private mode */
    }
  }

  function cueWasDismissed() {
    try {
      return localStorage.getItem(CUE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function markCueDismissed() {
    try {
      localStorage.setItem(CUE_KEY, '1');
    } catch (_) {
      /* ignore */
    }
  }

  function iconMuted() {
    return (
      '<svg class="geez-audio-toggle__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12zM16 4.2v2.1a6.5 6.5 0 0 1 0 11.4v2.1a8.5 8.5 0 0 0 0-15.6z"/>' +
      '<path fill="currentColor" d="M3.3 4.7 4.7 3.3 20.7 19.3 19.3 20.7z"/>' +
      '</svg>'
    );
  }

  function iconPlaying() {
    return (
      '<svg class="geez-audio-toggle__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M4 10v4h3l5 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.1v6.2A3.5 3.5 0 0 0 15.5 12zM14 4.2v2.1a6.5 6.5 0 0 1 0 11.4v2.1a8.5 8.5 0 0 0 0-15.6z"/>' +
      '</svg>'
    );
  }

  function cueMarkup() {
    return (
      '<p class="geez-audio-cue" id="geez-audio-cue" role="status">' +
      '<span class="geez-audio-cue__pointer" aria-hidden="true">' +
      '<svg viewBox="0 0 48 24" width="48" height="24" focusable="false">' +
      '<path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" d="M2 12h34M28 4l12 8-12 8"/>' +
      '</svg>' +
      '</span>' +
      '<span class="geez-audio-cue__text">You can turn this off</span>' +
      '</p>'
    );
  }

  function ensureDock(showCue) {
    var existing = document.getElementById('geez-audio-dock');
    if (existing) return existing;
    var dock = document.createElement('div');
    dock.id = 'geez-audio-dock';
    dock.className = 'geez-audio-dock' + (showCue ? ' geez-audio-dock--cue' : '');
    dock.innerHTML =
      (showCue ? cueMarkup() : '') +
      '<button type="button" class="geez-audio-toggle" id="geez-audio-toggle" aria-pressed="true" aria-label="Mute ambient music"' +
      (showCue ? ' aria-describedby="geez-audio-cue"' : '') +
      '>' +
      iconPlaying() +
      '<span class="geez-audio-toggle__label">Mute</span>' +
      '</button>';
    document.body.appendChild(dock);
    return dock;
  }

  function init() {
    var userWantsSound = !readMutedPreference();
    var showCue = userWantsSound && !cueWasDismissed();
    var dock = ensureDock(showCue);
    var btn = document.getElementById('geez-audio-toggle');
    if (!btn) return;

    var audio = new Audio(audioSrc());
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = VOLUME;

    var playing = false;
    var gestureBound = false;
    var cueTimer = null;

    function syncUi() {
      var on = userWantsSound;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        on ? 'Mute ambient music' : 'Play ambient music',
      );
      btn.classList.toggle('geez-audio-toggle--intent-on', on);
      btn.classList.toggle('geez-audio-toggle--playing', playing);
      btn.innerHTML =
        (on ? iconPlaying() : iconMuted()) +
        '<span class="geez-audio-toggle__label">' +
        (on ? 'Mute' : 'Sound') +
        '</span>';
    }

    function dismissCue() {
      if (!dock.classList.contains('geez-audio-dock--cue')) return;
      dock.classList.remove('geez-audio-dock--cue');
      dock.classList.add('geez-audio-dock--cue-done');
      btn.removeAttribute('aria-describedby');
      var cue = document.getElementById('geez-audio-cue');
      if (cue) cue.remove();
      markCueDismissed();
      if (cueTimer) {
        clearTimeout(cueTimer);
        cueTimer = null;
      }
    }

    function pausePlayback() {
      audio.pause();
      playing = false;
      syncUi();
    }

    function playAmbient() {
      return audio
        .play()
        .then(function () {
          playing = true;
          syncUi();
          return true;
        })
        .catch(function () {
          playing = false;
          syncUi();
          return false;
        });
    }

    function bindGestureResume() {
      if (gestureBound) return;
      gestureBound = true;
      var resumeOnce = function () {
        document.removeEventListener('pointerdown', resumeOnce, true);
        document.removeEventListener('keydown', resumeOnce, true);
        document.removeEventListener('touchstart', resumeOnce, true);
        gestureBound = false;
        if (!userWantsSound) return;
        if (document.visibilityState === 'hidden') return;
        playAmbient();
      };
      document.addEventListener('pointerdown', resumeOnce, { capture: true, once: true });
      document.addEventListener('keydown', resumeOnce, { capture: true, once: true });
      document.addEventListener('touchstart', resumeOnce, { capture: true, once: true });
    }

    function setUnmuted(on) {
      userWantsSound = on;
      writeMutedPreference(!on);
      if (on) {
        if (document.visibilityState === 'hidden') {
          pausePlayback();
          bindGestureResume();
          return;
        }
        playAmbient().then(function (ok) {
          if (!ok) bindGestureResume();
        });
      } else {
        pausePlayback();
      }
    }

    btn.addEventListener('click', function () {
      dismissCue();
      setUnmuted(!userWantsSound);
    });

    dock.addEventListener('pointerdown', function () {
      dismissCue();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        if (playing) {
          audio.pause();
          playing = false;
          syncUi();
        }
        return;
      }
      if (userWantsSound) {
        playAmbient().then(function (ok) {
          if (!ok) bindGestureResume();
        });
      }
    });

    syncUi();

    if (showCue) {
      cueTimer = setTimeout(dismissCue, CUE_MS);
    }

    if (userWantsSound) {
      if (document.visibilityState === 'hidden') {
        bindGestureResume();
      } else {
        playAmbient().then(function (ok) {
          if (!ok) bindGestureResume();
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
