/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — Main Application Controller
   ═══════════════════════════════════════════════════════════ */

import { ScrollEngine } from './scroll-engine.js';
import { DataLoader } from './data-loader.js';
import { ParticleSystem } from './visualizations/particles.js';
import { WorldIndicator } from './visualizations/world-indicator.js';
import { Charts } from './visualizations/charts.js';
import { Maps } from './visualizations/maps.js';
import { Counter, CounterManager, Typewriter } from './visualizations/counters.js';
import { CinematicScroll } from './visualizations/cinematic.js';
import { MathUtils } from './utils/math.js';
import { DOMUtils } from './utils/dom.js';

class BelkisOne {
  constructor() {
    this.dataLoader = new DataLoader();
    this.scrollEngine = new ScrollEngine();
    this.cinematic = new CinematicScroll();
    this.particles = null;
    this.worldIndicator = null;
    this.counterManager = new CounterManager();
    this.scrollCount = 0;
    this._sectionColors = {
      'prolog': { r: 255, g: 255, b: 255 },
      'akt-indicator': { r: 200, g: 200, b: 220 },
      'akt-environment': { r: 0, g: 180, b: 216 },
      'akt-society': { r: 232, g: 168, b: 124 },
      'akt-economy': { r: 255, g: 215, b: 0 },
      'akt-progress': { r: 0, g: 255, b: 204 },
      'akt-realtime': { r: 255, g: 59, b: 48 },
      'akt-momentum': { r: 90, g: 200, b: 250 },
      'akt-crisis-map': { r: 255, g: 107, b: 107 },
      'akt-scenarios': { r: 90, g: 200, b: 250 },
      'akt-sources': { r: 142, g: 142, b: 147 },
      'akt-action': { r: 52, g: 199, b: 89 },
      'epilog': { r: 255, g: 255, b: 255 }
    };
  }

  // ─── Bootstrap ───
  async init() {
    try {
      // Show loading
      this._updateLoading(10);

      // Load data
      const data = await this.dataLoader.load();
      this._updateLoading(40);

      // Init particles
      this._initParticles();
      this._updateLoading(60);

      // Init scroll engine & sections
      this._initScrollEngine(data);
      this._updateLoading(80);

      // Init cinematic scroll effects + images
      this.cinematic.init();

      // Init all visualizations
      this._initVisualizations(data);
      this._updateLoading(95);

      // Init counters
      this.counterManager.discover().observe();

      // Init nav dots first (before interactions, which registers their click handlers)
      this._initNavDots();
      this._initInteractions();
      this._initEasterEgg();

      // Prolog animation
      this._initProlog();

      // Hide loading
      this._updateLoading(100);
      setTimeout(() => {
        const loading = document.querySelector('.loading-screen');
        if (loading) loading.classList.add('is-hidden');
      }, 500);

    } catch (err) {
      console.error('[BelkisOne] Init failed:', err);
      const loading = document.querySelector('.loading-screen');
      if (loading) {
        loading.querySelector('.loading-screen__text').textContent = 'Daten konnten nicht geladen werden.';
      }
    }
  }

  _updateLoading(percent) {
    const bar = document.querySelector('.loading-screen__progress');
    if (bar) bar.style.width = `${percent}%`;
  }

  // ─── Particle System ───
  _initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';

    // Track mouse via window event instead of canvas (canvas has pointer-events:none)
    window.addEventListener('mousemove', (e) => {
      if (this.particles) {
        this.particles.mouse.x = e.clientX;
        this.particles.mouse.y = e.clientY;
      }
    });

