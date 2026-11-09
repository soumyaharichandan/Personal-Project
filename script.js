document.getElementById('yr').textContent = new Date().getFullYear();

// Theme toggle
const root = document.documentElement;
const btn = document.getElementById('theme');
const isDark = () => root.dataset.theme
  ? root.dataset.theme === 'dark'
  : matchMedia('(prefers-color-scheme: dark)').matches;
try { const s = localStorage.getItem('theme'); if (s) root.dataset.theme = s; } catch (e) {}
const paint = () => { btn.textContent = isDark() ? '☀' : '☾'; };
paint();
btn.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  paint();
});

// Burger menu (secondary nav links, e.g. Lab)
(function () {
  const burgerBtn = document.getElementById('burgerBtn');
  const burgerPanel = document.getElementById('burgerPanel');
  if (!burgerBtn || !burgerPanel) return;
  function open() { burgerPanel.hidden = false; burgerBtn.classList.add('open'); burgerBtn.setAttribute('aria-expanded', 'true'); }
  function close() { burgerPanel.hidden = true; burgerBtn.classList.remove('open'); burgerBtn.setAttribute('aria-expanded', 'false'); }
  burgerBtn.addEventListener('click', e => {
    e.stopPropagation();
    burgerPanel.hidden ? open() : close();
  });
  burgerPanel.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// Current-page indicator in the header nav (including the burger menu)
(function () {
  const navLinks = document.querySelectorAll('header.site nav > a');
  const burgerBtn = document.getElementById('burgerBtn');
  const burgerLinks = document.querySelectorAll('.burger-panel a');
  if (!navLinks.length && !burgerLinks.length) return;

  const fileOf = href => (href || '').split('#')[0].split('/').pop();
  let current = fileOf(location.pathname) || 'index.html';
  // case studies are a sub-page of Work, so treat them as "Work" for this purpose
  const currentForNav = /^case-\d+\.html$/.test(current) ? 'work.html' : current;

  navLinks.forEach(a => {
    if (fileOf(a.getAttribute('href')) === currentForNav) {
      a.classList.add('nav-current');
      a.setAttribute('aria-current', 'page');
    }
  });

  let matchedInBurger = false;
  burgerLinks.forEach(a => {
    if (fileOf(a.getAttribute('href')) === current) {
      a.classList.add('nav-current');
      a.setAttribute('aria-current', 'page');
      matchedInBurger = true;
    }
  });
  if (matchedInBurger && burgerBtn) burgerBtn.classList.add('nav-current');
})();

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Hero particles: drifting pixels that scatter away from the cursor
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dots = [], mouse = { x: -999, y: -999 };

  const size = () => {
    const r = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = Array.from({ length: Math.round(w * h / 1800) }, () => {
      const x = Math.random() * w, y = Math.random() * h;
      return { x, y, ox: x, oy: y, vx: 0, vy: 0, s: Math.random() < .2 ? 4 : 2, p: Math.random() * 6.28 };
    });
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);

    // Soft spotlight glow that follows the cursor
    if (mouse.x > -500) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
      grad.addColorStop(0, 'rgba(13,13,13,0.06)');
      grad.addColorStop(1, 'rgba(13,13,13,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = '#0d0d0d';
    for (const d of dots) {
      const tx = d.ox + Math.sin(t / 2000 + d.p) * 6, ty = d.oy + Math.cos(t / 2300 + d.p) * 6;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - dist / 140);
      if (dist < 140) { d.vx += (dx / (dist || 1)) * 1.6 * near; d.vy += (dy / (dist || 1)) * 1.6 * near; }
      d.vx += (tx - d.x) * .03; d.vy += (ty - d.y) * .03;
      d.vx *= .86; d.vy *= .86; d.x += d.vx; d.y += d.vy;
      ctx.globalAlpha = .55 + near * .45;
      const grow = d.s + near * 3;
      ctx.fillRect(d.x, d.y, grow, grow);
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  const sketchImg = canvas.parentElement.querySelector('.hero-sketch');
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (sketchImg) {
      const nx = (mouse.x / w - .5) * 2, ny = (mouse.y / h - .5) * 2; // -1..1
      sketchImg.style.transform = `translateX(-50%) rotate(${nx * -1.6}deg) translate(${nx * 6}px, ${ny * 4}px) scale(1.015)`;
    }
  });
  canvas.parentElement.addEventListener('pointerleave', () => {
    mouse = { x: -999, y: -999 };
    if (sketchImg) sketchImg.style.transform = 'translateX(-50%)';
  });
  addEventListener('resize', size);
  size(); requestAnimationFrame(draw);

  // Custom ring cursor over the hero
  const cur = document.createElement('div');
  cur.className = 'hero-cursor';
  document.body.appendChild(cur);
  canvas.parentElement.addEventListener('pointerenter', () => cur.classList.add('show'));
  canvas.parentElement.addEventListener('pointerleave', () => cur.classList.remove('show'));
  canvas.parentElement.addEventListener('pointermove', (e) => {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });
}

