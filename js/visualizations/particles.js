/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Canvas Particle System
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';
import { DOMUtils } from '../utils/dom.js';

export class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.time = 0;
    this.running = false;
    this.lastTime = 0;

    this.config = {
      count: options.count || (DOMUtils.viewport().isMobile ? 400 : 1200),
      baseColor: options.baseColor || { r: 255, g: 255, b: 255 },
      maxSize: options.maxSize || 2.5,
      minSize: options.minSize || 0.5,
      speed: options.speed || 0.3,
      turbulence: options.turbulence || 0.5,
      mouseRepulsion: options.mouseRepulsion || 80,
      mouseForce: options.mouseForce || 0.08,
      fadeEdge: options.fadeEdge || 0.15,
      connectDistance: options.connectDistance || 0,
      ...options
    };

    this._resize();
    this._initParticles();
    this._bindEvents();
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle(x, y) {
    const { baseColor, maxSize, minSize, speed } = this.config;
    return {
      x: x ?? Math.random() * this.width,
      y: y ?? Math.random() * this.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: minSize + Math.random() * (maxSize - minSize),
      opacity: 0.1 + Math.random() * 0.5,
      life: Math.random(),
      r: baseColor.r,
      g: baseColor.g,
      b: baseColor.b,
      phase: Math.random() * Math.PI * 2
    };
  }

  _bindEvents() {
    this._resizeHandler = DOMUtils.debounce(() => {
      this._resize();
    }, 200);

    this._mouseHandler = DOMUtils.throttle((e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }, 16);

    this._mouseLeaveHandler = () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    };

    window.addEventListener('resize', this._resizeHandler);
    this.canvas.addEventListener('mousemove', this._mouseHandler);
    this.canvas.addEventListener('mouseleave', this._mouseLeaveHandler);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this._loop();
  }

  stop() {
    this.running = false;
  }

  _loop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.time += dt;

    this._update(dt);
    this._draw();

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _update(dt) {
    const { turbulence, mouseRepulsion, mouseForce, fadeEdge, speed } = this.config;

    for (const p of this.particles) {
      // Perlin-like turbulence
      const noiseX = MathUtils.smoothNoise(p.x * 0.002 + this.time * 0.2, 2) - 0.5;
      const noiseY = MathUtils.smoothNoise(p.y * 0.002 + this.time * 0.3 + 100, 2) - 0.5;

      p.vx += noiseX * turbulence * dt * 2;
      p.vy += noiseY * turbulence * dt * 2;

      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouseRepulsion && dist > 0) {
        const force = (1 - dist / mouseRepulsion) * mouseForce;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Speed limit
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > speed * 3) {
        p.vx = (p.vx / spd) * speed * 3;
        p.vy = (p.vy / spd) * speed * 3;
      }

      // Position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Edge fade
      const edgeX = Math.min(p.x / (this.width * fadeEdge), (this.width - p.x) / (this.width * fadeEdge));
      const edgeY = Math.min(p.y / (this.height * fadeEdge), (this.height - p.y) / (this.height * fadeEdge));
      p._edgeFade = MathUtils.clamp(Math.min(edgeX, edgeY), 0, 1);

      // Gentle breathing
      p._breathe = 0.7 + 0.3 * Math.sin(this.time * 0.8 + p.phase);
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connections if enabled
    if (this.config.connectDistance > 0) {
      this._drawConnections();
    }

    // Draw particles
    for (const p of this.particles) {
      const alpha = p.opacity * p._edgeFade * p._breathe;
      if (alpha < 0.01) continue;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
      this.ctx.fill();
    }
  }

  _drawConnections() {
    const maxDist = this.config.connectDistance;
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15 * a._edgeFade * b._edgeFade;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(${a.r}, ${a.g}, ${a.b}, ${alpha})`;
          this.ctx.stroke();
        }
      }
    }
  }

  // ─── Set Color Theme ───
  setColor(r, g, b, transition = 1) {
    // Cancel any previous color animation
    if (this._colorAnimId) cancelAnimationFrame(this._colorAnimId);

    const startColors = this.particles.map(p => ({ r: p.r, g: p.g, b: p.b }));
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const t = MathUtils.clamp(elapsed / transition, 0, 1);
      const eased = MathUtils.easing.easeOutCubic(t);

      this.particles.forEach((p, i) => {
        p.r = Math.round(MathUtils.lerp(startColors[i].r, r, eased));
        p.g = Math.round(MathUtils.lerp(startColors[i].g, g, eased));
        p.b = Math.round(MathUtils.lerp(startColors[i].b, b, eased));
      });

      if (t < 1) {
        this._colorAnimId = requestAnimationFrame(animate);
      } else {
        this._colorAnimId = null;
      }
    };

    this._colorAnimId = requestAnimationFrame(animate);
  }

  // ─── Burst effect ───
  burst(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      const p = this._createParticle(x, y);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.opacity = 0.8;
      p.size = 1 + Math.random() * 2;
      // Replace a random existing particle
      const idx = Math.floor(Math.random() * this.particles.length);
      this.particles[idx] = p;
    }
  }

  destroy() {
    this.stop();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._colorAnimId) cancelAnimationFrame(this._colorAnimId);
    window.removeEventListener('resize', this._resizeHandler);
    this.canvas.removeEventListener('mousemove', this._mouseHandler);
    this.canvas.removeEventListener('mouseleave', this._mouseLeaveHandler);
    this.particles = [];
  }
}
