/**
 * Optional Ethiopian/Tigrinya cultural ambience — default OFF.
 * Prefers muted-until-gesture; persists mute preference in localStorage (UX only).
 * Pauses when the tab is hidden (Page Visibility API).
 */
(function () {
  var STORAGE_KEY = 'geez-ambient-unmuted';
  var VOLUME = 0.28;

  function basePath() {
    var meta = document.querySelector('meta[name="geez-base-path"]');
    var raw = meta && meta.getAttribute('content');
    if (!raw || raw === '/') return '';
    return String(raw).replace(/\/+$/, '');
  }

  function audioSrc() {
    return basePath() + '/media/audio/ethiopian-azmari-krar-ambient.mp3';
  }

  function wantsUnmuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function setWantUnmuted(on) {
    try {
      if (on) localStorage.setItem(STORAGE_KEY, '1');
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignore quota / private mode */
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

  function ensureDock() {
    var existing = document.getElementById('geez-audio-dock');
    if (existing) return existing;
    var dock = document.createElement('div');
    dock.id = 'geez-audio-dock';
    dock.className = 'geez-audio-dock';
    dock.innerHTML =
      '<button type="button" class="geez-audio-toggle" id="geez-audio-toggle" aria-pressed="false" aria-label="Play ambient music">' +
      iconMuted() +
      '<span class="geez-audio-toggle__label">Sound</span>' +
      '</button>';
    document.body.appendChild(dock);
    return dock;
  }

  function init() {
    var dock = ensureDock();
    var btn = document.getElementById('geez-audio-toggle');
    if (!btn) return;

    var audio = new Audio(audioSrc());
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = VOLUME;

    var playing = false;
    var userWantsSound = wantsUnmuted();

    function syncUi() {
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        playing ? 'Mute ambient music' : 'Play ambient music',
      );
      btn.innerHTML =
        (playing ? iconPlaying() : iconMuted()) +
        '<span class="geez-audio-toggle__label">' +
        (playing ? 'Mute' : 'Sound') +
        '</span>';
    }

    function pauseAmbient() {
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
        })
        .catch(function () {
          playing = false;
          syncUi();
        });
    }

    function setUnmuted(on) {
      userWantsSound = on;
      setWantUnmuted(on);
      if (on) {
        if (document.visibilityState === 'hidden') {
          pauseAmbient();
          return;
        }
        playAmbient();
      } else {
        pauseAmbient();
      }
    }

    btn.addEventListener('click', function () {
      setUnmuted(!userWantsSound || !playing);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        if (playing) audio.pause();
        return;
      }
      if (userWantsSound) playAmbient();
    });

    syncUi();

    // Never autoplay with sound on load. If the visitor previously opted in,
    // wait for a gesture (or try muted resume after gesture-less play fails).
    if (userWantsSound) {
      var resumeOnce = function () {
        document.removeEventListener('pointerdown', resumeOnce);
        document.removeEventListener('keydown', resumeOnce);
        setUnmuted(true);
      };
      document.addEventListener('pointerdown', resumeOnce, { once: true });
      document.addEventListener('keydown', resumeOnce, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
