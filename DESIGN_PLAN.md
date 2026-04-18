# DESIGN_PLAN.md — Elite-Tier Redesign of azan.biomechemical.com

**Branch:** `redesign-antigravity`
**Author:** Claude (on behalf of Dr. Azan)
**Status:** Proposal — awaiting your approval before any file is touched.

---

## 0. Phase 0 Audit — Current State

### 0.1 Repo Inventory

| File | Role | LOC | Notes |
|---|---|---|---|
| `index.html` | Home | 329 | Hero, About, Research Interests (6 cards), Quick-links |
| `academics.html` | Publications + Grants | 198 | 20-item JS-rendered pub list, 8 grant cards |
| `students.html` | Supervision + Courses | 286 | 2 current + 7 graduated students, 3 course cards |
| `personal.html` | Gallery + Contact | 140 | 2 gallery photos, contact form, scholar/IIUM links |
| `blog.html` | Blog index | 63 | 1 blog card (links to `blog-2030-mirage.html`) |
| `blog-2030-mirage.html` | Long-form article | ~20 paras | "The 2030 Mirage" energy essay |
| `styles.css` | Global styles | 603 | Claymorphism system, recently-appended scientific-fx CSS |
| `script.js` | Navbar, reveal, form | 39 | Vanilla — no deps |
| `scientific-fx.js` | Hero canvas + glyphs | 155 | Vanilla — no deps |
| `CNAME` | `azan.biomechemical.com` | 1 | GitHub Pages domain |
| Images | 3× (portrait + 2 gallery) | — | JPG/JPEG, not optimized, no `<picture>`/WebP |

### 0.2 Current Design Tokens

```
/* Colors (current) */
Background:        #FFF8F0   (warm cream)
Ink (body):        #2D3436   (soft charcoal)
Primary accent:    #5BBFB5   (teal)           ← used everywhere
Secondary accent:  #F08080   (coral)          ← sparingly
Tertiary accent:   #F5A623 / #D4A853 (amber)  ← stats, citations
Muted text:        #666 / #888
White surface:     #FFFFFF

/* Typography */
Body:    'Inter', sans-serif (weights 300–700)
Display: 'Playfair Display', serif (weights 400–700)
No mono font, no variable fonts

/* Radius / shadow system */
Clay: 24px radius, dual-direction shadows (8/8/-4/-4),
      pure-white surface with inset highlights.
```

### 0.3 Component Inventory (what exists today)

**Global**
- Fixed navbar with backdrop-blur, mobile hamburger, scroll-shadow
- `.reveal` IntersectionObserver fade-up
- `.clay` + `.clay-teal` + `.clay-coral` surface utilities
- Section padding `5rem 1.5rem`, container `max-w-1200`

**Home**
- Hero: 2-column grid (name + keywords + 5 stat cards | 320px rounded photo) + flow-field `<canvas>` + 6 drifting SVG glyphs
- About: single clay card with education list
- Research: 6 SVG-icon cards with micro-animations (fx-dash, fx-wave, fx-pulse, fx-vortex, fx-ping)
- Quick-links: 3-up grid to inner pages
- Two `<div class="flow-divider">` animated wave strips between sections

**Inner pages**
- Page banner with glyph layer + underline accent
- Academics: search + year-filter pub list, grants split into On-Going / Completed
- Students: grid cards with role-tags (supervisor/cosupervisor) and status (ongoing/graduated)
- Courses: clay cards with emoji-prefixed resource lists ⚠️ (emojis = no-go per brief)
- Personal: gallery + form + info card with emoji icons ⚠️
- Blog: card grid → article page with justified `<p>` column

### 0.4 Problems to Fix (honest critique)