// Sketchbook — "work I'm proud of": one small flip-book per project
(function () {
  const shelf = document.getElementById('skShelf');
  if (!shelf) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COILS = 10;

  const projects = [
    { title: "ai investigations", kick: "security analysts × ai, during investigations", read: "9 min read",
      url: "case-1.html", paper: "#dbe0ec", paperBack: "#c9d0e2", band: "#6f8af2", bandInk: "#fbfcff",
      notes: [["q", "how do analysts and ai work one case together?"], ["tried", "alerts + ai thread side by side"], ["kept", "one shared investigation view"]],
      sticky: ["human + ai", "one thread"], ui: "matters", sketch: "matters", tags: ["AI", "Security"] },
    { title: "partner credits", kick: "ux for an aws partner credits programme", read: "3 min read",
      url: "case-2.html", paper: "#f8e3c8", paperBack: "#efd3ae", band: "#f0a93f", bandInk: "#2e1b08",
      notes: [["q", "why weren't partners claiming credits?"], ["tried", "checks as a clear pass / fail list"], ["kept", "eligibility visible up front"]],
      sticky: ["$5,000", "credits unlocked"], ui: "checks", sketch: "checks", tags: ["UX", "Partner programs"],
      substages: ["Research & Discovery", "Definition", "Testing & Validation"] },
    { title: "vision ui", kick: "design system · dark mode & white-labeling", read: "2 min read",
      url: "case-3.html", paper: "#dcf1e7", paperBack: "#c7e6d7", band: "#36b88e", bandInk: "#f3fdf9",
      notes: [["q", "one ui, many brands?"], ["tried", "tokens for every colour"], ["kept", "themes swap without new screens"]],
      sticky: ["dark mode", "+ white-label"], ui: "vision", sketch: "vision", tags: ["Design systems", "Theming"] },
    { title: "wafr insights", kick: "turning checks into a reporting workflow", read: "2 min read",
      url: "case-4.html", paper: "#ece2f8", paperBack: "#dccbef", band: "#9c5fe0", bandInk: "#faf5ff",
      notes: [["q", "where do the 5 hours go?"], ["tried", "auto-built report from checks"], ["kept", "dashboard first, export after"]],
      sticky: ["5 h → 45 m", "per report"], ui: "insights", sketch: "insights", tags: ["Analytics", "Reporting"] }
  ];

  // seeded wobble so the sketch looks hand-drawn but stays the same every load
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const j = (a = 1) => (rnd() * 2 - 1) * a;
  const rect = (x, y, w, h) => `M${x + j()} ${y + j()} L${x + w + 1.6 + j()} ${y + j(.6)} M${x + w + j()} ${y - 1 + j()} L${x + w + j()} ${y + h + 1.2 + j()} M${x + w + 1 + j()} ${y + h + j()} L${x - 1 + j()} ${y + h + j(.6)} M${x + j()} ${y + h + 1 + j()} L${x + j(.6)} ${y - 1.4}`;
  const line = (x1, y1, x2, y2) => `M${x1 + j()} ${y1 + j()} Q${(x1 + x2) / 2 + j(1.5)} ${(y1 + y2) / 2 + j(1.5)} ${x2 + j()} ${y2 + j()}`;
  const circ = (cx, cy, r) => `M${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx + r - .5} ${cy - 2.5}`;

  const sketches = {
    matters() {
      const p = [[rect(10, 8, 280, 164)], [line(10, 24, 290, 24), "lite"], [rect(14, 30, 46, 136), "lite"]];
      for (let i = 0; i < 4; i++) { p.push([rect(68, 34 + i * 22, 140, 16)]); p.push([circ(76, 42 + i * 22, 3), "lite"]); p.push([line(86, 42 + i * 22, 170, 42 + i * 22), "lite"]); }
      p.push([rect(216, 34, 68, 60)]); p.push([line(222, 48, 276, 48), "lite"]); p.push([line(222, 58, 266, 58), "lite"]); p.push([rect(216, 104, 68, 24), "lite"]); return p;
    },
    checks() {
      const p = [[rect(10, 8, 280, 164)], [rect(22, 20, 256, 20)]];
      for (let i = 0; i < 5; i++) { const y = 50 + i * 23; p.push([rect(24, y, 10, 10)]); p.push([line(26, y + 5, 29, y + 9) + " " + line(29, y + 9, 35, y - 1), "lite"]); p.push([line(44, y + 5, 200, y + 5), "lite"]); p.push([rect(236, y, 36, 10), "lite"]); }
      return p;
    },
    vision() {
      const p = [[rect(10, 8, 280, 164)], [line(150, 8, 150, 172)]];
      [20, 160].forEach(x => { p.push([line(x, 24, x + 60, 24), "lite"]); p.push([rect(x, 34, 120, 52)]); p.push([rect(x, 96, 120, 52)]); p.push([line(x + 10, 48, x + 50, 48), "lite"]); p.push([line(x + 10, 110, x + 70, 110), "lite"]); });
      p.push([circ(150, 90, 10), "lite"]); return p;
    },
    insights() {
      const p = [[rect(10, 8, 280, 164)], [rect(22, 20, 80, 32)], [rect(110, 20, 80, 32)], [rect(198, 20, 80, 32)], [line(26, 160, 276, 160)]];
      [40, 62, 30, 80, 50, 96].forEach((h, i) => p.push([rect(36 + i * 40, 160 - h, 22, h), i === 5 ? "" : "lite"]));
      p.push([line(30, 40, 70, 40), "lite"]); p.push([line(120, 40, 170, 40), "lite"]); return p;
    }
  };

  const uis = {
    matters: `<div class="sk-ui dark"><div class="side"><i></i><i></i><i></i><i></i><i></i></div><div class="main">
      <div class="row"><i style="background:#ef5a45"></i><span class="bar" style="max-width:60%"></span></div>
      <div class="row"><i style="background:#f2b33d"></i><span class="bar" style="max-width:75%"></span></div>
      <div class="row"><i style="background:#f2b33d"></i><span class="bar" style="max-width:50%"></span></div>
      <div class="bubble">ai: these 3 alerts share one host. want me to group them?</div></div></div>`,
    checks: `<div class="sk-ui light"><div class="main">
      <div class="banner">eligible for $5,000 in aws credits</div>
      <div class="chk"><em class="ok">pass</em><span class="bar" style="background:#e6e8ec;max-width:70%"></span></div>
      <div class="chk"><em class="ok">pass</em><span class="bar" style="background:#e6e8ec;max-width:55%"></span></div>
      <div class="chk"><em class="no">fix</em><span class="bar" style="background:#e6e8ec;max-width:65%"></span></div>
      <div class="chk"><em class="ok">pass</em><span class="bar" style="background:#e6e8ec;max-width:45%"></span></div></div></div>`,
    vision: `<div class="sk-ui split"><div class="l"><span class="lbl">light</span><div class="card"><i class="acc"></i><i></i><i style="width:70%"></i></div><div class="card"><i style="width:50%"></i><i></i></div></div>
      <div class="d"><span class="lbl">dark</span><div class="card"><i class="acc"></i><i></i><i style="width:70%"></i></div><div class="card"><i style="width:50%"></i><i></i></div></div></div>`,
    insights: `<div class="sk-ui light chart"><div class="stats"><div class="stat"><span class="lbl" style="color:#777">report time</span><b>45 min</b><s>5 hrs</s></div>
      <div class="stat"><span class="lbl" style="color:#777">pillars</span><b>6</b></div></div>
      <div class="bars"><i style="height:40%"></i><i style="height:62%"></i><i style="height:30%"></i><i style="height:80%"></i><i style="height:50%"></i><i class="hi" style="height:96%"></i></div></div>`
  };

  const holes = `<div class="sk-holes" aria-hidden="true">${'<i></i>'.repeat(COILS)}</div>`;
  const backFace = `<div class="sk-face back">${holes}</div>`;

  // a small static pencil preview of a project's own sketch, used on its cover
  function coverSketch(p, i) {
    seed = 31 + i * 13;
    const paths = sketches[p.sketch]();
    return `<svg viewBox="0 0 300 180" aria-hidden="true">${paths.map(x => `<path d="${x[0]}" class="${x[1] === 'lite' ? 'soft' : ''}"/>`).join("")}</svg>`;
  }

  const shelfHTML = projects.map((p, i) => {
    const num = String(i + 1).padStart(2, "0");
    seed = 11 + i * 17;
    const paths = sketches[p.sketch]();
    const svg = `<svg class="sk" viewBox="0 0 300 180" aria-hidden="true">${paths.map((x, k) => `<path pathLength="1" class="${x[1] || ""}" style="--d:${(k * 0.06).toFixed(2)}s" d="${x[0]}"/>`).join("")}</svg>`;

    const cover = `<div class="sk-page sk-cover" data-label="cover"><div class="sk-face front" role="button" tabindex="0" aria-label="open the sketchbook for ${p.title}">${holes}
      <div class="sk-inner"><div class="sk-cover-top"><div class="sk-brand"><span class="owner">soumya's</span><span class="word"><span>sketchbook</span></span></div>
      <div class="sk-spec"><b>${num}</b><small>${p.read}</small></div></div>
      <div class="sk-cover-art">${coverSketch(p, i)}</div>
      <div class="sk-band"><span class="t">${p.title}</span><span class="sk-meta">${p.kick}</span>
      <span class="open">open <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20 V5 M6 11 L12 5 L18 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></div></div></div>${backFace}</div>`;

    const proj = `<div class="sk-page sk-proj" data-label="p.${num} · ${p.title}"><div class="sk-face front sk-dotgrid">${holes}<div class="sk-inner">
      <div class="sk-top"><span class="sk-num">p.${num} · ${p.read}</span><button type="button" class="sk-back-link" data-go="0">↩ close</button></div>
      <h3>${p.title}</h3><p class="sk-kick">${p.kick}</p>
      <div class="sk-board" tabindex="0" role="button" aria-label="toggle between sketch and finished screen for ${p.title}">${svg}
        <span class="sk-tape a"></span><span class="sk-tape b"></span><div class="sk-final">${uis[p.ui]}</div><span class="sk-peek-hint">hover to see the sketch</span></div>
      <div class="sk-notes">${p.notes.map(n => `<p><b>${n[0]}:</b>${n[1]}</p>`).join("")}</div>
      <div class="sk-sticky"><b>${p.sticky[0]}</b><span>${p.sticky[1]}</span></div>
      <a class="sk-read" href="${p.url}">read the case study →</a>
    </div></div>${backFace}</div>`;

    return `<div class="sk-cell" data-title="${p.title}" data-kick="${p.kick}" data-tags="${(p.tags || []).join(',')}" data-substages="${(p.substages || []).join('|')}">
      <div class="sk-stage sk-stage-sm">
        <div class="sk-book" data-book="${i}" tabindex="-1" style="--sk-paper:${p.paper};--sk-paper-back:${p.paperBack};--sk-kraft:${p.band};--sk-kraft-ink:${p.bandInk};">
          <div class="sk-stack"></div>
          <div class="sk-spiral" aria-hidden="true">${'<i></i>'.repeat(COILS)}</div>
          <div class="sk-pages">${cover}${proj}</div>
        </div>
      </div>
    </div>`;
  }).join("");

  shelf.innerHTML = shelfHTML;

  // dim backdrop behind the book that's currently zoomed to center
  const overlay = document.createElement('div');
  overlay.className = 'sk-overlay';
  document.body.appendChild(overlay);
  let closeActive = null; // close function of the currently-open book, if any

  // each book flips independently between its two pages (cover / project),
  // and zooms to the center of the screen while its project page is open
  shelf.querySelectorAll('.sk-book').forEach(book => {
    const pages = [...book.querySelectorAll('.sk-page')];
    const stage = book.closest('.sk-stage-sm');
    const cell = book.closest('.sk-cell');
    let idx = 0;
    let homeRect = null;

    function paint() {
      pages.forEach((p, i) => {
        p.classList.toggle('flipped', i < idx);
        p.classList.toggle('active', i === idx);
        // the cover (page 0) is a physical flap sitting on top of the project
        // page underneath it — keep that stacking constant in both directions
        // so the cover's own flip (handled by its front/back faces) is what's
        // visible, instead of the page below popping on top mid-rotation
        p.style.zIndex = pages.length - i;
        p.inert = i !== idx;
      });
    }

    function openModal(onDone) {
      homeRect = stage.getBoundingClientRect();
      cell.style.minHeight = homeRect.height + 'px';
      stage.style.position = 'fixed';
      stage.style.margin = '0';
      stage.style.zIndex = '1000';
      stage.style.left = homeRect.left + 'px';
      stage.style.top = homeRect.top + 'px';
      stage.style.width = homeRect.width + 'px';
      stage.classList.add('sk-zoomed');
      document.body.classList.add('sk-modal-open');
      overlay.classList.add('show');
      void stage.offsetWidth; // force reflow before animating to target
      const targetW = Math.min(560, innerWidth * 0.88, (innerHeight - 64) * (6.8 / 8.3));
      const targetH = targetW * (8.3 / 6.8);
      const targetLeft = (innerWidth - targetW) / 2;
      const targetTop = Math.max(16, (innerHeight - targetH) / 2);
      stage.style.transition = reduce ? 'none' : 'left .45s cubic-bezier(.2,.8,.2,1), top .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)';
      stage.style.left = targetLeft + 'px';
      stage.style.top = targetTop + 'px';
      stage.style.width = targetW + 'px';
      closeActive = () => go(0);
      // only flip the page open once the zoom-to-center has fully settled
      if (reduce) { onDone(); return; }
      stage.addEventListener('transitionend', function onZoomIn(e) {
        if (e.target !== stage || e.propertyName !== 'width') return;
        stage.removeEventListener('transitionend', onZoomIn);
        onDone();
      });
    }

    function closeModal() {
      if (!homeRect) return;
      closeActive = null;
      overlay.classList.remove('show');
      document.body.classList.remove('sk-modal-open');
      stage.style.left = homeRect.left + 'px';
      stage.style.top = homeRect.top + 'px';
      stage.style.width = homeRect.width + 'px';
      const cleanup = () => {
        stage.style.position = ''; stage.style.margin = ''; stage.style.left = '';
        stage.style.top = ''; stage.style.width = ''; stage.style.zIndex = ''; stage.style.transition = '';
        stage.classList.remove('sk-zoomed');
        cell.style.minHeight = '';
        homeRect = null;
      };
      if (reduce) { cleanup(); return; }
      stage.addEventListener('transitionend', function onZoomOut(e) {
        if (e.target !== stage || e.propertyName !== 'width') return;
        stage.removeEventListener('transitionend', onZoomOut);
        cleanup();
      });
    }

    function go(target) {
      target = Math.max(0, Math.min(pages.length - 1, target));
      if (target === idx) return;
      idx = target;
      if (target === 1) {
        openModal(paint); // zoom to center first, flip the page open only once that settles
      } else {
        // flip the page shut first (the cover un-flipping back into view), zoom
        // back out to the grid only once that settles
        const closingPage = pages[0];
        paint();
        if (reduce) { closeModal(); return; }
        closingPage.addEventListener('transitionend', function onFlip(e) {
          if (e.target !== closingPage || e.propertyName !== 'transform') return;
          closingPage.removeEventListener('transitionend', onFlip);
          closeModal();
        });
      }
    }
    book.addEventListener('click', e => {
      const g = e.target.closest('[data-go]'); if (g) { go(+g.dataset.go); return; }
      const b = e.target.closest('.sk-board'); if (b) { b.classList.toggle('peek'); return; }
      if (e.target.closest('.sk-cover .sk-face.front')) go(1);
    });
    book.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.sk-board,.sk-cover .sk-face.front')) { e.preventDefault(); e.target.click(); }
    });
    paint();
  });

  overlay.addEventListener('click', () => { if (closeActive) closeActive(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && closeActive) closeActive(); });
})();
