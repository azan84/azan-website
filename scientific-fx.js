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
  function initFlowField(){
    if(PREFERS_REDUCED) return;
    const canvas = document.getElementById('flowCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const isMobile = window.matchMedia('(max-width:768px)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let particles = [];
    const COUNT = isMobile ? 55 : 140;

    function resize(){
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.scale(DPR, DPR);
    }
    resize();
    window.addEventListener('resize', ()=>{
      ctx.setTransform(1,0,0,1,0,0);
      resize();
    }, { passive: true });

    // Simple pseudo-curl-noise: smooth, swirly field around a virtual cylinder
    function field(x, y, t){
      // cylinder located slightly right of center: simulates wake
      const cx = W * 0.72, cy = H * 0.55;
      const dx = x - cx, dy = y - cy;
      const r = Math.sqrt(dx*dx + dy*dy) + 1e-3;
      // swirl around the "cylinder" + a global mean flow to the right
      const swirl = 80 / (r * 0.06 + 1);
      const ang = Math.atan2(dy, dx);
      const vx =  Math.cos(ang + Math.PI/2) * swirl * 0.018 + 0.55
                + Math.sin(y * 0.008 + t*0.3) * 0.25;
      const vy =  Math.sin(ang + Math.PI/2) * swirl * 0.018
                + Math.cos(x * 0.008 + t*0.2) * 0.25;
      return [vx, vy];
    }

    function spawn(p){
      p.x = Math.random() * -50;         // spawn left of canvas
      p.y = Math.random() * H;
      p.life = 0;
      p.maxLife = 240 + Math.random() * 260;
      p.w = 0.6 + Math.random() * 1.1;
      p.hueShift = Math.random() < 0.12 ? 1 : 0;  // ~12% amber accents
    }
    for(let i=0; i<COUNT; i++){
      const p = {};
      spawn(p);
      p.life = Math.random() * p.maxLife;   // stagger starts
      particles.push(p);
    }

    let t = 0;
    let running = true;
    document.addEventListener('visibilitychange', ()=>{ running = !document.hidden; if(running) loop(); });

    function loop(){
      if(!running) return;
      t += 0.016;
      // Trail fade (additive darkening so strokes leave soft trails)
      ctx.fillStyle = 'rgba(8, 12, 24, 0.09)';
      ctx.fillRect(0, 0, W, H);

      ctx.lineCap = 'round';
      for(const p of particles){
        const [vx, vy] = field(p.x, p.y, t);
        const nx = p.x + vx;
        const ny = p.y + vy;

        // Stroke a tiny segment
        const alpha = Math.min(1, p.life / 40) * (1 - p.life / p.maxLife);
        ctx.strokeStyle = p.hueShift
          ? `rgba(245, 166, 35, ${alpha * 0.55})`   // amber accent
          : `rgba(91, 191, 181, ${alpha * 0.55})`;  // teal (matches #5BBFB5)
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