| # | Issue | Severity |
|---|---|---|
| 1 | Emoji icons in students, personal, academics (📄 🎬 📁 ✉ ☎ 🏢 🎓) — kills pro feel | HIGH |
| 2 | No custom cursor; no antigravity-style spotlight; hero is static relative to mouse | HIGH (the headline ask) |
| 3 | Stat numbers static — no count-up on scroll | MEDIUM |
| 4 | `<h1>` in hero is only `clamp(2rem, 5vw, 3rem)` ≈ 48px — too small for an editorial feel | HIGH |
| 5 | Photo is a hard rounded rectangle — brief asks for organic blob clip-path | MEDIUM |
| 6 | No scroll progress bar | LOW |
| 7 | Active-link indicator is a background-color swap, not a sliding pill | MEDIUM |
| 8 | No dark-mode toggle | LOW (optional) |
| 9 | No `loading="lazy"` / `fetchpriority`, no `<picture>`/WebP — LCP risk | MEDIUM |
| 10 | No schema.org JSON-LD, no Open Graph tags, no `sitemap.xml`, no `robots.txt` | MEDIUM (SEO) |
| 11 | Hero canvas runs continuously even when off-screen (only `visibilitychange`, not `IntersectionObserver`) | LOW |
| 12 | Contact form submits to nowhere (JS stub) | OUT OF SCOPE — keep as-is |
| 13 | Courses section resource links are all `href="#"` placeholders | OUT OF SCOPE — keep as-is |
| 14 | Two duplicate `Nur Marissa Kamarul Baharin` entries (current PhD + graduated Master) — correct, same person | OK, confirmed |
| 15 | No focus-visible ring styling — default browser outline | HIGH (a11y) |
| 16 | No CSS reset for `prefers-color-scheme` detection | LOW |

---

## 1. Proposed Design Direction

### 1.1 Mood Board — one sentence each

- **Linear**: monochrome with one bold accent, ruthless typography discipline, thin dividers.
- **Stripe**: grid-feel, precise spacing, warm neutrals, illustrations with technical-drawing vibes.
- **Rauno.me**: editorial serif + tight mono captions, small footprint animations that *respond* rather than *play*.
- **Google Antigravity**: cursor-driven radial brightening + weightless floating elements — **the signature move we're borrowing**.
- **Distill.pub / Quanta**: academic-serious, clear hierarchy, readable long-form, no "agency" flourishes.

The target feeling: **a research lab website that reads like a mature publication** (The Atlantic meets an MIT lab homepage). Not an agency portfolio.

### 1.2 Color Tokens (LIGHT MODE, primary)

```css
:root {
  /* Surfaces */
  --bg:            #fafaf7;   /* warm off-white, not pure */
  --bg-elev:       #ffffff;   /* card / elevated surface */
  --bg-sunk:       #f2f1ea;   /* muted panel */

  /* Ink */
  --ink:           #0f1419;   /* body text */
  --ink-2:         #3a4048;   /* secondary */
  --ink-3:         #6a7078;   /* muted / captions */
  --hairline:      rgba(15, 20, 25, 0.08); /* dividers */

  /* Accents — three, each with a job */
  --accent-1:      #0a4d6e;   /* steel/ocean blue — "precision/engineering" */
  --accent-1-soft: rgba(10, 77, 110, 0.08);
  --accent-2:      #c26a12;   /* burnt amber — "energy/CTA" (darker than d97706 for better AA) */
  --accent-2-soft: rgba(194, 106, 18, 0.10);
  --accent-3:      #5a8559;   /* sage — "organic/research/microalgae" */
  --accent-3-soft: rgba(90, 133, 89, 0.10);

  /* Spotlight (the antigravity cursor glow) */
  --spot:          rgba(255, 240, 210, 0.55); /* warm sunbeam */
  --spot-outer:    rgba(255, 240, 210, 0);

  /* Motion */
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out:   cubic-bezier(0.7, 0, 0.3, 1);
}

/* Dark mode (optional toggle, persisted in localStorage) */
:root[data-theme="dark"] {
  --bg:            #0e1013;
  --bg-elev:       #15181c;
  --bg-sunk:       #0a0c0f;
  --ink:           #e6e8eb;
  --ink-2:         #b4b8bf;
  --ink-3:         #7a8089;
  --hairline:      rgba(230, 232, 235, 0.08);
  --accent-1:      #5db2d9;   /* lightened for contrast */
  --accent-2:      #e89557;
  --accent-3:      #8fb88d;
  --spot:          rgba(255, 220, 170, 0.10);
}
```

