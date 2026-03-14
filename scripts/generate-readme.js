#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   World.One — Auto-README Generator
   Generates a living README from world-state.json
   Runs as part of the data pipeline — updates every 6h
   ═══════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'processed', 'world-state.json');
const README_PATH = join(__dirname, '..', 'README.md');

function formatCompact(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + ' Bio';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + ' Mrd';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Mio';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

function getZoneEmoji(score) {
  if (score <= 20) return '🔴';
  if (score <= 40) return '🟠';
  if (score <= 60) return '🟡';
  if (score <= 80) return '🟢';
  return '🔵';
}

function getZoneLabel(score) {
  if (score <= 20) return 'KRITISCH';
  if (score <= 40) return 'BESORGNISERREGEND';
  if (score <= 60) return 'GEMISCHT';
  if (score <= 80) return 'POSITIV';
  return 'EXZELLENT';
}

function generateProgressBar(value, max = 100, width = 20) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Safe accessor — returns fallback instead of undefined
function safe(value, fallback = '—') {
  if (value === undefined || value === null) return fallback;
  return value;
}

function main() {
  console.log('[README] Generating auto-updated README...');

  if (!existsSync(DATA_PATH)) {
    console.error('[README] world-state.json not found, skipping.');
    process.exit(0);
  }

  let data;
  try {
    data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  } catch (e) {
    console.error('[README] Failed to parse world-state.json:', e.message);
    process.exit(0);
  }

  const wi = data.worldIndex || {};
  const sub = data.subScores || {};
  const meta = data.meta || {};
  const env = data.environment || {};
  const soc = data.society || {};
  const eco = data.economy || {};
  const prog = data.progress || {};
  const rt = data.realtime || {};
  const mom = data.momentum || {};
  const scenarios = data.scenarios || {};
  const sources = data.dataSources || [];

  const now = meta.generated ? new Date(meta.generated) : new Date();
  const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const wiValue = safe(wi.value, 0);
  const wiChange = safe(wi.change, 0);
  const trendArrow = wiChange >= 0 ? '↑' : '↓';
  const trendColor = wiChange >= 0 ? '+' : '';

  // Build momentum summary
  const indicators = mom.indicators || [];
  const improving = indicators.filter(i => i.direction === 'improving');
  const declining = indicators.filter(i => i.direction === 'declining');

  const readme = `# World.One 1.0

> **Der Zustand der Welt in einem einzigen Scroll-Erlebnis.**
> Ein Vermächtnis aus Daten, Code und der Überzeugung, dass Transparenz die Welt verbessert.

---

## 🌍 Welt-Indikator: ${wiValue} / 100 ${getZoneEmoji(wiValue)} ${getZoneLabel(wiValue)}

\`\`\`
${generateProgressBar(wiValue)}  ${wiValue}/100  ${trendArrow} ${trendColor}${wiChange}
\`\`\`

> Berechnet aus hunderten Datenpunkten. Kein KI-Modell — reiner Code, reale Daten.
> **Letzte Aktualisierung:** ${dateStr} ${timeStr} UTC

### Sub-Scores

| Kategorie | Score | Trend | Gewichtung |
|-----------|-------|-------|------------|
${['environment|Umwelt|25', 'society|Gesellschaft|25', 'economy|Wirtschaft|20', 'progress|Fortschritt|20', 'momentum|Momentum|10'].map(entry => {
    const [key, label, weight] = entry.split('|');
    const s = sub[key] || {};
    const val = safe(s.value, 0);
    const trend = s.trend === 'improving' ? '↑' : s.trend === 'declining' ? '↓' : '→';
    const change = safe(s.change, 0);
    return `| ${getZoneEmoji(val)} ${label} | **${val}**/100 | ${trend} ${change >= 0 ? '+' : ''}${change} | ${weight}% |`;
  }).join('\n')}

---

## 📊 Live-Daten Snapshot

### 🌡️ Umwelt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Temperaturanomalie | **+${safe(env.temperatureAnomaly?.current)}°C** | NASA GISTEMP |
| CO2-Konzentration | **${safe(env.co2?.current)} ppm** | NOAA |
| Arktis-Eisfläche | **${safe(env.arcticIce?.current)} Mio km²** (${safe(env.arcticIce?.percentLost)}% verloren) | NSIDC |
| Luftqualität (Ø) | AQI **${safe(env.airQuality?.globalAvgAQI)}** | WAQI |

### 👥 Gesellschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Aktive Konflikte | **${safe(soc.conflicts?.activeCount)}** | ACLED |
| Menschen auf der Flucht | **${soc.refugees?.total ? formatCompact(soc.refugees.total) : '—'}** | UNHCR |
| Lebenserwartung | **${safe(soc.lifeExpectancy?.global)} Jahre** | WHO |
| Freiheitsindex | ${safe(soc.freedom?.free)} frei / ${safe(soc.freedom?.partlyFree)} teilw. / ${safe(soc.freedom?.notFree)} unfrei | Freedom House |

### 💰 Wirtschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| BIP-Wachstum | **${safe(eco.gdpGrowth?.global)}%** | IMF |
| Gini-Index | **${safe(eco.gini?.globalAvg)}** | World Bank |
| Extreme Armut | **${eco.wealth?.extremePoverty ? formatCompact(eco.wealth.extremePoverty) : '—'}** | World Bank |
| Milliardäre | **${eco.wealth?.billionaires ? formatCompact(eco.wealth.billionaires) : '—'}** (${safe(eco.wealth?.top1Percent)}% Vermögen) | Oxfam |

### 🚀 Fortschritt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Internet-Nutzer | **${safe(prog.internet?.penetration)}%** (${prog.internet?.users ? formatCompact(prog.internet.users) : '—'}) | ITU |
| Alphabetisierung | **${safe(prog.literacy?.global)}%** | UNESCO |
| Wiss. Publikationen | **${prog.publications?.annualTotal ? formatCompact(prog.publications.annualTotal) : '—'}/Jahr** | arXiv/Scopus |
| GitHub Commits | **${prog.github?.dailyCommits ? formatCompact(prog.github.dailyCommits) : '—'}/Tag** | GitHub |

### ⚡ Echtzeit
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Erdbeben (24h) | **${rt.earthquakes?.last24h?.length ?? '—'}** Beben M2.5+ | USGS |
| Nachrichten-Sentiment | **${safe(rt.newsSentiment?.score)}** (${safe(rt.newsSentiment?.label)}) | GDELT |
| Crypto Fear & Greed | **${safe(rt.cryptoFearGreed?.value)}/100** (${safe(rt.cryptoFearGreed?.label)}) | Alternative.me |

---

## 📈 Momentum: ${improving.length}/${indicators.length} Trends positiv

<details>
<summary>Alle ${indicators.length} Indikatoren anzeigen</summary>

#### ✅ Verbessert sich (${improving.length})
${improving.map(i => `- **${i.name}**: ${i.change}`).join('\n')}

#### ❌ Verschlechtert sich (${declining.length})
${declining.map(i => `- **${i.name}**: ${i.change}`).join('\n')}

</details>

---

## 🔮 Drei Szenarien bis 2050

| Pfad | 2030 | 2050 | Beschreibung |
|------|------|------|-------------|
| 🟠 Weiter so | ${safe(scenarios.businessAsUsual?.worldIndex2030)} | ${safe(scenarios.businessAsUsual?.worldIndex2050)} | ${scenarios.businessAsUsual?.keyChanges?.[0] || '—'} |
| 🔴 Worst Case | ${safe(scenarios.worstCase?.worldIndex2030)} | ${safe(scenarios.worstCase?.worldIndex2050)} | ${scenarios.worstCase?.keyChanges?.[0] || '—'} |
| 🔵 Best Case | ${safe(scenarios.bestCase?.worldIndex2030)} | ${safe(scenarios.bestCase?.worldIndex2050)} | ${scenarios.bestCase?.keyChanges?.[0] || '—'} |

---

## 🏗️ Architektur

\`\`\`
world-one/
├── index.html                    # Entry Point — 12 Scroll-Sektionen
├── css/
│   ├── core.css                  # Design System, Custom Properties, Reset
│   ├── sections.css              # Bento Grid & Section Styles
│   ├── components.css            # Data Cards, AQI, Exchange Rates, Gauges
│   └── animations.css            # 40+ Keyframes & Transitions
├── js/
│   ├── app.js                    # Main Controller — Data Binding
│   ├── data-loader.js            # Fetch & LocalStorage Cache
│   ├── scroll-engine.js          # IntersectionObserver + RAF Loop
│   └── visualizations/
│       ├── world-indicator.js    # Der Haupt-Schieberegler
│       ├── charts.js             # SVG Charts (Line, Bar, Gauge, Sparklines)
│       ├── maps.js               # SVG-Weltkarten mit Overlays
│       ├── particles.js          # Canvas Partikel-System
│       ├── counters.js           # Animierte Counter & Typewriter
│       └── cinematic.js          # Scroll-driven Cinematics
├── scripts/
│   ├── collect-data.js           # 40+ API Datensammler
│   ├── process-data.js           # Raw → world-state.json Transformer
│   └── generate-readme.js        # Auto-README Generator
├── data/processed/
│   └── world-state.json          # Alle verarbeiteten Daten
└── .github/workflows/
    └── data-pipeline.yml         # Automatische Pipeline (alle 6h)
\`\`\`

## ⚙️ Tech Stack

- **Vanilla JS** (ES Modules) — keine Frameworks, keine Build-Tools
- **CSS Custom Properties** — dynamisches Farbsystem pro Sektion
- **Canvas API** — Partikel-System mit Physik-Simulation
- **SVG** — Alle Charts, Sparklines und Karten
- **IntersectionObserver** — Scroll-driven Animations
- **GitHub Actions** — Automatisierte Daten-Pipeline mit Self-Healing

## 📡 Datenquellen (${sources.length})

| Quelle | Vertrauen | Letztes Update |
|--------|-----------|----------------|
${sources.map(s => `| [${s.name}](${s.url}) | ${'⭐'.repeat(s.trust)} | ${s.lastUpdate} |`).join('\n')}

## 🚀 Setup

### Lokal starten

\`\`\`bash
git clone https://github.com/BEKO2210/World_report.git
cd World_report
npx serve .
# → http://localhost:3000
\`\`\`

### GitHub Pages

1. Repository-Settings → Pages → Source: **GitHub Actions**
2. Die Pipeline läuft automatisch alle 6 Stunden
3. Manuell: Actions → World.One → Run workflow

## 🧬 Das Vermächtnis

Dieses Projekt wurde gebaut um zu überdauern. Die GitHub Actions Pipeline:
- **Sammelt Daten** aus 40+ freien APIs — alle 6 Stunden, automatisch
- **Aktualisiert diese README** mit Live-Daten bei jedem Pipeline-Lauf
- **Erkennt Fehler** und erstellt automatisch Issues bei Problemen
- **Heilt sich selbst** — schließt Issues wenn Quellen wieder verfügbar sind
- **Läuft unendlich** — solange GitHub existiert, lebt dieses Projekt

> *Die Daten hören nie auf zu fließen. Der Code repariert sich selbst.*
> *Ein Vermächtnis aus Transparenz, gebaut um die Menschheit zu überdauern.*

---

<sub>
Auto-generiert von der World.One Pipeline | ${dateStr} ${timeStr} UTC | ${safe(meta.sources_available, '?')}/${safe(meta.sources_count, '?')} Quellen aktiv
</sub>
`;

  writeFileSync(README_PATH, readme);
  console.log('[README] ✓ README.md generated successfully');
  console.log(`[README] World Index: ${wi.value} | Sources: ${meta.sources_available}/${meta.sources_count}`);
}

main();
