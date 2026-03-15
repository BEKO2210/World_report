# World.One 1.0 — Entwickler-Dokumentation

## Projekt-Architektur

**World.One** ist ein selbst-aktualisierendes globales Dashboard, das alle 6 Stunden 40+ APIs abfragt,
die Daten normalisiert und als immersives Scroll-Erlebnis auf GitHub Pages darstellt.

### Tech Stack
- **Frontend**: Vanilla JS (ES Modules), HTML5, CSS3, Canvas API, SVG
- **Pipeline**: Node.js v20, GitHub Actions (6h-Zyklus)
- **Abhängigkeiten**: `rss-parser` (^3.13.0), `xml2js` (^0.6.2)
- **Hosting**: GitHub Pages (automatisches Deployment)

### Dateistruktur (kritische Pfade)

```
index.html                    → Einstiegspunkt (13 Sektionen)
js/
  app.js                      → Haupt-Controller, orchestriert alles
  data-loader.js              → Fetch + localStorage Cache (6h TTL)
  scroll-engine.js            → IntersectionObserver + RAF
  utils/math.js               → Normalisierung, Formatierung, Geo-Konvertierung
  utils/dom.js                → DOM-Helfer
  visualizations/
    world-indicator.js         → Haupt-Slider (0-100)
    charts.js                  → SVG Charts (Warming Stripes, Line, Gauge, etc.)
    maps.js                    → Interaktive Weltkarten (5 Layer)
    particles.js               → Canvas Partikelsystem
    counters.js                → Animierte Zähler
    cinematic.js               → Scroll-getriebene Effekte
scripts/
  collect-data.js              → 40+ API-Abfragen → data/raw/
  process-data.js              → Rohdaten → world-state.json (Normalisierung, Scores)
  self-heal.js                 → Validierung & automatische Reparatur
  generate-readme.js           → Auto-README mit Live-Daten
data/
  raw/{category}/              → Rohe API-Antworten
  processed/world-state.json   → Hauptdatei (alle transformierten Daten)
```

### Datenfluss

```
GitHub Actions (alle 6h)
  → collect-data.js (40+ APIs → data/raw/)
  → process-data.js (raw → world-state.json)
  → self-heal.js (Validierung & Reparatur)
  → generate-readme.js (README aktualisieren)
  → Git Commit + GitHub Pages Deploy

Browser:
  → DataLoader fetcht world-state.json (cache: 'no-store')
  → Fallback: localStorage (6h TTL) → stale cache
  → app.js initialisiert 6 Subsysteme
  → ScrollEngine steuert 13 Sektionen via IntersectionObserver
```

### World Index Berechnung (Tragfähigkeitsprinzip V6 — Mike Hertig)

```
rawIndex = environment * 0.25
         + society    * 0.25
         + economy    * 0.20
         + progress   * 0.20
         + momentum   * 0.10

worldIndex = (rawIndex + existencePenalty + cascadePenalty) × balanceMultiplier
```

**Gewichte** MÜSSEN sich zu 1.0 summieren. Jeder Sub-Score ist 0-100.

**Carrying Capacity Checks:**
1. **CHECK 1 (Existence)**: Strafe 0 bis -20 wenn Sub-Score < 15 (Existenz-Boden)
2. **CHECK 2 (Balance)**: Multiplikator 0.85–1.10 basierend auf Anteil verbesserter Indikatoren
3. **CHECK 3 (Cascading)**: Strafe 0 bis -10 wenn korrelierte Kategorien gleichzeitig fallen

**Drei Indikatoren pro Kategorie:**
- Buffer Distance: Abstand zur kritischen Schwelle (0-100)
- Recovery Time: Geschätzte Erholungszeit bei Abwärtstrend
- Maintenance Cost: Volatilität (Standardabweichung) der letzten Werte

**Erosion/Expansion Spektrum:**
- Erosion: Stable → Strained → Fragile → Critical → Irreversible
- Expansion: Stable → Elastic → Capacitive → Expansive → Generative

### Sub-Score Berechnungen

**Environment** (Gewichtung intern):
- Temperaturanomalie: 30% (normalize: 3.0°C=0, 0°C=100)
- CO2-Konzentration: 30% (normalize: 500ppm=0, 280ppm=100)
- Waldfläche: 20% (normalize: 20%=0, 40%=100)
- Erneuerbare Energie: 20% (normalize: 0%=0, 60%=100)

