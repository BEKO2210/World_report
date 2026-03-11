/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — SVG Map Visualizations
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';
import { DOMUtils } from '../utils/dom.js';

export class Maps {
  // ─── Render conflict points on a map ───
  static conflictMap(container, conflicts, progress = 1) {
    const overlay = container.querySelector('.map-overlay') || DOMUtils.create('div', { className: 'map-overlay' });
    overlay.innerHTML = '';

    const visibleCount = Math.ceil(conflicts.length * MathUtils.clamp(progress, 0, 1));
    const rect = container.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 450;

    conflicts.slice(0, visibleCount).forEach((conflict, i) => {
      const pos = MathUtils.geoToSVG(conflict.lat, conflict.lng, w, h);
      const size = 6 + conflict.intensity * 14;
      const colors = {
        war: '#ff3b30',
        conflict: '#ff9500',
        unrest: '#ffcc00',
        protest: '#5ac8fa'
      };
      const color = colors[conflict.type] || '#ff6b6b';

      const point = DOMUtils.create('div', {
        className: 'map-point map-point--pulse',
        style: {
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          color: color,
          opacity: '0.8',
          animationDelay: `${i * 200}ms`,
          boxShadow: `0 0 ${size}px ${color}`
        },
        title: `${conflict.name} (${conflict.type})`
      });

      overlay.appendChild(point);
    });

    if (!container.querySelector('.map-overlay')) {
      container.appendChild(overlay);
    }
  }

  // ─── Render earthquake points ───
  static earthquakeMap(container, earthquakes) {
    const overlay = container.querySelector('.map-overlay') || DOMUtils.create('div', { className: 'map-overlay' });
    overlay.innerHTML = '';

    const rect = container.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 450;

    earthquakes.forEach((eq, i) => {
      const pos = MathUtils.geoToSVG(eq.lat, eq.lng, w, h);
      const size = Math.pow(eq.magnitude, 1.5) * 2;
      const intensity = MathUtils.normalize(eq.magnitude, 3, 8);
      const color = `rgb(${Math.round(255 * intensity)}, ${Math.round(100 * (1 - intensity))}, ${Math.round(50 * (1 - intensity))})`;

      const point = DOMUtils.create('div', {
        className: 'map-point map-point--pulse',
        style: {
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          color: color,
          animationDelay: `${i * 300}ms`
        },
        title: `${eq.location}: M${eq.magnitude}`
      });

      overlay.appendChild(point);
    });

    if (!container.querySelector('.map-overlay')) {
      container.appendChild(overlay);
    }
  }

  // ─── Refugee flow lines ───
  static refugeeFlows(container, flows) {
    const overlay = container.querySelector('.map-overlay') || DOMUtils.create('div', { className: 'map-overlay' });

    // Coordinates for common countries (simplified)
    const coords = {
      'Syria': { lat: 35.0, lng: 38.0 },
      'Turkey': { lat: 39.0, lng: 35.0 },
      'Ukraine': { lat: 49.0, lng: 31.0 },
      'Poland': { lat: 52.0, lng: 20.0 },
      'Venezuela': { lat: 8.0, lng: -66.0 },
      'Colombia': { lat: 4.0, lng: -72.0 },
      'Afghanistan': { lat: 33.0, lng: 65.0 },
      'Pakistan': { lat: 30.0, lng: 70.0 },
      'Sudan': { lat: 15.0, lng: 32.0 },
      'Chad': { lat: 15.0, lng: 19.0 },
      'Myanmar': { lat: 19.0, lng: 96.0 },
      'Bangladesh': { lat: 24.0, lng: 90.0 },
      'Somalia': { lat: 5.0, lng: 46.0 },
      'Kenya': { lat: 1.0, lng: 38.0 },
      'DRC': { lat: -4.0, lng: 22.0 },
      'Uganda': { lat: 1.0, lng: 32.0 }
    };

    const rect = container.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 450;

    const svgNS = 'http://www.w3.org/2000/svg';
    let flowSVG = container.querySelector('.flow-svg');

    if (!flowSVG) {
      flowSVG = document.createElementNS(svgNS, 'svg');
      flowSVG.setAttribute('class', 'flow-svg');
      flowSVG.setAttribute('viewBox', `0 0 ${w} ${h}`);
      flowSVG.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
      container.appendChild(flowSVG);
    }
    flowSVG.innerHTML = '';

    const maxFlow = Math.max(...flows.map(f => f.count));

    flows.forEach(flow => {
      const fromCoord = coords[flow.from];
      const toCoord = coords[flow.to];
      if (!fromCoord || !toCoord) return;

      const from = MathUtils.geoToSVG(fromCoord.lat, fromCoord.lng, w, h);
      const to = MathUtils.geoToSVG(toCoord.lat, toCoord.lng, w, h);
      const thickness = 1 + (flow.count / maxFlow) * 4;

      // Curved path
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 30;
      const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(255, 149, 0, 0.4)');
      path.setAttribute('stroke-width', thickness);
      path.setAttribute('stroke-linecap', 'round');

      // Animate dash
      const length = path.getTotalLength ? 200 : 200;
      path.setAttribute('stroke-dasharray', `4 8`);
      path.innerHTML = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="2s" repeatCount="indefinite" />`;

      flowSVG.appendChild(path);
    });
  }

  // ─── Internet penetration timeline map ───
  static internetMap(container, penetration) {
    const overlay = container.querySelector('.map-overlay') || DOMUtils.create('div', { className: 'map-overlay' });
    const alpha = MathUtils.clamp(penetration / 100, 0, 1);

    overlay.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse at 50% 40%,
        rgba(0, 212, 255, ${alpha * 0.3}) 0%,
        rgba(0, 212, 255, ${alpha * 0.1}) 40%,
        transparent 70%);
      transition: all 1s ease;
    `;

    if (!container.querySelector('.map-overlay')) {
      container.appendChild(overlay);
    }
  }

  // ─── Simple SVG world map placeholder ───
  static createBasicMap(container) {
    container.innerHTML = '';
    const mapEl = DOMUtils.create('div', {
      className: 'map-container',
      style: {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }
    });

    // Load SVG map
    fetch('assets/maps/world.svg')
      .then(r => r.text())
      .then(svg => {
        mapEl.innerHTML = svg;
        const svgEl = mapEl.querySelector('svg');
        if (svgEl) {
          svgEl.style.cssText = 'width:100%;height:100%;opacity:0.4;';
        }
      })
      .catch(() => {
        // Fallback: simplified dot-matrix world outline
        mapEl.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.15);font-size:14px;">Weltkarte</div>`;
      });

    const overlay = DOMUtils.create('div', { className: 'map-overlay' });
    mapEl.appendChild(overlay);
    container.appendChild(mapEl);

    return mapEl;
  }
}
