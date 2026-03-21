# World.One 1.0

> **Der Zustand der Welt in einem einzigen Scroll-Erlebnis.**
> Ein Vermächtnis aus Daten, Code und der Überzeugung, dass Transparenz die Welt verbessert.

---

## 🌍 Welt-Indikator: 64.3 / 100 🟢 POSITIV

```
█████████████░░░░░░░  64.3/100  ↑ +0
```

> Berechnet aus hunderten Datenpunkten. Kein KI-Modell — reiner Code, reale Daten.
> **Letzte Aktualisierung:** 21.03.2026 06:42 UTC

### Sub-Scores

| Kategorie | Score | Trend | Gewichtung |
|-----------|-------|-------|------------|
| 🟡 Umwelt | **44.3**/100 | → +0.1 | 25% |
| 🟡 Gesellschaft | **56**/100 | → +0.1 | 25% |
| 🟢 Wirtschaft | **73.1**/100 | → +0 | 20% |
| 🟢 Fortschritt | **78.5**/100 | → +0 | 20% |
| 🟢 Momentum | **71.4**/100 | → +0 | 10% |

---

## 📊 Live-Daten Snapshot

### 🌡️ Umwelt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Temperaturanomalie | **+1.19°C** | NASA GISTEMP |
| CO2-Konzentration | **429 ppm** | NOAA |
| Arktis-Eisfläche | **4.2 Mio km²** (46.2% verloren) | NSIDC |
| Luftqualität (Ø) | AQI **60** | WAQI |

### 👥 Gesellschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Aktive Konflikte | **56** | ACLED |
| Menschen auf der Flucht | **108.4 Mio** | UNHCR |
| Lebenserwartung | **73.3 Jahre** | WHO |
| Freiheitsindex | 84 frei / 56 teilw. / 55 unfrei | Freedom House |

### 💰 Wirtschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| BIP-Wachstum | **2.87%** | IMF |
| Gini-Index | **42** | World Bank |
| Extreme Armut | **648.0 Mio** | World Bank |
| Milliardäre | **2.8K** (45.8% Vermögen) | Oxfam |

### 🚀 Fortschritt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Internet-Nutzer | **73.6%** (5.4 Mrd) | ITU |
| Alphabetisierung | **87.7%** | UNESCO |
| Wiss. Publikationen | **3.2 Mio/Jahr** | arXiv/Scopus |
| GitHub Commits | **142.0 Mio/Tag** | GitHub |

### ⚡ Echtzeit
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Erdbeben (24h) | **8** Beben M2.5+ | USGS |
| Nachrichten-Sentiment | **-0.42** (Leicht Negativ) | GDELT |
| Crypto Fear & Greed | **12/100** (Extreme Fear) | Alternative.me |

---

## 📈 Momentum: 15/21 Trends positiv

<details>
<summary>Alle 21 Indikatoren anzeigen</summary>

#### ✅ Verbessert sich (15)
- **Kindersterblichkeit**: -4.5%
- **Erneuerbare Energie**: +6.6%
- **Internet-Zugang**: +12.1%
- **BIP-Wachstum**: +48.9%
- **Arbeitslosigkeit**: -19.1%
- **BIP pro Kopf**: +14.3%
- **Globaler Handel**: +7.8%
- **Alphabetisierung**: +0.7%
- **Mobilfunk**: +3.8%
- **F&E Ausgaben**: +15.7%
- **Elektrizitätszugang**: +1.4%
- **Trinkwasser**: +2.7%
- **Gesundheitsausgaben**: +1.0%
- **Urbanisierung**: +1.6%
- **Patentanmeldungen**: +1.2%

#### ❌ Verschlechtert sich (6)
- **Lebenserwartung**: -0.1%
- **CO2-Konzentration**: +2.0%
- **Waldfläche**: -0.3%
- **Inflation**: +120.9%
- **CO2 pro Kopf**: +1.4%
- **Militärausgaben (% BIP)**: +5.6%

</details>

---

## 🔮 Drei Szenarien bis 2050

| Pfad | 2030 | 2050 | Beschreibung |
|------|------|------|-------------|
| 🟠 Weiter so | 45.1 | 38.7 | Temperatur +2.1°C bis 2050 |
| 🔴 Worst Case | 35.2 | 22.8 | Temperatur +3.5°C bis 2050 |
| 🔵 Best Case | 58.4 | 72.1 | Temperatur stabilisiert bei +1.8°C |

---

## 🏗️ Architektur

```
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
```