**Society** (Gewichtung intern):
- Lebenserwartung: 30% (normalize: 50J=0, 85J=100)
- Kindersterblichkeit: 30% (normalize: 100/1000=0, 5/1000=100)
- Elektrizitätszugang: 20% (normalize: 50%=0, 100%=100)
- Trinkwasserzugang: 20% (normalize: 40%=0, 100%=100)

**Economy** (Gewichtung intern):
- BIP-Wachstum: 30% (normalize: -5%=0, 6%=100)
- Gini-Index: 25% (normalize: 60=0, 25=100 — Skala 0-100, NICHT 0-1!)
- Inflation: 25% (normalize: 20%=0, 2%=100)
- Arbeitslosigkeit: 20% (normalize: 15%=0, 2%=100)

**Progress** (Gewichtung intern):
- Internet-Durchdringung: 30% (normalize: 0%=0, 90%=100)
- Alphabetisierung: 30% (normalize: 50%=0, 100%=100)
- F&E Ausgaben: 20% (normalize: 0%=0, 4%=100)
- Mobilfunk: 20% (normalize: 0/100=0, 130/100=100)

**Momentum**:
- Anteil positiver Trends von 20 Indikatoren (vergleiche letzte 3 vs. vorletzte 3 Datenpunkte)

### Kritische Abhängigkeiten & Hinweise

1. **World Bank API**: Format `data[1]` enthält die Datenpunkte. `data[0]` ist Metadata.
   IMMER null-check auf `data[1]` setzen.

2. **Gini-Index**: World Bank liefert Gini als 0-100 Skala (z.B. 42.0).
   NIEMALS als 0-1 Skala (0.42) behandeln! Normalisierung: worst=60, best=25.

3. **normalize(value, worst, best)**: `worst` = schlechtester Wert (Score 0),
   `best` = bester Wert (Score 100). Funktioniert für invertierte Skalen
   (z.B. Kindersterblichkeit: worst=100, best=5).

4. **XSS-Schutz**: Alle externen Texte (RSS-Titel, API-Daten) MÜSSEN
   vor innerHTML-Verwendung escaped werden. Funktion: `escapeHTML()`.

5. **Charts**: Leere Arrays an `Math.min(...[])` = Infinity.
   IMMER Mindestlänge 2 prüfen vor Chart-Rendering.

6. **Maps SVG**: `world.svg` wird per fetch geladen. Falls es fehlt,
   Fallback-Text wird angezeigt.

7. **self-heal.js**: Default-Werte dienen als Notfall-Fallback.
   Sie müssen NICHT den aktuellen World Index widerspiegeln.

---

## Änderungslog

### 2026-03-14 — Robustheit-Härtung (Act-für-Act Review)

**Gefundene & behobene Probleme:**

1. **KRITISCH: Gini-Skala Fehler** (process-data.js)
   - World Bank liefert Gini als 0-100, Code normalisierte gegen 0-1 Skala
   - Fix: `normalize(giniCurrent, 60, 25)` statt `normalize(giniCurrent, 0.60, 0.25)`

2. **KRITISCH: Environment Trend falsch** (process-data.js)
   - Environment-Trend nutzte `worldChange` statt eigene Sub-Score-Änderung
   - Fix: Eigener Trend basierend auf envScore-Differenz

3. **HOCH: XSS-Schutz** (app.js)
   - RSS/News-Titel wurden unescaped in innerHTML eingesetzt
   - Fix: `escapeHTML()` Funktion für alle externen Texte

4. **HOCH: Chart-Crashes bei leeren Daten** (charts.js)
   - `Math.min(...[])` = Infinity, Division durch 0 bei einzelnen Datenpunkten
   - Fix: Guard-Checks für minimale Datenlänge

5. **HOCH: Division durch Null** (charts.js, maps.js)
   - `inequalityBar`: bottomPercent könnte 0 sein
   - `_drawRefugeeFlows`: leeres flows-Array
   - Fix: Fallback-Werte

6. **MITTEL: formatCompact Edge Cases** (math.js)
   - Negative Zahlen und nicht-endliche Werte nicht behandelt
   - Fix: Guard-Checks

7. **MITTEL: Sub-Score Trend-Berechnung** (process-data.js)
   - Alle Sub-Score-Trends basieren jetzt auf ihrer eigenen Wert-Änderung

8. **MITTEL: Data Staleness Warning** (data-loader.js)
   - Warnung wenn Daten älter als 24h
