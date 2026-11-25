/* ==========================================================================
   ANYA TECH — 10fps Vermilion Dot-Matrix Motif Canvas (Careers Section)
   Inspired by sakana.ai's red dot-matrix stage, cycling original geometric
   Anya Tech patterns: Apex Mark, Neural Wave, Orbital Mesh, Collective Lattice
   ========================================================================== */

(function () {
  const canvas = document.getElementById('dotMatrixCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labelEl = document.getElementById('dotMatrixLabel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLS = 44;
  const ROWS = 28;
  const FPS = 10;
  const INTERVAL = 1000 / FPS;

  const patterns = [
    {
      name: '01 / APEX COLLECTIVE',
      fn: (x, y, frame) => {
        const cx = (x - COLS / 2) / (COLS * 0.42);
        const cy = (y - ROWS / 2) / (ROWS * 0.42);
        const pulse = Math.sin(frame * 0.14) * 0.08;
        // Geometric Anya Apex / Chevron
        const upper = Math.abs(cx) * 1.2 + cy + 0.55;
        const inner = Math.abs(cx) * 1.35 + cy + 0.05;
        const inApex = upper > 0 && upper < 1.15 + pulse && cy < 0.65 && !(inner > 0.35 && cy > 0.1);
        const wave = Math.sin(Math.hypot(cx, cy) * 6 - frame * 0.25) * 0.35 + 0.5;
        return inApex ? 0.92 : wave * 0.18;
      }
    },
    {
      name: '02 / SWARM HARMONICS',
      fn: (x, y, frame) => {
        const nx = x / COLS;
        const ny = y / ROWS;
        const w1 = Math.sin(nx * Math.PI * 3.5 - frame * 0.22);
        const w2 = Math.cos(ny * Math.PI * 2.5 + frame * 0.15);
        const dist = Math.abs(ny - (0.5 + w1 * 0.22 * w2));
        return Math.max(0, 1 - dist * 5.2);
      }
    },
    {
      name: '03 / ORBITAL NODES',
      fn: (x, y, frame) => {
        const cx = (x - COLS / 2) / 14;
        const cy = (y - ROWS / 2) / 10;
        const r = Math.hypot(cx, cy);
        const angle = Math.atan2(cy, cx);
        const ring1 = Math.max(0, 1 - Math.abs(r - 0.85) * 5.5);
        const ring2 = Math.max(0, 1 - Math.abs(r - 0.42) * 6.0);
        const spoke = Math.sin(angle * 4 - frame * 0.22) * 0.5 + 0.5;
        const core = r < 0.22 ? 0.95 : 0;
        return Math.max(core, ring1 * spoke, ring2 * (1 - spoke * 0.4));
      }
    },
    {
      name: '04 / ADAPTIVE LATTICE',
      fn: (x, y, frame) => {
        const phase = frame * 0.18;
        const gx = Math.sin(x * 0.48 + phase);
        const gy = Math.sin(y * 0.55 - phase * 0.7);
        const v = (gx * gy + 1) * 0.5;
        return v > 0.56 ? v : v * 0.22;
      }
    }
  ];

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let frame = 0;
  let lastTime = 0;
  let rafId = null;
  let isVisible = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const cycleLen = 70; // 7 seconds per motif at 10fps
    const totalIdx = Math.floor(frame / cycleLen);
    const pIdx = totalIdx % patterns.length;
    const nextIdx = (pIdx + 1) % patterns.length;
    const localFrame = frame % cycleLen;
    const blend = localFrame > cycleLen - 12 ? (localFrame - (cycleLen - 12)) / 12 : 0;

    if (labelEl) {
      labelEl.textContent = patterns[pIdx].name;
    }

    const cellW = width / COLS;
    const cellH = height / ROWS;
    const maxR = Math.min(cellW, cellH) * 0.36;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        let val = patterns[pIdx].fn(x, y, frame);
        if (blend > 0) {
          const nextVal = patterns[nextIdx].fn(x, y, frame);
          val = val * (1 - blend) + nextVal * blend;
        }
        if (val < 0.08) continue;

        const r = Math.max(0.8, maxR * Math.min(1, val));
        const px = (x + 0.5) * cellW;
        const py = (y + 0.5) * cellH;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 6, 0, ${(0.18 + val * 0.82).toFixed(2)})`;
        ctx.fill();
      }
    }
  }

  function tick(ts) {
    if (!isVisible) return;
    if (ts - lastTime >= INTERVAL) {
      lastTime = ts;
      draw();
      frame++;
    }
    if (!reducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        if (reducedMotion) {
          draw();
        } else if (!rafId) {
          rafId = requestAnimationFrame(tick);
        }
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    { threshold: 0.05 }
  );

  resize();
  draw();
  io.observe(canvas);

  window.addEventListener('resize', () => {
    resize();
    draw();
  });
})();
