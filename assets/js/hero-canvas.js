/* ==========================================================================
   ANYA TECH — Hero Collective Swarm Canvas (Vanilla Canvas2D Reynolds Boids)
   69 slate-gray autonomous agents + 1 vermilion (#E10600) leader agent
   Click or drag anywhere on the hero canvas to spawn additional agents.
   ========================================================================== */

(function () {
  const canvas = document.getElementById('swarmCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let rafId = null;
  let isVisible = true;
  let t = 0;

  const INITIAL_BOIDS = 70;
  const MAX_BOIDS = 220;
  const boids = [];

  const pointer = {
    active: false,
    dragging: false,
    x: 0,
    y: 0,
    lastSpawn: 0
  };

  class Agent {
    constructor(x, y, isLeader = false) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = isLeader ? 2.4 : 1.5 + Math.random() * 1.1;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.ax = 0;
      this.ay = 0;
      this.isLeader = isLeader;
      this.maxSpeed = isLeader ? 2.75 : 2.35;
      this.maxForce = isLeader ? 0.065 : 0.048;
      this.size = isLeader ? 10.5 : 6.5 + Math.random() * 2.2;
      this.phase = Math.random() * Math.PI * 2;
    }

    edges() {
      const margin = 36;
      if (this.x < -margin) this.x = width + margin;
      if (this.x > width + margin) this.x = -margin;
      if (this.y < -margin) this.y = height + margin;
      if (this.y > height + margin) this.y = -margin;
    }

    flock(agents, leader) {
      if (this.isLeader) {
        // Organic smooth noise-like wander steered gently toward center bounds
        const flowAngle =
          Math.sin(this.x * 0.0028 + t * 0.45) * 1.6 +
          Math.cos(this.y * 0.0028 - t * 0.35) * 1.6;
        let dx = Math.cos(flowAngle) * this.maxSpeed;
        let dy = Math.sin(flowAngle) * this.maxSpeed;

        // Gentle pull away from extreme edges
        const pad = 120;
        if (this.x < pad) dx += 1.4;
        if (this.x > width - pad) dx -= 1.4;
        if (this.y < pad) dy += 1.4;
        if (this.y > height - pad) dy -= 1.4;

        // Subtle pointer curiosity
        if (pointer.active) {
          const px = pointer.x - this.x;
          const py = pointer.y - this.y;
          const pDist = Math.hypot(px, py);
          if (pDist > 40 && pDist < 320) {
            dx += (px / pDist) * 0.9;
            dy += (py / pDist) * 0.9;
          }
        }

        const mag = Math.hypot(dx, dy) || 1;
        dx = (dx / mag) * this.maxSpeed;
        dy = (dy / mag) * this.maxSpeed;

        let sx = dx - this.vx;
        let sy = dy - this.vy;
        const smag = Math.hypot(sx, sy);
        if (smag > this.maxForce) {
          sx = (sx / smag) * this.maxForce;
          sy = (sy / smag) * this.maxForce;
        }
        this.ax += sx;
        this.ay += sy;
        return;
      }

      const perception = 66;
      const sepRadius = 30;
      let sepX = 0, sepY = 0, sepCount = 0;
      let aliX = 0, aliY = 0, aliCount = 0;
      let cohX = 0, cohY = 0, cohCount = 0;

      for (let i = 0; i < agents.length; i++) {
        const other = agents[i];
        if (other === this) continue;
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dSq = dx * dx + dy * dy;

        if (dSq > 0 && dSq < perception * perception) {
          const d = Math.sqrt(dSq);
          aliX += other.vx;
          aliY += other.vy;
          aliCount++;

          cohX += other.x;
          cohY += other.y;
          cohCount++;

          if (d < sepRadius) {
            sepX += dx / d;
            sepY += dy / d;
            sepCount++;
          }
        }
      }

      if (sepCount > 0) {
        sepX /= sepCount;
        sepY /= sepCount;
        this.applySteer(sepX, sepY, 1.55);
      }

      if (aliCount > 0) {
        aliX /= aliCount;
        aliY /= aliCount;
        this.applySteer(aliX, aliY, 1.0);
      }

      if (cohCount > 0) {
        cohX = cohX / cohCount - this.x;
        cohY = cohY / cohCount - this.y;
        this.applySteer(cohX, cohY, 0.72);
      }

      // Soft attraction to the vermilion leader so the school dances coherently
      if (leader) {
        const lx = leader.x - this.x;
        const ly = leader.y - this.y;
        const lDist = Math.hypot(lx, ly);
        if (lDist > 85 && lDist < 420) {
          this.applySteer(lx, ly, 0.32);
        }
      }

      // Gentle cursor swirl avoidance
      if (pointer.active && !pointer.dragging) {
        const mx = this.x - pointer.x;
        const my = this.y - pointer.y;
        const mDist = Math.hypot(mx, my);
        if (mDist > 1 && mDist < 95) {
          this.applySteer(mx, my, 1.15);
        }
      }
    }

    applySteer(tx, ty, weight) {
      const mag = Math.hypot(tx, ty);
      if (mag === 0) return;
      const desiredX = (tx / mag) * this.maxSpeed;
      const desiredY = (ty / mag) * this.maxSpeed;
      let sx = desiredX - this.vx;
      let sy = desiredY - this.vy;
      const smag = Math.hypot(sx, sy);
      if (smag > this.maxForce) {
        sx = (sx / smag) * this.maxForce;
        sy = (sy / smag) * this.maxForce;
      }
      this.ax += sx * weight;
      this.ay += sy * weight;
    }

    update() {
      this.vx += this.ax;
      this.vy += this.ay;
      const speed = Math.hypot(this.vx, this.vy) || 1;
      if (speed > this.maxSpeed) {
        this.vx = (this.vx / speed) * this.maxSpeed;
        this.vy = (this.vy / speed) * this.maxSpeed;
      } else if (speed < 1.05) {
        this.vx = (this.vx / speed) * 1.05;
        this.vy = (this.vy / speed) * 1.05;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.ax = 0;
      this.ay = 0;
      this.edges();
    }

    draw() {
      const angle = Math.atan2(this.vy, this.vx);
      const s = this.size;
      const flutter = Math.sin(t * 7 + this.phase) * 0.12;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle + flutter);

      // Minimalist Anya geometric apex/delta wing silhouette
      ctx.beginPath();
      ctx.moveTo(s * 1.35, 0);
      ctx.lineTo(-s * 0.85, -s * 0.68);
      ctx.lineTo(-s * 0.35, 0);
      ctx.lineTo(-s * 0.85, s * 0.68);
      ctx.closePath();

      if (this.isLeader) {
        ctx.fillStyle = '#E10600';
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(168, 174, 184, 0.72)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    boids.length = 0;
    // 1 red leader agent
    boids.push(new Agent(width * 0.38, height * 0.42, true));
    // 69 flock agents distributed around the perimeter & field
    for (let i = 1; i < INITIAL_BOIDS; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      boids.push(new Agent(x, y, false));
    }
  }

  function spawnAt(x, y) {
    const now = performance.now();
    if (now - pointer.lastSpawn < 45) return;
    pointer.lastSpawn = now;
    if (boids.length < MAX_BOIDS) {
      boids.push(new Agent(x, y, false));
    }
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    t += 0.016;
    const leader = boids[0];

    for (let i = 0; i < boids.length; i++) {
      boids[i].flock(boids, leader);
    }
    for (let i = 0; i < boids.length; i++) {
      boids[i].update();
      boids[i].draw();
    }

    if (isVisible && !reducedMotion) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId);
    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      boids.forEach((b) => b.draw());
      return;
    }
    rafId = requestAnimationFrame(renderFrame);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Pointer interactions (drag or click spawns new agents)
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.active = true;
    pointer.dragging = true;
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    spawnAt(pointer.x, pointer.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.active = true;
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    if (pointer.dragging) {
      spawnAt(pointer.x, pointer.y);
    }
  });

  window.addEventListener('pointerup', () => {
    pointer.dragging = false;
  });

  canvas.addEventListener('pointerleave', () => {
    pointer.active = false;
    pointer.dragging = false;
  });

  // Pause rendering when scrolled out of viewport
  const io = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) {
        start();
      } else {
        stop();
      }
    },
    { threshold: 0.05 }
  );

  resize();
  seed();
  io.observe(canvas);
  start();

  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      boids.forEach((b) => b.draw());
    }
  });
})();