## ⚙️ Tech Stack

- **Vanilla JS** (ES Modules) — keine Frameworks, keine Build-Tools
- **CSS Custom Properties** — dynamisches Farbsystem pro Sektion
- **Canvas API** — Partikel-System mit Physik-Simulation
- **SVG** — Alle Charts, Sparklines und Karten
- **IntersectionObserver** — Scroll-driven Animations
- **GitHub Actions** — Automatisierte Daten-Pipeline mit Self-Healing

## 📡 Datenquellen (33)

| Quelle | Vertrauen | Letztes Update |
|--------|-----------|----------------|
| [NASA GISTEMP](https://data.giss.nasa.gov/gistemp/) | ⭐⭐⭐ | 2026-03-21 |
| [NOAA (CO2)](https://gml.noaa.gov/ccgg/trends/) | ⭐⭐⭐ | 2026-03-21 |
| [Open-Meteo (Air Quality)](https://air-quality-api.open-meteo.com/) | ⭐⭐ | 2026-03-21 |
| [Open-Meteo](https://open-meteo.com/) | ⭐⭐ | 2026-03-21 |
| [World Bank (Environment)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-03-21 |
| [NSIDC (Arktis)](https://nsidc.org/) | ⭐⭐⭐ | 2026-03-21 |
| [World Bank (Society)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-03-21 |
| [ACLED (Konflikte)](https://acleddata.com/) | ⭐⭐⭐ | 2026-03-21 |
| [UNHCR](https://data.unhcr.org/) | ⭐⭐⭐ | 2026-03-21 |
| [Freedom House](https://freedomhouse.org/) | ⭐⭐⭐ | 2026-03-21 |
| [disease.sh](https://disease.sh/) | ⭐⭐ | 2026-03-21 |
| [World Bank (Economy)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-03-21 |
| [IMF WEO](https://www.imf.org/en/Publications/WEO) | ⭐⭐⭐ | 2026-03-21 |
| [Alternative.me (Crypto)](https://alternative.me/crypto/) | ⭐⭐ | 2026-03-21 |
| [Exchange Rate API](https://open.er-api.com/) | ⭐⭐ | 2026-03-21 |
| [World Bank (Tech)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-03-21 |
| [GitHub API](https://api.github.com/) | ⭐⭐ | 2026-03-21 |
| [arXiv](https://arxiv.org/) | ⭐⭐⭐ | 2026-03-21 |
| [Spaceflight News](https://spaceflightnewsapi.net/) | ⭐⭐ | 2026-03-21 |
| [USGS Earthquakes](https://earthquake.usgs.gov/) | ⭐⭐⭐ | 2026-03-21 |
| [GDELT Project](https://www.gdeltproject.org/) | ⭐⭐ | 2026-03-21 |
| [UN News (RSS)](https://news.un.org/) | ⭐⭐⭐ | 2026-03-21 |
| [WHO News (RSS)](https://www.who.int/) | ⭐⭐⭐ | 2026-03-21 |
| [UNHCR (RSS)](https://www.unhcr.org/) | ⭐⭐⭐ | 2026-03-21 |
| [ReliefWeb (RSS)](https://reliefweb.int/) | ⭐⭐⭐ | 2026-03-21 |
| [NASA (RSS)](https://www.nasa.gov/) | ⭐⭐⭐ | 2026-03-21 |
| [BBC World (RSS)](https://www.bbc.com/news/world) | ⭐⭐⭐ | 2026-03-21 |
| [DW News (RSS)](https://www.dw.com/) | ⭐⭐⭐ | 2026-03-21 |
| [Al Jazeera (RSS)](https://www.aljazeera.com/) | ⭐⭐⭐ | 2026-03-21 |
| [Guardian World (RSS)](https://www.theguardian.com/world) | ⭐⭐⭐ | 2026-03-21 |
| [France24 (RSS)](https://www.france24.com/) | ⭐⭐⭐ | 2026-03-21 |
| [NOAA Space Weather](https://www.swpc.noaa.gov/) | ⭐⭐⭐ | 2026-03-21 |
| [USGS Volcanoes](https://volcanoes.usgs.gov/) | ⭐⭐⭐ | 2026-03-21 |

## 🚀 Setup

### Lokal starten

```bash
git clone https://github.com/BEKO2210/World_report.git
cd World_report
npx serve .
# → http://localhost:3000
```

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
Auto-generiert von der World.One Pipeline | 21.03.2026 06:42 UTC | 40/40 Quellen aktiv
</sub>
