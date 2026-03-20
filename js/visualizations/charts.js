/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Chart Visualizations (SVG-based)
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';
import { DOMUtils } from '../utils/dom.js';
import { i18n } from '../i18n.js';

export class Charts {
  // ─── Warming Stripes ───
  static warmingStripes(container, data, progress = 1) {
    if (!Array.isArray(data) || data.length === 0) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const visibleCount = Math.ceil(data.length * MathUtils.clamp(progress, 0, 1));

    data.forEach((entry, i) => {
      const bar = DOMUtils.create('div', {
        className: 'warming-stripes__bar',
        style: {
          backgroundColor: MathUtils.tempToColor(entry.value),
          opacity: i < visibleCount ? '1' : '0',
          transition: `opacity 0.3s ease ${i * 20}ms`
        },
        title: `${entry.year}: ${entry.value > 0 ? '+' : ''}${entry.value}°C`
      });
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', `${entry.year}: ${entry.value}°C Anomalie`);
      fragment.appendChild(bar);
    });

    container.appendChild(fragment);
  }

  // ─── Line/Area Chart ───
  static lineChart(container, data, options = {}) {
    if (!Array.isArray(data) || data.length < 2) return;
    const containerWidth = container.getBoundingClientRect().width || 800;
    const isMobile = containerWidth < 500;
    const {
      width = Math.round(containerWidth),
      height = isMobile ? 180 : 300,
      color = '#00d4ff',
      fillOpacity = 0.15,
      strokeWidth = isMobile ? 2 : 2.5,
      showArea = true,
      showDots = isMobile ? false : true,
      showLabels = true,
      animate = true,
      progress = 1,
      yLabel = '',
      padding = isMobile ? { top: 15, right: 10, bottom: 30, left: 35 } : { top: 20, right: 20, bottom: 40, left: 50 }
    } = options;

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const values = data.map(d => Number(d.value)).filter(Number.isFinite);
    if (values.length < 2) return;
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin || 1;
    const minVal = rawMin - range * 0.05;
    const maxVal = rawMax + range * 0.05 || 1;

    const xScale = (i) => padding.left + (i / (data.length - 1)) * plotWidth;
    const yScale = (v) => padding.top + plotHeight - ((v - minVal) / (maxVal - minVal)) * plotHeight;

    // Build path
    const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value) }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

    const pathLength = points.reduce((sum, p, i) => {
      if (i === 0) return 0;
      return sum + MathUtils.distance(points[i - 1].x, points[i - 1].y, p.x, p.y);
    }, 0);

    const gradId = container.id || 'chart-' + Math.random().toString(36).slice(2, 8);
    let svg = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">`;

    // Gradient
    svg += `<defs>
      <linearGradient id="areaGrad-${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="${fillOpacity}" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </linearGradient>
    </defs>`;

    // Grid lines
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (plotHeight / gridSteps) * i;
      const val = maxVal - ((maxVal - minVal) / gridSteps) * i;
      svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"
        stroke="rgba(255,255,255,0.05)" stroke-width="1" />`;
      if (showLabels) {
        svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end"
          fill="rgba(255,255,255,0.3)" font-size="10" font-family="var(--font-mono)">${val.toFixed(val >= 100 ? 0 : 1)}</text>`;
      }
    }

    // X axis labels
    if (showLabels) {
      const labelStep = Math.max(1, Math.floor(data.length / 6));
      data.forEach((d, i) => {
        if (i % labelStep === 0 || i === data.length - 1) {
          svg += `<text x="${xScale(i)}" y="${height - 8}" text-anchor="middle"
            fill="rgba(255,255,255,0.3)" font-size="10" font-family="var(--font-mono)">${d.year || d.label || i}</text>`;
        }
      });
    }

    // Area fill
    if (showArea) {
      svg += `<path d="${areaD}" fill="url(#areaGrad-${gradId})" opacity="${animate ? 0 : 1}">
        ${animate ? `<animate attributeName="opacity" from="0" to="1" dur="1s" begin="0.5s" fill="freeze" />` : ''}
      </path>`;
    }

    // Line
    const dashOffset = animate ? pathLength * (1 - progress) : 0;
    svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="${pathLength}" stroke-dashoffset="${dashOffset}"
      style="transition: stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1);" />`;

    // Dots
    if (showDots) {
      points.forEach((p, i) => {
        const opacity = animate ? (i / points.length < progress ? 1 : 0) : 1;
        svg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}" opacity="${opacity}"
          style="transition: opacity 0.3s ease ${i * 50}ms;">
          <title>${data[i].year || ''}: ${data[i].value}</title>
        </circle>`;
      });
    }

    // Y label
    if (yLabel) {
      svg += `<text x="12" y="${padding.top + plotHeight / 2}" transform="rotate(-90, 12, ${padding.top + plotHeight / 2})"
        fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="middle">${yLabel}</text>`;
    }

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ─── Bar Chart ───
  static barChart(container, data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) return;
    const containerWidth = container.getBoundingClientRect().width || 800;
    const isMobile = containerWidth < 500;
    const {
      width = Math.round(containerWidth),
      height = isMobile ? 180 : 250,
      colorFn = () => '#00d4ff',
      barGap = isMobile ? 2 : 4,
      progress = 1,
      showLabels = true,
      padding = isMobile ? { top: 15, right: 10, bottom: 30, left: 35 } : { top: 20, right: 20, bottom: 40, left: 50 }
    } = options;

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const values = data.map(d => Number(d.value)).filter(Number.isFinite);
    if (values.length === 0) return;
    const maxVal = Math.max(...values) * 1.1;
    const barWidth = (plotWidth - barGap * (data.length - 1)) / data.length;

    let svg = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">`;

    data.forEach((d, i) => {
      const barH = (d.value / maxVal) * plotHeight * MathUtils.clamp(progress, 0, 1);
      const x = padding.left + i * (barWidth + barGap);
      const y = padding.top + plotHeight - barH;
      const color = typeof colorFn === 'function' ? colorFn(d, i) : colorFn;

      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}"
        fill="${color}" rx="2" opacity="0.85"
        style="transition: height 1s ease ${i * 30}ms, y 1s ease ${i * 30}ms;">
        <title>${d.label || d.name}: ${d.value}</title>
      </rect>`;

      if (showLabels) {
        svg += `<text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle"
          fill="rgba(255,255,255,0.3)" font-size="9" font-family="var(--font-mono)">${d.label || d.name || ''}</text>`;
      }
    });

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ─── Sentiment Wave ───
  static sentimentWave(container, data) {
    if (!Array.isArray(data) || data.length === 0) return;
    container.innerHTML = '';
    const maxAbs = Math.max(...data.filter(Number.isFinite).map(Math.abs), 1);

    data.forEach(val => {
      const height = Math.abs(val) / maxAbs * 100;
      const isNeg = val < 0;
      const bar = DOMUtils.create('div', {
        className: 'sentiment-wave__bar',
        style: {
          height: `${Math.max(height, 8)}%`,
          backgroundColor: isNeg ? 'rgba(255, 59, 48, 0.6)' : 'rgba(52, 199, 89, 0.6)',
          alignSelf: 'center'
        }
      });
      container.appendChild(bar);
    });
  }

  // ─── Gauge (Circular SVG) ───
  static gauge(container, value, options = {}) {
    const {
      size = 100,
      strokeWidth = 8,
      color = '#00d4ff',
      trackColor = 'rgba(255,255,255,0.06)',
      animate = true,
      label = ''
    } = options;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - MathUtils.clamp(value / 100, 0, 1));

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="gauge__svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
          fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}" class="gauge__track" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
          fill="none" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-linecap="round" class="gauge__fill"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${animate ? circumference : offset}"
          style="transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);" />
      </svg>
      <span class="gauge__value" style="color: ${color}; font-size: ${size * 0.22}px;">${Math.round(value)}</span>
      ${label ? `<span class="gauge__label">${label}</span>` : ''}
    `;

    container.innerHTML = svg;
    container.classList.add('gauge');

    // Trigger animation after insert
    if (animate) {
      requestAnimationFrame(() => {
        const fill = container.querySelector('.gauge__fill');
        if (fill) fill.setAttribute('stroke-dashoffset', offset);
      });
    }
  }

  // ─── Semi-circle Gauge (Fear & Greed style) ───
  static semiGauge(container, value, options = {}) {
    const {
      width = 120,
      height = 70,
      colors = ['#3b82f6', '#60a5fa', '#fbbf24', '#f97316', '#ef4444']
    } = options;

    const cx = width / 2;
    const cy = height - 5;
    const radius = Math.min(cx, cy) - 10;
    const angle = -180 + (value / 100) * 180;
    const needleX = cx + radius * 0.7 * Math.cos(angle * Math.PI / 180);
    const needleY = cy + radius * 0.7 * Math.sin(angle * Math.PI / 180);

    let svg = `<svg viewBox="0 0 ${width} ${height}">`;

    // Arc segments
    const segAngle = 180 / colors.length;
    colors.forEach((color, i) => {
      const start = -180 + i * segAngle;
      const end = start + segAngle;
      const x1 = cx + radius * Math.cos(start * Math.PI / 180);
      const y1 = cy + radius * Math.sin(start * Math.PI / 180);
      const x2 = cx + radius * Math.cos(end * Math.PI / 180);
      const y2 = cy + radius * Math.sin(end * Math.PI / 180);
      svg += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z"
        fill="${color}" opacity="0.3" />`;
    });

    // Needle
    svg += `<line x1="${cx}" y1="${cy}" x2="${needleX}" y2="${needleY}"
      stroke="white" stroke-width="2" stroke-linecap="round" />`;
    svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="white" />`;
    svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="white" font-size="14" font-weight="700" font-family="var(--font-mono)">${value}</text>`;

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ─── Inequality Bar ───
  static inequalityBar(container, topPercent, bottomPercent, progress = 1) {
    const top = Number.isFinite(topPercent) ? topPercent : 45.8;
    const bottom = Number.isFinite(bottomPercent) && bottomPercent > 0 ? bottomPercent : 2.1;
    const topW = top * MathUtils.clamp(progress, 0, 1);
    const bottomW = bottom * MathUtils.clamp(progress, 0, 1);
    const scale = top > 0 ? 100 / top : 1;

    container.innerHTML = `
      <div class="inequality-bar__row">
        <div class="inequality-bar__label">${i18n.t('chart.top1')}</div>
        <div class="inequality-bar__track">
          <div class="inequality-bar__fill inequality-bar__fill--top" style="width:${topW * scale}%"></div>
        </div>
        <div class="inequality-bar__pct inequality-bar__pct--top">${top.toFixed(1)}%</div>
      </div>
      <div class="inequality-bar__row">
        <div class="inequality-bar__label">${i18n.t('chart.bottom50')}</div>
        <div class="inequality-bar__track">
          <div class="inequality-bar__fill inequality-bar__fill--bottom" style="width:${bottomW * scale}%"></div>
        </div>
        <div class="inequality-bar__pct">${bottom.toFixed(1)}%</div>
      </div>
      <div class="inequality-bar__ratio">${(top / bottom).toFixed(0)}${i18n.t('chart.timesMore')}</div>
    `;
  }

  // ─── Freedom Index Bar ───
  static freedomBar(container, freedom) {
    if (!freedom) return;
    const total = (freedom.free || 0) + (freedom.partlyFree || 0) + (freedom.notFree || 0);
    if (total === 0) return;
    const freeP = (freedom.free / total * 100).toFixed(1);
    const partlyP = (freedom.partlyFree / total * 100).toFixed(1);
    const notFreeP = (freedom.notFree / total * 100).toFixed(1);

    container.innerHTML = `
      <div style="width:100%;height:32px;border-radius:8px;overflow:hidden;display:flex;margin-bottom:8px">
        <div style="width:${freeP}%;background:#34c759;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#000;transition:width 1.5s ease">${freedom.free}</div>
        <div style="width:${partlyP}%;background:#ffcc00;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#000;transition:width 1.5s ease">${freedom.partlyFree}</div>
        <div style="width:${notFreeP}%;background:#ff3b30;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#000;transition:width 1.5s ease">${freedom.notFree}</div>
      </div>
    `;
  }

  // ─── Sparkline (Compact Inline Chart) ───
  static sparkline(container, data, options = {}) {
    if (!Array.isArray(data) || data.length < 2) return;
    const {
      width = container.getBoundingClientRect().width || 200,
      height = 40,
      color = '#00d4ff',
      fillOpacity = 0.1,
      strokeWidth = 1.5
    } = options;

    const values = data.map(d => typeof d === 'number' ? d : Number(d.value)).filter(Number.isFinite);
    if (values.length < 2) return;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 2;

    const points = values.map((v, i) => ({
      x: pad + (i / (values.length - 1)) * (width - pad * 2),
      y: pad + (1 - (v - min) / range) * (height - pad * 2)
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

    const gradId = 'spark-' + Math.random().toString(36).slice(2, 8);

    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:${height}px;display:block">
      <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="${fillOpacity}"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaD}" fill="url(#${gradId})"/>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${points[points.length - 1].x.toFixed(1)}" cy="${points[points.length - 1].y.toFixed(1)}" r="2.5" fill="${color}"/>
    </svg>`;
  }

  // ─── Literacy Stairs ───
  static literacyStairs(container, data, progress = 1) {
    container.innerHTML = '';
    if (!Array.isArray(data) || !data.length) return;

    const minVal = 0;
    const maxVal = 100;
    const range = maxVal - minVal;

    data.forEach((entry, i) => {
      const step = DOMUtils.create('div', { className: 'literacy-stairs__step' });
      const visible = i / data.length < progress;

      const male = Number(entry.male);
      const female = Number(entry.female);
      const maleH = visible && Number.isFinite(male) ? ((male - minVal) / range) * 100 : 0;
      const femaleH = visible && Number.isFinite(female) ? ((female - minVal) / range) * 100 : 0;

      const wrapper = DOMUtils.create('div', {
        style: { display: 'flex', gap: '6px', alignItems: 'flex-end', width: '100%', height: '100%' }
      });

      const maleBar = DOMUtils.create('div', {
        className: 'literacy-stairs__bar literacy-stairs__bar--male',
        style: { height: `${maleH}%`, flex: '1' },
        title: `${entry.year} Männer: ${entry.male}%`
      });

      const femaleBar = DOMUtils.create('div', {
        className: 'literacy-stairs__bar literacy-stairs__bar--female',
        style: { height: `${femaleH}%`, flex: '1' },
        title: `${entry.year} Frauen: ${entry.female}%`
      });

      wrapper.appendChild(maleBar);
      wrapper.appendChild(femaleBar);
      step.appendChild(wrapper);

      const label = DOMUtils.create('span', {
        className: 'literacy-stairs__label',
        textContent: entry.year
      });
      step.appendChild(label);

      const gap = Number.isFinite(male) && Number.isFinite(female) ? Math.abs(male - female) : null;
      if (gap !== null) {
        const gapLabel = DOMUtils.create('span', {
          className: 'literacy-stairs__gap',
          textContent: `Δ${gap.toFixed(1)}%`
        });
        step.appendChild(gapLabel);
      }

      container.appendChild(step);
    });
  }
}
