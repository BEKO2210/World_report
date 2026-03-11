# BELKIS ONE 1.0

> Der Zustand der Welt in einem einzigen Scroll-Erlebnis.

BELKIS ONE ist ein globales Echtzeit-Analyse-Dashboard, das den Zustand der Menschheit visualisiert. Keine KI-Analyse — reiner Code, reale Daten, echte Quellen.

## Das Herzstück: Der Welt-Indikator

Ein monumentaler Schieberegler, berechnet aus hunderten Datenpunkten auf einer Skala von **KOLLAPS** (0) bis **GOLDENES ZEITALTER** (100).

**Formel:**
```
weltIndex = (
  umweltScore × 0.25 +
  gesellschaftScore × 0.25 +
  wirtschaftScore × 0.20 +
  fortschrittScore × 0.20 +
  momentumScore × 0.10
)
```

## Architektur

```
belkis-one/
├── index.html                    # Entry Point — 12 Scroll-Sektionen
├── css/
│   ├── core.css                  # Design System, Custom Properties, Reset
│   ├── sections.css              # Styles pro Akt/Sektion
│   ├── components.css            # Wiederverwendbare Elemente
│   └── animations.css            # Alle Keyframes & Transitions
├── js/
│   ├── app.js                    # Main Controller
│   ├── data-loader.js            # Fetch & Cache
│   ├── scroll-engine.js          # IntersectionObserver + RAF Loop
│   └── visualizations/
│       ├── world-indicator.js    # Der Haupt-Schieberegler
│       ├── charts.js             # SVG Charts (Line, Bar, Gauge, Stripes)
│       ├── maps.js               # SVG-Weltkarten mit Overlays
│       ├── particles.js          # Canvas Partikel-System
│       └── counters.js           # Animierte Counter & Typewriter
├── data/processed/
│   └── world-state.json          # Alle verarbeiteten Daten
├── assets/maps/
│   └── world.svg                 # Optimierte SVG-Weltkarte
└── .github/workflows/
    └── data-pipeline.yml         # Automatische Daten-Pipeline (alle 6h)
```

## Tech Stack

- **Vanilla JS** (ES Modules) — keine Frameworks, keine Build-Tools
- **CSS Custom Properties** — dynamisches Farbsystem pro Sektion
- **Canvas API** — Partikel-System mit Physik-Simulation
- **SVG** — Alle Charts und Karten sind Vektorgrafiken
- **IntersectionObserver** — Scroll-driven Animations
- **GitHub Actions** — Automatisierte Daten-Pipeline

## Datenquellen

| Kategorie | Quellen |
|-----------|---------|
| Umwelt | NASA GISTEMP, NOAA, WAQI, NSIDC, World Bank |
| Gesellschaft | ACLED, UNHCR, Freedom House, WHO, IEP |
| Wirtschaft | World Bank, IMF, UNDP |
| Fortschritt | UNESCO, ITU, GitHub API, arXiv, WIPO |
| Echtzeit | USGS Earthquakes, GDELT, OpenAQ |

## Setup

### Lokal starten

```bash
# Repository klonen
git clone https://github.com/BEKO2210/World_report.git
cd World_report

# Lokalen Server starten (beliebiger HTTP-Server)
npx serve .
# oder
python3 -m http.server 8000
```

Dann `http://localhost:8000` im Browser öffnen.

### GitHub Pages

1. Repository-Settings > Pages > Source: GitHub Actions
2. Die Pipeline läuft automatisch alle 6 Stunden
3. Manuell starten: Actions > BELKIS ONE — Data Pipeline > Run workflow

## Scroll-Erlebnis (12 Akte)

| Akt | Thema | Daten |
|-----|-------|-------|
| Prolog | Erster Eindruck | Partikelfeld + Typewriter |
| 1 | Welt-Indikator | Gewichteter Score aus 5 Kategorien |
| 2 | Umwelt | Temperatur, CO2, Arktis-Eis, Luftqualität |
| 3 | Gesellschaft | Konflikte, Flucht, Freiheit, Lebenserwartung |
| 4 | Wirtschaft | Armut vs. Reichtum, GDP, Gini-Index |
| 5 | Fortschritt | Publikationen, GitHub, Internet, Bildung |
| 6 | Echtzeit | Erdbeben, Sentiment, Luftqualität, Fear&Greed |
| 7 | Momentum | 20 Schlüssel-Trends, Vergleich 2000 vs. Heute |
| 8 | Krisenkarte | Multi-Layer Weltkarte |
| 9 | Szenarien | 3 Zukunftspfade bis 2050 |
| 10 | Quellen | Transparenz & Methodik |
| 11 | Handeln | Konkrete Aktionen |
| Epilog | Loop | Zurück zum Anfang |

## Performance

- **Keine externen Abhängigkeiten** — Zero npm packages
- **System Fonts** — Kein Font-Loading
- **Lazy Loading** — Visualisierungen werden erst bei Sichtbarkeit gebaut
- **GPU-beschleunigt** — Nur `transform` und `opacity` animiert
- **Particle Pool** — Feste Partikelanzahl, kein Garbage Collection
- **`prefers-reduced-motion`** — Respektiert Accessibility-Einstellungen

## Accessibility

- ARIA-Labels auf allen Visualisierungen
- Keyboard-Navigation für interaktive Elemente
- `prefers-reduced-motion` Support
- Screen-Reader-kompatible Datenalternativen
- WCAG AAA Kontrast für Text

## Lizenz

MIT