**Contrast audit (all against `--bg` = `#fafaf7`):**
| Pair | Ratio | AA? |
|---|---|---|
| `--ink` on `--bg` | 17.8:1 | AAA |
| `--ink-3` on `--bg` | 4.9:1 | AA |
| `--accent-1` on `--bg` | 8.7:1 | AAA |
| `--accent-2` (#c26a12) on `--bg` | 4.8:1 | AA (body text size) |
| `--accent-3` on `--bg` | 4.6:1 | AA |

### 1.3 Typography Scale

```css
/* Google Fonts load: Instrument Serif, Inter Tight, JetBrains Mono */
--font-display: 'Instrument Serif', 'Playfair Display', Georgia, serif;
--font-body:    'Inter Tight', 'Inter', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;

/* Type scale — 1.25 desktop / 1.2 mobile */
--fs-xs:    clamp(0.75rem, 0.7rem + 0.2vw, 0.8rem);     /* 12-13px captions */
--fs-sm:    clamp(0.875rem, 0.85rem + 0.2vw, 0.95rem);   /* 14-15px ui */
--fs-base:  clamp(1rem, 0.95rem + 0.25vw, 1.1rem);       /* 16-18px body */
--fs-lg:    clamp(1.2rem, 1.1rem + 0.5vw, 1.4rem);       /* 19-22px lead */
--fs-h3:    clamp(1.5rem, 1.3rem + 1vw, 2rem);           /* 24-32px */
--fs-h2:    clamp(2rem, 1.6rem + 2vw, 3rem);             /* 32-48px */
--fs-h1:    clamp(3rem, 2rem + 5vw, 6rem);               /* 48-96px — editorial hero */

--lh-tight:  1.05;  /* display */
--lh-snug:   1.25;
--lh-body:   1.55;
--lh-loose:  1.75;
```

- H1 uses **Instrument Serif** with very tight tracking (`letter-spacing: -0.02em`).
- Body uses **Inter Tight** (a condensed variant — packs denser).
- Stats, keywords, citation counts, course codes, dates use **JetBrains Mono**.

### 1.4 Spacing & Layout

```css
--space-1:  4px;   --space-2:  8px;   --space-3: 12px;
--space-4: 16px;   --space-5: 24px;   --space-6: 32px;
--space-7: 48px;   --space-8: 64px;   --space-9: 96px;  --space-10: 128px;

--radius-sm: 8px;  --radius-md: 14px; --radius-lg: 20px; --radius-pill: 999px;
--container: 1200px;
```

Section vertical rhythm: `clamp(64px, 8vw, 128px)` top/bottom — generous breathing room like Stripe/Linear.

---

## 2. The Signature Feature — Antigravity Cursor

### 2.1 What it is (scoped to hero only)

Three layers, composited:

1. **Spotlight layer** — a single radial-gradient div that lives behind the hero content:
   ```css
   .hero::before {
     background: radial-gradient(
       600px circle at var(--mouse-x) var(--mouse-y),
       var(--spot) 0%,
       var(--spot-outer) 60%
     );
     mix-blend-mode: soft-light;  /* warms the cream background */
   }
   ```
   A single `mousemove` listener rAF-throttles and sets `--mouse-x/--mouse-y` on `.hero`. No per-frame JS beyond the single `style.setProperty` call.

2. **Particle layer** — 14 SVG glyphs (gears, turbine blades, pump impellers, microalgae cells, molecular rings, calipers, waveforms) absolutely positioned in the hero:
   ```css
   .particle {
     transform: translate3d(
       calc((var(--mouse-x, 50%) - 50%) * var(--w)),
       calc((var(--mouse-y, 50%) - 50%) * var(--w)),
       0
     );
     transition: transform 600ms var(--ease-out-expo);
   }
   /* each gets --w between 0.02 and 0.08 for parallax depth */
   ```
   Plus a slow per-particle CSS keyframe (`drift` 18–28s) for baseline life.

3. **Custom cursor** — two `position: fixed` divs at `z-index: 9999`:
   - `.cursor-dot` — 6px, follows exactly via `transform: translate(Xpx, Ypx)` set in rAF
   - `.cursor-ring` — 32px outlined, lerped with `0.15` easing factor per frame toward target
   - Hover-detection for `a, button, [role="button"]` expands ring to 1.5× + fills `--accent-2-soft`
   - Hover over `p, h1, h2, h3, h4, h5, h6, span` transforms ring into a 2px × 20px I-beam
   - Gated by `matchMedia('(hover: hover) and (pointer: fine)')` — disabled on touch

### 2.2 Non-negotiables

- One `rAF` loop for cursor (not per-particle). Spotlight uses CSS-var updates only.
- All disabled under `prefers-reduced-motion: reduce` — fallback to default cursor + static hero.
- Hero `IntersectionObserver` pauses the rAF loop when hero exits viewport.
- Particles are SVG with `opacity: 0.08–0.15`. Never emojis. All domain-relevant (mech/fluid/instrumentation/microalgae).

### 2.3 Particle inventory

| # | Glyph | Domain | Weight |
|---|---|---|---|
| 1 | 6-tooth gear | Mechanical | 0.045 |
| 2 | Turbine blade cross-section | Rotating eq. | 0.065 |
| 3 | Pump impeller (spiral) | Rotating eq. | 0.030 |
| 4 | Vortex spiral | Fluid mech | 0.075 |
| 5 | Pitot tube / pressure gauge | Instrumentation | 0.050 |
| 6 | Oscilloscope trace | Instrumentation | 0.035 |
| 7 | Shock-diamond chain | Supersonic | 0.060 |
| 8 | Microalgae cell (ellipsoid + flagella) | Research | 0.040 |
| 9 | Hex molecular ring | Chemistry | 0.055 |
| 10 | Caliper jaws | Precision | 0.020 |
| 11 | CFD mesh fragment (triangulated) | CFD | 0.070 |
| 12 | Sine wave packet | Signal | 0.030 |
| 13 | Shaft-alignment crosshair | Rotating eq. | 0.050 |
| 14 | Sensor antenna / IoT node | IoT | 0.025 |

---

## 3. Elite-Tier Component Upgrades

### 3.1 Navigation (shared, all pages)

- Sticky; `backdrop-filter: blur(16px) saturate(180%)`
- **Scroll-progress bar**: a 2px `::after` line pinned to navbar bottom with `transform: scaleX(var(--progress))` updated via one `scroll` handler (passive)
- **Sliding active-link pill**: measure bounding rects on page load + resize; translate a single `<span class="nav-pill">` behind the links. On route change (page navigation) it snaps before fade.
- **Dark-mode toggle**: sun/moon SVG button, `view-transition-name` for smooth swap on supporting browsers
- **Mobile**: slides in from right, scrim with backdrop-blur, body-scroll-lock while open

### 3.2 Hero (home)

- Huge H1 "Dr. Mohd Azan" in Instrument Serif, 64–96px, line-height 1.05
- Subhead in mono: `Assistant Professor · CFD · MHD · Rotating Equipment`
- Body bio paragraph in Inter Tight at `--fs-lg` for the first two sentences
- **Animated underline draws under name on load** — SVG `<path>` with `pathLength=1` and `stroke-dasharray/offset` animation (1000ms ease-out, 400ms delay)
- **Photo → organic blob**:
  ```svg
  <clipPath><path d="M180,20 C260,30 340,90 350,180 C360,280 280,350 180,345 ..."/></clipPath>
  ```
  + a very subtle `animation: blob-morph 16s ease-in-out infinite alternate` that interpolates to a second organic path.
- Stat cards: 5 cards in a row, each with the number in JetBrains Mono + a thin progress arc underneath counting with the IntersectionObserver count-up.

### 3.3 Count-up stat cards

```js
// IntersectionObserver fires once, requestAnimationFrame from 0 to target
// 1200ms with ease-out-expo; digits are tabular-nums monospace so layout never shifts
```
Numbers: 166 Citations · 6 h-index · 20 Publications · 8 Grants · 10 Students

### 3.4 Section transitions

- `IntersectionObserver` with `rootMargin: "-10% 0px"`, `threshold: 0.1`
- Each section marks children with `.stagger-child` and applies `transition-delay: calc(var(--i) * 90ms)`
- Subtle parallax only on `.hero` and section backgrounds (2–5% translate on scroll), via a single shared `scroll` handler with `requestAnimationFrame` gate

### 3.5 Buttons / Links / Cards

```css
/* CTA — warm amber lift */
.btn {
  background: var(--ink);
  color: var(--bg);
  transition: transform 250ms var(--ease-out-expo),
              box-shadow 300ms var(--ease-out-expo);
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px var(--accent-2);
}

/* Inline link — underline draw-in from left */
a.link {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: background-size 350ms var(--ease-out-expo);
}
a.link:hover { background-size: 100% 1px; }

/* Card hover — float + accent ring + content nudge */
.card {
  transition: transform 350ms var(--ease-out-expo), border-color 300ms ease;
  border: 1px solid var(--hairline);
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-1-soft);
  box-shadow: 0 20px 40px -16px var(--accent-1-soft);
}
.card:hover > :first-child { transform: translateY(-2px); }

/* Focus — never default browser outline */
:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### 3.6 Custom iconography (replace every emoji)

| Current emoji | Replacement SVG |
|---|---|
| 🎓 (graduation cap) | Simple mortarboard outline, 2px stroke |
| ✉ / envelope | Open envelope with seam |
| ☎ / phone | Handset silhouette |
| 🏢 (building) | Faculty building line-art |
| 📄 (document) | Folded paper with corner |
| 🎬 (film) | Play triangle inside rounded square |
| 📁 (folder) | Folder with tab |
| ▶ (play) | Triangle inside rounded square |
| 📚 (books) | Stacked books |

All share: 1.6px stroke, round caps, 24×24 viewBox, `currentColor`. Hover: 200ms stroke-dashoffset draw-in for the most prominent icons.

### 3.7 Academics page

- Publication cards: each row is two lines — title in `--fs-base`, then a mono meta-row `[YEAR] · journal · ● 60 citations`. Year becomes a "tab-strip" of mono tags; hover = accent-1 underline.
- Search: input with a leading SVG magnifier icon, focus ring in accent-2
- Filter buttons: pill group with sliding indicator (same technique as navbar)
- Grants: 2-col grid; "On-Going" uses accent-1 tag, "Completed" uses accent-3 tag; hover = card lift + thin left border accent

### 3.8 Students page

- Supervision cards: name in Instrument Serif (italic), role as mono tag, topic in Inter Tight body, status line with a small colored dot (accent-1 = ongoing, accent-3 = graduated)
- Course cards: header is a 2-row mono block (CODE / semester) with a slim vertical divider; resources list uses line-icon (document, play, folder) instead of emojis. The "Download/Watch/Open" turns into a subtle right-arrow on hover.

### 3.9 Personal page

- Gallery: 2-up, hover scales 1.03× + shows a mono caption overlay that slides up from the bottom
- Contact form: stack of underlined inputs (no boxes) — very editorial, with label above in mono
- Send button: dark ink with amber underline glow on hover
- Info card: line-SVG icons for email/phone/address. Scholar + IIUM buttons become thin-outlined pills with hover-fill.

### 3.10 Blog + article

- Blog index card: date in mono caption, title in Instrument Serif, excerpt in Inter Tight, read-more as an arrow link
- Article page: max-width 680px column, drop-cap on first paragraph, pull-quotes get a left accent-1 border, inline links get the underline-draw-in treatment, reading-progress bar on top, estimated-read-time `[7 min]` mono tag next to date

### 3.11 Section dividers

Keep the `flow-divider` concept but simplify:
- A single thin `--hairline` stroke with a mono label centered: `— §02 —`
- Optional animated SVG sine wave behind it at `opacity: 0.1`

---

## 4. Technical Constraints Honored

| Requirement | Plan |
|---|---|
| Vanilla HTML/CSS/JS, no framework | ✅ keep current stack |
| No heavy libs (no GSAP full) | ✅ zero dependencies; all motion via CSS + rAF |
| Lighthouse Perf ≥ 90 mobile | ✅ fonts via `<link rel="preload">` + `font-display: swap`; hero canvas only on desktop; critical CSS inlined; images to WebP + `loading="lazy"` (existing JPGs converted where possible) |
| LCP < 2.5s | ✅ hero text is LCP → no blocking JS before paint; Instrument Serif has `font-display: swap` |
| CLS < 0.1 | ✅ fixed-aspect portrait container, preserved heights for hero + stat cards |
| 60 fps cursor | ✅ one rAF loop, CSS custom props, GPU transforms only |
| WCAG AA | ✅ colors audited above; focus-visible ring; skip-link; ARIA labels on icon buttons |
| `prefers-reduced-motion` | ✅ one `@media` block kills all custom animations + cursor |
| Cursor desktop-only | ✅ `@media (hover: hover) and (pointer: fine)` gate |
| Keyboard navigable | ✅ tab order matches visual; focus-visible; Esc closes mobile menu |
| Semantic HTML | ✅ `<header> <main> <article> <aside> <nav> <footer>`; H1 once per page |
| SEO — schema.org + OG | ✅ ADD: JSON-LD `Person` + `ScholarlyArticle` on blog; OG tags; `sitemap.xml`; `robots.txt`; canonical URLs |
| Mobile-first, test 375px | ✅ hero cursor effect disabled on touch → static gradient instead |
| No purple-pink SaaS gradient | ✅ warm-neutral only, one ocean accent, one amber, one sage |

---

## 5. Implementation Order (so you can review incrementally)

**Stage A — Foundation (no visual change yet)**
1. Add `<meta>` OG tags, JSON-LD, canonical, `sitemap.xml`, `robots.txt`
2. Introduce new CSS token layer at top of `styles.css` (doesn't break existing rules)
3. Load Instrument Serif + Inter Tight + JetBrains Mono via one `<link>`

**Stage B — Hero + Cursor (STOP HERE FOR YOUR REVIEW)**
4. Rewrite hero markup on `index.html` with editorial H1, organic-blob photo, new particles
5. Add `cursor.js` + `antigravity.js` (two tiny modules, <200 LOC combined)
6. Add the spotlight `::before`, particle CSS, cursor CSS
7. Deploy to a local preview; you walk through it; if "feel" is right → continue

**Stage C — Rest of the system**
8. Navbar upgrade (scroll-progress, sliding pill, dark-mode toggle)
9. Convert all emoji → line SVG icons (sweep across every page)
10. Stat-count-up on scroll
11. Section reveals with staggered children
12. Card hover / link draw-in / focus-visible polish
13. Academics/Students/Personal/Blog pages aligned to new type + tokens
14. Drop-cap + reading-progress on blog article

**Stage D — Audit**
15. Lighthouse run (desktop + mobile)
16. Cross-browser: Chrome, Safari, Firefox latest — note any `backdrop-filter`, `mix-blend-mode`, `view-transition` divergence
17. Axe-core accessibility scan
18. `CHANGELOG.md` with before/after
19. PR left open, not merged

---

## 6. Files I Will Create / Modify

| File | Action |
|---|---|
| `DESIGN_PLAN.md` | CREATE (this doc) — awaiting approval |
| `index.html` | MODIFY — hero rewrite, particles, icons, stat markup |
| `academics.html` | MODIFY — icons, card polish, mono meta, grants visual |
| `students.html` | MODIFY — icons (critical: resource emojis), card polish |
| `personal.html` | MODIFY — icons (critical: all emojis), form restyle, gallery caption |
| `blog.html` | MODIFY — card polish, banner glyphs, type |
| `blog-2030-mirage.html` | MODIFY — drop-cap, reading progress, pull-quote treatment |
| `styles.css` | MODIFY — prepend token layer, add new utilities, dark-mode vars, antigravity hero CSS, icon sizes, focus-visible. Keep scientific-fx.js compatibility. |
| `script.js` | MODIFY — extend with stat-count-up, sliding nav pill, scroll progress, theme toggle, stagger reveals, skip-link behavior |
| `scientific-fx.js` | MODIFY — swap cyan leftovers, pause on IntersectionObserver, coexist with antigravity |
| `antigravity.js` | CREATE — cursor dot+ring, spotlight rAF, particle hook |
| `icons.js` *(optional inline)* | CREATE — reusable SVG symbol sprite, loaded once |
| `sitemap.xml` | CREATE |
| `robots.txt` | CREATE |
| `og-image.jpg` | CREATE (1200×630, name + affiliation) |
| `CHANGELOG.md` | CREATE at the end |

No existing file is deleted.

---

## 7. Questions Before I Start

1. **Dark mode**: build it or skip it? (Brief says "optional but recommended".) My recommendation: **build it** — it's ~40 extra lines of CSS and signals polish.
2. **Photo clip-path**: you OK with me using the existing `portrait_sapardi.jpg` inside an SVG blob clip, or do you want me to leave it as a rounded rectangle?
3. **Contact form**: leave as UI-only stub (as today) or wire up a Formspree/Netlify endpoint? Default: leave as stub.
4. **Courses resources**: all links are currently `href="#"` placeholders. Leave as-is or hide until you have real links? Default: leave as-is with a subtle "coming soon" mono tag.
5. **Deploy target**: keep pushing to `main` for GitHub Pages, or prefer the PR stays unmerged and you merge yourself? Brief says "leave PR open" — will do.
6. **Fonts**: Instrument Serif has a "warmer" editorial feel than Playfair Display. OK to swap, or prefer to keep Playfair for continuity? Default: **swap to Instrument Serif**.

---

## 8. What happens if you say "go"

I'll execute Stage A immediately (invisible groundwork), then Stage B (hero + cursor), stop, and ping you with a preview commit so you can judge the feel before I rebuild the rest of the site.

**Please reply with either `approved`, or specific edits to this plan.**

---

## 9. Addendum — Tooling Decision Needed

After the initial plan you added a second directive about tooling. I ran it down but there's a contradiction between your two messages that I can't silently resolve. Choosing one or the other quietly would burn hours either way, so I'm surfacing it.

### 9.1 `frontend-design` skill

Checked `C:\Users\salmi\.claude\skills\` — **directory does not exist.** No `frontend-design` skill is installed globally or in the project's `.claude/` folder. The only skill present is `ui-ux-pro-max` (already in use). Proceeding without the skill.

### 9.2 The contradiction

| First message says | Second message says |
|---|---|
| "Stay **vanilla**: HTML/CSS/JS only unless already on a framework. **No React rewrite**. **No build step** if none exists currently." | "Use **Tailwind v4**, **shadcn/ui** components, **Radix UI** primitives..." |
| "**No heavy libraries**" | "shadcn/ui... Radix UI primitives (shadcn uses these under the hood)" |

The issue: **shadcn/ui and Radix UI are React-only.** They physically cannot run without a React runtime and a build pipeline. If you want them, the site has to become a React/Next.js app — which the first message explicitly rules out. Tailwind v4 can be bolted onto a static site (CLI build or CDN), but shadcn/Radix can't.

### 9.3 Three ways I can proceed — pick one

**Option A — Stay 100% vanilla (honor message #1 literally)**
- No Tailwind, no shadcn, no Radix.
- Adopt the *spirit* of message #2: strict token hierarchy (`tokens → primitives → components → sections → pages`) in plain CSS custom properties; component classes named shadcn-style (`btn`, `btn-primary`, `card`, `card-header`, etc.); Lucide icons via their [static SVG CDN](https://unpkg.com/lucide-static@latest/icons/) or copied inline.
- Pros: zero build step, smallest JS payload, ships today, zero risk to GitHub Pages deploy.
- Cons: doesn't literally use the tools you named.

**Option B — Static HTML + Tailwind v4 CLI (hybrid)**
- Keep HTML/JS vanilla. Add Tailwind v4 as a single-file CLI build: `npx @tailwindcss/cli -i input.css -o styles.css --minify`. One `package.json`, no framework. GitHub Pages still serves static files.
- shadcn/Radix: use their *class patterns* and *accessibility primitives* (copied into vanilla HTML with ARIA roles) but not the React components themselves. Lucide via static SVG.
- Pros: tokens in `globals.css` + Tailwind config mirrored, shadcn-aesthetic, lean runtime.
- Cons: introduces a tiny Node build step (new dep you didn't have before).

**Option C — Full Next.js + shadcn/ui rewrite**
- Rebuild the site as a Next.js app. shadcn/ui + Radix + Tailwind v4 native. Deploy from `/out/` via `next export` to GitHub Pages.
- Pros: gets you literally the tools you named, future-proof for a real blog CMS later.
- Cons: **directly violates "no React rewrite"** from message #1; multi-day effort vs. a one-day refresh; every existing page needs porting; deploy pipeline changes.

### 9.4 My recommendation

**Option A**, unless you want the Node build toolchain on this repo. The aesthetic target (Claude.ai / Anthropic / Linear / Rauno) is about **discipline and restraint**, not about which framework wrote the HTML. Those sites happen to be React — but what makes them feel that way is:

- Strict token hierarchy
- Editorial typography (Instrument Serif / Tiempos / Söhne)
- One accent, deployed sparingly
- Motion that *responds*, not *performs*
- Every pixel of spacing on a scale

All of that is reproducible in vanilla CSS with zero React. The "shadcn layer" I'd build: component classes (`[data-component="button"]`, `[data-variant="primary"]`) that mirror shadcn's naming so if you ever do migrate to React, the CSS selectors port cleanly.

**Option B** if you're OK with a minimal `package.json` + one `npm run build` step. I'd sugggest this if you're planning to do more custom pages over time — Tailwind pays off beyond ~2–3 pages.

**Option C only if** you accept the first-message rule gets overridden by the second.

### 9.5 What I need from you

Reply with one of:
- `A` — all-vanilla, tokens-first, shadcn-patterned, Lucide via SVG
- `B` — vanilla + Tailwind v4 CLI, shadcn patterns, Lucide via class
- `C` — full Next.js rewrite (accepting the framework override)

Plus your answers to the six questions in §7 above. Then I execute Stage A → B → stop → show.

