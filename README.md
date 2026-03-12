# BELKIS ONE 1.0

> **Der Zustand der Welt in einem einzigen Scroll-Erlebnis.**
> Ein Vermächtnis aus Daten, Code und der Überzeugung, dass Transparenz die Welt verbessert.

---

## 🌍 Welt-Indikator: 47.3 / 100 🟡 GEMISCHT

```
█████████░░░░░░░░░░░  47.3/100  ↑ +0.5
```

> Berechnet aus hunderten Datenpunkten. Kein KI-Modell — reiner Code, reale Daten.
> **Letzte Aktualisierung:** 11.03.2026 20:01 UTC

### Sub-Scores

| Kategorie | Score | Trend | Gewichtung |
|-----------|-------|-------|------------|
| 🟠 Umwelt | **38.2**/100 | ↓ -1.2 | 25% |
| 🟡 Gesellschaft | **44.7**/100 | → +0.1 | 25% |
| 🟡 Wirtschaft | **51.4**/100 | ↑ +0.8 | 20% |
| 🟢 Fortschritt | **62.8**/100 | ↑ +2.1 | 20% |
| 🟡 Momentum | **54.6**/100 | ↑ +1.5 | 10% |

---

## 📊 Live-Daten Snapshot

### 🌡️ Umwelt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Temperaturanomalie | **+1.45°C** | NASA GISTEMP |
| CO2-Konzentration | **421 ppm** | NOAA |
| Arktis-Eisfläche | **4.2 Mio km²** (46.2% verloren) | NSIDC |
| Luftqualität (Ø) | AQI **68** | WAQI |

### 👥 Gesellschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Aktive Konflikte | **56** | ACLED |
| Menschen auf der Flucht | **108.4 Mio** | UNHCR |
| Lebenserwartung | **73.4 Jahre** | WHO |
| Freiheitsindex | 84 frei / 56 teilw. / 55 unfrei | Freedom House |

### 💰 Wirtschaft
| Indikator | Wert | Quelle |
|-----------|------|--------|
| BIP-Wachstum | **3.1%** | IMF |
| Gini-Index | **0.42** | World Bank |
| Extreme Armut | **648.0 Mio** | World Bank |
| Milliardäre | **2.8K** (45.8% Vermögen) | Oxfam |

### 🚀 Fortschritt
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Internet-Nutzer | **67.4%** (5.4 Mrd) | ITU |
| Alphabetisierung | **87.4%** | UNESCO |
| Wiss. Publikationen | **3.2 Mio/Jahr** | arXiv/Scopus |
| GitHub Commits | **142.0 Mio/Tag** | GitHub |

### ⚡ Echtzeit
| Indikator | Wert | Quelle |
|-----------|------|--------|
| Erdbeben (24h) | **8** Beben M2.5+ | USGS |
| Nachrichten-Sentiment | **-0.42** (Leicht Negativ) | GDELT |
| Crypto Fear & Greed | **38/100** (Fear) | Alternative.me |

---

## 📈 Momentum: 14/20 Trends positiv

<details>
<summary>Alle 20 Indikatoren anzeigen</summary>

#### ✅ Verbessert sich (14)
- **Extreme Armut**: -2.1%/Jahr
- **Kindersterblichkeit**: -3.8%/Jahr
- **Lebenserwartung**: +0.2 Jahre/Jahr
- **Alphabetisierung**: +0.4%/Jahr
- **Internetzugang**: +1.8%/Jahr
- **Erneuerbare Energie**: +2.4%/Jahr
- **Wissenschaftl. Output**: +5.2%/Jahr
- **Bildungszugang Frauen**: +1.1%/Jahr
- **Impfabdeckung**: +0.8%/Jahr
- **Demokratisierung**: +0.3 Punkte
- **Malaria-Todesfälle**: -4.2%/Jahr
- **Zugang zu Trinkwasser**: +0.6%/Jahr
- **Müttersterblickkeit**: -2.9%/Jahr
- **Smartphone-Verbreitung**: +3.1%/Jahr

#### ❌ Verschlechtert sich (6)
- **CO2-Emissionen**: +0.8%/Jahr
- **Biodiversität**: -2.5%/Jahr
- **Waldverlust**: -0.12%/Jahr
- **Demokratie-Qualität**: -0.5 Punkte
- **Meeresspiegel**: +3.6mm/Jahr
- **Ungleichheit (innerstaatl.)**: +0.3 Gini

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
```

## ⚙️ Tech Stack

- **Vanilla JS** (ES Modules) — keine Frameworks, keine Build-Tools
- **CSS Custom Properties** — dynamisches Farbsystem pro Sektion
- **Canvas API** — Partikel-System mit Physik-Simulation
- **SVG** — Alle Charts, Sparklines und Karten
- **IntersectionObserver** — Scroll-driven Animations
- **GitHub Actions** — Automatisierte Daten-Pipeline mit Self-Healing

## 📡 Datenquellen (22)

| Quelle | Vertrauen | Letztes Update |
|--------|-----------|----------------|
| [NASA GISTEMP](https://data.giss.nasa.gov/gistemp/) | ⭐⭐⭐ | 2026-03-10 |
| [NOAA Climate](https://www.climate.gov/) | ⭐⭐⭐ | 2026-03-10 |
| [World Air Quality Index](https://waqi.info/) | ⭐⭐ | 2026-03-11 |
| [NSIDC Arctic Ice](https://nsidc.org/) | ⭐⭐⭐ | 2026-03-08 |
| [World Bank Open Data](https://data.worldbank.org/) | ⭐⭐⭐ | 2026-03-01 |
| [ACLED](https://acleddata.com/) | ⭐⭐⭐ | 2026-03-09 |
| [UNHCR](https://www.unhcr.org/refugee-statistics/) | ⭐⭐⭐ | 2026-03-05 |
| [Freedom House](https://freedomhouse.org/) | ⭐⭐⭐ | 2026-02-15 |
| [WHO GHO](https://www.who.int/data/gho) | ⭐⭐⭐ | 2026-02-28 |
| [IMF WEO](https://www.imf.org/en/Publications/WEO) | ⭐⭐⭐ | 2026-01-20 |
| [UNESCO](https://data.uis.unesco.org/) | ⭐⭐⭐ | 2026-02-10 |
| [ITU](https://datahub.itu.int/) | ⭐⭐⭐ | 2026-02-01 |
| [GitHub API](https://api.github.com/) | ⭐⭐ | 2026-03-11 |
| [arXiv](https://arxiv.org/) | ⭐⭐ | 2026-03-11 |
| [WIPO](https://www.wipo.int/) | ⭐⭐⭐ | 2026-01-15 |
| [USGS Earthquakes](https://earthquake.usgs.gov/) | ⭐⭐⭐ | 2026-03-11 |
| [GDELT Project](https://www.gdeltproject.org/) | ⭐⭐ | 2026-03-11 |
| [OpenAQ](https://openaq.org/) | ⭐⭐ | 2026-03-11 |
| [IEP Global Peace Index](https://www.visionofhumanity.org/) | ⭐⭐⭐ | 2026-01-01 |
| [IRENA](https://www.irena.org/) | ⭐⭐⭐ | 2026-02-20 |
| [Oxfam](https://www.oxfam.org/) | ⭐⭐ | 2026-01-15 |
| [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/) | ⭐ | 2026-03-11 |

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
Auto-generiert von der BELKIS ONE Pipeline | 11.03.2026 20:01 UTC | 22/24 Quellen aktiv
</sub>
