// Monochrome lightning background: ambient strikes plus cursor/scroll-reactive micro-discharges.
(() => {
  const canvas = document.getElementById("lightning");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX_BOLTS = 8;
  const bolts = [];
  let width = 0, height = 0, dpr = 1, rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Midpoint displacement: returns a jagged polyline between two points.
  function segment(x1, y1, x2, y2, roughness, depth) {
    let points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    let offset = Math.hypot(x2 - x1, y2 - y1) * roughness;
    for (let i = 0; i < depth; i++) {
      const next = [];
      for (let j = 0; j < points.length - 1; j++) {
        const a = points[j], b = points[j + 1];
        const nx = -(b.y - a.y), ny = b.x - a.x;
        const len = Math.hypot(nx, ny) || 1;
        const d = (Math.random() - 0.5) * offset;
        next.push(a, { x: (a.x + b.x) / 2 + (nx / len) * d, y: (a.y + b.y) / 2 + (ny / len) * d });
      }
      next.push(points[points.length - 1]);
      points = next;
      offset /= 2;
    }
    return points;
  }

  function createBolt(x1, y1, x2, y2, { intensity = 1, branches = 3, life = 420, width: w = 1.4 } = {}) {
    const paths = [{ points: segment(x1, y1, x2, y2, 0.35, 6), width: w }];
    const main = paths[0].points;
    for (let i = 0; i < branches; i++) {
      const start = main[Math.floor(main.length * (0.2 + Math.random() * 0.6))];
      const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.6;
      const length = Math.hypot(x2 - x1, y2 - y1) * (0.15 + Math.random() * 0.3);
      paths.push({
        points: segment(start.x, start.y, start.x + Math.cos(angle) * length, start.y + Math.sin(angle) * length, 0.4, 4),
        width: w * 0.55,
      });
    }
    if (bolts.length >= MAX_BOLTS) bolts.shift();
    bolts.push({ paths, born: performance.now(), life, intensity });
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function drawPath(points, lineWidth, alpha) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function render(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255,255,255,0.9)";

    for (let i = bolts.length - 1; i >= 0; i--) {
      const bolt = bolts[i];
      const t = (now - bolt.born) / bolt.life;
      if (t >= 1) { bolts.splice(i, 1); continue; }
      // Quick flash, slight re-flicker, then fade.
      const flicker = t < 0.12 ? 1 : t < 0.2 ? 0.45 : t < 0.28 ? 0.9 : 1 - t;
      const alpha = Math.max(0, flicker) * bolt.intensity;
      for (const p of bolt.paths) {
        ctx.shadowBlur = 14;
        drawPath(p.points, p.width, alpha * 0.55);
        ctx.shadowBlur = 0;
        drawPath(p.points, p.width * 0.45, alpha);
      }
    }

    rafId = bolts.length ? requestAnimationFrame(render) : null;
  }

  function ambientStrike() {
    const x = Math.random() * width;
    createBolt(x, -10, x + (Math.random() - 0.5) * width * 0.4, height * (0.35 + Math.random() * 0.45), {
      intensity: 0.22 + Math.random() * 0.12,
      branches: 3 + Math.floor(Math.random() * 3),
      life: 650,
      width: 1.6,
    });
  }

  function scheduleAmbient() {
    setTimeout(() => {
      if (!document.hidden) ambientStrike();
      scheduleAmbient();
    }, 4000 + Math.random() * 5000);
  }

  // Cursor micro-discharge, throttled and only on meaningful movement.
  let lastSpark = 0, lastX = 0, lastY = 0;
  function onPointerMove(e) {
    const now = performance.now();
    const moved = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (now - lastSpark < 260 || moved < 60) return;
    lastSpark = now;
    const angle = Math.atan2(e.clientY - lastY, e.clientX - lastX) + Math.PI + (Math.random() - 0.5);
    const len = 40 + Math.random() * 50;
    createBolt(e.clientX, e.clientY, e.clientX + Math.cos(angle) * len, e.clientY + Math.sin(angle) * len, {
      intensity: 0.35, branches: 1, life: 260, width: 0.9,
    });
    lastX = e.clientX;
    lastY = e.clientY;
  }

  // Fast scrolling triggers a faint strike.
  let lastScrollY = window.scrollY, lastScrollT = performance.now(), lastScrollStrike = 0;
  function onScroll() {
    const now = performance.now();
    const velocity = Math.abs(window.scrollY - lastScrollY) / Math.max(1, now - lastScrollT);
    lastScrollY = window.scrollY;
    lastScrollT = now;
    if (velocity > 2.2 && now - lastScrollStrike > 900) {
      lastScrollStrike = now;
      const x = width * (0.55 + Math.random() * 0.4);
      createBolt(x, -10, x + (Math.random() - 0.5) * 200, height * 0.5, { intensity: 0.18, branches: 2, life: 420 });
    }
  }

  resize();
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  if (reducedMotion) return;

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  setTimeout(ambientStrike, 900);
  scheduleAmbient();
})();
