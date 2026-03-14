/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — SVG Map Visualizations
   ═══════════════════════════════════════════════════════════ */

import { MathUtils } from '../utils/math.js';
import { DOMUtils } from '../utils/dom.js';
import { i18n } from '../i18n.js';

// ─── Country data for SVG coloring ───
// Climate risk: higher = more at risk (based on ND-GAIN vulnerability index approximation)
const CLIMATE_RISK = {
  BD: 0.95, PK: 0.9, MM: 0.88, IN: 0.85, PH: 0.82, VN: 0.8, TH: 0.75,
  MZ: 0.92, MG: 0.88, SD: 0.9, SO: 0.93, ET: 0.85, KE: 0.78, TD: 0.91,
  NE: 0.89, ML: 0.87, NG: 0.8, CF: 0.9, CD: 0.82, GH: 0.7,
  HT: 0.88, GT: 0.78, HN: 0.82, NI: 0.75, SV: 0.72,
  AF: 0.93, IQ: 0.82, YE: 0.91, SY: 0.85, LY: 0.7,
  ID: 0.72, KH: 0.78, LA: 0.75, NP: 0.8,
  EG: 0.6, MA: 0.5, DZ: 0.55, TN: 0.5,
  BR: 0.45, MX: 0.5, CO: 0.48, PE: 0.52, BO: 0.55, EC: 0.5,
  ZA: 0.55, TZ: 0.65, UG: 0.7, RW: 0.65, BI: 0.75,
  CN: 0.45, US: 0.3, DE: 0.2, FR: 0.22, ES: 0.35, IT: 0.32, GR: 0.38,
  JP: 0.3, KR: 0.25, AU: 0.35, GB: 0.18, SE: 0.12, NO: 0.1, FI: 0.12,
  CA: 0.2, RU: 0.4, UA: 0.5, PL: 0.28, RO: 0.35, BG: 0.38, HU: 0.32
};

// Hunger severity (IPC Phase 3+ population proportion approximation)
const HUNGER_RISK = {
  SO: 0.95, YE: 0.92, AF: 0.9, SD: 0.93, SS: 0.95, CD: 0.85, CF: 0.88,
  HT: 0.82, ET: 0.78, NG: 0.72, ML: 0.75, NE: 0.78, TD: 0.8, BF: 0.7,
  MZ: 0.65, MG: 0.68, MW: 0.7, ZM: 0.55, ZW: 0.6, LR: 0.55, SL: 0.58,
  MM: 0.65, KH: 0.5, LA: 0.48, BD: 0.55, NP: 0.45, PK: 0.6,
  SY: 0.78, IQ: 0.5, LB: 0.45, PS: 0.9, KP: 0.75,
  GT: 0.55, HN: 0.52, NI: 0.48, VE: 0.6,
  KE: 0.45, UG: 0.4, TZ: 0.42, RW: 0.38, BI: 0.65,
  GN: 0.5, GW: 0.52, SN: 0.35, GM: 0.4, MR: 0.45,
  IN: 0.4, EG: 0.25
};

// Nature / protected area coverage (% of land protected, inverted for risk display)
const NATURE_SCORE = {
  DE: 0.38, FR: 0.33, ES: 0.28, IT: 0.22, GB: 0.28, SE: 0.15, NO: 0.17,
  FI: 0.12, AT: 0.29, CH: 0.13, PL: 0.4, RO: 0.23, BG: 0.35, GR: 0.36,
  BR: 0.3, CO: 0.15, PE: 0.18, BO: 0.22, EC: 0.2, VE: 0.55, GY: 0.1,
  US: 0.12, CA: 0.13, MX: 0.15, AU: 0.18, NZ: 0.33,
  CN: 0.15, IN: 0.05, JP: 0.21, KR: 0.17, ID: 0.15,
  CD: 0.12, CF: 0.1, CG: 0.13, CM: 0.1, GA: 0.18,
  KE: 0.08, TZ: 0.38, UG: 0.16, ET: 0.15, ZA: 0.08,
  RU: 0.11, KZ: 0.09, MN: 0.21,
  BW: 0.38, NA: 0.38, ZM: 0.42, MZ: 0.26,
  MG: 0.1, NE: 0.07, TD: 0.1, NG: 0.14, SD: 0.05, ML: 0.04,
  AF: 0.04, PK: 0.1, BD: 0.05, MM: 0.08, TH: 0.19, VN: 0.08
};

