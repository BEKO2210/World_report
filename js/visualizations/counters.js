/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Animated Counter System
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';

export class Counter {
  constructor(element, options = {}) {
    this.element = element;
    this.target = options.target || 0;
    this.current = options.start || 0;
    this.duration = options.duration || 2000;
    this.decimals = options.decimals || 0;
    this.suffix = options.suffix || '';
    this.prefix = options.prefix || '';
    this.locale = options.locale || 'de-DE';
    this.easing = options.easing || MathUtils.easing.easeOutCubic;
    this.onComplete = options.onComplete || null;
    this._started = false;
    this._completed = false;
  }

  start() {
    if (this._started) return;
    this._started = true;
    this._completed = false;
    const startTime = performance.now();
    const startVal = this.current;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = MathUtils.clamp(elapsed / this.duration, 0, 1);
      const eased = this.easing(progress);

      this.current = startVal + (this.target - startVal) * eased;
      this._render();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.current = this.target;
        this._render();
        this._completed = true;
        if (this.onComplete) this.onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  _render() {
    let displayValue;

    if (this.suffix === 'compact') {
      displayValue = MathUtils.formatCompact(Math.round(this.current));
    } else {
      displayValue = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: this.decimals,
        maximumFractionDigits: this.decimals
      }).format(this.current);
    }

    this.element.textContent = `${this.prefix}${displayValue}${this.suffix === 'compact' ? '' : this.suffix}`;
  }

  setTarget(newTarget) {
    this.target = newTarget;
    this._started = false;
    this._completed = false;
  }

  reset() {
    this.current = 0;
    this._started = false;
    this._completed = false;
    this._render();
  }
}

// ─── Batch Counter Manager ───
export class CounterManager {
  constructor() {
    this.counters = new Map();
    this._observer = null;
  }

  // Register a counter element
  register(element, options = {}) {
    const target = parseFloat(element.dataset.target || options.target || 0);
    const counter = new Counter(element, {
      target,
      suffix: element.dataset.suffix || options.suffix || '',
      prefix: element.dataset.prefix || options.prefix || '',
      decimals: parseInt(element.dataset.decimals || options.decimals || 0),
      duration: parseInt(element.dataset.duration || options.duration || 2000),
      locale: options.locale || 'de-DE',
      ...options
    });
    this.counters.set(element, counter);
    return counter;
  }

  // Auto-discover and register counters
  discover(container = document) {
    const elements = container.querySelectorAll('[data-counter]');
    elements.forEach(el => this.register(el));
    return this;
  }

  // Observe and trigger on visibility
  observe() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = this.counters.get(entry.target);
          if (counter && !counter._started) {
            counter.start();
          }
        }
      });
    }, { threshold: 0.3 });

    this.counters.forEach((counter, element) => {
      this._observer.observe(element);
    });

    return this;
  }

  // Start all counters
  startAll() {
    this.counters.forEach(counter => counter.start());
  }

  // Reset all counters
  resetAll() {
    this.counters.forEach(counter => counter.reset());
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
    }
    this.counters.clear();
  }
}

// ─── Typewriter Effect ───
export class Typewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.text = options.text || element.textContent;
    this.speed = options.speed || 60;
    this.delay = options.delay || 0;
    this.cursor = options.cursor !== false;
    this._started = false;
  }

  start() {
    if (this._started) return;
    this._started = true;

    this.element.textContent = '';
    if (this.cursor) {
      this.element.classList.add('typewriter');
    }

    let i = 0;
    setTimeout(() => {
      const type = () => {
        if (i < this.text.length) {
          this.element.textContent += this.text[i];
          i++;
          setTimeout(type, this.speed + Math.random() * 30);
        } else if (this.cursor) {
          // Keep cursor blinking for 2s then remove
          setTimeout(() => {
            this.element.classList.remove('typewriter');
          }, 2000);
        }
      };
      type();
    }, this.delay);
  }
}
