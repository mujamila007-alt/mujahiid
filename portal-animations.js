(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function injectFxLayers() {
    const shell = $('.shell');
    if (!shell || $('#particleCanvas')) return;

    const progress = document.createElement('div');
    progress.id = 'scrollProgress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.prepend(progress);

    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.className = 'fx-particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    const aurora = document.createElement('div');
    aurora.className = 'fx-aurora';
    aurora.setAttribute('aria-hidden', 'true');

    const stars = document.createElement('div');
    stars.className = 'fx-stars';
    stars.setAttribute('aria-hidden', 'true');

    shell.prepend(stars);
    shell.prepend(aurora);
    shell.prepend(canvas);

    if (finePointer) {
      const glow = document.createElement('div');
      glow.className = 'fx-cursor-glow';
      glow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glow);
    }
  }

  function setupScrollProgress() {
    const bar = $('#scrollProgress');
    if (!bar) return;

    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const pct = Math.min(100, Math.max(0, (scrollY / max) * 100));
      bar.style.width = `${pct}%`;
      const header = $('.shell > header.wrap');
      if (header) header.classList.toggle('fx-scrolled', scrollY > 24);
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function setupPointerGlow() {
    if (!finePointer || reduceMotion) return;
    const glow = $('.fx-cursor-glow');
    if (!glow) return;

    let tx = innerWidth / 2;
    let ty = innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const render = () => {
      cx += (tx - cx) * .13;
      cy += (ty - cy) * .13;
      glow.style.left = `${cx}px`;
      glow.style.top = `${cy}px`;
      raf = requestAnimationFrame(render);
    };

    addEventListener('pointermove', e => {
      tx = e.clientX;
      ty = e.clientY;
      document.body.classList.add('fx-pointer-active');
    }, { passive: true });
    addEventListener('mouseout', e => {
      if (!e.relatedTarget) document.body.classList.remove('fx-pointer-active');
    });
    raf = requestAnimationFrame(render);
    addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  }

  function setupParticles() {
    if (reduceMotion) return;
    const canvas = $('#particleCanvas');
    const shell = $('.shell');
    if (!canvas || !shell) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const particleCount = () => {
      const area = width * Math.min(height, 1200);
      const base = Math.round(area / 42000);
      return Math.max(18, Math.min(finePointer ? 54 : 28, base));
    };

    const makeParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: .65 + Math.random() * 1.15,
      a: .16 + Math.random() * .42,
      hue: Math.random() > .55 ? '124,92,255' : '74,217,234'
    });

    const resize = () => {
      width = Math.max(1, innerWidth);
      height = Math.max(1, innerHeight);
      dpr = Math.min(devicePixelRatio || 1, 1.6);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: particleCount() }, makeParticle);
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000 && d2 > 20) {
            const force = (15000 - d2) / 15000 * .0035;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }
        p.vx *= .994;
        p.vy *= .994;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.a})`;
        ctx.fill();

        if (i % 2 !== 0) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(125,105,255,${(1 - dist / 115) * .055})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const updateMouse = e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    shell.addEventListener('pointermove', updateMouse, { passive: true });
    shell.addEventListener('pointerleave', () => { mouse.active = false; }, { passive: true });
    addEventListener('resize', resize, { passive: true });


    resize();
    raf = requestAnimationFrame(frame);
    addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  }

  function addFloatingTechChips() {
    if (reduceMotion) return;
    const hero = $('.hero');
    if (!hero || $('.fx-tech-chip', hero)) return;
    ['AI', 'SEO', '</>', 'ADS'].forEach(label => {
      const chip = document.createElement('span');
      chip.className = 'fx-tech-chip';
      chip.textContent = label;
      chip.setAttribute('aria-hidden', 'true');
      hero.appendChild(chip);
    });
  }

  function setupHeroParallax() {
    if (!finePointer || reduceMotion) return;
    const hero = $('.hero');
    const panel = $('.hero-panel');
    const copy = $('.hero-copy');
    if (!hero || !panel || !copy) return;

    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      panel.style.transform = `perspective(950px) rotateX(${(-ny * 3.5).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg) translate3d(0,0,0)`;
      copy.style.transform = `translate3d(${(nx * -5).toFixed(1)}px, ${(ny * -4).toFixed(1)}px, 0)`;
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      panel.style.transform = '';
      copy.style.transform = '';
    }, { passive: true });
  }

  function bindCardTilt(card) {
    if (!finePointer || reduceMotion || card.dataset.fxTiltBound) return;
    card.dataset.fxTiltBound = '1';

    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 4.8;
      const ry = (px - 0.5) * 6.4;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
      card.classList.add('fx-tilting');
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.classList.remove('fx-tilting');
    }, { passive: true });
  }

  function setupDynamicCardEffects() {
    const grid = $('#moduleGrid');
    if (!grid) return;
    const apply = () => $$('.module-card', grid).forEach(bindCardTilt);
    apply();
    new MutationObserver(apply).observe(grid, { childList: true, subtree: true });
  }

  function setupRipples() {
    document.addEventListener('pointerdown', e => {
      const target = e.target.closest('.btn, .module-open, .password-row button, .file-download');
      if (!target || reduceMotion) return;
      const r = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'fx-ripple';
      ripple.style.left = `${e.clientX - r.left}px`;
      ripple.style.top = `${e.clientY - r.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  }

  function animateNumber(el, next) {
    const value = Number(String(next).replace(/\D/g, ''));
    if (!Number.isFinite(value)) return;
    const current = Number(String(el.dataset.fxValue || 0).replace(/\D/g, '')) || 0;
    el.dataset.fxValue = String(value);
    if (reduceMotion || value === current) {
      el.textContent = String(value).padStart(2, '0');
      return;
    }
    const start = performance.now();
    const duration = 720;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(current + (value - current) * ease)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupAnimatedCounters() {
    ['moduleCount', 'fileCount', 'noteCount'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.dataset.fxValue = '0';
      const sync = () => animateNumber(el, el.textContent);
      new MutationObserver(sync).observe(el, { childList: true, characterData: true, subtree: true });
      setTimeout(sync, 600);
    });
  }

  function enhanceRevealObserver() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const targets = $$('.ribbon, .flow-box, .page-footer .wrap');
    targets.forEach((el, i) => {
      if (el.dataset.fxReveal) return;
      el.dataset.fxReveal = '1';
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity .7s ${i * 40}ms ease, transform .7s ${i * 40}ms cubic-bezier(.2,.75,.3,1)`;
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    targets.forEach(el => observer.observe(el));
  }

  function start() {
    injectFxLayers();
    setupScrollProgress();
    setupPointerGlow();
    setupParticles();
    addFloatingTechChips();
    setupHeroParallax();
    setupDynamicCardEffects();
    setupRipples();
    setupAnimatedCounters();
    enhanceRevealObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