// Renewable energy share (approx. % of energy from renewables, normalized 0-1)
const RENEWABLE_SCORE = {
  IS: 1.0, NO: 0.98, BR: 0.83, NZ: 0.82, SE: 0.75, AT: 0.78, CH: 0.68,
  CA: 0.67, FI: 0.44, DK: 0.8, PT: 0.6, ES: 0.47, DE: 0.46, FR: 0.21,
  GB: 0.43, IT: 0.4, GR: 0.35, IE: 0.38, NL: 0.14, BE: 0.13, PL: 0.17,
  US: 0.21, CN: 0.29, IN: 0.2, JP: 0.22, KR: 0.07, AU: 0.32,
  ET: 0.92, KE: 0.75, UG: 0.9, TZ: 0.85, MZ: 0.78, CD: 0.95, CG: 0.65,
  ZA: 0.11, EG: 0.12, MA: 0.2, DZ: 0.01, NG: 0.18, GH: 0.4,
  MX: 0.26, CO: 0.75, PE: 0.6, EC: 0.55, CL: 0.47, AR: 0.3, VE: 0.65,
  PK: 0.35, BD: 0.03, NP: 0.88, LA: 0.65, KH: 0.4, VN: 0.35, MM: 0.55,
  TH: 0.2, PH: 0.28, ID: 0.15, MY: 0.2,
  RU: 0.2, UA: 0.08, KZ: 0.12, UZ: 0.2, TM: 0.0, TJ: 0.95,
  SA: 0.01, AE: 0.07, QA: 0.0, KW: 0.01, IQ: 0.03, IR: 0.06,
  RO: 0.28, BG: 0.23, HU: 0.15, CZ: 0.17, SK: 0.24, HR: 0.3, RS: 0.26
};

// Country class names to ISO-2 mapping for SVG paths that use class instead of id
const CLASS_TO_ISO = {
  'Angola': 'AO', 'Argentina': 'AR', 'Australia': 'AU', 'Azerbaijan': 'AZ',
  'Bahamas': 'BS', 'Canada': 'CA', 'Cape Verde': 'CV', 'Chile': 'CL',
  'China': 'CN', 'Comoros': 'KM', 'Cyprus': 'CY', 'Denmark': 'DK',
  'Falkland Islands': 'FK', 'Fiji': 'FJ', 'France': 'FR', 'Greece': 'GR',
  'Indonesia': 'ID', 'Italy': 'IT', 'Japan': 'JP', 'Malaysia': 'MY',
  'Malta': 'MT', 'New Caledonia': 'NC', 'New Zealand': 'NZ', 'Norway': 'NO',
  'Oman': 'OM', 'Papua New Guinea': 'PG', 'Philippines': 'PH',
  'Russian Federation': 'RU', 'Solomon Islands': 'SB', 'Turkey': 'TR',
  'United Kingdom': 'GB', 'United States': 'US', 'Vanuatu': 'VU',
  'Seychelles': 'SC', 'Mauritius': 'MU', 'Samoa': 'WS',
  'Trinidad and Tobago': 'TT', 'Tonga': 'TO'
};

export class Maps {

  // ─── Get ISO code from SVG path element ───
  static _getISO(path) {
    if (path.id && path.id.length === 2) return path.id;
    const cls = path.getAttribute('class');
    if (cls && CLASS_TO_ISO[cls]) return CLASS_TO_ISO[cls];
    return null;
  }

  // ─── Reset all SVG path fills to default ───
  static _resetSVG(container) {
    const svg = container.querySelector('.map-svg-wrapper svg');
    if (!svg) return;
    svg.querySelectorAll('path').forEach(p => {
      p.style.fill = '';
      p.style.opacity = '';
      p.style.transition = 'fill 0.6s ease, opacity 0.6s ease';
    });
    svg.style.opacity = '0.4';
  }

