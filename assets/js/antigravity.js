/* ============================================================
   Antigravity — hero spotlight, physics-lagged particles, custom cursor
   Reference: https://antigravity.google/
   - Single rAF loop for cursor; CSS custom props for spotlight + particles
   - Desktop-only (hover + fine pointer); disabled on touch
   - Pauses when hero leaves viewport (IntersectionObserver)
   - Fully disabled under prefers-reduced-motion: reduce
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover       = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // If the user prefers reduced motion OR is on a touch device, do nothing.
  // The hero still renders fine with a static background gradient.
  if (prefersReduced || !hasHover) {
    document.documentElement.classList.add('no-antigravity');
    return;
  }

  document.documentElement.classList.add('has-antigravity');

  const hero = document.querySelector('[data-antigravity]');
  if (!hero) return;

  // ---------- 1. Spotlight (CSS-var driven, no JS per frame) ----------
  // Update --mouse-x / --mouse-y on the hero element. Rate-limited via rAF.
  let targetMX = 50, targetMY = 50;      // percentages
  let currentMX = 50, currentMY = 50;
  let spotlightTicking = false;

  function onHeroMove(e) {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    targetMX = x;
    targetMY = y;
    if (!spotlightTicking) {
      spotlightTicking = true;
      requestAnimationFrame(applySpotlight);
    }
  }
  function applySpotlight() {
    // gentle lerp so particles glide rather than snap
    currentMX += (targetMX - currentMX) * 0.18;
    currentMY += (targetMY - currentMY) * 0.18;
    hero.style.setProperty('--mouse-x', currentMX.toFixed(2) + '%');
    hero.style.setProperty('--mouse-y', currentMY.toFixed(2) + '%');
    if (Math.abs(targetMX - currentMX) > 0.05 || Math.abs(targetMY - currentMY) > 0.05) {
      requestAnimationFrame(applySpotlight);
    } else {
      spotlightTicking = false;
    }
  }
  hero.addEventListener('mousemove', onHeroMove, { passive: true });

  // Reset to center when the cursor leaves the hero so particles drift home.
  hero.addEventListener('mouseleave', () => {
    targetMX = 50; targetMY = 50;
    if (!spotlightTicking) {
      spotlightTicking = true;
      requestAnimationFrame(applySpotlight);
    }
  });

  // ---------- 2. Custom cursor (dot + lagging ring) ----------
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'ag-cursor-dot';
  ring.className = 'ag-cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let dx = mx, dy = my;   // dot
  let rx = mx, ry = my;   // ring
  let cursorActive = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!cursorActive) {
      cursorActive = true;
      document.documentElement.classList.add('ag-cursor-on');
    }
  }, { passive: true });

  // Hide when the cursor leaves the window
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && !e.toElement) {
      document.documentElement.classList.remove('ag-cursor-on');
      cursorActive = false;
    }
  });

  // Hover-target detection: expand ring on links/buttons, I-beam on text
  let hoverMode = 'default';
  document.addEventListener('mouseover', (e) => {
    const el = e.target;
    if (!el || !el.closest) return;
    if (el.closest('a, button, [role="button"], .resource-link, input[type="submit"], .form-submit')) {
      setHoverMode('link');
    } else if (el.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, label, input, textarea')) {
      setHoverMode('text');
    } else {
      setHoverMode('default');
    }
  });
  function setHoverMode(m) {
    if (m === hoverMode) return;
    hoverMode = m;
    ring.dataset.mode = m;
  }

  // One rAF loop for both dot (instant) and ring (lerped)
  function tickCursor() {
    dx = mx; dy = my;                                   // dot tracks exactly
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = `translate3d(${dx - 3}px, ${dy - 3}px, 0)`;  // 6px dot
    ring.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0)`; // 32px ring
    requestAnimationFrame(tickCursor);
  }
  requestAnimationFrame(tickCursor);

  // ---------- 3. Pause spotlight work when hero is offscreen ----------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        hero.dataset.visible = entry.isIntersecting ? 'true' : 'false';
      });
    }, { threshold: 0.01 });
    io.observe(hero);
  }
})();
