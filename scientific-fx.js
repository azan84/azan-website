/* =========================================================
   Scientific FX for Dr. Azan Sapardi's site
   - Hero flow-field canvas (curl-noise particles)
   - Floating instrument glyphs with mouse parallax
   - Research-card micro-animations on hover
   - Respects prefers-reduced-motion & scales down on mobile
   ========================================================= */
(function(){
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. HERO FLOW-FIELD CANVAS ----------
  // Curl-noise streamlines around a virtual cylinder (wake-like).
  // Theme-aware: on LIGHT bg we use ocean-ink trails on a warm cream wash;
  // on DARK bg we use cyan-teal trails on a deep navy wash. Inspired by
  // distill.pub / stripe / openai research pages.
  function initFlowField(){
    if(PREFERS_REDUCED) return;
    const canvas = document.getElementById('flowCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const isMobile = window.matchMedia('(max-width:768px)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let particles = [];
    const COUNT = isMobile ? 45 : 130;

    // Theme palette (refreshed on theme change)
    let palette = {
      fade:   'rgba(250, 250, 247, 0.055)',  // warm cream trail fade for light
      ink:    [10, 77, 110],                 // ocean #0a4d6e
      accent: [217, 119, 6],                 // amber #d97706
      sage:   [107, 155, 107]                // sage #6b9b6b
    };
    function refreshPalette(){
      const theme = document.documentElement.dataset.theme
        || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if(theme === 'dark'){
        palette = {
          fade:   'rgba(10, 14, 20, 0.075)',
          ink:    [110, 200, 230],           // cool cyan
          accent: [245, 166, 35],             // brighter amber for dark
          sage:   [140, 200, 140]
        };
      } else {
        palette = {
          fade:   'rgba(250, 250, 247, 0.055)',
          ink:    [10, 77, 110],
          accent: [217, 119, 6],
          sage:   [107, 155, 107]
        };
      }
    }
    refreshPalette();
    // Observe theme-attribute changes (triggered by the theme toggle)
    const themeObserver = new MutationObserver(refreshPalette);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // Also listen to OS-level dark mode switch
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshPalette);
    } catch(_) {}

    function resize(){
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pseudo-curl-noise: smooth, swirly field around a virtual cylinder
    function field(x, y, t){
      // Cylinder slightly right of center — simulates wake shedding
      const cx = W * 0.72, cy = H * 0.55;
      const dx = x - cx, dy = y - cy;
      const r = Math.sqrt(dx*dx + dy*dy) + 1e-3;
      const swirl = 80 / (r * 0.06 + 1);
      const ang = Math.atan2(dy, dx);
      const vx =  Math.cos(ang + Math.PI/2) * swirl * 0.018 + 0.55
                + Math.sin(y * 0.008 + t*0.3) * 0.25;
      const vy =  Math.sin(ang + Math.PI/2) * swirl * 0.018
                + Math.cos(x * 0.008 + t*0.2) * 0.25;
      return [vx, vy];
    }

    function spawn(p){
      p.x = Math.random() * -50;              // spawn left of canvas
      p.y = Math.random() * H;
      p.life = 0;
      p.maxLife = 240 + Math.random() * 260;
      p.w = 0.5 + Math.random() * 1.1;
      const r = Math.random();
      p.hue = r < 0.08 ? 'accent' : (r < 0.14 ? 'sage' : 'ink');
    }
    for(let i=0; i<COUNT; i++){
      const p = {};
      spawn(p);
      p.life = Math.random() * p.maxLife;     // stagger starts
      particles.push(p);
    }

    let t = 0;
    let running = true;
    // Pause when offscreen / tab hidden to save CPU
    let inView = true;
    const io = ('IntersectionObserver' in window) && new IntersectionObserver((entries)=>{
      inView = entries[0].isIntersecting;
      if(inView && running) loop();
    }, { threshold: 0.01 });
    if(io) io.observe(canvas);
    document.addEventListener('visibilitychange', ()=>{
      running = !document.hidden;
      if(running && inView) loop();
    });

    function loop(){
      if(!running || !inView) return;
      t += 0.016;
      // Warm/dark wash so strokes leave soft trails
      ctx.fillStyle = palette.fade;
      ctx.fillRect(0, 0, W, H);

      ctx.lineCap = 'round';
      for(const p of particles){
        const [vx, vy] = field(p.x, p.y, t);
        const nx = p.x + vx;
        const ny = p.y + vy;

        const alpha = Math.min(1, p.life / 40) * (1 - p.life / p.maxLife);
        const rgb = palette[p.hue];
        // Brighten slightly for the rarer accent hues
        const k = p.hue === 'ink' ? 0.48 : 0.72;
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * k})`;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx; p.y = ny; p.life += 1;
        if(p.x > W + 20 || p.y < -20 || p.y > H + 20 || p.life > p.maxLife) spawn(p);
      }

      requestAnimationFrame(loop);
    }
    loop();
  }

  // ---------- 2. MOUSE PARALLAX ON FLOATING GLYPHS ----------
  function initGlyphParallax(){
    if(PREFERS_REDUCED) return;
    const wrap = document.getElementById('glyphLayer');
    if(!wrap) return;
    const glyphs = wrap.querySelectorAll('.sci-glyph');
    if(!glyphs.length) return;

    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    window.addEventListener('mousemove', (e)=>{
      const w = window.innerWidth, h = window.innerHeight;
      targetX = (e.clientX / w - 0.5);
      targetY = (e.clientY / h - 0.5);
    }, { passive: true });

    function tick(){
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      glyphs.forEach((g, i)=>{
        const depth = parseFloat(g.dataset.depth || (1 + (i % 3)));
        g.style.transform = `translate3d(${curX * -18 * depth}px, ${curY * -18 * depth}px, 0)`;
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---------- 3. RESEARCH-CARD HOVER PLAY ----------
  // Pauses CSS animations by default; starts them only when a card is hovered/focused.
  function initCardInteractivity(){
    const cards = document.querySelectorAll('.research-card');
    cards.forEach(card=>{
      card.addEventListener('mouseenter', ()=>card.classList.add('fx-play'));
      card.addEventListener('mouseleave', ()=>card.classList.remove('fx-play'));
      card.addEventListener('focusin',  ()=>card.classList.add('fx-play'));
      card.addEventListener('focusout', ()=>card.classList.remove('fx-play'));
    });
  }

  // ---------- BOOT ----------
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  function boot(){
    initFlowField();
    initGlyphParallax();
    initCardInteractivity();
  }
})();
