#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   BELKIS ONE — Auto-README Generator
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

function main() {
  console.log('[README] Generating auto-updated README...');

  if (!existsSync(DATA_PATH)) {
    console.error('[README] world-state.json not found, skipping.');
    process.exit(0);
  }

  const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  const wi = data.worldIndex;
  const sub = data.subScores;
  const meta = data.meta;
  const env = data.environment;
  const soc = data.society;
  const eco = data.economy;
  const prog = data.progress;
  const rt = data.realtime;
  const mom = data.momentum;
  const scenarios = data.scenarios;
  const sources = data.dataSources;

  const now = new Date(meta.generated);
  const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const trendArrow = wi.change >= 0 ? '↑' : '↓';
  const trendColor = wi.change >= 0 ? '+' : '';

  // Build momentum summary
  const improving = mom.indicators.filter(i => i.direction === 'improving');
  const declining = mom.indicators.filter(i => i.direction === 'declining');

  const readme = `# BELKIS ONE 1.0

> **Der Zustand der Welt in einem einzigen Scroll-Erlebnis.**
> Ein Vermächtnis aus Daten, Code und der Überzeugung, dass Transparenz die Welt verbessert.

---

## 🌍 Welt-Indikator: ${wi.value} / 100 ${getZoneEmoji(wi.value)} ${getZoneLabel(wi.value)}

\`\`\`
${generateProgressBar(wi.value)}  ${wi.value}/100  ${trendArrow} ${trendColor}${wi.change}
\`\`\`

> Berechnet aus hunderten Datenpunkten. Kein KI-Modell — reiner Code, reale Daten.
> **Letzte Aktualisierung:** ${dateStr} ${timeStr} UTC

### Sub-Scores

| Kategorie | Score | Trend | Gewichtung |
|-----------|-------|-------|------------|
| ${getZoneEmoji(sub.environment.value)} Umwelt | **${sub.environment.value}**/100 | ${sub.environment.trend === 'improving' ? '↑' : sub.environment.trend === 'declining' ? '↓' : '→'} ${sub.environment.change >= 0 ? '+' : ''}${sub.environment.change} | 25% |
| ${getZoneEmoji(sub.society.value)} Gesellschaft | **${sub.society.value}**/100 | ${sub.society.trend === 'improving' ? '↑' : sub.society.trend === 'declining' ? '↓' : '→'} ${sub.society.change >= 0 ? '+' : ''}${sub.society.change} | 25% |
| ${getZoneEmoji(sub.economy.value)} Wirtschaft | **${sub.economy.value}**/100 | ${sub.economy.trend === 'improving' ? '↑' : sub.economy.trend === 'declining' ? '↓' : '→'} ${sub.economy.change >= 0 ? '+' : ''}${sub.economy.change} | 20% |
| ${getZoneEmoji(sub.progress.value)} Fortschritt | **${sub.progress.value}**/100 | ${sub.progress.trend === 'improving' ? '↑' : sub.progress.trend === 'declining' ? '↓' : '→'} ${sub.progress.change >= 0 ? '+' : ''}${sub.progress.change} | 20% |
| ${getZoneEmoji(sub.momentum.value)} Momentum | **${sub.momentum.value}**/100 | ${sub.momentum.trend === 'improving' ? '↑' : sub.momentum.trend === 'declining' ? '↓' : '→'} ${sub.momentum.change >= 0 ? '+' : ''}${sub.momentum.change} | 10% |

---

## 📊 Live-Daten Snapshot

### 🌡️ Umwelt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Temperaturanomalie | **+${env.temperatureAnomaly.current}°C** | NASA GISTEMP |
| CO2-Konzentration | **${env.co2.current} ppm** | NOAA |
| Arktis-Eisfläche | **${env.arcticIce.current} Mio km²** (${env.arcticIce.percentLost}% verloren) | NSIDC |
| Luftqualität (Ø) | AQI **${env.airQuality.globalAvgAQI}** | WAQI |

### 👥 Gesellschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Aktive Konflikte | **${soc.conflicts.activeCount}** | ACLED |
| Menschen auf der Flucht | **${formatCompact(soc.refugees.total)}** | UNHCR |
| Lebenserwartung | **${soc.lifeExpectancy.global} Jahre** | WHO |
| Freiheitsindex | ${soc.freedom.free} frei / ${soc.freedom.partlyFree} teilw. / ${soc.freedom.notFree} unfrei | Freedom House |

### 💰 Wirtschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| BIP-Wachstum | **${eco.gdpGrowth.global}%** | IMF |
| Gini-Index | **${eco.gini.globalAvg}** | World Bank |
| Extreme Armut | **${formatCompact(eco.wealth.extremePoverty)}** | World Bank |
| Milliardäre | **${formatCompact(eco.wealth.billionaires)}** (${eco.wealth.top1Percent}% Vermögen) | Oxfam |

### 🚀 Fortschritt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Internet-Nutzer | **${prog.internet.penetration}%** (${formatCompact(prog.internet.users)}) | ITU |
| Alphabetisierung | **${prog.literacy.global}%** | UNESCO |
| Wiss. Publikationen | **${formatCompact(prog.publications.annualTotal)}/Jahr** | arXiv/Scopus |
| GitHub Commits | **${formatCompact(prog.github.dailyCommits)}/Tag** | GitHub |

### ⚡ Echtzeit
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Erdbeben (24h) | **${rt.earthquakes.last24h.length}** Beben M2.5+ | USGS |
| Nachrichten-Sentiment | **${rt.newsSentiment.score}** (${rt.newsSentiment.label}) | GDELT |
| Crypto Fear & Greed | **${rt.cryptoFearGreed.value}/100** (${rt.cryptoFearGreed.label}) | Alternative.me |

---

## 📈 Momentum: ${improving.length}/${mom.indicators.length} Trends positiv

<details>
<summary>Alle ${mom.indicators.length} Indikatoren anzeigen</summary>

#### ✅ Verbessert sich (${improving.length})
${improving.map(i => `- **${i.name}**: ${i.change}`).join('\n')}

#### ❌ Verschlechtert sich (${declining.length})
${declining.map(i => `- **${i.name}**: ${i.change}`).join('\n')}

</details>

---

## 🔮 Drei Szenarien bis 2050

| Pfad | 2030 | 2050 | Beschreibung |
|------|------|------|-------------|
| 🟠 Weiter so | ${scenarios.businessAsUsual.worldIndex2030} | ${scenarios.businessAsUsual.worldIndex2050} | ${scenarios.businessAsUsual.keyChanges[0]} |
| 🔴 Worst Case | ${scenarios.worstCase.worldIndex2030} | ${scenarios.worstCase.worldIndex2050} | ${scenarios.worstCase.keyChanges[0]} |
| 🔵 Best Case | ${scenarios.bestCase.worldIndex2030} | ${scenarios.bestCase.worldIndex2050} | ${scenarios.bestCase.keyChanges[0]} |

---

## 🏗️ Architektur

\`\`\`
belkis-one/
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
3. Manuell: Actions → BELKIS ONE → Run workflow

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
Auto-generiert von der BELKIS ONE Pipeline | ${dateStr} ${timeStr} UTC | ${meta.sources_available}/${meta.sources_count} Quellen aktiv
</sub>
`;

  writeFileSync(README_PATH, readme);
  console.log('[README] ✓ README.md generated successfully');
  console.log(`[README] World Index: ${wi.value} | Sources: ${meta.sources_available}/${meta.sources_count}`);
}

main();
