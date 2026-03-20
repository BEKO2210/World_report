/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Math Utilities
   ═══════════════════════════════════════════════════════════ */

import { i18n } from '../i18n.js';

export const MathUtils = {
  // ─── Clamping ───
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // ─── Linear Interpolation ───
  lerp(start, end, t) {
    return start + (end - start) * t;
  },

  // ─── Inverse Lerp ───
  inverseLerp(start, end, value) {
    if (start === end) return 0;
    return (value - start) / (end - start);
  },

  // ─── Remap value from one range to another ───
  remap(value, inMin, inMax, outMin, outMax) {
    const t = this.inverseLerp(inMin, inMax, value);
    return this.lerp(outMin, outMax, this.clamp(t, 0, 1));
  },

  // ─── Normalize to 0-1 ───
  normalize(value, min, max) {
    return this.clamp((value - min) / (max - min), 0, 1);
  },

  // ─── Easing Functions ───
  easing: {
    linear(t) { return t; },

    easeInQuad(t) { return t * t; },
    easeOutQuad(t) { return t * (2 - t); },
    easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },

    easeInCubic(t) { return t * t * t; },
    easeOutCubic(t) { return (--t) * t * t + 1; },
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },

    easeOutQuart(t) { return 1 - (--t) * t * t * t; },

    easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },

    easeOutBack(t) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },

    spring(t) {
      return 1 - Math.cos(t * Math.PI * 0.5) * Math.exp(-6 * t);
    }
  },

  // ─── Smooth Damp (Spring-like interpolation) ───
  smoothDamp(current, target, velocity, smoothTime, dt) {
    const omega = 2 / Math.max(smoothTime, 0.0001);
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (velocity + omega * change) * dt;
    const newVelocity = (velocity - omega * temp) * exp;
    let newValue = target + (change + temp) * exp;

    // Prevent overshooting
    if ((target - current > 0) === (newValue > target)) {
      newValue = target;
      return { value: newValue, velocity: 0 };
    }

    return { value: newValue, velocity: newVelocity };
  },

  // ─── Simple Perlin-like Noise ───
  noise(x) {
    const n = Math.sin(x * 127.1 + x * 311.7) * 43758.5453;
    return n - Math.floor(n);
  },

  noise2D(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  },

  // ─── Smooth Noise ───
  smoothNoise(x, octaves = 3) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const xi = x * frequency;
      const i0 = Math.floor(xi);
      const t = xi - i0;
      const smooth = t * t * (3 - 2 * t); // smoothstep
      value += this.lerp(this.noise(i0), this.noise(i0 + 1), smooth) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  },

  // ─── Format Numbers ───
  formatNumber(num, locale = 'de-DE') {
    return new Intl.NumberFormat(locale).format(num);
  },

  formatCompact(num) {
    if (!Number.isFinite(num)) return '—';
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1e12) return sign + (abs / 1e12).toFixed(1) + ' ' + i18n.t('num.bio');
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + ' ' + i18n.t('num.mrd');
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + ' ' + i18n.t('num.mio');
    if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
    return num.toString();
  },

  // ─── Escape HTML to prevent XSS ───
  escapeHTML(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // ─── Get zone info from score ───
  getZone(score) {
    if (score <= 20) return { label: i18n.t('act1.zone.critical'), zone: 'critical', color: '#ff3b30' };
    if (score <= 40) return { label: i18n.t('act1.zone.concerning'), zone: 'concerning', color: '#ff9500' };
    if (score <= 60) return { label: i18n.t('act1.zone.mixed'), zone: 'mixed', color: '#ffcc00' };
    if (score <= 80) return { label: i18n.t('act1.zone.positive'), zone: 'positive', color: '#34c759' };
    return { label: i18n.t('act1.zone.excellent'), zone: 'excellent', color: '#00d4ff' };
  },

  // ─── Get color for temperature anomaly ───
  tempToColor(anomaly) {
    if (anomaly <= -0.5) return '#08306b';
    if (anomaly <= -0.3) return '#2171b5';
    if (anomaly <= -0.1) return '#6baed6';
    if (anomaly <= 0.1) return '#fee090';
    if (anomaly <= 0.3) return '#fdae61';
    if (anomaly <= 0.5) return '#f46d43';
    if (anomaly <= 0.8) return '#d73027';
    if (anomaly <= 1.0) return '#a50026';
    return '#67000d';
  },

  // ─── Map lat/lng to SVG coordinates ───
  geoToSVG(lat, lng, width = 900, height = 450) {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  },

  // ─── Distance between two points ───
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // ─── Angle between two points ───
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // ─── Degrees to Radians ───
  degToRad(deg) {
    return deg * (Math.PI / 180);
  },

  radToDeg(rad) {
    return rad * (180 / Math.PI);
  }
};
