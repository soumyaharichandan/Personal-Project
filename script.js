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
    dots = Array.from({ length: Math.round(w * h / 4500) }, () => {
      const x = Math.random() * w, y = Math.random() * h;
      return { x, y, ox: x, oy: y, vx: 0, vy: 0, s: Math.random() < .2 ? 4 : 2, p: Math.random() * 6.28 };
    });
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(root).getPropertyValue('--fg');
    for (const d of dots) {
      const tx = d.ox + Math.sin(t / 2000 + d.p) * 6, ty = d.oy + Math.cos(t / 2300 + d.p) * 6;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 90) { d.vx += dx / dist * 1.2; d.vy += dy / dist * 1.2; }
      d.vx += (tx - d.x) * .03; d.vy += (ty - d.y) * .03;
      d.vx *= .86; d.vy *= .86; d.x += d.vx; d.y += d.vy;
      ctx.globalAlpha = .75;
      ctx.fillRect(d.x, d.y, d.s, d.s);
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse = { x: -999, y: -999 }; });
  addEventListener('resize', size);
  size(); requestAnimationFrame(draw);
}
