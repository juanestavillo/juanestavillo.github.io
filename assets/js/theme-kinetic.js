// Variant A: kinetic hero name, stack marquee, PTDE blueprint and a particle network background.
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Kinetic type ---------- */
  function splitHeroName() {
    const h1 = document.querySelector("header h1");
    if (!h1) return;
    // Lines come from the <br> in the markup; words from spaces.
    const lines = [[]];
    h1.childNodes.forEach((node) => {
      if (node.nodeName === "BR") lines.push([]);
      else lines.at(-1).push(node.textContent);
    });

    const name = lines.map((parts) => parts.join("")).join(" ").replace(/\s+/g, " ").trim();

    let wordIndex = 0;
    const chars = [];
    const frag = document.createDocumentFragment();
    lines.forEach((parts) => {
      const text = parts.join("").trim();
      if (!text) return;
      const line = document.createElement("span");
      line.className = "k-line";
      line.setAttribute("aria-hidden", "true");
      text.split(/\s+/).forEach((word, i) => {
        if (i) line.append(" ");
        const w = document.createElement("span");
        w.className = "k-word";
        w.style.setProperty("--i", wordIndex++);
        [...word].forEach((ch) => {
          const c = document.createElement("span");
          c.className = "k-char";
          c.textContent = ch;
          chars.push(c);
          w.append(c);
        });
        line.append(w);
      });
      frag.append(line);
    });

    h1.setAttribute("aria-label", name);
    h1.replaceChildren(frag);
    h1.classList.add("k-split");

    if (reducedMotion) {
      h1.classList.add("is-in");
      return;
    }
    // Two frames so the hidden start state is committed before the transition.
    requestAnimationFrame(() => requestAnimationFrame(() => h1.classList.add("is-in")));

    if (!finePointer) return;
    let centers = [];
    const measure = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    h1.addEventListener("pointerenter", measure);
    h1.addEventListener("pointermove", (e) => {
      if (!centers.length) measure();
      chars.forEach((c, i) => {
        const d = Math.hypot(e.clientX - centers[i].x, (e.clientY - centers[i].y) * 1.4);
        const lift = Math.max(0, 1 - d / 120);
        c.style.setProperty("--lift", (lift * lift).toFixed(3));
      });
    });
    h1.addEventListener("pointerleave", () => {
      centers = [];
      chars.forEach((c) => c.style.setProperty("--lift", 0));
    });
  }

  function loopMarquee() {
    const track = document.querySelector(".stack-track");
    if (!track || track.dataset.looped) return;
    // A second copy makes translateX(-50%) land exactly on the start.
    [...track.children].forEach((item) => track.append(item.cloneNode(true)));
    track.dataset.looped = "true";
  }

  /* ---------- 2. Blueprint ---------- */
  function buildBlueprint() {
    const figure = document.querySelector("[data-blueprint]");
    if (!figure || figure.childElementCount) return;

    const drawing = (spec) => {
      let i = 0;
      const out = [];
      const s = () => `style="--i:${i++}"`;
      const api = {
        ln: (d, cls = "") => out.push(`<path class="bp-ln ${cls}" d="${d}" pathLength="1" ${s()}/>`),
        box: (x, y, w, h, cls = "") => out.push(`<rect class="bp-ln ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" pathLength="1" ${s()}/>`),
        dash: (d) => out.push(`<path class="bp-dash" d="${d}" ${s()}/>`),
        dashBox: (x, y, w, h) => out.push(`<rect class="bp-dash" x="${x}" y="${y}" width="${w}" height="${h}" ${s()}/>`),
        tx: (x, y, text, cls = "", anchor = "middle", extra = "") =>
          out.push(`<text class="bp-tx ${cls}" x="${x}" y="${y}" text-anchor="${anchor}" ${extra} ${s()}>${text}</text>`),
        arrow(x1, y1, x2, y2, cls = "") {
          api.ln(`M${x1} ${y1} L${x2} ${y2}`, cls);
          const a = Math.atan2(y2 - y1, x2 - x1);
          const p = (da) => `${(x2 - 6 * Math.cos(a + da)).toFixed(1)} ${(y2 - 6 * Math.sin(a + da)).toFixed(1)}`;
          api.ln(`M${p(0.45)} L${x2} ${y2} L${p(-0.45)}`, cls);
        },
        db(cx, top, rx, h) {
          const ry = 8;
          api.ln(`M${cx - rx} ${top} V${top + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + h} V${top}`, "is-bold");
          out.push(`<ellipse class="bp-ln is-bold" cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" pathLength="1" ${s()}/>`);
        },
      };
      spec(api);
      return out.join("");
    };

    const wide = drawing(({ ln, box, dash, dashBox, tx, arrow, db }) => {
      // Dimension line over the server side.
      ln("M160 54 V66 M544 54 V66 M160 60 H544", "is-faint");
      dash("M160 66 V96 M544 66 V120");
      tx(352, 52, "PTDE · PRODUCCIÓN", "is-dim");
      tx(16, 84, "ACTORES", "is-dim", "start");
      // Roles and the bus into the front.
      [["docente", 92], ["alumno", 146], ["Secretaría", 200]].forEach(([role, y]) => {
        box(16, y, 96, 34);
        tx(64, y + 21, role);
      });
      ln("M112 109 H136 M112 163 H136 M112 217 H136 M136 109 V217");
      arrow(136, 165, 160, 165);
      ln("M64 234 V256", "is-faint");
      tx(64, 268, "aprueba planes", "is-dim");
      // nginx + Angular.
      dashBox(160, 96, 118, 138);
      tx(168, 110, "nginx", "is-dim", "start");
      box(172, 122, 94, 98, "is-bold");
      tx(219, 166, "Angular 22", "is-name");
      tx(219, 184, "SPA", "is-dim");
      arrow(278, 165, 320, 165);
      tx(299, 157, "REST");
      // Spring Boot API.
      box(320, 110, 118, 110, "is-accent");
      tx(379, 148, "Spring Boot 4", "is-name");
      tx(379, 164, "API", "is-dim");
      box(330, 186, 42, 20); tx(351, 199, "JWT", "is-accent");
      box(380, 186, 50, 20); tx(405, 199, "Flyway", "is-accent");
      arrow(438, 165, 470, 165);
      tx(454, 157, "JDBC");
      // PostgreSQL and backup.
      db(507, 128, 37, 68);
      tx(507, 166, "PostgreSQL", "is-name", "middle", 'style="font-size:11px"');
      tx(507, 182, "17", "is-dim");
      dash("M507 206 V250");
      box(464, 250, 86, 40);
      tx(507, 267, "backup", "is-name", "middle", 'style="font-size:11px"');
      tx(507, 281, "diario", "is-dim");
      // Title block.
      box(16, 296, 156, 24, "is-faint");
      tx(24, 312, "DWG PTDE-01 · ESC 1:1", "is-dim", "start");
    });

    const tall = drawing(({ ln, box, dash, dashBox, tx, arrow, db }) => {
      tx(16, 24, "ACTORES", "is-dim", "start");
      [["docente", 16], ["alumno", 123], ["Secretaría", 230]].forEach(([role, x]) => {
        box(x, 36, 94, 32);
        tx(x + 47, 56, role);
      });
      ln("M63 68 V86 M170 68 V86 M277 68 V86 M63 86 H277");
      arrow(170, 86, 170, 116);
      // Vertical dimension line along the server side.
      ln("M34 116 H46 M34 480 H46 M40 116 V480", "is-faint");
      tx(32, 298, "PTDE · PRODUCCIÓN", "is-dim", "middle", 'transform="rotate(-90 32 298)"');
      dashBox(80, 116, 180, 100);
      tx(90, 130, "nginx", "is-dim", "start");
      box(100, 140, 140, 62, "is-bold");
      tx(170, 168, "Angular 22", "is-name");
      tx(170, 186, "SPA", "is-dim");
      arrow(170, 216, 170, 256);
      tx(180, 240, "REST", "", "start");
      box(80, 256, 180, 104, "is-accent");
      tx(170, 290, "Spring Boot 4", "is-name");
      tx(170, 306, "API", "is-dim");
      box(108, 322, 50, 22); tx(133, 336, "JWT", "is-accent");
      box(170, 322, 62, 22); tx(201, 336, "Flyway", "is-accent");
      arrow(170, 360, 170, 396);
      tx(180, 382, "JDBC", "", "start");
      db(170, 404, 50, 66);
      tx(170, 440, "PostgreSQL", "is-name", "middle", 'style="font-size:12px"');
      tx(170, 456, "17", "is-dim");
      dash("M220 438 H254");
      box(254, 418, 74, 40);
      tx(291, 435, "backup", "is-name", "middle", 'style="font-size:11px"');
      tx(291, 449, "diario", "is-dim");
      box(16, 520, 170, 24, "is-faint");
      tx(24, 536, "DWG PTDE-01 · ESC 1:1", "is-dim", "start");
    });

    const svg = (cls, w, h, body) =>
      `<svg class="${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;
    const label =
      "Diagrama de arquitectura de PTDE: docentes, alumnos y Secretaría usan un front en Angular 22 servido por nginx, " +
      "que llama a una API Spring Boot 4 con JWT y Flyway, conectada a PostgreSQL 17 con un backup diario.";

    figure.innerHTML =
      `<div class="bp-sheet" role="img" aria-label="${label}">` +
      svg("bp-wide", 560, 330, wide) + svg("bp-tall", 340, 556, tall) +
      `</div><figcaption class="bp-caption"><span><b>PTDE</b> — arquitectura en producción</span><span>FIG. 01</span></figcaption>`;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      figure.classList.add("is-drawn");
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      figure.classList.add("is-drawn");
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(figure);
  }

  /* ---------- 3. Particle network ---------- */
  function particles() {
    const canvas = document.getElementById("lightning");
    const ctx = canvas && canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, dpr = 1, rafId = 0, last = 0, mobile = null;
    let pts = [];
    let linkDist = 130;
    const pointer = { x: 0, y: 0, active: false };
    const REPEL = 110;

    function seed() {
      const count = mobile ? 40 : 70;
      pts = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.12 + Math.random() * 0.25;
        return {
          x: Math.random() * width, y: Math.random() * height,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          ox: 0, oy: 0, r: 0.8 + Math.random() * 1.2,
        };
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const prevW = width || window.innerWidth, prevH = height || window.innerHeight;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const nowMobile = width < 768;
      linkDist = nowMobile ? 100 : 130;
      if (nowMobile !== mobile) {
        mobile = nowMobile;
        seed();
      } else {
        // Keep the field, just rescale it (mobile toolbars resize the viewport often).
        pts.forEach((p) => { p.x *= width / prevW; p.y *= height / prevH; });
      }
    }

    function step(dt) {
      for (const p of pts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x += width + 40; else if (p.x > width + 20) p.x -= width + 40;
        if (p.y < -20) p.y += height + 40; else if (p.y > height + 20) p.y -= height + 40;
        if (pointer.active) {
          const dx = p.x + p.ox - pointer.x, dy = p.y + p.oy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL && d > 0.01) {
            const f = (1 - d / REPEL) * 1.6 * dt;
            p.ox += (dx / d) * f;
            p.oy += (dy / d) * f;
          }
        }
        // Ease the displacement back so particles never chase or flee for long.
        const k = Math.pow(0.94, dt);
        p.ox *= k;
        p.oy *= k;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], ax = a.x + a.ox, ay = a.y + a.oy;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = ax - b.x - b.ox, dy = ay - b.y - b.oy;
          const d2 = dx * dx + dy * dy;
          if (d2 > linkDist * linkDist) continue;
          const alpha = (1 - Math.sqrt(d2) / linkDist) * 0.16;
          ctx.strokeStyle = `rgba(212, 212, 216, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(b.x + b.ox, b.y + b.oy);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(228, 228, 231, 0.55)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(t) {
      const dt = last ? Math.min((t - last) / 16.667, 3) : 1;
      last = t;
      step(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    }
    const start = () => { if (!rafId) { last = 0; rafId = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(rafId); rafId = 0; };

    resize();
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (reducedMotion) draw(); }, 120);
    });

    if (reducedMotion) {
      draw();
      return;
    }

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { pointer.active = false; });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    if (!document.hidden) start();
  }

  splitHeroName();
  loopMarquee();
  buildBlueprint();
  particles();
})();