  // ─── Color SVG paths by data map ───
  static _colorSVG(container, dataMap, colorFn) {
    const svg = container.querySelector('.map-svg-wrapper svg');
    if (!svg) return;
    svg.style.opacity = '1';
    svg.querySelectorAll('path').forEach(p => {
      p.style.transition = 'fill 0.6s ease, opacity 0.6s ease';
      const iso = Maps._getISO(p);
      if (iso && dataMap[iso] !== undefined) {
        const val = dataMap[iso];
        p.style.fill = colorFn(val);
        p.style.opacity = '0.85';
      } else {
        p.style.fill = '#1a1a2e';
        p.style.opacity = '0.3';
      }
    });
  }

  // ─── Clear overlays (points, flows, legends) ───
  static _clearOverlays(container) {
    const overlay = container.querySelector('.map-overlay');
    if (overlay) overlay.innerHTML = '';
    const flowSvg = container.querySelector('.flow-svg');
    if (flowSvg) flowSvg.remove();
    const legend = container.querySelector('.map-legend');
    if (legend) legend.remove();
  }

  // ─── Add legend to map ───
  static _addLegend(container, items) {
    const existing = container.querySelector('.map-legend');
    if (existing) existing.remove();

    const legend = DOMUtils.create('div', {
      className: 'map-legend',
      style: {
        position: 'absolute', bottom: '8px', left: '8px', zIndex: '5',
        display: 'flex', flexDirection: 'column', gap: '4px',
        padding: '8px 12px', borderRadius: '8px',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        fontSize: '11px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4'
      }
    });

    items.forEach(({ color, label }) => {
      const row = DOMUtils.create('div', {
        style: { display: 'flex', alignItems: 'center', gap: '6px' }
      });
      const swatch = DOMUtils.create('span', {
        style: {
          width: '10px', height: '10px', borderRadius: '50%',
          background: color, display: 'inline-block', flexShrink: '0'
        }
      });
      const text = DOMUtils.create('span', { textContent: label });
      row.appendChild(swatch);
      row.appendChild(text);
      legend.appendChild(row);
    });

    container.appendChild(legend);
  }

  // ═══════════════════════════════════════════════════════════
  //  LAYER: Klimarisiko (Climate Risk)
  // ═══════════════════════════════════════════════════════════
  static climateLayer(container, envData) {
    Maps._clearOverlays(container);
    Maps._colorSVG(container, CLIMATE_RISK, val => {
      if (val > 0.8) return '#a50026';
      if (val > 0.6) return '#d73027';
      if (val > 0.4) return '#f46d43';
      if (val > 0.2) return '#fdae61';
      return '#fee08b';
    });

    Maps._addLegend(container, [
      { color: '#a50026', label: i18n.t('map.extremelyHigh') },
      { color: '#d73027', label: i18n.t('map.high') },
      { color: '#f46d43', label: i18n.t('map.medium') },
      { color: '#fdae61', label: i18n.t('map.low') },
      { color: '#fee08b', label: i18n.t('map.veryLow') }
    ]);

    // Add temperature label
    if (envData?.temperatureAnomaly?.current) {
      const overlay = container.querySelector('.map-overlay');
      if (overlay) {
        const badge = DOMUtils.create('div', {
          style: {
            position: 'absolute', top: '8px', right: '8px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(165,0,38,0.85)', color: '#fff',
            fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)',
            zIndex: '5'
          },
          textContent: `+${envData.temperatureAnomaly.current}°C global`
        });
        overlay.appendChild(badge);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  LAYER: Konflikte (Conflicts)
  // ═══════════════════════════════════════════════════════════
  static conflictsLayer(container, conflicts, refugees) {
    Maps._clearOverlays(container);
    Maps._resetSVG(container);

    const rect = container.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 450;

    const overlay = container.querySelector('.map-overlay');
    if (!overlay) return;

    // Conflict hotspots
    conflicts.forEach((conflict, i) => {
      const pos = MathUtils.geoToSVG(conflict.lat, conflict.lng, w, h);
      const size = 6 + conflict.intensity * 16;
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
          left: `${pos.x}px`, top: `${pos.y}px`,
          width: `${size}px`, height: `${size}px`,
          backgroundColor: color, color: color,
          opacity: '0.85',
          animationDelay: `${i * 150}ms`,
          boxShadow: `0 0 ${size * 1.5}px ${color}`
        },
        title: `${conflict.name} (${conflict.type}, ${i18n.t('map.intensity')} ${(conflict.intensity * 100).toFixed(0)}%)`
      });

      // Label for major conflicts
      if (conflict.intensity >= 0.7) {
        const label = DOMUtils.create('div', {
          className: 'map-point-label',
          style: {
            position: 'absolute',
            left: `${pos.x + size / 2 + 4}px`, top: `${pos.y - 6}px`,
            fontSize: '10px', color: '#fff', whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            pointerEvents: 'none', zIndex: '3'
          },
          textContent: conflict.name
        });
        overlay.appendChild(label);
      }

      overlay.appendChild(point);
    });

