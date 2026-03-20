/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — World Indicator (Das Herzstück)
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';
import { Charts } from './charts.js';
import { Counter } from './counters.js';
import { i18n } from '../i18n.js';

export class WorldIndicator {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.animated = false;
    this.currentValue = 0;
    this.targetValue = data.worldIndex.value;
    this._counter = null;
  }

  // ─── Update data reference (called on timeline/language change) ───
  setData(data) {
    this.data = data;
    this.targetValue = data.worldIndex.value;
    this.animated = false;
    this._counter = null;
  }

  // ─── Animate the indicator based on scroll progress ───
  update(progress) {
    if (progress <= 0) return;

    const eased = MathUtils.easing.easeOutExpo(MathUtils.clamp(progress * 2, 0, 1));
    const currentVal = this.targetValue * eased;

    // Update pointer position
    const pointer = this.container.querySelector('.world-indicator__pointer');
    const comet = this.container.querySelector('.world-indicator__comet');
    if (pointer) {
      pointer.style.left = `${currentVal}%`;
    }
    if (comet) {
      comet.style.left = `${Math.max(0, currentVal - 15)}%`;
      comet.style.width = `${Math.min(15, currentVal)}%`;
    }

    // Update number display
    const numberEl = this.container.querySelector('.world-indicator__number');
    if (numberEl && !this._counter) {
      this._counter = new Counter(numberEl, {
        target: this.targetValue,
        decimals: 1,
        duration: 2500,
        easing: MathUtils.easing.easeOutExpo
      });
    }

    if (this._counter && !this._counter._started && progress > 0.1) {
      this._counter.start();
      this._animateSubScores();
    }

    // Set zone color on value display
    const zone = MathUtils.getZone(currentVal);
    const valueContainer = this.container.querySelector('.world-indicator__value');
    if (valueContainer) {
      valueContainer.style.color = zone.color;
    }

    // Set zone badge
    const zoneBadge = this.container.querySelector('.world-indicator__zone-label');
    if (zoneBadge && progress > 0.3) {
      zoneBadge.innerHTML = `<span class="zone-badge zone-badge--${zone.zone}">${zone.label}</span>`;
    }
  }

  _animateSubScores() {
    if (this.animated) return;
    this.animated = true;

    const subScores = this.data.subScores;
    const categories = ['environment', 'society', 'economy', 'progress', 'momentum'];

    categories.forEach((cat, i) => {
      const scoreData = subScores[cat];
      const el = this.container.querySelector(`[data-subscore="${cat}"]`);
      if (!el) return;

      // Animate gauge
      const gaugeEl = el.querySelector('.sub-score__gauge');
      if (gaugeEl) {
        setTimeout(() => {
          Charts.gauge(gaugeEl, scoreData.value, {
            size: 80,
            strokeWidth: 6,
            color: MathUtils.getZone(scoreData.value).color,
            label: ''
          });
        }, i * 150);
      }

      // Animate value
      const valueEl = el.querySelector('.sub-score__value');
      if (valueEl) {
        const counter = new Counter(valueEl, {
          target: scoreData.value,
          decimals: 1,
          duration: 2000 + i * 200
        });
        setTimeout(() => counter.start(), i * 150);
      }
    });
  }
}
