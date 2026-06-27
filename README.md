# World.One 1.0

> **Der Zustand der Welt in einem einzigen Scroll-Erlebnis.**
> Ein Vermächtnis aus Daten, Code und der Überzeugung, dass Transparenz die Welt verbessert.

---

## 🌍 Welt-Indikator: 65.4 / 100 🟢 POSITIV

```
█████████████░░░░░░░  65.4/100  ↓ -0.4
```

> Berechnet aus hunderten Datenpunkten. Kein KI-Modell — reiner Code, reale Daten.
> **Letzte Aktualisierung:** 27.06.2026 19:19 UTC

### Sub-Scores

| Kategorie | Score | Trend | Gewichtung |
|-----------|-------|-------|------------|
| 🟡 Umwelt | **44.1**/100 | → -0.1 | 25% |
| 🟡 Gesellschaft | **55.9**/100 | → -0.1 | 25% |
| 🟢 Wirtschaft | **68.2**/100 | → +0 | 20% |
| 🟢 Fortschritt | **78.1**/100 | → +0 | 20% |
| 🟢 Momentum | **80**/100 | → +0 | 10% |

---

## 📊 Live-Daten Snapshot

### 🌡️ Umwelt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Temperaturanomalie | **+1.19°C** | NASA GISTEMP |
| CO2-Konzentration | **432 ppm** | NOAA |
| Arktis-Eisfläche | **4.2 Mio km²** (46.2% verloren) | NSIDC |
| Luftqualität (Ø) | AQI **59** | WAQI |

### 👥 Gesellschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Aktive Konflikte | **56** | ACLED |
| Menschen auf der Flucht | **108.4 Mio** | UNHCR |
| Lebenserwartung | **73.5 Jahre** | WHO |
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
| Crypto Fear & Greed | **15/100** (Extreme Fear) | Alternative.me |

---

## 📈 Momentum: 16/20 Trends positiv

<details>
<summary>Alle 20 Indikatoren anzeigen</summary>

#### ✅ Verbessert sich (16)
- **Lebenserwartung**: +1.6%
- **Kindersterblichkeit**: -2.3%
- **Erneuerbare Energie**: +6.6%
- **Internet-Zugang**: +12.1%
- **BIP-Wachstum**: +48.9%
- **Arbeitslosigkeit**: -19.1%
- **BIP pro Kopf**: +14.3%
- **Globaler Handel**: +7.8%
- **Alphabetisierung**: +0.7%
- **Mobilfunk**: +3.8%
- **F&E Ausgaben**: +10.8%
- **Elektrizitätszugang**: +1.4%
- **Trinkwasser**: +2.7%
- **Gesundheitsausgaben**: +1.0%
- **Urbanisierung**: +1.6%
- **Patentanmeldungen**: +1.2%

#### ❌ Verschlechtert sich (4)
- **CO2-Konzentration**: +2.1%
- **Waldfläche**: -0.3%
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
| [NASA GISTEMP](https://data.giss.nasa.gov/gistemp/) | ⭐⭐⭐ | 2026-06-27 |
| [NOAA (CO2)](https://gml.noaa.gov/ccgg/trends/) | ⭐⭐⭐ | 2026-06-27 |
| [Open-Meteo (Air Quality)](https://air-quality-api.open-meteo.com/) | ⭐⭐ | 2026-06-27 |
| [Open-Meteo](https://open-meteo.com/) | ⭐⭐ | 2026-06-27 |
| [World Bank (Environment)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-06-27 |
| [NSIDC (Arktis)](https://nsidc.org/) | ⭐⭐⭐ | 2026-06-27 |
| [World Bank (Society)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-06-27 |
| [ACLED (Konflikte)](https://acleddata.com/) | ⭐⭐⭐ | 2026-06-27 |
| [UNHCR](https://data.unhcr.org/) | ⭐⭐⭐ | 2026-06-27 |
| [Freedom House](https://freedomhouse.org/) | ⭐⭐⭐ | 2026-06-27 |
| [disease.sh](https://disease.sh/) | ⭐⭐ | 2026-06-27 |
| [World Bank (Economy)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-06-27 |
| [IMF WEO](https://www.imf.org/en/Publications/WEO) | ⭐⭐⭐ | 2026-06-27 |
| [Alternative.me (Crypto)](https://alternative.me/crypto/) | ⭐⭐ | 2026-06-27 |
| [Exchange Rate API](https://open.er-api.com/) | ⭐⭐ | 2026-06-27 |
| [World Bank (Tech)](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-06-27 |
| [GitHub API](https://api.github.com/) | ⭐⭐ | 2026-06-27 |
| [arXiv](https://arxiv.org/) | ⭐⭐⭐ | 2026-06-27 |
| [Spaceflight News](https://spaceflightnewsapi.net/) | ⭐⭐ | 2026-06-27 |
| [USGS Earthquakes](https://earthquake.usgs.gov/) | ⭐⭐⭐ | 2026-06-27 |
| [GDELT Project](https://www.gdeltproject.org/) | ⭐⭐ | 2026-06-27 |
| [UN News (RSS)](https://news.un.org/) | ⭐⭐⭐ | 2026-06-27 |
| [WHO News (RSS)](https://www.who.int/) | ⭐⭐⭐ | 2026-06-27 |
| [UNHCR (RSS)](https://www.unhcr.org/) | ⭐⭐⭐ | 2026-06-27 |
| [ReliefWeb (RSS)](https://reliefweb.int/) | ⭐⭐⭐ | 2026-06-27 |
| [NASA (RSS)](https://www.nasa.gov/) | ⭐⭐⭐ | 2026-06-27 |
| [BBC World (RSS)](https://www.bbc.com/news/world) | ⭐⭐⭐ | 2026-06-27 |
| [DW News (RSS)](https://www.dw.com/) | ⭐⭐⭐ | 2026-06-27 |
| [Al Jazeera (RSS)](https://www.aljazeera.com/) | ⭐⭐⭐ | 2026-06-27 |
| [Guardian World (RSS)](https://www.theguardian.com/world) | ⭐⭐⭐ | 2026-06-27 |
| [France24 (RSS)](https://www.france24.com/) | ⭐⭐⭐ | 2026-06-27 |
| [NOAA Space Weather](https://www.swpc.noaa.gov/) | ⭐⭐⭐ | 2026-06-27 |
| [USGS Volcanoes](https://volcanoes.usgs.gov/) | ⭐⭐⭐ | 2026-06-27 |

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
Auto-generiert von der World.One Pipeline | 27.06.2026 19:19 UTC | 40/40 Quellen aktiv
</sub>
