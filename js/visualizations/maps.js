/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — SVG Map Visualizations
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
    // Check each class token against CLASS_TO_ISO (handles added classes like map-country--war)
    const cls = path.getAttribute('class');
    if (cls) {
      const tokens = cls.split(/\s+/);
      // Try full class string first (single-token original class)
      if (tokens.length === 1 && CLASS_TO_ISO[cls]) return CLASS_TO_ISO[cls];
      // Multi-word class names: rebuild without our added classes and check
      const filtered = tokens.filter(t => !t.startsWith('map-country--')).join(' ');
      if (filtered && CLASS_TO_ISO[filtered]) return CLASS_TO_ISO[filtered];
    }
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
      p.classList.remove('map-country--war', 'map-country--conflict', 'map-country--unrest');
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
      p.classList.remove('map-country--war', 'map-country--conflict', 'map-country--unrest');
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

  // ─── Clear overlays (points, flows, legends, tooltips) ───
  static _clearOverlays(container) {
    const overlay = container.querySelector('.map-overlay');
    if (overlay) overlay.innerHTML = '';
    const flowSvg = container.querySelector('.flow-svg');
    if (flowSvg) flowSvg.remove();
    const legend = container.querySelector('.map-legend');
    if (legend) legend.remove();
    // Clean up tooltip + event listeners from previous layer
    const tip = container.querySelector('.map-tooltip');
    if (tip) tip.remove();
    if (container._tooltipCleanup) { container._tooltipCleanup(); container._tooltipCleanup = null; }
    // Reset cursor on all paths
    const svg = container.querySelector('.map-svg-wrapper svg');
    if (svg) svg.querySelectorAll('path').forEach(p => { p.style.cursor = ''; });
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
  //  LAYER: Konflikte (Conflicts) — Country highlighting
  // ═══════════════════════════════════════════════════════════
  static conflictsLayer(container, conflicts, refugees) {
    Maps._clearOverlays(container);

    // Build conflict data map: merge API data + additional known conflicts (March 2026)
    // Sources: ACLED, Crisis Group, CFR, Al Jazeera, Wikipedia
    const CONFLICT_COUNTRIES = {
      // Wars (intensity ≥ 0.7 — bright red glow)
      UA: 0.90, RU: 0.90, PS: 1.0, SD: 0.95, MM: 0.85, IR: 0.90,
      IL: 0.90, LB: 0.80, CD: 0.80, AF: 0.75, PK: 0.70,
      // Armed conflicts (0.5–0.69 — orange glow)
      SS: 0.70, ET: 0.70, ML: 0.70, SY: 0.60, SO: 0.60,
      BF: 0.65, HT: 0.65, NG: 0.60, YE: 0.55, NE: 0.55,
      VE: 0.50, MZ: 0.50, EC: 0.50, CO: 0.45, CM: 0.45,
      // Unrest / lower-intensity (< 0.5 — dark orange glow)
      CF: 0.45, IQ: 0.35, LY: 0.30, TD: 0.35, MX: 0.45
    };

    // Conflict name-to-ISO mapping for data from world-state.json
    const NAME_TO_ISO = {
      'Ukraine': ['UA'], 'Gaza': ['PS', 'IL'], 'Sudan': ['SD'],
      'Myanmar': ['MM'], 'Syrien': ['SY'], 'Syria': ['SY'],
      'Jemen': ['YE'], 'Yemen': ['YE'], 'Somalia': ['SO'],
      'DR Kongo': ['CD'], 'DRC': ['CD'], 'Sahel': ['ML', 'BF', 'NE'],
      'Haiti': ['HT'], 'Iran': ['IR'], 'Lebanon': ['LB'], 'Libanon': ['LB'],
      'Iraq': ['IQ'], 'Irak': ['IQ'], 'Afghanistan': ['AF'],
      'Nigeria': ['NG'], 'Ethiopia': ['ET'], 'Äthiopien': ['ET'],
      'Libya': ['LY'], 'Libyen': ['LY'], 'Pakistan': ['PK'],
      'Mozambique': ['MZ'], 'Mosambik': ['MZ'], 'Cameroon': ['CM'], 'Kamerun': ['CM'],
      'Chad': ['TD'], 'Tschad': ['TD'], 'Central African Republic': ['CF']
    };

    // Override with actual API data intensities where available
    if (Array.isArray(conflicts)) {
      conflicts.forEach(c => {
        const isos = NAME_TO_ISO[c.name];
        if (isos) {
          isos.forEach(iso => { CONFLICT_COUNTRIES[iso] = Math.max(CONFLICT_COUNTRIES[iso] || 0, c.intensity); });
        }
      });
    }

    // Color all SVG country paths
    const svg = container.querySelector('.map-svg-wrapper svg');
    if (svg) {
      svg.style.opacity = '1';
      svg.querySelectorAll('path').forEach(p => {
        const iso = Maps._getISO(p);
        const intensity = iso ? CONFLICT_COUNTRIES[iso] : undefined;
        p.style.transition = 'fill 0.8s ease, opacity 0.8s ease';

        if (intensity !== undefined) {
          // War = bright red, conflict = orange-red, unrest = dark orange
          if (intensity >= 0.7) {
            p.style.fill = '#ff2020';
            p.style.opacity = '1';
            p.classList.add('map-country--war');
          } else if (intensity >= 0.5) {
            p.style.fill = '#e05500';
            p.style.opacity = '0.95';
            p.classList.add('map-country--conflict');
          } else {
            p.style.fill = '#cc6600';
            p.style.opacity = '0.85';
            p.classList.add('map-country--unrest');
          }
        } else {
          p.style.fill = '#1a1a2e';
          p.style.opacity = '0.3';
          p.classList.remove('map-country--war', 'map-country--conflict', 'map-country--unrest');
        }
      });
    }

    // Tooltip data for conflict countries (shown on click)
    const CONFLICT_NAMES = {
      UA: 'Ukraine', RU: i18n.t('map.russia'), PS: i18n.t('map.gaza'),
      IL: 'Israel', SD: i18n.t('map.sudan'), MM: 'Myanmar',
      IR: i18n.t('map.iran'), LB: i18n.t('map.lebanon'),
      CD: i18n.t('map.drCongo'), AF: i18n.t('map.afghanistan'),
      PK: 'Pakistan', SS: i18n.t('map.southSudan'), SY: i18n.t('map.syria'),
      YE: i18n.t('map.yemen'), SO: i18n.t('map.somalia'), HT: 'Haiti',
      ML: 'Mali', BF: 'Burkina Faso', NE: 'Niger', NG: 'Nigeria',
      ET: i18n.t('map.ethiopia') || 'Ethiopia', CF: 'Central African Rep.',
      CM: i18n.t('map.cameroon') || 'Cameroon', MZ: i18n.t('map.mozambique') || 'Mozambique',
      TD: i18n.t('map.chad') || 'Chad', LY: i18n.t('map.libya') || 'Libya',
      IQ: i18n.t('map.iraq'), VE: 'Venezuela', EC: 'Ecuador',
      CO: 'Colombia', MX: 'Mexico'
    };
    const CONFLICT_TYPES = {};
    for (const [iso, val] of Object.entries(CONFLICT_COUNTRIES)) {
      CONFLICT_TYPES[iso] = val >= 0.7 ? i18n.t('map.war') : val >= 0.5 ? i18n.t('map.conflict') : i18n.t('map.unrest');
    }

    // Enable click-to-show tooltip on highlighted countries
    Maps._enableCountryTooltip(container, CONFLICT_COUNTRIES, CONFLICT_NAMES, CONFLICT_TYPES);

    // Refugee badge
    if (refugees?.total) {
      const overlay = container.querySelector('.map-overlay');
      if (overlay) {
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

    Maps._addLegend(container, [
      { color: '#ff2020', label: i18n.t('map.war') },
      { color: '#e05500', label: i18n.t('map.conflict') },
      { color: '#cc6600', label: i18n.t('map.unrest') }
    ]);
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

    // Click-to-show tooltip for hunger countries
    const HUNGER_NAMES = {};
    const HUNGER_DETAILS = {};
    const hotspotPcts = {
      SS: '63%', SO: '50%', YE: '45%', AF: '42%', SD: '37%',
      PS: '90%', CD: '26%', HT: '48%', ET: '35%', MM: '30%',
      CF: '40%', TD: '32%', BF: '28%', MW: '25%', NE: '30%',
      NG: '22%', ML: '27%', MZ: '20%', SY: '33%', KP: '29%'
    };
    for (const iso of Object.keys(HUNGER_RISK)) {
      HUNGER_NAMES[iso] = {
        SS: i18n.t('map.southSudan'), SO: i18n.t('map.somalia'),
        YE: i18n.t('map.yemen'), AF: i18n.t('map.afghanistan'),
        SD: i18n.t('map.sudan'), PS: i18n.t('map.gaza'),
        CD: i18n.t('map.drCongo'), HT: i18n.t('map.haiti') || 'Haiti',
        ET: i18n.t('map.ethiopia') || 'Ethiopia', MM: 'Myanmar',
        CF: 'Central African Rep.', TD: i18n.t('map.chad') || 'Chad',
        SY: i18n.t('map.syria'), MZ: i18n.t('map.mozambique') || 'Mozambique',
        NE: 'Niger', ML: 'Mali', BF: 'Burkina Faso', NG: 'Nigeria',
        MW: 'Malawi', KP: 'North Korea', BD: 'Bangladesh', PK: 'Pakistan',
        KH: 'Cambodia', LA: 'Laos', NP: 'Nepal', LB: i18n.t('map.lebanon'),
        IQ: i18n.t('map.iraq'), IN: 'India', EG: 'Egypt',
        ZM: 'Zambia', ZW: 'Zimbabwe', LR: 'Liberia', SL: 'Sierra Leone',
        GT: 'Guatemala', HN: 'Honduras', NI: 'Nicaragua', VE: 'Venezuela',
        KE: 'Kenya', UG: 'Uganda', TZ: 'Tanzania', RW: 'Rwanda', BI: 'Burundi',
        GN: 'Guinea', GW: 'Guinea-Bissau', SN: 'Senegal', GM: 'Gambia', MR: 'Mauritania',
        MG: 'Madagascar', CM: i18n.t('map.cameroon') || 'Cameroon'
      }[iso] || iso;
      const pct = hotspotPcts[iso];
      HUNGER_DETAILS[iso] = pct ? `${pct} ${i18n.t('map.acutelyMalnourished')}` : null;
    }
    Maps._enableCountryTooltip(container, HUNGER_RISK, HUNGER_NAMES, HUNGER_DETAILS);

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
  //  Click-to-show Country Tooltip
  // ═══════════════════════════════════════════════════════════
  static _enableCountryTooltip(container, dataMap, names, types) {
    const svg = container.querySelector('.map-svg-wrapper svg');
    if (!svg) return;

    // Remove any previous tooltip + listeners
    const old = container.querySelector('.map-tooltip');
    if (old) old.remove();
    if (container._tooltipCleanup) { container._tooltipCleanup(); container._tooltipCleanup = null; }

    // Create tooltip element
    const tip = DOMUtils.create('div', { className: 'map-tooltip' });
    container.appendChild(tip);

    const showTip = (e, iso) => {
      const name = names[iso] || iso;
      const type = types ? types[iso] : null;
      tip.textContent = type ? `${name} — ${type}` : name;
      tip.classList.add('map-tooltip--visible');

      // Position relative to container, clamped within bounds
      const cRect = container.getBoundingClientRect();
      const tw = tip.offsetWidth || 120;
      const th = tip.offsetHeight || 28;
      let x = e.clientX - cRect.left + 12;
      let y = e.clientY - cRect.top - th - 6;
      // Clamp horizontally
      if (x + tw > cRect.width - 8) x = cRect.width - tw - 8;
      if (x < 4) x = 4;
      // Clamp vertically — flip below cursor if no room above
      if (y < 4) y = e.clientY - cRect.top + 16;
      if (y + th > cRect.height - 4) y = cRect.height - th - 4;
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
    };

    const hideTip = () => { tip.classList.remove('map-tooltip--visible'); };

    // Add pointer cursor to clickable paths
    svg.querySelectorAll('path').forEach(p => {
      const iso = Maps._getISO(p);
      if (iso && dataMap[iso] !== undefined) p.style.cursor = 'pointer';
    });

    const onClick = (e) => {
      const path = e.target.closest('path');
      if (!path) { hideTip(); return; }
      const iso = Maps._getISO(path);
      if (iso && dataMap[iso] !== undefined) {
        showTip(e, iso);
      } else {
        hideTip();
      }
    };

    // Dismiss on click outside map
    const onDocClick = (e) => {
      if (!container.contains(e.target)) hideTip();
    };

    svg.addEventListener('click', onClick);
    document.addEventListener('click', onDocClick);

    container._tooltipCleanup = () => {
      svg.removeEventListener('click', onClick);
      document.removeEventListener('click', onDocClick);
    };
  }

  // (Legacy conflictMap removed — replaced by conflictsLayer with country highlighting)

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
