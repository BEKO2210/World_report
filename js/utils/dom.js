/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — DOM Utilities
   ═══════════════════════════════════════════════════════════ */

export const DOMUtils = {
  // ─── Query Shorthand ───
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  },

  // ─── Create Element ───
  create(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') el.className = value;
      else if (key === 'textContent') el.textContent = value;
      else if (key === 'innerHTML') el.innerHTML = value;
      else if (key.startsWith('data-')) el.setAttribute(key, value);
      else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
      else el.setAttribute(key, value);
    }
    for (const child of children) {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    }
    return el;
  },

  // ─── Create SVG Element ───
  createSVG(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  },

  // ─── Throttle ───
  throttle(fn, delay) {
    let lastCall = 0;
    let timeoutId;
    return function (...args) {
      const now = Date.now();
      const remaining = delay - (now - lastCall);

      if (remaining <= 0) {
        clearTimeout(timeoutId);
        lastCall = now;
        fn.apply(this, args);
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          timeoutId = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  },

  // ─── Debounce ───
  debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // ─── RAF Queue ───
  rafQueue: [],
  rafRunning: false,

  scheduleRAF(fn) {
    this.rafQueue.push(fn);
    if (!this.rafRunning) {
      this.rafRunning = true;
      requestAnimationFrame(() => {
        const queue = [...this.rafQueue];
        this.rafQueue = [];
        this.rafRunning = false;
        queue.forEach(f => f());
      });
    }
  },

  // ─── Wait for next frame ───
  nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  },

  // ─── Wait for transition end ───
  onTransitionEnd(el) {
    return new Promise(resolve => {
      const handler = () => {
        el.removeEventListener('transitionend', handler);
        resolve();
      };
      el.addEventListener('transitionend', handler);
    });
  },

  // ─── Observe elements visibility ───
  observe(elements, callback, options = {}) {
    const defaults = {
      threshold: 0.1,
      rootMargin: '0px'
    };
    const config = { ...defaults, ...options };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => callback(entry));
    }, config);

    if (typeof elements === 'string') {
      this.$$(elements).forEach(el => observer.observe(el));
    } else if (elements instanceof Element) {
      observer.observe(elements);
    } else if (elements[Symbol.iterator]) {
      [...elements].forEach(el => observer.observe(el));
    }

    return observer;
  },

  // ─── Magnetic Button Effect ───
  magneticEffect(button, strength = 0.3) {
    const handleMove = (e) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height);

      if (dist < maxDist) {
        const pull = (1 - dist / maxDist) * strength;
        button.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      }
    };

    const handleLeave = () => {
      button.style.transform = '';
    };

    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseleave', handleLeave);

    return () => {
      button.removeEventListener('mousemove', handleMove);
      button.removeEventListener('mouseleave', handleLeave);
    };
  },

  // ─── Check Reduced Motion ───
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // ─── Get viewport info ───
  viewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 640,
      isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024
    };
  },

  // ─── Smooth scroll to element ───
  scrollTo(target, offset = 0) {
    const el = typeof target === 'string' ? this.$(target) : target;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  },

  // ─── Set CSS Custom Property ───
  setCSSVar(name, value, el = document.documentElement) {
    el.style.setProperty(name, value);
  },

  // ─── Get CSS Custom Property ───
  getCSSVar(name, el = document.documentElement) {
    return getComputedStyle(el).getPropertyValue(name).trim();
  }
};