    this.particles = new ParticleSystem(canvas, {
      count: DOMUtils.viewport().isMobile ? 300 : 1000,
      baseColor: { r: 255, g: 255, b: 255 },
      maxSize: 2,
      speed: 0.2,
      turbulence: 0.3,
      mouseRepulsion: 100,
      mouseForce: 0.06
    });
    this.particles.start();
  }

  // ─── Scroll Engine Registration ───
  _initScrollEngine(data) {
    const engine = this.scrollEngine;

    const sectionIds = [
      'prolog', 'akt-indicator', 'akt-environment', 'akt-society',
      'akt-economy', 'akt-progress', 'akt-realtime', 'akt-momentum',
      'akt-crisis-map', 'akt-scenarios', 'akt-sources', 'akt-action', 'epilog'
    ];

    sectionIds.forEach(id => {
      engine.register(id, (progress, section) => {
        this._onSectionProgress(id, progress, section, data);
      });
    });

    engine.init();
  }

  // ─── Section Progress Handler ───
  _onSectionProgress(sectionId, progress, section, data) {
    // Cinematic scroll transformations + image effects
    this.cinematic.updateSection(sectionId, progress);

    // Update particle colors based on active section
    if (progress > 0.2 && progress < 0.8 && this.particles) {
      const color = this._sectionColors[sectionId];
      if (color) {
        this.particles.setColor(color.r, color.g, color.b, 2);
      }
    }

    switch (sectionId) {
      case 'akt-indicator':
        if (this.worldIndicator) {
          this.worldIndicator.update(progress);
        }
        break;

      case 'akt-environment':
        this._updateEnvironment(progress, data);
        break;

      case 'akt-society':
        this._updateSociety(progress, data);
        break;

      case 'akt-economy':
        this._updateEconomy(progress, data);
        break;

      case 'akt-progress':
        this._updateProgress(progress, data);
        break;

      case 'akt-momentum':
        this._updateMomentum(progress, data);
        break;

      case 'epilog':
        this._updateEpilog(progress, data);
        break;
    }
  }

  // ─── Initialize Visualizations ───
  _initVisualizations(data) {
    // World Indicator
    const indicatorEl = document.getElementById('akt-indicator');
    if (indicatorEl) {
      this.worldIndicator = new WorldIndicator(indicatorEl, data);
    }

    // Environment charts (lazy - built on first view)
    this._envBuilt = false;
    this._societyBuilt = false;
    this._economyBuilt = false;
    this._progressBuilt = false;
    this._realtimeBuilt = false;
    this._momentumBuilt = false;

    // Realtime section - build immediately since it has live data
    this._buildRealtime(data);

    // Scenarios
    this._buildScenarios(data);

    // Sources
    this._buildSources(data);

    // Last updated
    const tsEls = document.querySelectorAll('.timestamp');
    tsEls.forEach(el => {
      el.textContent = `Letzte Aktualisierung: ${this.dataLoader.getLastUpdated()}`;
    });
  }

  // ─── Environment Section ───
  _updateEnvironment(progress, data) {
    if (!this._envBuilt && progress > 0.1) {
      this._envBuilt = true;
      const env = data.environment;

      // Warming stripes
      const stripesEl = document.getElementById('warming-stripes');
      if (stripesEl) {
        Charts.warmingStripes(stripesEl, env.temperatureAnomaly.history);
      }

      // CO2 chart
      const co2Chart = document.getElementById('co2-chart');
      if (co2Chart) {
        Charts.lineChart(co2Chart, env.co2.history, {
          color: '#ffcc00',
          height: 200,
          showArea: true,
          yLabel: 'ppm'
        });
      }
    }
  }

  // ─── Society Section ───
  _updateSociety(progress, data) {
    if (!this._societyBuilt && progress > 0.1) {
      this._societyBuilt = true;
      const soc = data.society;
      this._crisisData = { conflicts: soc.conflicts.locations };

      // Conflict map
      const conflictMapEl = document.getElementById('conflict-map');
      if (conflictMapEl) {
        Maps.createBasicMap(conflictMapEl);
        setTimeout(() => {
          Maps.conflictMap(conflictMapEl.querySelector('.map-container') || conflictMapEl, soc.conflicts.locations);
        }, 500);
      }

      // Life expectancy chart
      const lifeChart = document.getElementById('life-expectancy-chart');
      if (lifeChart) {
        Charts.lineChart(lifeChart, soc.lifeExpectancy.history, {
          color: '#e8a87c',
          height: 200,
          yLabel: 'Jahre'
        });
      }
    }
  }

  // ─── Economy Section ───
  _updateEconomy(progress, data) {
    if (!this._economyBuilt && progress > 0.1) {
      this._economyBuilt = true;
      const eco = data.economy;

      // Inequality bar
      const ineqBar = document.getElementById('inequality-bar');
      if (ineqBar) {
        Charts.inequalityBar(ineqBar, eco.wealth.top1Percent, eco.wealth.bottom50Percent);
      }

      // Gini chart
      const giniChart = document.getElementById('gini-chart');
      if (giniChart) {
        Charts.lineChart(giniChart, eco.gini.history, {
          color: '#ffd700',
          height: 180,
          yLabel: 'Gini-Index',
          showDots: true
        });
      }
    }
  }

  // ─── Progress Section ───
  _updateProgress(progress, data) {
    if (!this._progressBuilt && progress > 0.1) {
      this._progressBuilt = true;
      const prog = data.progress;

      // Publications chart
      const pubChart = document.getElementById('publications-chart');
      if (pubChart) {
        Charts.lineChart(pubChart, prog.publications.history, {
          color: '#00ffcc',
          height: 200,
          showArea: true,
          yLabel: 'Publikationen'
        });
      }

      // Internet chart
      const netChart = document.getElementById('internet-chart');
      if (netChart) {
        Charts.lineChart(netChart, prog.internet.history, {
          color: '#5ac8fa',
          height: 200,
          showArea: true,
          yLabel: '%'
        });
      }

      // Literacy stairs
      const litStairs = document.getElementById('literacy-stairs');
      if (litStairs) {
        Charts.literacyStairs(litStairs, prog.literacy.history);
      }
    }
  }

  // ─── Realtime Section ───
  _buildRealtime(data) {
    const rt = data.realtime;

    // Earthquake list
    const eqList = document.getElementById('earthquake-list');
    if (eqList && rt.earthquakes) {
      eqList.innerHTML = '';
      rt.earthquakes.last24h.slice(0, 6).forEach(eq => {
        const color = eq.magnitude >= 5 ? '#ff6b6b' : eq.magnitude >= 4 ? '#ffcc00' : '#8e8e93';
        const li = DOMUtils.create('li', {
          className: 'earthquake-list__item',
          innerHTML: `
            <span>${eq.location}</span>
            <span class="earthquake-list__mag" style="background:${color}20;color:${color}">M${eq.magnitude}</span>
          `
        });
        eqList.appendChild(li);
      });
    }

    // Sentiment wave
    const sentWave = document.getElementById('sentiment-wave');
    if (sentWave && rt.newsSentiment) {
      Charts.sentimentWave(sentWave, rt.newsSentiment.history24h);
    }

    // Fear & Greed
    const fgGauge = document.getElementById('fear-greed-gauge');
    if (fgGauge && rt.cryptoFearGreed) {
      Charts.semiGauge(fgGauge, rt.cryptoFearGreed.value);
    }

    // Air quality lists
    const cleanList = document.getElementById('clean-cities');
    const dirtyList = document.getElementById('dirty-cities');
    if (cleanList && data.environment?.airQuality) {
      data.environment.airQuality.cleanestCities.forEach(city => {
        const li = DOMUtils.create('li', {
          className: 'earthquake-list__item',
          innerHTML: `<span>${city.city}</span><span class="earthquake-list__mag" style="background:rgba(52,199,89,0.2);color:#34c759">AQI ${city.aqi}</span>`
        });
        cleanList.appendChild(li);
      });
    }
    if (dirtyList && data.environment?.airQuality) {
      data.environment.airQuality.mostPolluted.forEach(city => {
        const li = DOMUtils.create('li', {
          className: 'earthquake-list__item',
          innerHTML: `<span>${city.city}</span><span class="earthquake-list__mag" style="background:rgba(255,59,48,0.2);color:#ff3b30">AQI ${city.aqi}</span>`
        });
        dirtyList.appendChild(li);
      });
    }
  }

  // ─── Momentum Section ───
  _updateMomentum(progress, data) {
    if (!this._momentumBuilt && progress > 0.15) {
      this._momentumBuilt = true;
      const mom = data.momentum;

      // Build momentum items
      const momList = document.getElementById('momentum-list');
      if (momList) {
        momList.innerHTML = '';
        mom.indicators.forEach((ind, i) => {
          const isUp = ind.direction === 'improving';
          const item = DOMUtils.create('div', {
            className: 'momentum-item reveal swoosh-right',
            style: { transitionDelay: `${i * 60}ms` },
            innerHTML: `
              <span class="momentum-item__arrow" style="color:${isUp ? '#34c759' : '#ff3b30'}">${isUp ? '↑' : '↓'}</span>
              <span class="momentum-item__name">${ind.name}</span>
              <span class="momentum-item__change" style="color:${isUp ? '#34c759' : '#ff3b30'}">${ind.change}</span>
            `
          });
          momList.appendChild(item);
        });

        // Re-observe new reveal elements
        this.scrollEngine.observeReveals(momList);
      }

      // Momentum gauge
      const momGauge = document.getElementById('momentum-gauge');
      if (momGauge) {
        Charts.gauge(momGauge, mom.positiveCount ? (mom.positiveCount / mom.totalIndicators) * 100 : 54.6, {
          size: 140,
          strokeWidth: 10,
          color: '#5ac8fa',
          label: 'Momentum'
        });
      }

      // Comparison grid
      const compGrid = document.getElementById('comparison-grid');
      if (compGrid) {
        compGrid.innerHTML = '';
        mom.comparison2000.forEach((item, i) => {
          const card = DOMUtils.create('div', {
            className: 'comparison-item reveal',
            style: { transitionDelay: `${i * 100}ms` },
            innerHTML: `
              <span class="comparison-item__name">${item.name}</span>
              <div class="comparison-item__values">
                <span class="comparison-item__then">${typeof item.then === 'number' ? MathUtils.formatCompact(item.then) : item.then}</span>
                <span class="comparison-item__arrow">→</span>
                <span class="comparison-item__now">${typeof item.now === 'number' ? MathUtils.formatCompact(item.now) : item.now}</span>
              </div>
              <span class="comparison-item__verdict" style="color:${item.improved ? '#34c759' : '#ff3b30'}">
                ${item.improved ? '✓ Verbessert' : '✗ Verschlechtert'}
              </span>
            `
          });
          compGrid.appendChild(card);
        });
        this.scrollEngine.observeReveals(compGrid);
      }
    }
  }

  // ─── Scenarios ───
  _buildScenarios(data) {
    const sc = data.scenarios;
    if (!sc) return;

    const setScore = (id, val) => {
      const el = document.querySelector(`#${id} .scenario__score`);
      if (el) el.textContent = `${val} / 100`;
    };

    const setList = (id, items) => {
      const el = document.querySelector(`#${id} .scenario__list`);
      if (el) {
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
      }
    };

    setScore('scenario-bau', sc.businessAsUsual.worldIndex2050);
    setList('scenario-bau', sc.businessAsUsual.keyChanges);

    setScore('scenario-worst', sc.worstCase.worldIndex2050);
    setList('scenario-worst', sc.worstCase.keyChanges);

    setScore('scenario-best', sc.bestCase.worldIndex2050);
    setList('scenario-best', sc.bestCase.keyChanges);
  }

  // ─── Sources ───
  _buildSources(data) {
    const grid = document.getElementById('sources-grid');
    if (!grid || !data.dataSources) return;

    grid.innerHTML = '';
    data.dataSources.forEach(source => {
      const stars = '\u2605'.repeat(source.trust);
      const card = DOMUtils.create('a', {
        className: 'source-card reveal',
        href: source.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        innerHTML: `
          <div>
            <div class="source-card__name">${source.name}</div>
            <div class="source-card__date">${source.lastUpdate}</div>
          </div>
          <span class="source-card__trust">${stars}</span>
        `
      });
      grid.appendChild(card);
    });

    this.scrollEngine.observeReveals(grid);
  }

  // ─── Epilog ───
  _updateEpilog(progress, data) {
    const valueEl = document.querySelector('.epilog__value');
    if (valueEl && progress > 0.3) {
      valueEl.style.opacity = '1';
      const zone = MathUtils.getZone(data.worldIndex.value);
      valueEl.style.color = zone.color;
    }
  }

  // ─── Prolog Animation ───
  _initProlog() {
    const title = document.querySelector('.prolog__title');
    if (title) {
      // Fade in title when typing starts
      setTimeout(() => title.classList.add('is-typing'), 1400);

      const tw = new Typewriter(title, {
        text: 'Wie geht es der Welt? Wirklich?',
        speed: 70,
        delay: 1500
      });
      tw.start();

      // Show subtitle after typewriter finishes
      const subtitle = document.querySelector('.prolog__subtitle');
      if (subtitle) {
        const textLength = 31; // "Wie geht es der Welt? Wirklich?"
        const typingDuration = 1500 + textLength * 85; // delay + chars * avg speed
        setTimeout(() => {
          subtitle.textContent = 'Ein datengetriebenes Scroll-Erlebnis.';
          subtitle.classList.add('is-visible');
        }, typingDuration);
      }
    }
  }

  // ─── Interactions ───
  _initInteractions() {
    // Back to top button
    const backBtn = document.querySelector('.epilog__back-to-top');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.scrollCount++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (this.particles) {
          this.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
        }
      });
      DOMUtils.magneticEffect(backBtn, 0.25);
    }

    // Magnetic buttons
    document.querySelectorAll('.btn--primary').forEach(btn => {
      DOMUtils.magneticEffect(btn, 0.2);
    });

    // Nav dot clicks
    document.querySelectorAll('.nav-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const target = dot.dataset.target;
        if (target) DOMUtils.scrollTo(`#${target}`);
      });
    });

    // Crisis map layer buttons
    document.querySelectorAll('.crisis-layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.crisis-layer-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const layer = btn.dataset.layer;
        const mapContainer = document.querySelector('.crisis-map-container .map-container');
        if (mapContainer && this._crisisData) {
          const overlay = mapContainer.querySelector('.map-overlay');
          if (overlay) overlay.innerHTML = '';
          if (layer === 'conflicts' && this._crisisData.conflicts) {
            Maps.conflictMap(mapContainer, this._crisisData.conflicts);
          }
        }
      });
    });
  }

  // ─── Navigation Dots ───
  _initNavDots() {
    const container = document.querySelector('.nav-dots');
    if (!container) return;

    const sections = [
      { id: 'prolog', label: 'Start' },
      { id: 'akt-indicator', label: 'Index' },
      { id: 'akt-environment', label: 'Umwelt' },
      { id: 'akt-society', label: 'Gesellschaft' },
      { id: 'akt-economy', label: 'Wirtschaft' },
      { id: 'akt-progress', label: 'Fortschritt' },
      { id: 'akt-realtime', label: 'Echtzeit' },
      { id: 'akt-momentum', label: 'Momentum' },
      { id: 'akt-crisis-map', label: 'Krisen' },
      { id: 'akt-scenarios', label: 'Szenarien' },
      { id: 'akt-sources', label: 'Quellen' },
      { id: 'akt-action', label: 'Handeln' },
      { id: 'epilog', label: 'Ende' }
    ];

    container.innerHTML = '';
    sections.forEach(sec => {
      const dot = DOMUtils.create('div', {
        className: 'nav-dot',
        'data-target': sec.id,
        innerHTML: `<span class="nav-dot__label">${sec.label}</span>`
      });
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Zu ${sec.label} springen`);
      dot.setAttribute('tabindex', '0');
      container.appendChild(dot);
    });
  }

  // ─── Easter Egg ───
  _initEasterEgg() {
    let lastScroll = 0;
    let bottomCount = 0;

    window.addEventListener('scroll', DOMUtils.throttle(() => {
      const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100;
      if (atBottom && !lastScroll) {
        bottomCount++;
        lastScroll = 1;
      }
      if (!atBottom) lastScroll = 0;

      if (bottomCount >= 3) {
        const egg = document.querySelector('.easter-egg');
        if (egg) egg.classList.add('is-active');
      }
    }, 300));
  }
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  const app = new BelkisOne();
  app.init();
});
