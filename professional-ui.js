/* MUJA PRIME progressive UX helpers. No business logic is replaced. */
(function(){
  'use strict';
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();
  ready(() => {
    document.documentElement.classList.add('muja-pro-ui');
    if (document.body) document.body.dataset.mujaUi = 'professional';

    // Better accessibility without changing handlers.
    document.querySelectorAll('a[target="_blank"]').forEach(a => a.setAttribute('rel','noopener noreferrer'));
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });

    // Mark the correct bottom-nav item active according to route.
    const path = location.pathname.replace(/\/+$/,'') || '/';
    document.querySelectorAll('.mobile-nav a[href], .bottom-nav a[href]').forEach(a => {
      let href = a.getAttribute('href') || '';
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) return;
      try {
        const p = new URL(href, location.origin).pathname.replace(/\/+$/,'') || '/';
        const active = p === '/' ? path === '/' : path === p || path.startsWith(p + '/');
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      } catch(_) {}
    });

    // Keep fixed header visually stable when scrolling.
    const header = document.querySelector('.muja-header');
    if (header) {
      const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 8);
      updateHeader();
      addEventListener('scroll', updateHeader, {passive:true});
    }

    // Lightweight online/offline feedback.
    const network = document.createElement('div');
    network.id = 'mujaNetworkStatus';
    network.setAttribute('role','status');
    network.setAttribute('aria-live','polite');
    document.body.appendChild(network);
    const updateNetwork = () => {
      const offline = navigator.onLine === false;
      network.textContent = offline ? 'Koneksi internet terputus' : 'Koneksi kembali online';
      network.classList.toggle('show', offline);
      if (!offline) {
        network.classList.add('show');
        clearTimeout(network._hideTimer);
        network._hideTimer = setTimeout(() => network.classList.remove('show'), 1800);
      }
    };
    addEventListener('offline', updateNetwork);
    addEventListener('online', updateNetwork);
    if (navigator.onLine === false) updateNetwork();

    // Escape closes existing overlays if their native close APIs/classes exist.
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const sideToggle = document.querySelector('#sidebar-toggle');
      if (sideToggle && sideToggle.checked) sideToggle.checked = false;
      const cart = document.querySelector('.cart-sidebar.open');
      if (cart && typeof window.toggleCart === 'function') { try { window.toggleCart(); } catch(_) {} }
      document.querySelectorAll('.modal-overlay.active,.modal.active,.registration-overlay.active').forEach(el => {
        const close = el.querySelector('[data-close],.close-btn,.modal-close,.cart-close');
        if (close) close.click();
      });
    });

    // Prevent accidental horizontal overflow from long values/URLs.
    document.querySelectorAll('td, .info-value, .value, .val').forEach(el => {
      el.style.overflowWrap = el.style.overflowWrap || 'anywhere';
    });
  });
})();
