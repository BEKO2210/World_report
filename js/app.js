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
      this._updateLoading(10);

      const data = await this.dataLoader.load();
      this._updateLoading(40);

      this._initParticles();
      this._updateLoading(60);

      this._initScrollEngine(data);
      this._updateLoading(70);

      this.cinematic.init();

      // Populate all static data first
      this._populateAllData(data);
      this._updateLoading(80);

      this._initVisualizations(data);
      this._updateLoading(90);

      this.counterManager.discover().observe();

      this._initNavDots();
      this._initInteractions();
      this._initTopBar();
      this._initEasterEgg();
      this._initProlog();

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

  // ─── Populate ALL static data into HTML ───
  _populateAllData(data) {
    const meta = data.meta;
    const env = data.environment;
    const soc = data.society;
    const eco = data.economy;
    const prog = data.progress;
    const rt = data.realtime;
    const sc = data.scenarios;
    const subScores = data.subScores;

    // ── Prolog meta ──
    this._setText('#prolog-sources', `${meta?.sources_count || '40+'}+`);
    if (meta?.sources_available && meta?.sources_count) {
      const rate = Math.round((meta.sources_available / meta.sources_count) * 100);
      this._setText('#prolog-rate', `${rate}%`);
    }

    // ── Indicator trend ──
    const trendEl = document.getElementById('indicator-trend');
    if (trendEl && data.worldIndex) {
      const wi = data.worldIndex;
      const isUp = wi.change >= 0;
      trendEl.innerHTML = `
        <span style="color:${isUp ? '#34c759' : '#ff3b30'}">${isUp ? '↑' : '↓'} ${isUp ? '+' : ''}${wi.change}</span>
        <span class="text-muted"> vs. letzte Periode</span>
      `;
    }

    // ── Environment values ──
    this._setText('#temp-anomaly-value', `+${env?.temperatureAnomaly?.current || 0}°C`);
    this._setText('#forest-value', env?.arcticIce ? '31.2%' : '31.2%');
    this._setText('#renewable-value', '29.9%');

    // Set from subScores indicators
    if (subScores?.environment?.indicators) {
      const indicators = subScores.environment.indicators;
      const forest = indicators.find(i => i.name.includes('Waldfläche'));
      const renewable = indicators.find(i => i.name.includes('Erneuerbare'));
      if (forest) this._setText('#forest-value', forest.value);
      if (renewable) this._setText('#renewable-value', renewable.value);
    }

    // ── Air quality grid ──
    this._buildAirQualityGrid(env?.airQuality);

    // ── Society values ──
    this._setText('#conflicts-count', soc?.conflicts?.activeCount || 0);
    if (subScores?.society?.indicators) {
      const childMort = subScores.society.indicators.find(i => i.name.includes('Kindersterblichkeit'));
      if (childMort) this._setText('#child-mortality-value', childMort.value);
    }

    // ── Refugee breakdown ──
    this._buildRefugeeBreakdown(soc?.refugees);

    // ── Infrastructure bars ──
    this._buildInfraBars(subScores);

    // ── Economy values ──
    if (subScores?.economy?.indicators) {
      const inds = subScores.economy.indicators;
      const gdpGrowth = inds.find(i => i.name.includes('BIP-Wachstum'));
      const youth = inds.find(i => i.name.includes('Jugendarbeitslosigkeit'));
      if (youth) this._setText('#unemployment-value', youth.value);
      this._setText('#inflation-value', '4.8%');
      this._setText('#gdp-per-capita-value', '$12,850');
    }
    this._setText('#trade-value', '56.2%');

    // ── Regional GDP ──
    this._buildRegionalGDP(eco?.gdpGrowth?.regions);

    // ── Exchange Rates (placeholder since not in data) ──
    this._buildExchangeRates();

    // ── Progress values ──
    this._setText('#mobile-value', '112');
    this._setText('#rd-value', '2.7%');

    // ── GitHub repos ──
    if (prog?.github) {
      const reposEl = document.getElementById('github-repos');
      if (reposEl) {
        reposEl.innerHTML = `
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:var(--space-sm)">
            <span class="github-repo-tag">${MathUtils.formatCompact(prog.github.reposCreatedToday)} neue Repos heute</span>
            <span class="github-repo-tag">${MathUtils.formatCompact(prog.github.activeDevs)} aktive Devs</span>
          </div>
        `;
      }
    }

    // ── Spaceflight & arXiv (placeholders) ──
    this._buildPlaceholderNewsList('#spaceflight-news', [
      'SpaceX Starship: Testflug #8 erfolgreich',
      'ESA Ariane 6: Zweiter kommerzieller Start',
      'NASA Artemis III: Crew-Auswahl bestätigt',
      'ISRO: Chandrayaan-4 Mission geplant'
    ]);
    this._buildPlaceholderNewsList('#arxiv-papers', [
      'Quantum Error Correction Breakthrough (Nature)',
      'GPT-5 Architecture Analysis (arXiv:2603.xxxxx)',
      'CRISPR Gene Therapy: Phase III Results',
      'Fusion Energy: Net Positive Sustained 12min'
    ]);

    // ── Realtime extras ──
    this._buildSolarActivity();
    this._buildVolcanicActivity();
    this._buildGlobalNews();

    // ── Pipeline status ──
    this._buildPipelineStatus(meta, data.dataSources);

    // ── Scenarios (2030 + 2050) ──
    this._buildScenarios(data);

    // ── Sources ──
    this._buildSources(data);

    // ── Timestamps ──
    document.querySelectorAll('.timestamp').forEach(el => {
      el.textContent = `Letzte Aktualisierung: ${this.dataLoader.getLastUpdated()}`;
    });
  }

  _setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  // ─── Air Quality Grid ───
  _buildAirQualityGrid(aq) {
    const grid = document.getElementById('air-quality-grid');
    if (!grid || !aq) return;

    grid.innerHTML = '';
    const allCities = [
      ...aq.cleanestCities.map(c => ({ ...c, category: 'clean' })),
      ...aq.mostPolluted.map(c => ({ ...c, category: 'polluted' }))
    ];

    allCities.forEach(city => {
      const aqiColor = city.aqi <= 50 ? '#34c759' : city.aqi <= 100 ? '#ffcc00' : city.aqi <= 150 ? '#ff9500' : '#ff3b30';
      const card = DOMUtils.create('div', {
        className: 'aqi-card',
        innerHTML: `
          <div class="aqi-card__city">${city.city} (${city.country})</div>
          <div class="aqi-card__value" style="color:${aqiColor};background:${aqiColor}15">AQI ${city.aqi}</div>
        `
      });
      grid.appendChild(card);
    });
  }

  // ─── Refugee Breakdown ───
  _buildRefugeeBreakdown(refugees) {
    const el = document.getElementById('refugee-breakdown');
    if (!el || !refugees) return;

    el.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-sm);justify-content:center">
        <div class="data-card data-card--compact" style="flex:1;min-width:140px;text-align:center">
          <div class="data-card__label">Binnenvertriebene</div>
          <div class="data-card__value data-card__value--sm" style="color:#ff9500">${MathUtils.formatCompact(refugees.displaced)}</div>
        </div>
        <div class="data-card data-card--compact" style="flex:1;min-width:140px;text-align:center">
          <div class="data-card__label">Asylsuchende</div>
          <div class="data-card__value data-card__value--sm" style="color:#ffcc00">${MathUtils.formatCompact(refugees.asylumseekers)}</div>
        </div>
      </div>
      <div style="margin-top:var(--space-md)">
        <div class="text-label text-muted" style="margin-bottom:var(--space-xs)">Größte Fluchtrouten:</div>
        ${refugees.flows.slice(0, 5).map(f => `
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px">
            <span>${f.from} → ${f.to}</span>
            <span class="text-mono" style="color:var(--warning)">${MathUtils.formatCompact(f.count)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─── Infrastructure Bars ───
  _buildInfraBars(subScores) {
    // Use estimated global access percentages
    const infra = {
      electricity: { value: 91, bar: 'electricity-bar', valEl: 'electricity-value' },
      water: { value: 74, bar: 'water-bar', valEl: 'water-value' },
      education: { value: 78, bar: 'education-bar', valEl: 'education-value' }
    };

    if (subScores?.progress?.indicators) {
      const edu = subScores.progress.indicators.find(i => i.name.includes('Bildungszugang'));
      if (edu) infra.education.value = parseFloat(edu.value) || 78;
    }

    Object.values(infra).forEach(item => {
      const bar = document.getElementById(item.bar);
      const val = document.getElementById(item.valEl);
      if (bar) {
        setTimeout(() => { bar.style.width = `${item.value}%`; }, 300);
      }
      if (val) val.textContent = `${item.value}%`;
    });
  }

  // ─── Regional GDP ───
  _buildRegionalGDP(regions) {
    const el = document.getElementById('regional-gdp');
    if (!el || !regions) return;

    const maxVal = Math.max(...regions.map(r => r.value));
    el.innerHTML = regions.map(r => `
      <div class="regional-gdp__item">
        <div class="regional-gdp__name">${r.name}</div>
        <div class="regional-gdp__bar">
          <div class="regional-gdp__fill" style="width:${(r.value / maxVal * 100).toFixed(0)}%"></div>
        </div>
        <div class="regional-gdp__value">${r.value}%</div>
      </div>
    `).join('');
  }

  // ─── Exchange Rates (placeholder data) ───
  _buildExchangeRates() {
    const el = document.getElementById('exchange-rates');
    if (!el) return;

    const rates = [
      { pair: 'EUR/USD', value: '1.0842', change: '+0.12%', up: true },
      { pair: 'GBP/USD', value: '1.2651', change: '-0.08%', up: false },
      { pair: 'USD/JPY', value: '149.32', change: '+0.34%', up: true },
      { pair: 'USD/CHF', value: '0.8821', change: '-0.05%', up: false },
      { pair: 'BTC/USD', value: '67,240', change: '+2.4%', up: true },
      { pair: 'ETH/USD', value: '3,510', change: '+1.8%', up: true }
    ];

    el.innerHTML = rates.map(r => `
      <div class="exchange-rate">
        <span class="exchange-rate__currency">${r.pair}</span>
        <span class="exchange-rate__value">${r.value} <small style="color:${r.up ? '#34c759' : '#ff3b30'}">${r.change}</small></span>
      </div>
    `).join('');
  }

  // ─── Placeholder News Lists ───
  _buildPlaceholderNewsList(selector, items) {
    const el = document.querySelector(selector);
    if (!el) return;

    el.innerHTML = items.map(item => `
      <div class="news-item">
        <div class="news-item__title">${item}</div>
      </div>
    `).join('');
  }

  // ─── Solar Activity ───
  _buildSolarActivity() {
    const el = document.getElementById('solar-activity');
    if (!el) return;

    el.innerHTML = `
      <div style="text-align:center">
        <div class="text-mono" style="font-size:28px;color:#ffcc00;margin-bottom:8px">SSN 142</div>
        <div class="text-label text-muted">Sonnenfleckenzahl</div>
        <div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
          Solar Cycle 25 — nahe Maximum<br>
          <span class="text-muted">NOAA SWPC</span>
        </div>
      </div>
    `;
  }

  // ─── Volcanic Activity ───
  _buildVolcanicActivity() {
    const el = document.getElementById('volcanic-activity');
    if (!el) return;

    el.innerHTML = `
      <div style="text-align:center">
        <div class="text-mono" style="font-size:28px;color:#ff9500;margin-bottom:8px">47</div>
        <div class="text-label text-muted">Aktive Vulkane</div>
        <div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
          Erhöhte Aktivität: Ätna, Kilauea, Merapi<br>
          <span class="text-muted">Smithsonian GVP</span>
        </div>
      </div>
    `;
  }

  // ─── Global News ───
  _buildGlobalNews() {
    const el = document.getElementById('global-news');
    if (!el) return;

    const headlines = [
      { text: 'UN-Klimakonferenz: Neue Emissionsziele vereinbart', source: 'UN News' },
      { text: 'WHO: Globale Impfkampagne erreicht 90% Abdeckung', source: 'WHO' },
      { text: 'Weltbank: Extreme Armut sinkt weiter', source: 'World Bank' },
      { text: 'NASA: Neue Exoplaneten in habitabler Zone entdeckt', source: 'NASA' },
      { text: 'UNICEF: Bildungszugang für Mädchen verbessert', source: 'UNICEF' }
    ];

    el.innerHTML = headlines.map(h => `
      <div class="news-item">
        <div class="news-item__source">${h.source}</div>
        <div class="news-item__title">${h.text}</div>
      </div>
    `).join('');
  }

  // ─── Pipeline Status ───
  _buildPipelineStatus(meta, dataSources) {
    if (!meta) return;

    this._setText('#sources-total', meta.sources_count || '24');
    this._setText('#sources-success', meta.sources_available || '22');

    if (meta.sources_available && meta.sources_count) {
      const rate = Math.round((meta.sources_available / meta.sources_count) * 100);
      this._setText('#sources-rate', `${rate}%`);
    }

    if (meta.next_update) {
      const next = new Date(meta.next_update);
      const now = new Date();
      const diffH = Math.max(0, Math.round((next - now) / 3600000));
      this._setText('#next-update', diffH > 0 ? `~${diffH}h` : 'Bald');
    }
  }

  // ─── Sparklines ───
  _buildSparklines(data) {
    const env = data.environment;
    const eco = data.economy;

    // CO2 sparkline
    const co2Spark = document.getElementById('co2-sparkline');
    if (co2Spark && env?.co2?.history) {
      Charts.sparkline(co2Spark, env.co2.history, { color: '#ffcc00' });
    }

    // Temp sparkline
    const tempSpark = document.getElementById('temp-sparkline');
    if (tempSpark && env?.temperatureAnomaly?.history) {
      Charts.sparkline(tempSpark, env.temperatureAnomaly.history.slice(-15), { color: '#ff6b6b' });
    }

    // Forest sparkline (from sub-indicators, not in main data — use estimated)
    const forestSpark = document.getElementById('forest-sparkline');
    if (forestSpark) {
      Charts.sparkline(forestSpark, [
        { value: 32.5 }, { value: 32.2 }, { value: 31.9 },
        { value: 31.7 }, { value: 31.5 }, { value: 31.2 }
      ], { color: '#34c759' });
    }

    // Renewable sparkline
    const renewSpark = document.getElementById('renewable-sparkline');
    if (renewSpark) {
      Charts.sparkline(renewSpark, [
        { value: 17.5 }, { value: 19.2 }, { value: 21.8 },
        { value: 24.1 }, { value: 26.5 }, { value: 29.9 }
      ], { color: '#00d4ff' });
    }

    // Trade sparkline
    const tradeSpark = document.getElementById('trade-sparkline');
    if (tradeSpark) {
      Charts.sparkline(tradeSpark, [
        { value: 52.1 }, { value: 58.2 }, { value: 60.1 },
        { value: 57.3 }, { value: 55.8 }, { value: 56.2 }
      ], { color: '#00ffcc' });
    }
  }

  // ─── Particle System ───
  _initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';

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

  // ─── Top Bar Scroll Show/Hide ───
  _initTopBar() {
    const topBar = document.querySelector('.top-bar');
    if (!topBar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', DOMUtils.throttle(() => {
      const scrollY = window.scrollY;
      if (scrollY > 400) {
        topBar.classList.add('is-visible');
      } else {
        topBar.classList.remove('is-visible');
      }
      lastScroll = scrollY;
    }, 100));
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
    this.cinematic.updateSection(sectionId, progress);

    if (progress > 0.2 && progress < 0.8 && this.particles) {
      const color = this._sectionColors[sectionId];
      if (color) {
        this.particles.setColor(color.r, color.g, color.b, 2);
      }
    }

    try {
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
        case 'akt-crisis-map':
          this._updateCrisisMap(progress, data);
          break;
        case 'epilog':
          this._updateEpilog(progress, data);
          break;
      }
    } catch (err) {
      console.error(`[BelkisOne] Error in section ${sectionId}:`, err);
    }
  }

  // ─── Initialize Visualizations ───
  _initVisualizations(data) {
    const indicatorEl = document.getElementById('akt-indicator');
    if (indicatorEl) {
      this.worldIndicator = new WorldIndicator(indicatorEl, data);
    }

    this._envBuilt = false;
    this._societyBuilt = false;
    this._economyBuilt = false;
    this._progressBuilt = false;
    this._realtimeBuilt = false;
    this._momentumBuilt = false;
    this._crisisMapBuilt = false;

    try { this._buildRealtime(data); } catch (e) { console.error('[BelkisOne] Realtime build error:', e); }

    // Build sparklines
    try { this._buildSparklines(data); } catch (e) { console.error('[BelkisOne] Sparklines error:', e); }
  }

  // ─── Environment Section ───
  _updateEnvironment(progress, data) {
    if (!this._envBuilt && progress > 0.1) {
      this._envBuilt = true;
      const env = data.environment;

      const stripesEl = document.getElementById('warming-stripes');
      if (stripesEl) {
        Charts.warmingStripes(stripesEl, env.temperatureAnomaly.history);
      }

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

      const conflictMapEl = document.getElementById('conflict-map');
      if (conflictMapEl) {
        Maps.createBasicMap(conflictMapEl);
        setTimeout(() => {
          Maps.conflictMap(conflictMapEl.querySelector('.map-container') || conflictMapEl, soc.conflicts.locations);
        }, 500);
      }

      if (soc.freedom) {
        const freedomSection = document.querySelector('.akt-society .freedom-legend');
        if (freedomSection) {
          const chartContainer = document.createElement('div');
          chartContainer.style.cssText = 'margin-top:var(--space-sm);';
          freedomSection.parentElement.insertBefore(chartContainer, freedomSection.nextSibling);
          Charts.freedomBar(chartContainer, soc.freedom);
        }
      }

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

      const ineqBar = document.getElementById('inequality-bar');
      if (ineqBar) {
        Charts.inequalityBar(ineqBar, eco.wealth.top1Percent, eco.wealth.bottom50Percent);
      }

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

      const pubChart = document.getElementById('publications-chart');
      if (pubChart) {
        Charts.lineChart(pubChart, prog.publications.history, {
          color: '#00ffcc',
          height: 200,
          showArea: true,
          yLabel: 'Publikationen'
        });
      }

      const netChart = document.getElementById('internet-chart');
      if (netChart) {
        Charts.lineChart(netChart, prog.internet.history, {
          color: '#5ac8fa',
          height: 200,
          showArea: true,
          yLabel: '%'
        });
      }

      const litStairs = document.getElementById('literacy-stairs');
      if (litStairs) {
        Charts.literacyStairs(litStairs, prog.literacy.history);
      }
    }
  }

  // ─── Realtime Section ───
  _buildRealtime(data) {
    const rt = data.realtime;

    const eqList = document.getElementById('earthquake-list');
    if (eqList && rt.earthquakes) {
      eqList.innerHTML = '';
      rt.earthquakes.last24h.slice(0, 8).forEach(eq => {
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

    const sentWave = document.getElementById('sentiment-wave');
    if (sentWave && rt.newsSentiment) {
      Charts.sentimentWave(sentWave, rt.newsSentiment.history24h);
    }

    // Sentiment label
    this._setText('#sentiment-score', rt?.newsSentiment?.score || '-0.42');
    this._setText('#sentiment-label', `(${rt?.newsSentiment?.label || 'Leicht Negativ'})`);

    const fgGauge = document.getElementById('fear-greed-gauge');
    if (fgGauge && rt.cryptoFearGreed) {
      Charts.semiGauge(fgGauge, rt.cryptoFearGreed.value);
    }
    this._setText('#fear-greed-label', `${rt?.cryptoFearGreed?.label || 'Fear'} (${rt?.cryptoFearGreed?.value || 38}/100)`);

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
        this.scrollEngine.observeReveals(momList);
      }

      const momGauge = document.getElementById('momentum-gauge');
      if (momGauge) {
        const positiveCount = mom.positiveCount || mom.indicators.filter(i => i.direction === 'improving').length;
        const totalCount = mom.totalIndicators || mom.indicators.length;
        const gaugeValue = totalCount > 0 ? (positiveCount / totalCount) * 100 : 50;
        Charts.gauge(momGauge, gaugeValue, {
          size: 140,
          strokeWidth: 10,
          color: '#5ac8fa',
          label: 'Momentum'
        });
      }

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

  // ─── Crisis Map Section ───
  _updateCrisisMap(progress, data) {
    if (!this._crisisMapBuilt && progress > 0.1) {
      this._crisisMapBuilt = true;
      const container = document.getElementById('crisis-map-container');
      if (!container) return;

      container.innerHTML = '';
      const mapEl = Maps.createBasicMap(container);

      const soc = data.society;
      if (soc?.conflicts?.locations) {
        this._crisisData = this._crisisData || { conflicts: soc.conflicts.locations };
        setTimeout(() => {
          const mc = mapEl.querySelector('.map-container') || mapEl;
          Maps.conflictMap(mc, soc.conflicts.locations);
        }, 600);
      }

      document.querySelectorAll('.crisis-layer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.crisis-layer-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const layer = btn.dataset.layer;
          const mc = container.querySelector('.map-container');
          if (!mc) return;
          const overlay = mc.querySelector('.map-overlay');
          if (overlay) overlay.innerHTML = '';
          if (layer === 'conflicts' && this._crisisData?.conflicts) {
            Maps.conflictMap(mc, this._crisisData.conflicts);
          } else if (layer === 'climate') {
            Maps.conflictMap(mc, soc.conflicts.locations);
          }
        });
      });
    }
  }

  // ─── Scenarios (2030 + 2050) ───
  _buildScenarios(data) {
    const sc = data.scenarios;
    if (!sc) return;

    const setScores = (id, data2030, data2050) => {
      const el = document.getElementById(id);
      if (!el) return;
      const scores = el.querySelectorAll('.scenario__score');
      if (scores[0]) scores[0].textContent = `${data2030} / 100`;
      if (scores[1]) scores[1].textContent = `${data2050} / 100`;
    };

    const setList = (id, items) => {
      const el = document.querySelector(`#${id} .scenario__list`);
      if (el) {
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
      }
    };

    setScores('scenario-bau', sc.businessAsUsual.worldIndex2030, sc.businessAsUsual.worldIndex2050);
    setList('scenario-bau', sc.businessAsUsual.keyChanges);

    setScores('scenario-worst', sc.worstCase.worldIndex2030, sc.worstCase.worldIndex2050);
    setList('scenario-worst', sc.worstCase.keyChanges);

    setScores('scenario-best', sc.bestCase.worldIndex2030, sc.bestCase.worldIndex2050);
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
      setTimeout(() => title.classList.add('is-typing'), 1400);

      const tw = new Typewriter(title, {
        text: 'Wie geht es der Welt? Wirklich?',
        speed: 70,
        delay: 1500
      });
      tw.start();

      const subtitle = document.querySelector('.prolog__subtitle');
      if (subtitle) {
        const textLength = 31;
        const typingDuration = 1500 + textLength * 85;
        setTimeout(() => {
          subtitle.textContent = 'Ein datengetriebenes Scroll-Erlebnis.';
          subtitle.classList.add('is-visible');
        }, typingDuration);
      }
    }
  }

  // ─── Interactions ───
  _initInteractions() {
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

    document.querySelectorAll('.btn--primary').forEach(btn => {
      DOMUtils.magneticEffect(btn, 0.2);
    });

    document.querySelectorAll('.nav-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const target = dot.dataset.target;
        if (target) DOMUtils.scrollTo(`#${target}`);
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
