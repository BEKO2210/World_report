#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   World.One — Data Processing Engine
   Transforms raw data into world-state.json
   ═══════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'data', 'raw');
const OUTPUT = join(__dirname, '..', 'data', 'processed', 'world-state.json');

// ─── Helpers ───
function readRaw(category, filename) {
  const path = join(RAW_DIR, category, filename);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return null; }
}

function readExisting() {
  if (!existsSync(OUTPUT)) return null;
  try { return JSON.parse(readFileSync(OUTPUT, 'utf-8')); } catch { return null; }
}

function latest(history) {
  if (!history || history.length === 0) return null;
  return history[history.length - 1];
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Normalize a value to 0-100 score (higher = better)
function normalize(value, worst, best) {
  if (best === worst) return 50;
  return clamp(((value - worst) / (best - worst)) * 100, 0, 100);
}

// ═══════════════════════════════════════════════════════════════
// CARRYING CAPACITY PRINCIPLE V6 — Mike Hertig
// Tragfähigkeitsprinzip: Existence, Balance, Cascading
// ═══════════════════════════════════════════════════════════════

// Erosion / Expansion spectrum positions
const SPECTRUM = {
  erosion: ['irreversible', 'critical', 'fragile', 'strained', 'stable'],
  expansion: ['stable', 'elastic', 'capacitive', 'expansive', 'generative']
};

// Critical existence thresholds — below these, the system is in danger
const EXISTENCE_FLOOR = 15;   // Any sub-score below 15 = existence check fails
const EXISTENCE_WARN = 25;    // Below 25 = severe strain

// Known cascading relationships: [source, target, strength]
// If source is declining AND target is declining, cascade amplifies
const CASCADE_PAIRS = [
  ['environment', 'society', 0.6],    // Environmental decline → health/displacement
  ['society', 'economy', 0.4],        // Social instability → economic damage
  ['economy', 'progress', 0.3],       // Economic stagnation → less R&D/education
  ['environment', 'economy', 0.3],    // Climate damage → economic cost
  ['progress', 'environment', 0.2],   // Tech progress → can help environment (positive cascade)
  ['society', 'environment', 0.2]     // Social stability → environmental policy
];

/**
 * CHECK 1: EXISTENCE — Are minimum conditions met?
 * If any category drops below the floor, the system faces collapse risk.
 * Returns a penalty (0 to -20) applied to the raw index.
 */
function checkExistence(scores) {
  let penalty = 0;
  const categories = Object.keys(scores);

  for (const cat of categories) {
    const val = scores[cat];
    if (val < EXISTENCE_FLOOR) {
      // Critical existence failure — severe penalty
      penalty -= 10 + (EXISTENCE_FLOOR - val) * 0.5;
    } else if (val < EXISTENCE_WARN) {
      // Strained — moderate penalty
      penalty -= (EXISTENCE_WARN - val) * 0.3;
    }
  }

  return clamp(penalty, -20, 0);
}

/**
 * CHECK 2: BALANCE — Is the system consuming more than it can sustain?
 * Compares declining vs improving trends across all momentum indicators.
 * Returns a multiplier (0.85 to 1.10).
 */
function checkBalance(momentumIndicators) {
  if (!momentumIndicators || momentumIndicators.length === 0) return 1.0;

  const improving = momentumIndicators.filter(i => i.direction === 'improving').length;
  const total = momentumIndicators.length;
  const ratio = improving / total;

  // ratio 0.0 = all declining → 0.85 multiplier (heavy load)
  // ratio 0.5 = balanced → 1.0 (neutral)
  // ratio 1.0 = all improving → 1.10 (regenerative)
  return 0.85 + ratio * 0.25;
}

/**
 * CHECK 3: CASCADING — Does the output of one category erode another?
 * If correlated pairs are both declining, amplify the penalty.
 * Returns a penalty (0 to -10).
 */
function checkCascading(scores, trends) {
  let penalty = 0;

  for (const [source, target, strength] of CASCADE_PAIRS) {
    const srcTrend = trends[source];
    const tgtTrend = trends[target];

    if (srcTrend === 'declining' && tgtTrend === 'declining') {
      // Both declining: negative cascade in action
      // Penalty scales with how far below 50 each score is
      const srcDistance = Math.max(0, 50 - scores[source]) / 50;
      const tgtDistance = Math.max(0, 50 - scores[target]) / 50;
      penalty -= (srcDistance + tgtDistance) * strength * 10;
    } else if (srcTrend === 'improving' && tgtTrend === 'improving') {
      // Both improving: positive cascade (small bonus)
      penalty += strength * 0.5;
    }
  }

  return clamp(penalty, -10, 2);
}

/**
 * THREE INDICATORS per category:
 * 1. Buffer Distance — how far from the critical floor? (0-100)
 * 2. Recovery Time — based on trend velocity, how many periods to recover? (lower = better)
 * 3. Maintenance Cost — volatility of recent values (lower = more stable)
 */
function calculateIndicators(score, history, higherIsBetter = true) {
  // Buffer Distance: how far from critical zone (0-20)
  const bufferDistance = clamp((score - EXISTENCE_FLOOR) / (100 - EXISTENCE_FLOOR) * 100, 0, 100);

  // Recovery Time: based on trend direction and speed
  let recoveryTime = 0; // 0 = no recovery needed
  if (history && history.length >= 4) {
    const recent = history.slice(-3);
    const earlier = history.slice(-6, -3);
    if (recent.length > 0 && earlier.length > 0) {
      const recentAvg = recent.reduce((s, h) => s + (h.value ?? h), 0) / recent.length;
      const earlierAvg = earlier.reduce((s, h) => s + (h.value ?? h), 0) / earlier.length;
      const velocity = recentAvg - earlierAvg;
      const isImproving = higherIsBetter ? velocity > 0 : velocity < 0;

      if (!isImproving && Math.abs(velocity) > 0.01) {
        // Declining: estimate periods to reach critical floor
        const distanceToFloor = score - EXISTENCE_FLOOR;
        recoveryTime = distanceToFloor > 0 ? Math.ceil(distanceToFloor / Math.abs(velocity)) : 99;
      }
    }
  }

  // Maintenance Cost: standard deviation of recent values (volatility)
  let maintenanceCost = 0;
  if (history && history.length >= 3) {
    const recentValues = history.slice(-6).map(h => h.value ?? h);
    const mean = recentValues.reduce((s, v) => s + v, 0) / recentValues.length;
    const variance = recentValues.reduce((s, v) => s + (v - mean) ** 2, 0) / recentValues.length;
    maintenanceCost = Math.sqrt(variance);
  }

  return { bufferDistance: Math.round(bufferDistance * 10) / 10, recoveryTime, maintenanceCost: Math.round(maintenanceCost * 100) / 100 };
}

/**
 * Determine position on the Erosion/Expansion spectrum.
 * Uses buffer distance + trend direction.
 */
function getSpectrumPosition(score, trend) {
  // Base position from score
  if (score < 15) return { direction: 'erosion', position: 'irreversible', level: -4 };
  if (score < 25) return { direction: 'erosion', position: 'critical', level: -3 };
  if (score < 40) return { direction: 'erosion', position: trend === 'declining' ? 'fragile' : 'strained', level: trend === 'declining' ? -2 : -1 };
  if (score < 55) return { direction: 'neutral', position: 'stable', level: 0 };
  if (score < 70) return { direction: 'expansion', position: trend === 'improving' ? 'elastic' : 'stable', level: trend === 'improving' ? 1 : 0 };
  if (score < 85) return { direction: 'expansion', position: trend === 'improving' ? 'capacitive' : 'elastic', level: trend === 'improving' ? 2 : 1 };
  if (score < 95) return { direction: 'expansion', position: 'expansive', level: 3 };
  return { direction: 'expansion', position: 'generative', level: 4 };
}

/**
 * FULL CARRYING CAPACITY CALCULATION
 * Applies all three checks to compute the adjusted World Index.
 */
function applyCarryingCapacity(rawIndex, scores, trends, momentumIndicators) {
  const existencePenalty = checkExistence(scores);
  const balanceMultiplier = checkBalance(momentumIndicators);
  const cascadePenalty = checkCascading(scores, trends);

  const adjustedIndex = clamp(
    (rawIndex + existencePenalty + cascadePenalty) * balanceMultiplier,
    0, 100
  );

  return {
    rawIndex,
    adjustedIndex: Math.round(adjustedIndex * 10) / 10,
    checks: {
      existence: { penalty: Math.round(existencePenalty * 10) / 10, passed: existencePenalty === 0 },
      balance: { multiplier: Math.round(balanceMultiplier * 1000) / 1000, ratio: momentumIndicators.length > 0 ? momentumIndicators.filter(i => i.direction === 'improving').length / momentumIndicators.length : 0.5 },
      cascading: { penalty: Math.round(cascadePenalty * 10) / 10, activePairs: CASCADE_PAIRS.filter(([s, t]) => trends[s] === 'declining' && trends[t] === 'declining').length }
    },
    spectrum: {
      environment: getSpectrumPosition(scores.environment, trends.environment),
      society: getSpectrumPosition(scores.society, trends.society),
      economy: getSpectrumPosition(scores.economy, trends.economy),
      progress: getSpectrumPosition(scores.progress, trends.progress),
      momentum: getSpectrumPosition(scores.momentum, trends.momentum || 'stable')
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// REALTIME PULSE — Micro-variations from live data signals
// Adds ±0.5–3 points per category based on current real-time data
// ═══════════════════════════════════════════════════════════════

function calculateRealtimePulse({ earthquakeData, weatherData, volcanicData, gdeltTone, cryptoData, githubData, arxivData }) {
  const pulse = { environment: 0, society: 0, economy: 0, progress: 0, details: {} };

  // ─── ENVIRONMENT PULSE ───
  // Earthquake activity: many or strong quakes = slight negative
  const quakes = earthquakeData?.quakes || [];
  const quakeCount = earthquakeData?.count || quakes.length;
  const maxMag = quakes.reduce((m, q) => Math.max(m, q.magnitude || 0), 0);
  if (quakeCount > 0) {
    // 0-10 quakes = neutral, 10-30 = slight negative, 30+ = more negative
    const countPenalty = clamp((quakeCount - 10) / 40, 0, 1) * -1.0;
    // Magnitude > 5.5 adds extra penalty
    const magPenalty = maxMag > 5.5 ? clamp((maxMag - 5.5) / 2.5, 0, 1) * -0.8 : 0;
    pulse.environment += countPenalty + magPenalty;
    pulse.details.quakeCount = quakeCount;
    pulse.details.maxMagnitude = maxMag;
  }

  // Volcanic activity: alerts present = slight negative
  const volcanicAlerts = volcanicData?.alerts || [];
  if (volcanicAlerts.length > 0) {
    pulse.environment -= clamp(volcanicAlerts.length * 0.15, 0, 0.5);
    pulse.details.volcanicAlerts = volcanicAlerts.length;
  }

  // Weather extremes: average temperature across cities vs. moderate baseline (~15°C)
  const cities = weatherData?.cities || [];
  if (cities.length > 0) {
    const temps = cities.map(c => c.current?.temperature_2m).filter(t => t != null);
    if (temps.length > 0) {
      const avgTemp = temps.reduce((s, t) => s + t, 0) / temps.length;
      // Deviation from moderate 15°C — extremes in either direction = slight penalty
      const deviation = Math.abs(avgTemp - 15);
      pulse.environment -= clamp((deviation - 10) / 20, 0, 0.5);
      pulse.details.avgGlobalTemp = Math.round(avgTemp * 10) / 10;
    }
  }

  pulse.environment = clamp(Math.round(pulse.environment * 100) / 100, -2, 0.5);

  // ─── SOCIETY PULSE ───
  // News sentiment (GDELT tone): negative tone = penalty, positive = bonus
  const sentimentScore = typeof gdeltTone?.data === 'object'
    ? (gdeltTone.data.score ?? null)
    : null;
  if (sentimentScore !== null) {
    // GDELT tone typically ranges -3 to +3, centered around -0.5
    // Shift so that -0.5 is neutral
    const shifted = sentimentScore + 0.5;
    pulse.society += clamp(shifted * 0.6, -1.5, 1.0);
    pulse.details.newsSentiment = sentimentScore;
  }

  // Large earthquakes (M6+) have humanitarian impact
  if (maxMag >= 6.0) {
    pulse.society -= clamp((maxMag - 6.0) / 2.0, 0, 1.0);
  }

  pulse.society = clamp(Math.round(pulse.society * 100) / 100, -2, 1.0);

  // ─── ECONOMY PULSE ───
  // Crypto Fear & Greed Index: 0-25 = extreme fear, 75-100 = extreme greed
  const cryptoFG = cryptoData?.current?.value ?? null;
  if (cryptoFG !== null) {
    // Neutral at 50, slight penalty below 25, slight bonus above 65
    const deviation = (cryptoFG - 50) / 50; // -1 to +1
    pulse.economy += clamp(deviation * 0.8, -1.0, 0.5);
    pulse.details.cryptoFearGreed = cryptoFG;
  }

  pulse.economy = clamp(Math.round(pulse.economy * 100) / 100, -1.5, 0.5);

  // ─── PROGRESS PULSE ───
  // GitHub & arXiv activity as innovation signal
  const arxivCount = arxivData?.papers?.length || 0;
  if (arxivCount > 0) {
    // Any fresh papers = small positive signal
    pulse.progress += clamp(arxivCount / 30, 0, 0.5);
    pulse.details.arxivPapers = arxivCount;
  }
  const githubRepos = githubData?.topRepos?.length || 0;
  if (githubRepos > 0) {
    pulse.progress += clamp(githubRepos / 30, 0, 0.3);
  }

  pulse.progress = clamp(Math.round(pulse.progress * 100) / 100, -0.5, 1.0);

  return pulse;
}

// ─── Merge helper: use new data if available, fall back to existing ───
function merge(newData, existingData, key) {
  if (newData && (Array.isArray(newData) ? newData.length > 0 : Object.keys(newData).length > 0)) {
    return newData;
  }
  return existingData?.[key] || newData;
}

// ═══════════════════════════════════════════════════════════════
// BUILD WORLD STATE
// ═══════════════════════════════════════════════════════════════

function buildWorldState() {
  const existing = readExisting();
  console.log('Processing raw data...\n');

  // ─── ENVIRONMENT ───
  const tempData = readRaw('environment', 'temperature.json');
  const co2Data = readRaw('environment', 'co2.json');
  const airData = readRaw('environment', 'air-quality.json');
  const forestData = readRaw('environment', 'forest-area.json');
  const renewableData = readRaw('environment', 'renewable-energy.json');
  const co2EmissionsData = readRaw('environment', 'co2-emissions-percapita.json');
  const weatherData = readRaw('environment', 'weather-global.json');

  const tempHistory = tempData?.history || existing?.environment?.temperatureAnomaly?.history || [];
  const tempCurrent = latest(tempHistory)?.value || existing?.environment?.temperatureAnomaly?.current || 1.45;

  const co2History = co2Data?.history || existing?.environment?.co2?.history || [];
  const co2Current = co2Data?.current || latest(co2History)?.value || existing?.environment?.co2?.current || 421;

  const forestHistory = forestData?.history || [];
  const forestCurrent = latest(forestHistory)?.value || existing?.environment?.forest?.current || 31.2;

  const renewableHistory = renewableData?.history || [];
  const renewableCurrent = latest(renewableHistory)?.value || 29.9;

  // Air quality processing
  let cleanestCities = existing?.environment?.airQuality?.cleanestCities || [];
  let mostPolluted = existing?.environment?.airQuality?.mostPolluted || [];
  if (airData?.locations && airData.locations.length > 0) {
    const withAQI = airData.locations
      .map(l => {
        // Prefer European AQI field, fallback to PM2.5 value
        const pm25 = l.parameters?.find(p => p.parameter === 'pm25' || p.parameter === 'PM2.5');
        const aqiValue = l.aqi || pm25?.value || null;
        return { city: l.city || l.name, country: l.country || '', aqi: aqiValue, lat: l.lat, lng: l.lng };
      })
      .filter(l => l.aqi !== null && l.aqi > 0);
    withAQI.sort((a, b) => a.aqi - b.aqi);
    if (withAQI.length >= 10) {
      cleanestCities = withAQI.slice(0, 5);
      mostPolluted = withAQI.slice(-5).reverse();
    }
  }

  // Calculate global average AQI from all cities
  const allAQICities = [...cleanestCities, ...mostPolluted];
  const globalAvgAQI = allAQICities.length > 0
    ? Math.round(allAQICities.reduce((s, c) => s + (c.aqi || 0), 0) / allAQICities.length)
    : existing?.environment?.airQuality?.globalAvgAQI || 68;

  // Environment scores
  const envTempScore = normalize(tempCurrent, 3.0, 0); // 0°C = 100, 3°C = 0
  const envCO2Score = normalize(co2Current, 500, 280); // 280ppm = 100, 500ppm = 0
  const envForestScore = forestCurrent ? normalize(forestCurrent, 20, 40) : 42;
  const envRenewableScore = normalize(renewableCurrent, 0, 60); // 60% = 100
  const envScore = Math.round((envTempScore * 0.3 + envCO2Score * 0.3 + envForestScore * 0.2 + envRenewableScore * 0.2) * 10) / 10;

  console.log(`  Environment Score: ${envScore} (temp:${envTempScore.toFixed(0)} co2:${envCO2Score.toFixed(0)} forest:${envForestScore.toFixed(0)} renew:${envRenewableScore.toFixed(0)})`);

  // ─── SOCIETY ───
  const lifeExpData = readRaw('society', 'life-expectancy.json');
  const childMortData = readRaw('society', 'child-mortality.json');
  const povertyData = readRaw('society', 'poverty.json');
  const popData = readRaw('society', 'population.json');
  const electricityData = readRaw('society', 'electricity-access.json');
  const waterData = readRaw('society', 'safe-water.json');
  const diseaseData = readRaw('society', 'disease-covid.json');
  const educationData = readRaw('society', 'education-enrollment.json');
  const healthExpData = readRaw('society', 'health-expenditure.json');
  const militaryData = readRaw('society', 'military-expenditure.json');
  const urbanData = readRaw('society', 'urbanization.json');

  const lifeExpHistory = lifeExpData?.history || existing?.society?.lifeExpectancy?.history || [];
  const lifeExpCurrent = latest(lifeExpHistory)?.value || 73.4;
  const childMortHistory = childMortData?.history || [];
  const childMortCurrent = latest(childMortHistory)?.value || 37.1;
  const electricityCurrent = latest(electricityData?.history || [])?.value || 91;
  const waterCurrent = latest(waterData?.history || [])?.value || 74;

  // ─── CONFLICT / REFUGEE / FREEDOM DATA (used in scoring) ───
  const conflicts = existing?.society?.conflicts || {
    activeCount: 56,
    locations: [
      { name: 'Ukraine', lat: 48.38, lng: 31.17, type: 'war', intensity: 0.95 },
      { name: 'Gaza', lat: 31.35, lng: 34.31, type: 'war', intensity: 0.98 },
      { name: 'Sudan', lat: 15.50, lng: 32.56, type: 'war', intensity: 0.85 },
      { name: 'Myanmar', lat: 19.76, lng: 96.07, type: 'conflict', intensity: 0.70 },
      { name: 'Äthiopien', lat: 9.15, lng: 40.49, type: 'conflict', intensity: 0.60 },
      { name: 'Jemen', lat: 15.55, lng: 48.52, type: 'war', intensity: 0.75 },
      { name: 'Somalia', lat: 5.15, lng: 46.20, type: 'conflict', intensity: 0.65 },
      { name: 'DR Kongo', lat: -4.04, lng: 21.76, type: 'conflict', intensity: 0.70 },
      { name: 'Sahel', lat: 14.50, lng: -1.50, type: 'conflict', intensity: 0.60 },
      { name: 'Haiti', lat: 18.97, lng: -72.28, type: 'unrest', intensity: 0.50 }
    ],
    source: 'ACLED'
  };
  const refugees = existing?.society?.refugees || {
    total: 108400000, displaced: 68300000, asylumseekers: 6900000,
    flows: [
      { from: 'Syria', to: 'Turkey', count: 3200000 },
      { from: 'Ukraine', to: 'Poland', count: 1800000 },
      { from: 'Venezuela', to: 'Colombia', count: 2500000 },
      { from: 'Afghanistan', to: 'Pakistan', count: 1700000 },
      { from: 'Sudan', to: 'Chad', count: 1100000 },
      { from: 'Myanmar', to: 'Bangladesh', count: 960000 },
      { from: 'Somalia', to: 'Kenya', count: 580000 },
      { from: 'DRC', to: 'Uganda', count: 470000 }
    ],
    source: 'UNHCR'
  };
  const freedom = existing?.society?.freedom || {
    free: 84, partlyFree: 56, notFree: 55, trendDecline: true, yearDecline: 18, source: 'Freedom House'
  };

  const socLifeScore = normalize(lifeExpCurrent, 50, 85);
  const socMortScore = normalize(childMortCurrent, 100, 5); // lower = better
  const socElecScore = normalize(electricityCurrent, 50, 100);
  const socWaterScore = normalize(waterCurrent, 40, 100);

  // Conflict score: combination of active conflict count and average intensity
  const conflictCount = conflicts.activeCount || 56;
  const avgIntensity = conflicts.locations?.length > 0
    ? conflicts.locations.reduce((s, c) => s + c.intensity, 0) / conflicts.locations.length
    : 0.72;
  const conflictMetric = (clamp(conflictCount, 0, 80) / 80) * 60 + avgIntensity * 40;
  const socConflictScore = normalize(conflictMetric, 100, 0); // worst=100 (80+ conflicts, max intensity), best=0

  // Refugee score: total displaced people in millions
  const refugeeMillions = (refugees.total || 108400000) / 1e6;
  const socRefugeeScore = normalize(refugeeMillions, 150, 0); // worst=150M, best=0

  // Freedom score: percentage of countries rated "Free"
  const totalCountries = freedom.free + freedom.partlyFree + freedom.notFree;
  const freePercent = (freedom.free / totalCountries) * 100;
  const socFreedomScore = normalize(freePercent, 20, 70); // worst=20%, best=70%

  const socScore = Math.round((
    socLifeScore * 0.20 +
    socMortScore * 0.20 +
    socElecScore * 0.12 +
    socWaterScore * 0.13 +
    socConflictScore * 0.15 +
    socRefugeeScore * 0.10 +
    socFreedomScore * 0.10
  ) * 10) / 10;

  console.log(`  Society Score:     ${socScore} (life:${socLifeScore.toFixed(0)} mort:${socMortScore.toFixed(0)} elec:${socElecScore.toFixed(0)} water:${socWaterScore.toFixed(0)} conflict:${socConflictScore.toFixed(0)} refugee:${socRefugeeScore.toFixed(0)} freedom:${socFreedomScore.toFixed(0)})`);

  // ─── ECONOMY ───
  const gdpData = readRaw('economy', 'gdp-growth.json');
  const giniData = readRaw('economy', 'gini.json');
  const inflationData = readRaw('economy', 'inflation.json');
  const unemploymentData = readRaw('economy', 'unemployment.json');
  const gdppcData = readRaw('economy', 'gdp-per-capita.json');
  const tradeData = readRaw('economy', 'trade.json');
  const cryptoData = readRaw('economy', 'crypto-fear-greed.json');
  const exchangeData = readRaw('economy', 'exchange-rates.json');
  const regionalData = readRaw('economy', 'regional-gdp.json');

  const gdpGrowth = latest(gdpData?.history || [])?.value || existing?.economy?.gdpGrowth?.global || 3.1;
  const giniHistory = giniData?.history || existing?.economy?.gini?.history || [];
  let giniCurrent = latest(giniHistory)?.value || 42; // World Bank Gini is 0-100 scale (NOT 0-1!)
  // Guard: if value is on 0-1 scale (legacy bug), convert to 0-100
  if (giniCurrent > 0 && giniCurrent < 1) {
    giniCurrent = Math.round(giniCurrent * 100 * 10) / 10;
  }
  const inflationCurrent = latest(inflationData?.history || [])?.value || 6.5;
  const unemploymentCurrent = latest(unemploymentData?.history || [])?.value || 5.8;

  const ecoGDPScore = normalize(gdpGrowth, -5, 6);
  const ecoGiniScore = normalize(giniCurrent, 60, 25); // World Bank Gini is 0-100 scale; lower = better
  const ecoInflScore = normalize(inflationCurrent, 20, 2); // 2% = perfect
  const ecoUnempScore = normalize(unemploymentCurrent, 15, 2);
  const ecoScore = Math.round((ecoGDPScore * 0.3 + ecoGiniScore * 0.25 + ecoInflScore * 0.25 + ecoUnempScore * 0.2) * 10) / 10;

  console.log(`  Economy Score:     ${ecoScore} (gdp:${ecoGDPScore.toFixed(0)} gini:${ecoGiniScore.toFixed(0)} infl:${ecoInflScore.toFixed(0)} unemp:${ecoUnempScore.toFixed(0)})`);

  // ─── PROGRESS & TECH ───
  const internetData = readRaw('tech', 'internet-users.json');
  const mobileData = readRaw('tech', 'mobile-subscriptions.json');
  const githubData = readRaw('tech', 'github-trending.json');
  const arxivData = readRaw('tech', 'arxiv-latest.json');
  const rdData = readRaw('tech', 'rd-spending.json');
  const patentData = readRaw('tech', 'patents.json');
  const spaceData = readRaw('tech', 'spaceflight-news.json');
  const literacyData = readRaw('tech', 'literacy.json');

  const internetHistory = internetData?.history || existing?.progress?.internet?.history || [];
  const internetCurrent = latest(internetHistory)?.value || 67.4;
  const mobileCurrent = latest(mobileData?.history || [])?.value || 106;
  const literacyCurrent = latest(literacyData?.history || [])?.value || 87.4;
  const rdCurrent = latest(rdData?.history || [])?.value || 2.63;

  const progInternetScore = normalize(internetCurrent, 0, 90);
  const progLiteracyScore = normalize(literacyCurrent, 50, 100);
  const progRDScore = normalize(rdCurrent, 0, 4);
  const progMobileScore = normalize(mobileCurrent, 0, 130);
  const progScore = Math.round((progInternetScore * 0.3 + progLiteracyScore * 0.3 + progRDScore * 0.2 + progMobileScore * 0.2) * 10) / 10;

  console.log(`  Progress Score:    ${progScore} (internet:${progInternetScore.toFixed(0)} literacy:${progLiteracyScore.toFixed(0)} rd:${progRDScore.toFixed(0)} mobile:${progMobileScore.toFixed(0)})`);

  // ─── REALTIME ───
  const earthquakeData = readRaw('realtime', 'earthquakes.json');
  const gdeltTone = readRaw('realtime', 'gdelt-tone.json');
  const gdeltNews = readRaw('realtime', 'gdelt-news.json');
  const rssData = readRaw('realtime', 'rss-news.json');
  const volcanicData = readRaw('realtime', 'volcanic-activity.json');
  const solarData = readRaw('realtime', 'solar-activity.json');

  // Merge RSS + GDELT news, deduplicate by title, sort by date, diversify sources
  const allNews = [
    ...(rssData?.articles || []),
    ...(gdeltNews?.articles || [])
  ];
  // Deduplicate by normalized title (first 60 chars lowercase)
  const seen = new Set();
  const deduped = allNews.filter(a => {
    const key = (a.title || '').toLowerCase().slice(0, 60);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Sort by date (newest first), then pick max 3 per source for diversity
  deduped.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return (db || 0) - (da || 0);
  });
  const sourceCounts = {};
  const diverseNews = deduped.filter(a => {
    const src = a.source || 'Unknown';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    return sourceCounts[src] <= 3;
  }).slice(0, 20);
  console.log(`  News: ${diverseNews.length} articles from ${Object.keys(sourceCounts).length} sources`);

  // ─── MOMENTUM (trend analysis) ───
  // Compare recent vs. earlier values for key indicators
  const momentumIndicators = [];

  function addMomentum(name, history, higherIsBetter = true) {
    if (!history || history.length < 3) return;
    const recent = history.slice(-3);
    const earlier = history.slice(-6, -3);
    if (recent.length === 0 || earlier.length === 0) return;
    const recentAvg = recent.reduce((s, h) => s + h.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, h) => s + h.value, 0) / earlier.length;
    const change = recentAvg - earlierAvg;
    const improving = higherIsBetter ? change > 0 : change < 0;
    const pctChange = earlierAvg !== 0 ? ((change / Math.abs(earlierAvg)) * 100) : 0;
    momentumIndicators.push({
      name,
      direction: improving ? 'improving' : 'declining',
      change: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`,
      icon: improving ? 'up' : 'down'
    });
  }

  addMomentum('Lebenserwartung', lifeExpHistory, true);
  addMomentum('Kindersterblichkeit', childMortHistory, false);
  addMomentum('CO2-Konzentration', co2History, false);
  addMomentum('Erneuerbare Energie', renewableHistory, true);
  addMomentum('Waldfläche', forestHistory, true);
  addMomentum('Internet-Zugang', internetHistory, true);
  addMomentum('BIP-Wachstum', gdpData?.history, true);
  addMomentum('Inflation', inflationData?.history, false);
  addMomentum('Arbeitslosigkeit', unemploymentData?.history, false);
  addMomentum('BIP pro Kopf', gdppcData?.history, true);
  addMomentum('Globaler Handel', tradeData?.history, true);
  addMomentum('Alphabetisierung', literacyData?.history, true);
  addMomentum('Mobilfunk', mobileData?.history, true);
  addMomentum('F&E Ausgaben', rdData?.history, true);
  addMomentum('Elektrizitätszugang', electricityData?.history, true);
  addMomentum('Trinkwasser', waterData?.history, true);
  addMomentum('CO2 pro Kopf', co2EmissionsData?.history, false);
  addMomentum('Gesundheitsausgaben', healthExpData?.history, true);
  addMomentum('Urbanisierung', urbanData?.history, true);
  addMomentum('Patentanmeldungen', patentData?.history, true);
  addMomentum('Militärausgaben (% BIP)', militaryData?.history, false); // lower military spending = better

  // Fall back to existing if not enough indicators computed
  const finalMomentum = momentumIndicators.length >= 10 ? momentumIndicators : (existing?.momentum?.indicators || momentumIndicators);
  const positiveCount = finalMomentum.filter(i => i.direction === 'improving').length;
  const momentumScore = finalMomentum.length > 0 ? Math.round((positiveCount / finalMomentum.length) * 100 * 10) / 10 : 54.6;

  console.log(`  Momentum Score:    ${momentumScore} (${positiveCount}/${finalMomentum.length} improving)\n`);

  // ─── REALTIME PULSE — micro-variations from live signals ───
  // Use raw data when available, fall back to existing world-state data
  const pulseEarthquakes = earthquakeData || {
    quakes: existing?.realtime?.earthquakes?.last24h || [],
    count: existing?.realtime?.earthquakes?.total24h || 0
  };
  const pulseWeather = weatherData || { cities: existing?.environment?.weather || [] };
  const pulseVolcanic = volcanicData || { alerts: existing?.realtime?.volcanic || [] };
  const pulseSentiment = gdeltTone || (existing?.realtime?.newsSentiment ? { data: existing.realtime.newsSentiment } : null);
  const pulseCrypto = cryptoData || (existing?.economy?.cryptoFearGreed ? { current: existing.economy.cryptoFearGreed } : null);
  const pulseGithub = githubData || existing?.progress?.github || null;
  const pulseArxiv = arxivData || { papers: existing?.progress?.publications?.latestArxiv || [] };

  const realtimePulse = calculateRealtimePulse({
    earthquakeData: pulseEarthquakes, weatherData: pulseWeather,
    volcanicData: pulseVolcanic, gdeltTone: pulseSentiment,
    cryptoData: pulseCrypto, githubData: pulseGithub, arxivData: pulseArxiv
  });

  const envScoreAdj = clamp(Math.round((envScore + realtimePulse.environment) * 10) / 10, 0, 100);
  const socScoreAdj = clamp(Math.round((socScore + realtimePulse.society) * 10) / 10, 0, 100);
  const ecoScoreAdj = clamp(Math.round((ecoScore + realtimePulse.economy) * 10) / 10, 0, 100);
  const progScoreAdj = clamp(Math.round((progScore + realtimePulse.progress) * 10) / 10, 0, 100);

  console.log(`  Realtime Pulse:    env:${realtimePulse.environment} soc:${realtimePulse.society} eco:${realtimePulse.economy} prog:${realtimePulse.progress}`);

  // ─── WORLD INDEX (Carrying Capacity Principle V6) ───
  const rawIndex = Math.round((
    envScoreAdj * 0.25 +
    socScoreAdj * 0.25 +
    ecoScoreAdj * 0.20 +
    progScoreAdj * 0.20 +
    momentumScore * 0.10
  ) * 10) / 10;

  // Collect scores and trends for carrying capacity checks
  const categoryScores = {
    environment: envScoreAdj, society: socScoreAdj, economy: ecoScoreAdj,
    progress: progScoreAdj, momentum: momentumScore
  };
  const categoryTrends = {};
  for (const [cat, val] of Object.entries(categoryScores)) {
    const prev = existing?.subScores?.[cat]?.value || val;
    const d = val - prev;
    categoryTrends[cat] = d > 0.2 ? 'improving' : d < -0.2 ? 'declining' : 'stable';
  }

  // Apply Carrying Capacity Principle (3 checks)
  const carryingCapacity = applyCarryingCapacity(rawIndex, categoryScores, categoryTrends, finalMomentum);
  const worldIndex = carryingCapacity.adjustedIndex;

  // Calculate per-category carrying capacity indicators
  const categoryHistories = {
    environment: tempHistory,
    society: lifeExpHistory,
    economy: gdpData?.history || [],
    progress: internetHistory,
    momentum: [] // momentum has no direct history
  };
  const carryingIndicators = {};
  for (const [cat, score] of Object.entries(categoryScores)) {
    carryingIndicators[cat] = calculateIndicators(score, categoryHistories[cat]);
  }

  const prevWorldIndex = existing?.worldIndex?.value || 46.8;
  const worldChange = Math.round((worldIndex - prevWorldIndex) * 10) / 10;
  const zone = worldIndex < 20 ? 'critical' : worldIndex < 40 ? 'concerning' : worldIndex < 60 ? 'mixed' : worldIndex < 80 ? 'positive' : 'excellent';
  const zoneLabels = { critical: 'KOLLAPS', concerning: 'BESORGNISERREGEND', mixed: 'GEMISCHT', positive: 'POSITIV', excellent: 'EXZELLENT' };

  console.log(`  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║  CARRYING CAPACITY PRINCIPLE V6              ║`);
  console.log(`  ║  Raw Index:    ${rawIndex.toFixed(1).padEnd(30)}║`);
  console.log(`  ║  Check 1 (Existence):  ${String(carryingCapacity.checks.existence.penalty).padEnd(22)}║`);
  console.log(`  ║  Check 2 (Balance):    ×${carryingCapacity.checks.balance.multiplier.toFixed(3).padEnd(21)}║`);
  console.log(`  ║  Check 3 (Cascading):  ${String(carryingCapacity.checks.cascading.penalty).padEnd(22)}║`);
  console.log(`  ║  ──────────────────────────────────────────  ║`);
  console.log(`  ║  WORLD INDEX: ${worldIndex.toFixed(1)} / 100                   ║`);
  console.log(`  ║  Zone: ${zoneLabels[zone].padEnd(38)}║`);
  console.log(`  ║  Change: ${worldChange >= 0 ? '+' : ''}${worldChange.toFixed(1).padEnd(36)}║`);
  console.log(`  ╚══════════════════════════════════════════════╝`);
  console.log(`  Spectrum: ${Object.entries(carryingCapacity.spectrum).map(([k, v]) => `${k}=${v.position}`).join(', ')}\n`);

  // ─── BUILD comparison2000 (always recalculate with fresh data) ───
  const comparison2000 = [
    { name: 'Extreme Armut', then: 1700000000, now: 648000000, improved: true },
    { name: 'Kindersterblichkeit', then: 76, now: childMortCurrent, improved: childMortCurrent < 76 },
    { name: 'Lebenserwartung', then: 67, now: lifeExpCurrent, improved: lifeExpCurrent > 67 },
    { name: 'Internet-Nutzer', then: 6.7, now: internetCurrent, improved: internetCurrent > 6.7 },
    { name: 'Alphabetisierung', then: 81, now: literacyCurrent, improved: literacyCurrent > 81 },
    { name: 'CO2-Konzentration', then: 369, now: co2Current, improved: co2Current < 369 },
    { name: 'Erneuerbare Energie', then: 17, now: renewableCurrent, improved: renewableCurrent > 17 },
    { name: 'Mobilfunkverträge', then: 12, now: mobileCurrent, improved: mobileCurrent > 12 }
  ];

  // ─── ASSEMBLE FINAL STATE ───
  const worldState = {
    meta: {
      generated: new Date().toISOString(),
      version: '2.0.0',
      sources_count: 40,
      sources_available: readRaw('.', 'collection-manifest.json')?.success?.length || existing?.meta?.sources_available || 22,
      sources_success_rate: readRaw('.', 'collection-manifest.json')?.successRate || 100,
      next_update: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      realtimePulse: realtimePulse
    },

    worldIndex: {
      value: worldIndex,
      rawValue: rawIndex,
      label: zoneLabels[zone],
      zone,
      previous: prevWorldIndex,
      change: worldChange,
      trend: worldChange > 0 ? 'improving' : worldChange < 0 ? 'declining' : 'stable',
      carryingCapacity: {
        checks: carryingCapacity.checks,
        spectrum: carryingCapacity.spectrum,
        indicators: carryingIndicators,
        method: 'Tragfähigkeitsprinzip V6 — Mike Hertig'
      }
    },

    subScores: {
      environment: {
        value: envScoreAdj,
        label: envScoreAdj < 20 ? 'KRITISCH' : envScoreAdj < 40 ? 'BESORGNISERREGEND' : envScoreAdj < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: envScoreAdj < 20 ? 'critical' : envScoreAdj < 40 ? 'concerning' : envScoreAdj < 60 ? 'mixed' : 'positive',
        weight: 0.25,
        trend: (() => { const d = envScoreAdj - (existing?.subScores?.environment?.value || envScoreAdj); return d > 0.2 ? 'improving' : d < -0.2 ? 'declining' : 'stable'; })(),
        change: Math.round((envScoreAdj - (existing?.subScores?.environment?.value || envScoreAdj)) * 10) / 10,
        indicators: [
          { name: 'Globale Temperaturanomalie', value: `+${tempCurrent}°C`, score: Math.round(envTempScore), trend: 'declining', source: 'NASA GISTEMP' },
          { name: 'CO2-Konzentration', value: `${Math.round(co2Current)} ppm`, score: Math.round(envCO2Score), trend: 'declining', source: 'NOAA' },
          { name: 'Waldfläche', value: `${forestCurrent || 31.2}%`, score: Math.round(envForestScore), trend: 'declining', source: 'World Bank' },
          { name: 'Erneuerbare Energie', value: `${renewableCurrent}%`, score: Math.round(envRenewableScore), trend: 'improving', source: 'World Bank / IRENA' },
          { name: 'Luftqualität (Global Avg AQI)', value: globalAvgAQI, score: globalAvgAQI <= 50 ? 70 : globalAvgAQI <= 100 ? 45 : 20, trend: 'stable', source: 'Open-Meteo' },
          { name: 'Arktis-Eisfläche', value: '4.2 Mio km²', score: 30, trend: 'declining', source: 'NSIDC' }
        ]
      },
      society: {
        value: socScoreAdj,
        label: socScoreAdj < 40 ? 'BESORGNISERREGEND' : socScoreAdj < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: socScoreAdj < 40 ? 'concerning' : socScoreAdj < 60 ? 'mixed' : 'positive',
        weight: 0.25,
        trend: (() => { const d = socScoreAdj - (existing?.subScores?.society?.value || socScoreAdj); return d > 0.2 ? 'improving' : d < -0.2 ? 'declining' : 'stable'; })(),
        change: Math.round((socScoreAdj - (existing?.subScores?.society?.value || socScoreAdj)) * 10) / 10,
        indicators: [
          { name: 'Lebenserwartung', value: `${lifeExpCurrent} Jahre`, score: Math.round(socLifeScore), trend: 'improving', source: 'World Bank' },
          { name: 'Kindersterblichkeit', value: `${childMortCurrent}/1000`, score: Math.round(socMortScore), trend: 'improving', source: 'World Bank' },
          { name: 'Aktive Konflikte', value: conflicts.activeCount, score: Math.round(socConflictScore), trend: 'declining', source: 'ACLED' },
          { name: 'Elektrizitätszugang', value: `${electricityCurrent}%`, score: Math.round(socElecScore), trend: 'improving', source: 'World Bank' },
          { name: 'Trinkwasserzugang', value: `${waterCurrent}%`, score: Math.round(socWaterScore), trend: 'improving', source: 'World Bank' },
          { name: 'Menschen auf der Flucht', value: `${(refugees.total / 1e6).toFixed(1)} Mio`, score: Math.round(socRefugeeScore), trend: 'declining', source: 'UNHCR' },
          { name: 'Politische Freiheit', value: `${freedom.free} frei / ${freedom.notFree} unfrei`, score: Math.round(socFreedomScore), trend: freedom.trendDecline ? 'declining' : 'stable', source: 'Freedom House' }
        ]
      },
      economy: {
        value: ecoScoreAdj,
        label: ecoScoreAdj < 40 ? 'BESORGNISERREGEND' : ecoScoreAdj < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: ecoScoreAdj < 40 ? 'concerning' : ecoScoreAdj < 60 ? 'mixed' : 'positive',
        weight: 0.20,
        trend: (() => { const d = ecoScoreAdj - (existing?.subScores?.economy?.value || ecoScoreAdj); return d > 0.2 ? 'improving' : d < -0.2 ? 'declining' : 'stable'; })(),
        change: Math.round((ecoScoreAdj - (existing?.subScores?.economy?.value || ecoScoreAdj)) * 10) / 10,
        indicators: [
          { name: 'BIP-Wachstum', value: `${gdpGrowth}%`, score: Math.round(ecoGDPScore), trend: ecoGDPScore > 60 ? 'improving' : ecoGDPScore < 40 ? 'declining' : 'stable', source: 'World Bank / IMF' },
          { name: 'Gini-Index', value: giniCurrent, score: Math.round(ecoGiniScore), trend: 'stable', source: 'World Bank' },
          { name: 'Inflation', value: `${inflationCurrent}%`, score: Math.round(ecoInflScore), trend: 'stable', source: 'World Bank' },
          { name: 'Arbeitslosigkeit', value: `${unemploymentCurrent}%`, score: Math.round(ecoUnempScore), trend: 'stable', source: 'World Bank / ILO' },
          { name: 'Extreme Armut', value: '8.5%', score: 55, trend: 'improving', source: 'World Bank' }
        ]
      },
      progress: {
        value: progScoreAdj,
        label: progScoreAdj < 40 ? 'BESORGNISERREGEND' : progScoreAdj < 60 ? 'GEMISCHT' : progScoreAdj < 80 ? 'POSITIV' : 'EXZELLENT',
        zone: progScoreAdj < 40 ? 'concerning' : progScoreAdj < 60 ? 'mixed' : progScoreAdj < 80 ? 'positive' : 'excellent',
        weight: 0.20,
        trend: (() => { const d = progScoreAdj - (existing?.subScores?.progress?.value || progScoreAdj); return d > 0.2 ? 'improving' : d < -0.2 ? 'declining' : 'stable'; })(),
        change: Math.round((progScoreAdj - (existing?.subScores?.progress?.value || progScoreAdj)) * 10) / 10,
        indicators: [
          { name: 'Internet-Durchdringung', value: `${internetCurrent}%`, score: Math.round(progInternetScore), trend: 'improving', source: 'World Bank / ITU' },
          { name: 'Alphabetisierung', value: `${literacyCurrent}%`, score: Math.round(progLiteracyScore), trend: 'improving', source: 'World Bank / UNESCO' },
          { name: 'F&E Ausgaben (% BIP)', value: `${rdCurrent}%`, score: Math.round(progRDScore), trend: 'improving', source: 'World Bank' },
          { name: 'Mobilfunkverträge', value: `${mobileCurrent}/100`, score: Math.round(progMobileScore), trend: 'improving', source: 'World Bank / ITU' },
          { name: 'GitHub Repositories', value: githubData?.totalPublicRepos ? `${Math.round(githubData.totalPublicRepos / 1000)}K+` : '300K+', score: 80, trend: 'improving', source: 'GitHub' },
          { name: 'Wissenschaftliche Papers', value: arxivData?.papers?.length ? `${arxivData.papers.length}+ heute` : '3.2M/Jahr', score: 75, trend: 'improving', source: 'arXiv' }
        ]
      },
      momentum: {
        value: momentumScore,
        positiveCount,
        negativeCount: finalMomentum.length - positiveCount,
        totalIndicators: finalMomentum.length
      }
    },

    environment: {
      temperatureAnomaly: {
        current: tempCurrent,
        unit: '°C',
        baseline: '1951-1980 avg',
        history: tempHistory.length > 2 ? tempHistory : existing?.environment?.temperatureAnomaly?.history || [],
        source: 'NASA GISTEMP'
      },
      co2: {
        current: Math.round(co2Current),
        unit: 'ppm',
        preindustrial: 280,
        history: co2History.length > 2 ? co2History : existing?.environment?.co2?.history || [],
        source: 'NOAA'
      },
      airQuality: {
        globalAvgAQI,
        cleanestCities,
        mostPolluted,
        source: 'Open-Meteo Air Quality'
      },
      arcticIce: existing?.environment?.arcticIce || {
        current: 4.2, unit: 'million km²', reference1980: 7.8, percentLost: 46.2, source: 'NSIDC'
      },
      forest: { current: forestCurrent || 31.2, history: forestHistory, source: 'World Bank' },
      renewableEnergy: { current: renewableCurrent, history: renewableHistory, source: 'World Bank / IRENA' },
      co2PerCapita: { current: latest(co2EmissionsData?.history || [])?.value, history: co2EmissionsData?.history || [], source: 'World Bank' },
      weather: weatherData?.cities || []
    },

    society: {
      conflicts,
      refugees,
      freedom,
      lifeExpectancy: {
        global: lifeExpCurrent,
        highest: existing?.society?.lifeExpectancy?.highest || { country: 'Japan', value: 84.8 },
        lowest: existing?.society?.lifeExpectancy?.lowest || { country: 'Central African Republic', value: 53.1 },
        history: lifeExpHistory.length > 2 ? lifeExpHistory : existing?.society?.lifeExpectancy?.history || [],
        source: 'World Bank / WHO'
      },
      childMortality: { current: childMortCurrent, history: childMortHistory, source: 'World Bank' },
      population: { current: latest(popData?.history || [])?.value, history: popData?.history || [], source: 'World Bank' },
      electricityAccess: { current: electricityCurrent, history: electricityData?.history || [], source: 'World Bank' },
      safeWater: { current: waterCurrent, history: waterData?.history || [], source: 'World Bank' },
      education: { enrollment: latest(educationData?.history || [])?.value, history: educationData?.history || [], source: 'World Bank / UNESCO' },
      healthExpenditure: { current: latest(healthExpData?.history || [])?.value, history: healthExpData?.history || [], source: 'World Bank' },
      militaryExpenditure: { current: latest(militaryData?.history || [])?.value, history: militaryData?.history || [], source: 'World Bank' },
      urbanization: { current: latest(urbanData?.history || [])?.value, history: urbanData?.history || [], source: 'World Bank' },
      covid: diseaseData ? { cases: diseaseData.cases, deaths: diseaseData.deaths, recovered: diseaseData.recovered } : existing?.society?.covid
    },

    economy: {
      wealth: existing?.economy?.wealth || {
        billionaires: 2781, billionaireWealth: 14200000000000,
        extremePoverty: 648000000, top1Percent: 45.8, bottom50Percent: 2.1,
        source: 'World Bank / Oxfam'
      },
      gdpGrowth: {
        global: gdpGrowth,
        regions: regionalData?.regions || existing?.economy?.gdpGrowth?.regions || [],
        history: gdpData?.history || existing?.economy?.gdpGrowth?.history || [],
        source: 'World Bank / IMF'
      },
      gini: {
        globalAvg: giniCurrent,
        history: giniHistory.length > 2 ? giniHistory : existing?.economy?.gini?.history || [],
        source: 'World Bank'
      },
      inflation: { current: inflationCurrent, history: inflationData?.history || [], source: 'World Bank' },
      unemployment: { current: unemploymentCurrent, history: unemploymentData?.history || [], source: 'World Bank / ILO' },
      gdpPerCapita: { current: latest(gdppcData?.history || [])?.value, history: gdppcData?.history || [], source: 'World Bank' },
      trade: { current: latest(tradeData?.history || [])?.value, history: tradeData?.history || [], source: 'World Bank' },
      cryptoFearGreed: cryptoData?.current || existing?.economy?.cryptoFearGreed || { value: 38, label: 'Fear' },
      exchangeRates: exchangeData?.rates || existing?.economy?.exchangeRates || {}
    },

    progress: {
      publications: {
        annualTotal: 3200000,
        history: existing?.progress?.publications?.history || [
          { year: 1980, value: 500000 }, { year: 1990, value: 900000 },
          { year: 2000, value: 1400000 }, { year: 2010, value: 2100000 },
          { year: 2020, value: 2900000 }, { year: 2026, value: 3200000 }
        ],
        latestArxiv: arxivData?.papers?.slice(0, 5) || [],
        source: 'arXiv / Scopus'
      },
      github: {
        dailyCommits: 142000000,
        activeDevs: 120000000,
        reposCreatedToday: 850000,
        topRepos: githubData?.topRepos || [],
        source: 'GitHub'
      },
      internet: {
        penetration: internetCurrent,
        users: 5400000000,
        history: internetHistory.length > 2 ? internetHistory : existing?.progress?.internet?.history || [],
        source: 'World Bank / ITU'
      },
      literacy: {
        global: literacyCurrent,
        male: existing?.progress?.literacy?.male || 90.1,
        female: existing?.progress?.literacy?.female || 84.7,
        history: existing?.progress?.literacy?.history || [
          { year: 1970, male: 70, female: 52 }, { year: 1980, male: 76, female: 60 },
          { year: 1990, male: 82, female: 68 }, { year: 2000, male: 87, female: 77 },
          { year: 2010, male: 89, female: 82 }, { year: 2020, male: 90, female: 84 },
          { year: 2026, male: 90.1, female: 84.7 }
        ],
        source: 'World Bank / UNESCO'
      },
      mobile: { subscriptionsPer100: mobileCurrent, history: mobileData?.history || [], source: 'World Bank / ITU' },
      rdSpending: { current: rdCurrent, history: rdData?.history || [], source: 'World Bank' },
      patents: { history: patentData?.history || [], source: 'World Bank / WIPO' },
      spaceflight: spaceData?.articles || []
    },

    realtime: {
      earthquakes: {
        last24h: (earthquakeData?.quakes || existing?.realtime?.earthquakes?.last24h || []).slice(0, 8),
        total24h: earthquakeData?.count || 0,
        source: 'USGS'
      },
      newsSentiment: gdeltTone?.data ? {
        score: typeof gdeltTone.data === 'object' ? (gdeltTone.data.score ?? -0.42) : -0.42,
        label: 'Leicht Negativ',
        history24h: Array.isArray(gdeltTone.data) ? gdeltTone.data.slice(-12).map(d => d.tone ?? d.value ?? -0.4) :
          [-0.3, -0.5, -0.4, -0.6, -0.3, -0.4, -0.5, -0.3, -0.4, -0.6, -0.5, -0.4],
        source: 'GDELT'
      } : (existing?.realtime?.newsSentiment || {
        score: -0.42, label: 'Leicht Negativ',
        history24h: [-0.3, -0.5, -0.4, -0.6, -0.3, -0.4, -0.5, -0.3, -0.4, -0.6, -0.5, -0.4],
        source: 'GDELT'
      }),
      cryptoFearGreed: {
        value: cryptoData?.current?.value || existing?.realtime?.cryptoFearGreed?.value || 38,
        label: cryptoData?.current?.label || 'Fear',
        source: 'Alternative.me'
      },
      news: diverseNews.length > 0 ? diverseNews : (existing?.realtime?.news || []),
      volcanic: volcanicData?.alerts || [],
      solar: solarData?.recent?.slice(-12) || [],
      lastUpdated: new Date().toISOString()
    },

    momentum: {
      indicators: finalMomentum,
      comparison2000
    },

    scenarios: existing?.scenarios || {
      businessAsUsual: {
        worldIndex2030: 45.1, worldIndex2050: 38.7,
        keyChanges: ['+1.8°C bis 2050', 'Erneuerbare bei 45%', 'Extreme Armut bei 5%', 'Internet bei 85%']
      },
      worstCase: {
        worldIndex2030: 38.2, worldIndex2050: 25.4,
        keyChanges: ['+3.2°C bis 2050', 'Kipppunkte überschritten', 'Konflikte +40%', 'Migration verdoppelt']
      },
      bestCase: {
        worldIndex2030: 58.3, worldIndex2050: 72.1,
        keyChanges: ['Netto-Null 2045', 'Extreme Armut eliminiert', 'Internet für alle', 'Konflikte -50%']
      }
    },

    dataSources: buildDataSourcesList()
  };

  writeFileSync(OUTPUT, JSON.stringify(worldState, null, 2));
  console.log(`\n✓ Written to ${OUTPUT}`);
  console.log(`  File size: ${(JSON.stringify(worldState).length / 1024).toFixed(1)} KB`);
}

function buildDataSourcesList() {
  const manifest = readRaw('.', 'collection-manifest.json');
  const today = new Date().toISOString().slice(0, 10);

  return [
    { name: 'NASA GISTEMP', url: 'https://data.giss.nasa.gov/gistemp/', trust: 3, lastUpdate: today, category: 'environment' },
    { name: 'NOAA (CO2)', url: 'https://gml.noaa.gov/ccgg/trends/', trust: 3, lastUpdate: today, category: 'environment' },
    { name: 'Open-Meteo (Air Quality)', url: 'https://air-quality-api.open-meteo.com/', trust: 2, lastUpdate: today, category: 'environment' },
    { name: 'Open-Meteo', url: 'https://open-meteo.com/', trust: 2, lastUpdate: today, category: 'environment' },
    { name: 'World Bank (Environment)', url: 'https://data.worldbank.org/', trust: 3, lastUpdate: today, category: 'environment' },
    { name: 'NSIDC (Arktis)', url: 'https://nsidc.org/', trust: 3, lastUpdate: today, category: 'environment' },
    { name: 'World Bank (Society)', url: 'https://data.worldbank.org/', trust: 3, lastUpdate: today, category: 'society' },
    { name: 'ACLED (Konflikte)', url: 'https://acleddata.com/', trust: 3, lastUpdate: today, category: 'society' },
    { name: 'UNHCR', url: 'https://data.unhcr.org/', trust: 3, lastUpdate: today, category: 'society' },
    { name: 'Freedom House', url: 'https://freedomhouse.org/', trust: 3, lastUpdate: today, category: 'society' },
    { name: 'disease.sh', url: 'https://disease.sh/', trust: 2, lastUpdate: today, category: 'society' },
    { name: 'World Bank (Economy)', url: 'https://data.worldbank.org/', trust: 3, lastUpdate: today, category: 'economy' },
    { name: 'IMF WEO', url: 'https://www.imf.org/en/Publications/WEO', trust: 3, lastUpdate: today, category: 'economy' },
    { name: 'Alternative.me (Crypto)', url: 'https://alternative.me/crypto/', trust: 2, lastUpdate: today, category: 'economy' },
    { name: 'Exchange Rate API', url: 'https://open.er-api.com/', trust: 2, lastUpdate: today, category: 'economy' },
    { name: 'World Bank (Tech)', url: 'https://data.worldbank.org/', trust: 3, lastUpdate: today, category: 'progress' },
    { name: 'GitHub API', url: 'https://api.github.com/', trust: 2, lastUpdate: today, category: 'progress' },
    { name: 'arXiv', url: 'https://arxiv.org/', trust: 3, lastUpdate: today, category: 'progress' },
    { name: 'Spaceflight News', url: 'https://spaceflightnewsapi.net/', trust: 2, lastUpdate: today, category: 'progress' },
    { name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'GDELT Project', url: 'https://www.gdeltproject.org/', trust: 2, lastUpdate: today, category: 'realtime' },
    { name: 'UN News (RSS)', url: 'https://news.un.org/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'WHO News (RSS)', url: 'https://www.who.int/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'UNHCR (RSS)', url: 'https://www.unhcr.org/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'ReliefWeb (RSS)', url: 'https://reliefweb.int/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'NASA (RSS)', url: 'https://www.nasa.gov/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'BBC World (RSS)', url: 'https://www.bbc.com/news/world', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'DW News (RSS)', url: 'https://www.dw.com/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'Al Jazeera (RSS)', url: 'https://www.aljazeera.com/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'Guardian World (RSS)', url: 'https://www.theguardian.com/world', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'France24 (RSS)', url: 'https://www.france24.com/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'NOAA Space Weather', url: 'https://www.swpc.noaa.gov/', trust: 3, lastUpdate: today, category: 'realtime' },
    { name: 'USGS Volcanoes', url: 'https://volcanoes.usgs.gov/', trust: 3, lastUpdate: today, category: 'realtime' }
  ];
}

// Run
try {
  buildWorldState();
} catch (err) {
  console.error('FATAL: buildWorldState failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