    // Refugee flow lines
    if (refugees?.flows?.length) {
      Maps._drawRefugeeFlows(container, refugees.flows, w, h);
    }

    Maps._addLegend(container, [
      { color: '#ff3b30', label: i18n.t('map.war') },
      { color: '#ff9500', label: i18n.t('map.conflict') },
      { color: '#ffcc00', label: i18n.t('map.unrest') },
      { color: 'rgba(255,149,0,0.5)', label: i18n.t('map.flightRoutes') }
    ]);

    // Refugee badge
    if (refugees?.total) {
      const badge = DOMUtils.create('div', {
        style: {
          position: 'absolute', top: '8px', right: '8px',
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(255,59,48,0.85)', color: '#fff',
          fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)',
          zIndex: '5'
        },
        textContent: i18n.t('map.mioDisplaced', { val: (refugees.total / 1e6).toFixed(1) })
      });
      overlay.appendChild(badge);
    }
  }

  // ─── Refugee flow arcs ───
  static _drawRefugeeFlows(container, flows, w, h) {
    if (!Array.isArray(flows) || flows.length === 0) return;
    const coords = {
      'Syria': { lat: 35.0, lng: 38.0 }, 'Turkey': { lat: 39.0, lng: 35.0 },
      'Ukraine': { lat: 49.0, lng: 31.0 }, 'Poland': { lat: 52.0, lng: 20.0 },
      'Venezuela': { lat: 8.0, lng: -66.0 }, 'Colombia': { lat: 4.0, lng: -72.0 },
      'Afghanistan': { lat: 33.0, lng: 65.0 }, 'Pakistan': { lat: 30.0, lng: 70.0 },
      'Sudan': { lat: 15.0, lng: 32.0 }, 'Chad': { lat: 15.0, lng: 19.0 },
      'Myanmar': { lat: 19.0, lng: 96.0 }, 'Bangladesh': { lat: 24.0, lng: 90.0 },
      'Somalia': { lat: 5.0, lng: 46.0 }, 'Kenya': { lat: 1.0, lng: 38.0 },
      'DRC': { lat: -4.0, lng: 22.0 }, 'Uganda': { lat: 1.0, lng: 32.0 }
    };

    const svgNS = 'http://www.w3.org/2000/svg';
    const flowSVG = document.createElementNS(svgNS, 'svg');
    flowSVG.setAttribute('class', 'flow-svg');
    flowSVG.setAttribute('viewBox', `0 0 ${w} ${h}`);
    flowSVG.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';

    const flowCounts = flows.map(f => Number(f.count) || 0);
    const maxFlow = Math.max(...flowCounts, 1);

    flows.forEach(flow => {
      const fromCoord = coords[flow.from];
      const toCoord = coords[flow.to];
      if (!fromCoord || !toCoord) return;

      const from = MathUtils.geoToSVG(fromCoord.lat, fromCoord.lng, w, h);
      const to = MathUtils.geoToSVG(toCoord.lat, toCoord.lng, w, h);
      const thickness = 1 + (flow.count / maxFlow) * 4;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 30;

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(255, 149, 0, 0.5)');
      path.setAttribute('stroke-width', thickness);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-dasharray', '4 8');
      path.innerHTML = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="2s" repeatCount="indefinite" />`;

      flowSVG.appendChild(path);
    });

    container.appendChild(flowSVG);
  }

  // ═══════════════════════════════════════════════════════════
  //  LAYER: Hungerkrisen (Hunger Crises)
  // ═══════════════════════════════════════════════════════════
  static hungerLayer(container) {
    Maps._clearOverlays(container);
    Maps._colorSVG(container, HUNGER_RISK, val => {
      if (val > 0.8) return '#67000d';
      if (val > 0.6) return '#a50f15';
      if (val > 0.4) return '#cb181d';
      if (val > 0.2) return '#ef3b2c';
      return '#fb6a4a';
    });

    // Add hunger hotspot labels
    const overlay = container.querySelector('.map-overlay');
    const rect = container.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 450;

    const hotspots = [
      { name: i18n.t('map.southSudan'), lat: 7.0, lng: 30.0, pct: '63%' },
      { name: i18n.t('map.somalia'), lat: 5.1, lng: 46.2, pct: '50%' },
      { name: i18n.t('map.yemen'), lat: 15.5, lng: 48.5, pct: '45%' },
      { name: i18n.t('map.afghanistan'), lat: 33.0, lng: 65.0, pct: '42%' },
      { name: i18n.t('map.sudan'), lat: 15.5, lng: 32.5, pct: '37%' },
      { name: i18n.t('map.gaza'), lat: 31.4, lng: 34.3, pct: '90%' },
      { name: i18n.t('map.drCongo'), lat: -4.0, lng: 22.0, pct: '26%' },
      { name: i18n.t('map.haiti'), lat: 19.0, lng: -72.3, pct: '48%' }
    ];

    if (overlay) {
      hotspots.forEach(hs => {
        const pos = MathUtils.geoToSVG(hs.lat, hs.lng, w, h);
        const marker = DOMUtils.create('div', {
          className: 'map-point',
          style: {
            left: `${pos.x}px`, top: `${pos.y}px`,
            width: '8px', height: '8px',
            backgroundColor: '#fff', borderRadius: '50%',
            boxShadow: '0 0 8px rgba(255,255,255,0.6)',
            zIndex: '3'
          },
          title: `${hs.name}: ${hs.pct} ${i18n.t('map.acutelyMalnourished')}`
        });
        const label = DOMUtils.create('div', {
          style: {
            position: 'absolute',
            left: `${pos.x + 8}px`, top: `${pos.y - 6}px`,
            fontSize: '10px', color: '#fff', whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            pointerEvents: 'none', zIndex: '4'
          },
          textContent: `${hs.name} ${hs.pct}`
        });
        overlay.appendChild(marker);
        overlay.appendChild(label);
      });
    }

    Maps._addLegend(container, [
      { color: '#67000d', label: i18n.t('map.famine') },
      { color: '#a50f15', label: i18n.t('map.emergency') },
      { color: '#cb181d', label: i18n.t('map.crisis') },
      { color: '#ef3b2c', label: i18n.t('map.stress') },
      { color: '#1a1a2e', label: i18n.t('map.noData') }
    ]);
  }

  // ═══════════════════════════════════════════════════════════
  //  LAYER: Naturschutz (Conservation)
  // ═══════════════════════════════════════════════════════════
  static natureLayer(container, envData) {
    Maps._clearOverlays(container);
    // Green = well protected, grey = poorly protected
    Maps._colorSVG(container, NATURE_SCORE, val => {
      if (val >= 0.35) return '#1a9850';
      if (val >= 0.25) return '#66bd63';
      if (val >= 0.15) return '#a6d96a';
      if (val >= 0.08) return '#d9ef8b';
      return '#f46d43';
    });

    Maps._addLegend(container, [
      { color: '#1a9850', label: i18n.t('map.protected35') },
      { color: '#66bd63', label: i18n.t('map.protected25') },
      { color: '#a6d96a', label: i18n.t('map.protected15') },
      { color: '#d9ef8b', label: i18n.t('map.protected8') },
      { color: '#f46d43', label: i18n.t('map.protectedLow') }
    ]);

    // Forest badge
    if (envData?.forest?.current) {
      const overlay = container.querySelector('.map-overlay');
      if (overlay) {
        const badge = DOMUtils.create('div', {
          style: {
            position: 'absolute', top: '8px', right: '8px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(26,152,80,0.85)', color: '#fff',
            fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)',
            zIndex: '5'
          },
          textContent: i18n.t('map.forest', { val: envData.forest.current })
        });
        overlay.appendChild(badge);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  LAYER: Erneuerbare Energie (Renewables)
  // ═══════════════════════════════════════════════════════════
  static energyLayer(container, envData) {
    Maps._clearOverlays(container);
    // Blue/green = high renewable share, grey/brown = fossil-dependent
    Maps._colorSVG(container, RENEWABLE_SCORE, val => {
      if (val >= 0.75) return '#006837';
      if (val >= 0.5) return '#31a354';
      if (val >= 0.3) return '#74c476';
      if (val >= 0.15) return '#bae4b3';
      if (val >= 0.05) return '#edf8e9';
      return '#4a1c1c';
    });

    Maps._addLegend(container, [
      { color: '#006837', label: i18n.t('map.renewable75') },
      { color: '#31a354', label: i18n.t('map.renewable50') },
      { color: '#74c476', label: i18n.t('map.renewable30') },
      { color: '#bae4b3', label: i18n.t('map.renewable15') },
      { color: '#edf8e9', label: i18n.t('map.renewable5') },
      { color: '#4a1c1c', label: i18n.t('map.fossil') }
    ]);

    // Renewables badge
    if (envData?.renewableEnergy?.current) {
      const overlay = container.querySelector('.map-overlay');
      if (overlay) {
        const badge = DOMUtils.create('div', {
          style: {
            position: 'absolute', top: '8px', right: '8px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(0,104,55,0.85)', color: '#fff',
            fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)',
            zIndex: '5'
          },
          textContent: i18n.t('map.renewableGlobal', { val: envData.renewableEnergy.current })
        });
        overlay.appendChild(badge);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  LEGACY: Render conflict points only (backward compat)
  // ═══════════════════════════════════════════════════════════
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
      const colors = { war: '#ff3b30', conflict: '#ff9500', unrest: '#ffcc00', protest: '#5ac8fa' };
      const color = colors[conflict.type] || '#ff6b6b';

      const point = DOMUtils.create('div', {
        className: 'map-point map-point--pulse',
        style: {
          left: `${pos.x}px`, top: `${pos.y}px`,
          width: `${size}px`, height: `${size}px`,
          backgroundColor: color, color: color,
          opacity: '0.8', animationDelay: `${i * 200}ms`,
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

  // ═══════════════════════════════════════════════════════════
  //  Map Container Builder
  // ═══════════════════════════════════════════════════════════
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

    const overlay = DOMUtils.create('div', { className: 'map-overlay' });
    const svgWrapper = DOMUtils.create('div', {
      className: 'map-svg-wrapper',
      style: { position: 'absolute', inset: '0', zIndex: '0' }
    });

    // Return a promise so callers can wait for SVG to load
    const loadPromise = fetch('assets/maps/world.svg')
      .then(r => r.text())
      .then(svg => {
        svgWrapper.innerHTML = svg;
        const svgEl = svgWrapper.querySelector('svg');
        if (svgEl) {
          svgEl.style.cssText = 'width:100%;height:100%;opacity:0.4;';
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          // Remove default fills so CSS/JS coloring works
          svgEl.querySelectorAll('path').forEach(p => {
            p.style.transition = 'fill 0.6s ease, opacity 0.6s ease';
          });
        }
      })
      .catch(() => {
        svgWrapper.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.15);font-size:14px;">${i18n.t('map.worldMap')}</div>`;
      });

    mapEl.appendChild(svgWrapper);
    mapEl.appendChild(overlay);
    container.appendChild(mapEl);

    mapEl._svgReady = loadPromise;
    return mapEl;
  }
}
