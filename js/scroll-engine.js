/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — Scroll Engine
   IntersectionObserver + requestAnimationFrame
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from './utils/math.js';
import { DOMUtils } from './utils/dom.js';

export class ScrollEngine {
  constructor(options = {}) {
    this.sections = new Map();
    this.callbacks = new Map();
    this.activeSections = new Set();
    this.scrollY = 0;
    this.docHeight = 0;
    this.viewportHeight = 0;
    this.running = false;
    this.reducedMotion = DOMUtils.prefersReducedMotion();

    this.config = {
      threshold: options.threshold || [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
      rootMargin: options.rootMargin || '0px',
      ...options
    };

    this._observer = null;
    this._revealObserver = null;
    this._rafId = null;
  }

  // ─── Initialize ───
  init() {
    this._setupObservers();
    this._setupRevealObserver();
    this._setupScrollListener();
    this._updateMetrics();
    this.running = true;
    this._tick();
    return this;
  }

  // ─── Register a section ───
  register(sectionId, callback) {
    const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
    if (!element) return this;

    this.sections.set(sectionId, {
      element,
      progress: 0,
      isVisible: false,
      wasVisible: false
    });

    if (callback) {
      this.callbacks.set(sectionId, callback);
    }

    if (this._observer) {
      this._observer.observe(element);
    }

    return this;
  }

  // ─── Section Observer ───
  _setupObservers() {
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id || entry.target.dataset.section;
        const section = this.sections.get(sectionId);
        if (!section) return;

        section.isVisible = entry.isIntersecting;
        section.intersectionRatio = entry.intersectionRatio;

        if (entry.isIntersecting) {
          this.activeSections.add(sectionId);
          section.wasVisible = true;
          entry.target.classList.add('is-active');
        } else {
          this.activeSections.delete(sectionId);
          entry.target.classList.remove('is-active');
        }
      });
    }, {
      threshold: this.config.threshold,
      rootMargin: this.config.rootMargin
    });
  }

  // ─── Reveal Observer for .reveal elements ───
  _setupRevealObserver() {
    this._revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
      this._revealObserver.observe(el);
    });
  }

  // ─── Scroll Listener ───
  _setupScrollListener() {
    this._scrollHandler = () => {
      this.scrollY = window.scrollY;
    };
    window.addEventListener('scroll', this._scrollHandler, { passive: true });

    this._resizeHandler = DOMUtils.debounce(() => {
      this._updateMetrics();
    }, 200);
    window.addEventListener('resize', this._resizeHandler);
  }

  _updateMetrics() {
    this.viewportHeight = window.innerHeight;
    this.docHeight = document.documentElement.scrollHeight;
  }

  // ─── Main Loop ───
  _tick() {
    if (!this.running) return;

    this._updateSections();
    this._updateNavDots();

    this._rafId = requestAnimationFrame(() => this._tick());
  }

  _updateSections() {
    for (const [sectionId, section] of this.sections) {
      if (!section.isVisible && section.progress === 0) continue;

      const rect = section.element.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewH = this.viewportHeight;

      // Progress: 0 when section top hits viewport bottom, 1 when section bottom hits viewport top
      const rawProgress = (viewH - rect.top) / (viewH + sectionHeight);
      section.progress = MathUtils.clamp(rawProgress, 0, 1);

      // Call registered callback
      const callback = this.callbacks.get(sectionId);
      if (callback) {
        callback(section.progress, section);
      }
    }
  }

  _updateNavDots() {
    const dots = document.querySelectorAll('.nav-dot');
    if (!dots.length) return;

    const navDotsContainer = document.querySelector('.nav-dots');
    const scrollProgress = this.scrollY / (this.docHeight - this.viewportHeight);

    // Show/hide nav dots
    if (navDotsContainer) {
      navDotsContainer.classList.toggle('is-visible', scrollProgress > 0.02);
    }

    // Highlight active dot — find section closest to center of viewport (progress ~0.5)
    let activeIndex = -1;
    let bestDist = Infinity;
    let i = 0;
    for (const [, section] of this.sections) {
      if (section.isVisible) {
        const dist = Math.abs(section.progress - 0.5);
        if (dist < bestDist) {
          bestDist = dist;
          activeIndex = i;
        }
      }
      i++;
    }

    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeIndex);
    });
  }

  // ─── Get global scroll progress (0-1) ───
  getGlobalProgress() {
    return MathUtils.clamp(this.scrollY / (this.docHeight - this.viewportHeight), 0, 1);
  }

  // ─── Get section progress ───
  getSectionProgress(sectionId) {
    const section = this.sections.get(sectionId);
    return section ? section.progress : 0;
  }

  // ─── Observe new reveal elements ───
  observeReveals(container = document) {
    container.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
      this._revealObserver.observe(el);
    });
  }

  // ─── Cleanup ───
  destroy() {
    this.running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    if (this._observer) this._observer.disconnect();
    if (this._revealObserver) this._revealObserver.disconnect();
    window.removeEventListener('scroll', this._scrollHandler);
    window.removeEventListener('resize', this._resizeHandler);
    this.sections.clear();
    this.callbacks.clear();
  }
}
