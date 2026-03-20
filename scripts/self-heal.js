#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   World.One — Self-Healing System
   Validates, repairs and ensures data integrity
   ═══════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync, unlinkSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROCESSED_DIR = join(__dirname, '..', 'data', 'processed');
const DATA_PATH = join(PROCESSED_DIR, 'world-state.json');
const BACKUP_PATH = join(PROCESSED_DIR, 'world-state.backup.json');
const LOG_PATH = join(PROCESSED_DIR, 'heal-log.json');
const MAX_BACKUPS = 5;

let fixes = [];
let warnings = [];

function log(type, msg) {
  const entry = { type, msg, time: new Date().toISOString() };
  if (type === 'fix') fixes.push(entry);
  if (type === 'warn') warnings.push(entry);
  console.log(`[HEAL] ${type === 'fix' ? '🔧' : type === 'warn' ? '⚠️' : '✓'} ${msg}`);
}

function ensureField(obj, path, defaultValue, label) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
      log('fix', `Created missing object: ${parts.slice(0, i + 1).join('.')}`);
    }
    current = current[parts[i]];
  }
  const lastKey = parts[parts.length - 1];
  if (current[lastKey] === undefined || current[lastKey] === null) {
    current[lastKey] = defaultValue;
    log('fix', `Restored missing field: ${path} = ${JSON.stringify(defaultValue).slice(0, 50)} (${label})`);
    return true;
  }
  return false;
}

function validateRange(obj, path, min, max, label) {
  const parts = path.split('.');
  let val = obj;
  for (const p of parts) {
    val = val?.[p];
  }
  if (typeof val !== 'number') return;
  if (val < min || val > max) {
    log('warn', `${label}: ${path} = ${val} (expected ${min}-${max})`);
  }
}

