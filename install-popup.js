// MujaPrime smart install mini banner v3
// Android browser -> Android APK. Desktop browser -> Windows desktop installer.
(function () {
  'use strict';

  var ANDROID_PATH = '/update-and-apk/MujaPrime_2.2_Android.apk';
  var DESKTOP_PATH = '/update-and-apk/MujaPrime_2.2.exe';
  var POPUP_ID = 'muja-install-popup';
  var SLOT_ID = 'muja-install-slot';

  function absoluteUrl(path) {
    try { return new URL(path, window.location.origin).href; }
    catch (_) { return path; }
  }

  function shouldSkipPage() {
    var p = (window.location.pathname || '/').toLowerCase();
    var blocked = [
      '/payment', '/admin', '/status-aktif', '/status-whatsapp', '/status-whatsapp-admin2',
      '/reset-cache', '/hapus-service-worker', '/panduan-backup-restore'
    ];
    return blocked.some(function (prefix) { return p.indexOf(prefix) === 0; });
  }

  function isStandaloneOrNativeShell() {
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
    var ua = String(navigator.userAgent || '').toLowerCase();
    var tauri = !!window.__TAURI__ || !!window.__TAURI_INTERNALS__ || ua.indexOf('tauri') !== -1 || ua.indexOf('mujaprime-desktop') !== -1;
    return standalone || tauri;
  }

  function detectTarget() {
    var ua = String(navigator.userAgent || '');
    var lower = ua.toLowerCase();
    var uaMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
    var isAndroid = /android/i.test(ua);
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isMobile = uaMobile || /android|iphone|ipad|ipod|mobile/i.test(ua);

    if (isAndroid) {
      return {
        type: 'android',
        label: 'ANDROID',
        title: 'Install aplikasi MujaPrime Android',
        subtitle: 'Lebih cepat, nyaman, dan langsung dari HP',
        button: 'Install APK',
        url: absoluteUrl(ANDROID_PATH),
        filename: 'MujaPrime_2.2_Android.apk'
      };
    }

    // MujaPrime currently ships a Windows desktop .exe. Avoid showing it as an iPhone/iPad app.
    if (isIOS || isMobile) return null;

    return {
      type: /windows/i.test(ua) || lower.indexOf('win') !== -1 ? 'windows' : 'desktop',
      label: 'DESKTOP',
      title: 'Install MujaPrime Desktop',
      subtitle: 'Aplikasi desktop Windows untuk akses lebih praktis',
      button: 'Install .EXE',
      url: absoluteUrl(DESKTOP_PATH),
      filename: 'MujaPrime_2.2.exe'
    };
  }

  function closeBanner() {
    var popup = document.getElementById(POPUP_ID);
    var slot = document.getElementById(SLOT_ID);
    if (!popup) return;
    popup.classList.remove('muja-install-show');
    popup.classList.add('muja-install-hiding');
    window.setTimeout(function () {
      if (slot && slot.parentNode) slot.parentNode.removeChild(slot);
    }, 240);
  }

  function triggerDownload(target, event) {
    if (event && event.preventDefault) event.preventDefault();
    if (!target || !target.url) return false;

    // Same-origin static files are downloaded directly. If a browser ignores download,
    // navigation still opens the installer file URL.
    try {
      var a = document.createElement('a');
      a.href = target.url;
      a.download = target.filename || '';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (_) {
      window.location.href = target.url;
    }
    return false;
  }

  function bindManualButtons(target) {
    document.querySelectorAll('[data-muja-install-apk], [data-muja-install-app]').forEach(function (btn) {
      if (btn.__mujaInstallBound) return;
      btn.__mujaInstallBound = true;
      if (!target) {
        btn.style.display = 'none';
        return;
      }
      if (btn.tagName === 'A') btn.setAttribute('href', target.url);
      btn.addEventListener('click', function (event) { triggerDownload(target, event); });
    });
  }

  function createBanner(target) {
    if (!target || shouldSkipPage() || isStandaloneOrNativeShell() || document.getElementById(SLOT_ID)) return;

    var slot = document.createElement('div');
    slot.id = SLOT_ID;
    slot.setAttribute('aria-live', 'polite');

    var popup = document.createElement('aside');
    popup.id = POPUP_ID;
    popup.className = 'muja-install-' + target.type;
    popup.setAttribute('role', 'status');
    popup.setAttribute('aria-label', target.title);

    popup.innerHTML = '' +
      '<div class="muja-install-card">' +
        '<div class="muja-install-logo" aria-hidden="true">' +
          '<img src="/muja.png" alt="" loading="eager" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
          '<span class="muja-install-logo-fallback">MP</span>' +
        '</div>' +
        '<div class="muja-install-text">' +
          '<div class="muja-install-heading">' +
            '<strong class="muja-install-title"></strong>' +
            '<span class="muja-install-badge"></span>' +
          '</div>' +
          '<span class="muja-install-subtitle"></span>' +
        '</div>' +
        '<button class="muja-install-btn" type="button"></button>' +
        '<button class="muja-install-close" type="button" aria-label="Tutup notifikasi install">&times;</button>' +
      '</div>';

    popup.querySelector('.muja-install-title').textContent = target.title;
    popup.querySelector('.muja-install-subtitle').textContent = target.subtitle;
    popup.querySelector('.muja-install-badge').textContent = target.label;
    popup.querySelector('.muja-install-btn').textContent = target.button;
    popup.querySelector('.muja-install-btn').setAttribute('aria-label', target.title);

    slot.appendChild(popup);

    var header = document.querySelector('.muja-header, #header, header');
    if (header && header.parentNode) header.parentNode.insertBefore(slot, header.nextSibling);
    else document.body.insertBefore(slot, document.body.firstChild);

    popup.querySelector('.muja-install-btn').addEventListener('click', function (event) {
      triggerDownload(target, event);
    });
    popup.querySelector('.muja-install-close').addEventListener('click', closeBanner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { popup.classList.add('muja-install-show'); });
    });
  }

  function init() {
    var target = detectTarget();
    bindManualButtons(target);
    createBanner(target);

    // Backward-compatible globals used by older MujaPrime markup.
    window.MujaInstallApk = function (event) {
      var android = {
        url: absoluteUrl(ANDROID_PATH),
        filename: 'MujaPrime_2.2_Android.apk'
      };
      return triggerDownload(android, event);
    };
    window.MujaPrimeInstallApkUrl = function () { return absoluteUrl(ANDROID_PATH); };
    window.MujaPrimeInstallDesktopUrl = function () { return absoluteUrl(DESKTOP_PATH); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
