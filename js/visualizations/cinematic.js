/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — Cinematic Scroll Transformations
   S/W Bilder die sich beim Scrollen verwandeln
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';

// Unsplash-Bilder: Hochwertige S/W Fotografien (lizenzfrei)
const SECTION_IMAGES = {
  prolog: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80&auto=format',     // Erde aus dem All
  'akt-indicator': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80&auto=format', // Kompass/Waage
  'akt-environment': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80&auto=format', // Nebel-Wald
  'akt-society': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80&auto=format',   // Menschen/Silhouetten
  'akt-economy': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&auto=format',   // Wolkenkratzer
  'akt-progress': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80&auto=format',   // Schaltkreise/Tech
  'akt-realtime': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80&auto=format',     // Abstrakte Wellen
  'akt-momentum': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80&auto=format',   // Sonnenaufgang
  'akt-crisis-map': 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80&auto=format', // Sturm/Blitz
  'akt-scenarios': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format',   // Sich gabelnder Weg/Berge
  'akt-sources': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=80&auto=format',   // Buecher/Bibliothek
  'akt-action': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80&auto=format',    // Haende/Zusammenhalt
  epilog: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80&auto=format'           // Sternenhimmel/Mond
};

export class CinematicScroll {
  constructor() {
    this._initialized = new Set();
    this._imgCache = new Map();
  }

  init() {
    // Preload first 3 images
    const keys = Object.keys(SECTION_IMAGES);
    keys.slice(0, 3).forEach(key => this._preload(key));

    // Create background layers for all sections
    Object.keys(SECTION_IMAGES).forEach(sectionId => {
      this._createBgLayer(sectionId);
    });

    // Create transition overlays between sections
    this._createTransitionDividers();
  }

  _preload(sectionId) {
    if (this._imgCache.has(sectionId)) return;
    const img = new Image();
    img.src = SECTION_IMAGES[sectionId];
    this._imgCache.set(sectionId, img);
  }

  _createBgLayer(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section || !SECTION_IMAGES[sectionId]) return;

    // Background image container
    const bgLayer = document.createElement('div');
    bgLayer.className = 'cinematic-bg';
    bgLayer.setAttribute('aria-hidden', 'true');
    bgLayer.style.cssText = `
      position: absolute;
      inset: -20%;
      width: 140%;
      height: 140%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    `;

    const img = document.createElement('div');
    img.className = 'cinematic-bg__img';
    img.style.cssText = `
      position: absolute;
      inset: 0;
      background-image: url(${SECTION_IMAGES[sectionId]});
      background-size: cover;
      background-position: center;
      filter: grayscale(100%) brightness(0.3) contrast(1.2);
      opacity: 0;
      transition: opacity 1.5s ease, filter 2s ease;
      will-change: transform, filter, opacity;
    `;

    bgLayer.appendChild(img);
    section.style.position = 'relative';
    section.insertBefore(bgLayer, section.firstChild);

    // Preload when near
    this._preload(sectionId);
  }

  _createTransitionDividers() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, i) => {
      if (i === 0) return;

      const divider = document.createElement('div');
      divider.className = 'section-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 200px;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(180deg,
          var(--bg-primary, #0a0a0f) 0%,
          transparent 100%
        );
        opacity: 0.8;
      `;
      section.insertBefore(divider, section.firstChild);

      // Bottom fade on previous section
      const bottomFade = document.createElement('div');
      bottomFade.className = 'section-bottom-fade';
      bottomFade.setAttribute('aria-hidden', 'true');
      bottomFade.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(0deg,
          rgba(10, 10, 15, 0.9) 0%,
          transparent 100%
        );
      `;
      sections[i - 1].appendChild(bottomFade);
    });
  }

  // Called by scroll engine per section
  updateSection(sectionId, progress) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const bgImg = section.querySelector('.cinematic-bg__img');
    if (!bgImg) return;

    // Reveal image with parallax
    const isVisible = progress > 0.05 && progress < 0.95;
    const normalizedProgress = MathUtils.clamp((progress - 0.1) / 0.8, 0, 1);

    // Parallax Y movement (slower than scroll)
    const parallaxY = (progress - 0.5) * -15;
    bgImg.style.transform = `translateY(${parallaxY}%) scale(1.1)`;

    // Fade in/out
    if (isVisible) {
      bgImg.style.opacity = '1';

      // Grayscale to slight color based on progress through section
      const colorAmount = MathUtils.easing.easeOutCubic(normalizedProgress);
      const grayscale = MathUtils.lerp(100, 40, colorAmount);
      const brightness = MathUtils.lerp(0.25, 0.35, colorAmount);
      bgImg.style.filter = `grayscale(${grayscale}%) brightness(${brightness}) contrast(1.2)`;
    } else {
      bgImg.style.opacity = '0';
    }

    // Section-specific cinematic effects
    this._applySectionEffect(sectionId, section, progress, normalizedProgress);
  }

  _applySectionEffect(sectionId, section, progress, normalized) {
    const content = section.querySelector('.section__content') || section.querySelector('.container');
    if (!content) return;

    switch (sectionId) {
      case 'prolog': {
        // Prolog: Scale up pulse, fade content
        const pulse = section.querySelector('.prolog__pulse');
        if (pulse) {
          const scale = 1 + progress * 3;
          const opacity = 1 - progress * 2;
          pulse.style.transform = `scale(${scale})`;
          pulse.style.opacity = MathUtils.clamp(opacity, 0, 1);
        }
        const hint = section.querySelector('.scroll-hint');
        if (hint) {
          hint.style.opacity = MathUtils.clamp(1 - progress * 4, 0, 1);
        }
        break;
      }

      case 'akt-indicator': {
        // Indicator: Scale reveal
        const indicator = section.querySelector('.world-indicator');
        if (indicator && normalized < 0.3) {
          const scale = MathUtils.lerp(0.9, 1, MathUtils.easing.easeOutExpo(normalized / 0.3));
          indicator.style.transform = `scale(${scale})`;
        }
        break;
      }

      case 'akt-environment': {
        // Environment: Rotate warming stripes slightly
        const stripes = section.querySelector('.warming-stripes');
        if (stripes) {
          const skew = MathUtils.lerp(-1, 0, MathUtils.clamp(normalized * 2, 0, 1));
          stripes.style.transform = `skewX(${skew}deg)`;
        }
        break;
      }

      case 'akt-economy': {
        // Economy: Inequality bar dramatic reveal
        const bar = section.querySelector('.inequality-bar');
        if (bar) {
          const clipProgress = MathUtils.clamp(normalized * 1.5, 0, 1);
          bar.style.clipPath = `inset(0 ${(1 - clipProgress) * 100}% 0 0)`;
        }
        break;
      }

      case 'akt-scenarios': {
        // Scenarios: Stagger cards with 3D perspective
        const cards = section.querySelectorAll('.scenario');
        cards.forEach((card, i) => {
          const cardProgress = MathUtils.clamp((normalized - i * 0.15) * 2, 0, 1);
          const eased = MathUtils.easing.easeOutExpo(cardProgress);
          const rotateY = MathUtils.lerp(15, 0, eased);
          const translateZ = MathUtils.lerp(-100, 0, eased);
          card.style.transform = `perspective(800px) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
          card.style.opacity = eased;
        });
        break;
      }
    }

    // Universal parallax on content
    if (content && sectionId !== 'prolog') {
      const contentY = MathUtils.lerp(30, -10, MathUtils.easing.easeOutQuart(normalized));
      content.style.transform = `translateY(${contentY}px)`;
    }
  }
}