function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  World.One — Self-Healing System');
  console.log('═══════════════════════════════════════\n');

  // 1. Check if data file exists
  if (!existsSync(DATA_PATH)) {
    console.error('[HEAL] ❌ world-state.json not found!');

    // Try to restore from backup
    if (existsSync(BACKUP_PATH)) {
      copyFileSync(BACKUP_PATH, DATA_PATH);
      log('fix', 'Restored world-state.json from backup');
    } else {
      console.error('[HEAL] ❌ No backup available. Cannot self-heal.');
      process.exit(1);
    }
  }

  // 2. Parse JSON
  let data;
  try {
    data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  } catch (e) {
    log('fix', `JSON parse failed: ${e.message}`);
    if (existsSync(BACKUP_PATH)) {
      copyFileSync(BACKUP_PATH, DATA_PATH);
      data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
      log('fix', 'Restored from backup due to corrupt JSON');
    } else {
      console.error('[HEAL] ❌ Cannot recover from corrupt JSON without backup.');
      process.exit(1);
    }
  }

  // 3. Validate and repair critical structure
  ensureField(data, 'meta.generated', new Date().toISOString(), 'Timestamp');
  ensureField(data, 'meta.version', '1.0.0', 'Version');
  ensureField(data, 'meta.sources_count', 24, 'Source count');
  ensureField(data, 'meta.sources_available', 20, 'Available sources');

  // World Index
  ensureField(data, 'worldIndex.value', 47.3, 'World Index');
  ensureField(data, 'worldIndex.label', 'GEMISCHT', 'World Index label');
  ensureField(data, 'worldIndex.zone', 'mixed', 'World Index zone');
  ensureField(data, 'worldIndex.previous', 46.8, 'Previous value');
  ensureField(data, 'worldIndex.change', 0.5, 'Change');
  ensureField(data, 'worldIndex.trend', 'improving', 'Trend');

  // Sub-scores
  const categories = ['environment', 'society', 'economy', 'progress', 'momentum'];
  const defaults = {
    environment: { value: 38.2, weight: 0.25 },
    society: { value: 44.7, weight: 0.25 },
    economy: { value: 51.4, weight: 0.20 },
    progress: { value: 62.8, weight: 0.20 },
    momentum: { value: 54.6, weight: 0.10 }
  };

  categories.forEach(cat => {
    ensureField(data, `subScores.${cat}.value`, defaults[cat].value, `${cat} score`);
    ensureField(data, `subScores.${cat}.weight`, defaults[cat].weight, `${cat} weight`);
    ensureField(data, `subScores.${cat}.indicators`, [], `${cat} indicators`);
  });

  // Critical data sections
  ensureField(data, 'environment.temperatureAnomaly.current', 1.45, 'Temperature');
  ensureField(data, 'environment.temperatureAnomaly.history', [], 'Temp history');
  ensureField(data, 'environment.co2.current', 421, 'CO2');
  ensureField(data, 'environment.co2.history', [], 'CO2 history');
  ensureField(data, 'environment.airQuality.cleanestCities', [], 'Clean cities');
  ensureField(data, 'environment.airQuality.mostPolluted', [], 'Polluted cities');
  ensureField(data, 'environment.arcticIce.current', 4.2, 'Arctic ice');

  ensureField(data, 'society.conflicts.activeCount', 56, 'Conflicts');
  ensureField(data, 'society.conflicts.locations', [], 'Conflict locations');
  ensureField(data, 'society.refugees.total', 108400000, 'Refugees');
  ensureField(data, 'society.refugees.flows', [], 'Refugee flows');
  ensureField(data, 'society.freedom.free', 84, 'Freedom');
  ensureField(data, 'society.lifeExpectancy.global', 73.4, 'Life expectancy');
  ensureField(data, 'society.lifeExpectancy.history', [], 'Life exp history');

  ensureField(data, 'economy.wealth.top1Percent', 45.8, 'Top 1%');
  ensureField(data, 'economy.wealth.bottom50Percent', 2.1, 'Bottom 50%');
  ensureField(data, 'economy.gdpGrowth.global', 3.1, 'GDP growth');
  ensureField(data, 'economy.gdpGrowth.regions', [], 'GDP regions');
  ensureField(data, 'economy.gini.history', [], 'Gini history');

  // Fix legacy Gini values on 0-1 scale (should be 0-100)
  if (data.economy?.gini?.globalAvg > 0 && data.economy.gini.globalAvg < 1) {
    data.economy.gini.globalAvg = Math.round(data.economy.gini.globalAvg * 100 * 10) / 10;
    log('fix', `Gini globalAvg was on 0-1 scale, converted to 0-100: ${data.economy.gini.globalAvg}`);
  }
  if (Array.isArray(data.economy?.gini?.history)) {
    let giniFixed = 0;
    data.economy.gini.history.forEach(e => {
      if (e.value > 0 && e.value < 1) {
        e.value = Math.round(e.value * 100 * 10) / 10;
        giniFixed++;
      }
    });
    if (giniFixed > 0) log('fix', `Converted ${giniFixed} Gini history values from 0-1 to 0-100 scale`);
  }

  ensureField(data, 'progress.publications.history', [], 'Publications');
  ensureField(data, 'progress.internet.history', [], 'Internet history');
  ensureField(data, 'progress.literacy.history', [], 'Literacy history');
  ensureField(data, 'progress.github.dailyCommits', 142000000, 'GitHub commits');

  ensureField(data, 'realtime.earthquakes.last24h', [], 'Earthquakes');
  ensureField(data, 'realtime.newsSentiment.score', -0.42, 'Sentiment');
  ensureField(data, 'realtime.newsSentiment.history24h', [], 'Sentiment history');
  ensureField(data, 'realtime.cryptoFearGreed.value', 38, 'Fear & Greed');
  ensureField(data, 'realtime.lastUpdated', new Date().toISOString(), 'Last updated');

  ensureField(data, 'momentum.indicators', [], 'Momentum indicators');
  ensureField(data, 'momentum.comparison2000', [], 'Comparison 2000');

  ensureField(data, 'scenarios.businessAsUsual.worldIndex2030', 45.1, 'BAU 2030');
  ensureField(data, 'scenarios.businessAsUsual.worldIndex2050', 38.7, 'BAU 2050');
  ensureField(data, 'scenarios.worstCase.worldIndex2030', 35.2, 'Worst 2030');
  ensureField(data, 'scenarios.worstCase.worldIndex2050', 22.8, 'Worst 2050');
  ensureField(data, 'scenarios.bestCase.worldIndex2030', 58.4, 'Best 2030');
  ensureField(data, 'scenarios.bestCase.worldIndex2050', 72.1, 'Best 2050');

  ensureField(data, 'dataSources', [], 'Data sources');

  // 4. Validate ranges
  validateRange(data, 'worldIndex.value', 0, 100, 'World Index');
  categories.forEach(cat => {
    validateRange(data, `subScores.${cat}.value`, 0, 100, `${cat} score`);
  });
  validateRange(data, 'environment.co2.current', 280, 600, 'CO2');
  validateRange(data, 'environment.temperatureAnomaly.current', -1, 5, 'Temperature');

  // 5. Validate weights sum to 1.0
  const weights = categories.map(cat => data.subScores[cat].weight);
  const weightSum = weights.reduce((s, w) => s + w, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    log('fix', `Sub-score weights sum to ${weightSum.toFixed(3)} instead of 1.0 — resetting`);
    data.subScores.environment.weight = 0.25;
    data.subScores.society.weight = 0.25;
    data.subScores.economy.weight = 0.20;
    data.subScores.progress.weight = 0.20;
    data.subScores.momentum.weight = 0.10;
  }

  // 6. Validate raw World Index against sub-scores (Carrying Capacity adjusts value separately)
  const recalculated =
    data.subScores.environment.value * data.subScores.environment.weight +
    data.subScores.society.value * data.subScores.society.weight +
    data.subScores.economy.value * data.subScores.economy.weight +
    data.subScores.progress.value * data.subScores.progress.weight +
    data.subScores.momentum.value * data.subScores.momentum.weight;
  const rawRef = data.worldIndex.rawValue || data.worldIndex.value;
  const diff = Math.abs(rawRef - recalculated);
  if (diff > 2) {
    log('fix', `World Index rawValue mismatch: stored=${rawRef}, calculated=${recalculated.toFixed(1)} — correcting rawValue`);
    data.worldIndex.rawValue = parseFloat(recalculated.toFixed(1));
  }
  // Ensure change and trend are consistent with value and previous
  if (data.worldIndex.value != null && data.worldIndex.previous != null) {
    const expectedChange = Math.round((data.worldIndex.value - data.worldIndex.previous) * 10) / 10;
    if (data.worldIndex.change !== expectedChange) {
      log('fix', `World Index change mismatch: stored=${data.worldIndex.change}, expected=${expectedChange} — correcting`);
      data.worldIndex.change = expectedChange;
      data.worldIndex.trend = expectedChange > 0 ? 'improving' : expectedChange < 0 ? 'declining' : 'stable';
    }
  }

  // 6b. Validate World Index zone matches value
  const correctedZone = data.worldIndex.value < 20 ? 'critical' : data.worldIndex.value < 40 ? 'concerning' : data.worldIndex.value < 60 ? 'mixed' : data.worldIndex.value < 80 ? 'positive' : 'excellent';
  if (data.worldIndex.zone !== correctedZone) {
    log('fix', `World Index zone mismatch: stored=${data.worldIndex.zone}, expected=${correctedZone}`);
    data.worldIndex.zone = correctedZone;
    const zoneLabels = { critical: 'KOLLAPS', concerning: 'BESORGNISERREGEND', mixed: 'GEMISCHT', positive: 'POSITIV', excellent: 'EXZELLENT' };
    data.worldIndex.label = zoneLabels[correctedZone];
  }

  // 7. Create dated backup with rotation (keep last 5)
  if (existsSync(DATA_PATH)) {
    // Always update the standard backup
    copyFileSync(DATA_PATH, BACKUP_PATH);

    // Create dated backup
    const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const datedBackup = join(PROCESSED_DIR, `world-state.backup-${dateTag}.json`);
    copyFileSync(DATA_PATH, datedBackup);

    // Rotate: keep only MAX_BACKUPS dated backups
    const backups = readdirSync(PROCESSED_DIR)
      .filter(f => f.startsWith('world-state.backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    if (backups.length > MAX_BACKUPS) {
      backups.slice(MAX_BACKUPS).forEach(old => {
        unlinkSync(join(PROCESSED_DIR, old));
        console.log(`[HEAL] Rotated old backup: ${old}`);
      });
    }
  }

  // 7b. Archive snapshot for timeline feature
  const HISTORY_DIR = join(__dirname, '..', 'data', 'history');
  mkdirSync(HISTORY_DIR, { recursive: true });

  const now = new Date();
  const snapTag = now.toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/(\d{8})(\d{4})/, '$1-$2');
  const snapPath = join(HISTORY_DIR, `snapshot-${snapTag}.json`);
  if (!existsSync(snapPath)) {
    copyFileSync(DATA_PATH, snapPath);
    console.log(`[HEAL] 📸 Archived snapshot: snapshot-${snapTag}.json`);

    // Update manifest (keep max 50,000 entries ≈ 34 years at 4/day)
    const MAX_MANIFEST_ENTRIES = 50000;
    const manifestPath = join(HISTORY_DIR, 'manifest.json');
    let manifest = { snapshots: [] };
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); } catch {}
    manifest.snapshots.unshift({
      id: snapTag,
      timestamp: now.toISOString(),
      worldIndex: Math.round((data.worldIndex?.value ?? 0) * 10) / 10
    });
    // Trim old entries from manifest (files stay on disk for direct access)
    if (manifest.snapshots.length > MAX_MANIFEST_ENTRIES) {
      manifest.snapshots = manifest.snapshots.slice(0, MAX_MANIFEST_ENTRIES);
    }
    writeFileSync(manifestPath, JSON.stringify(manifest));
  }

  // 8. Save repaired data
  if (fixes.length > 0) {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`\n[HEAL] 🔧 Applied ${fixes.length} fix(es)`);
  } else {
    console.log('\n[HEAL] ✅ Data integrity OK — no repairs needed');
  }

  if (warnings.length > 0) {
    console.log(`[HEAL] ⚠️ ${warnings.length} warning(s)`);
  }

  // 9. Data staleness check — warn if data is older than 24 hours
  const generated = new Date(data.meta.generated);
  const ageHours = (Date.now() - generated.getTime()) / 3600000;
  if (ageHours > 24) {
    log('warn', `Data is ${Math.round(ageHours)}h old (generated: ${data.meta.generated})`);
  }

  // 10. Write heal log
  const healLog = {
    timestamp: new Date().toISOString(),
    fixes: fixes.length,
    warnings: warnings.length,
    details: [...fixes, ...warnings],
    worldIndex: data.worldIndex.value,
    sourcesAvailable: data.meta.sources_available,
    dataAgeHours: Math.round(ageHours * 10) / 10
  };

  writeFileSync(LOG_PATH, JSON.stringify(healLog, null, 2));
  console.log(`[HEAL] Log written to ${LOG_PATH}`);

  // Exit code: 0 = healthy, 1 = critical fixes applied, 2 = warnings only
  if (fixes.length > 3) {
    console.log('[HEAL] ⚠️ Many fixes applied — data may be degraded');
    process.exit(1);
  }
  process.exit(0);
}

main();
