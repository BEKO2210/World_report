#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   BELKIS ONE — Data Processing Engine
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
        const pm25 = l.parameters?.find(p => p.parameter === 'pm25' || p.parameter === 'PM2.5');
        return { city: l.city || l.name, country: l.country, aqi: pm25?.value || null, lat: l.lat, lng: l.lng };
      })
      .filter(l => l.aqi !== null && l.aqi > 0);
    withAQI.sort((a, b) => a.aqi - b.aqi);
    if (withAQI.length >= 10) {
      cleanestCities = withAQI.slice(0, 5);
      mostPolluted = withAQI.slice(-5).reverse();
    }
  }

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

  const socLifeScore = normalize(lifeExpCurrent, 50, 85);
  const socMortScore = normalize(childMortCurrent, 100, 5); // lower = better
  const socElecScore = normalize(electricityCurrent, 50, 100);
  const socWaterScore = normalize(waterCurrent, 40, 100);
  const socScore = Math.round((socLifeScore * 0.3 + socMortScore * 0.3 + socElecScore * 0.2 + socWaterScore * 0.2) * 10) / 10;

  console.log(`  Society Score:     ${socScore} (life:${socLifeScore.toFixed(0)} mort:${socMortScore.toFixed(0)} elec:${socElecScore.toFixed(0)} water:${socWaterScore.toFixed(0)})`);

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
  const giniCurrent = latest(giniHistory)?.value || 0.42;
  const inflationCurrent = latest(inflationData?.history || [])?.value || 6.5;
  const unemploymentCurrent = latest(unemploymentData?.history || [])?.value || 5.8;

  const ecoGDPScore = normalize(gdpGrowth, -5, 6);
  const ecoGiniScore = normalize(giniCurrent, 0.60, 0.25); // lower Gini = better (0-1 scale)
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

  // Fall back to existing if not enough indicators computed
  const finalMomentum = momentumIndicators.length >= 10 ? momentumIndicators : (existing?.momentum?.indicators || momentumIndicators);
  const positiveCount = finalMomentum.filter(i => i.direction === 'improving').length;
  const momentumScore = finalMomentum.length > 0 ? Math.round((positiveCount / finalMomentum.length) * 100 * 10) / 10 : 54.6;

  console.log(`  Momentum Score:    ${momentumScore} (${positiveCount}/${finalMomentum.length} improving)\n`);

  // ─── WORLD INDEX ───
  const worldIndex = Math.round((
    envScore * 0.25 +
    socScore * 0.25 +
    ecoScore * 0.20 +
    progScore * 0.20 +
    momentumScore * 0.10
  ) * 10) / 10;

  const prevWorldIndex = existing?.worldIndex?.value || 46.8;
  const worldChange = Math.round((worldIndex - prevWorldIndex) * 10) / 10;
  const zone = worldIndex < 20 ? 'critical' : worldIndex < 40 ? 'concerning' : worldIndex < 60 ? 'mixed' : worldIndex < 80 ? 'positive' : 'excellent';
  const zoneLabels = { critical: 'KOLLAPS', concerning: 'BESORGNISERREGEND', mixed: 'GEMISCHT', positive: 'POSITIV', excellent: 'EXZELLENT' };

  console.log(`  ╔══════════════════════════════╗`);
  console.log(`  ║  WORLD INDEX: ${worldIndex.toFixed(1)} / 100     ║`);
  console.log(`  ║  Zone: ${zoneLabels[zone].padEnd(22)}║`);
  console.log(`  ║  Change: ${worldChange >= 0 ? '+' : ''}${worldChange.toFixed(1).padEnd(20)}║`);
  console.log(`  ╚══════════════════════════════╝\n`);

  // ─── BUILD comparison2000 ───
  const comparison2000 = existing?.momentum?.comparison2000 || [
    { name: 'Extreme Armut', then: 1700000000, now: 648000000, improved: true },
    { name: 'Kindersterblichkeit', then: 76, now: childMortCurrent, improved: childMortCurrent < 76 },
    { name: 'Lebenserwartung', then: 67, now: lifeExpCurrent, improved: lifeExpCurrent > 67 },
    { name: 'Internet-Nutzer', then: 6.7, now: internetCurrent, improved: true },
    { name: 'Alphabetisierung', then: 81, now: literacyCurrent, improved: literacyCurrent > 81 },
    { name: 'CO2-Konzentration', then: 369, now: co2Current, improved: false },
    { name: 'Erneuerbare Energie', then: 17, now: renewableCurrent, improved: renewableCurrent > 17 },
    { name: 'Mobilfunkverträge', then: 12, now: mobileCurrent, improved: true }
  ];

  // ─── BUILD CONFLICT DATA ───
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

  // ─── ASSEMBLE FINAL STATE ───
  const worldState = {
    meta: {
      generated: new Date().toISOString(),
      version: '2.0.0',
      sources_count: 40,
      sources_available: readRaw('.', 'collection-manifest.json')?.success?.length || existing?.meta?.sources_available || 22,
      sources_success_rate: readRaw('.', 'collection-manifest.json')?.successRate || 100,
      next_update: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    },

    worldIndex: {
      value: worldIndex,
      label: zoneLabels[zone],
      zone,
      previous: prevWorldIndex,
      change: worldChange,
      trend: worldChange > 0 ? 'improving' : worldChange < 0 ? 'declining' : 'stable'
    },

    subScores: {
      environment: {
        value: envScore,
        label: envScore < 20 ? 'KRITISCH' : envScore < 40 ? 'BESORGNISERREGEND' : envScore < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: envScore < 20 ? 'critical' : envScore < 40 ? 'concerning' : envScore < 60 ? 'mixed' : 'positive',
        weight: 0.25,
        trend: worldChange > 0 ? 'improving' : 'declining',
        change: Math.round((envScore - (existing?.subScores?.environment?.value || envScore)) * 10) / 10,
        indicators: [
          { name: 'Globale Temperaturanomalie', value: `+${tempCurrent}°C`, score: Math.round(envTempScore), trend: 'declining', source: 'NASA GISTEMP' },
          { name: 'CO2-Konzentration', value: `${Math.round(co2Current)} ppm`, score: Math.round(envCO2Score), trend: 'declining', source: 'NOAA' },
          { name: 'Waldfläche', value: `${forestCurrent || 31.2}%`, score: Math.round(envForestScore), trend: 'declining', source: 'World Bank' },
          { name: 'Erneuerbare Energie', value: `${renewableCurrent}%`, score: Math.round(envRenewableScore), trend: 'improving', source: 'World Bank / IRENA' },
          { name: 'Luftqualität (Global Avg AQI)', value: 68, score: 45, trend: 'stable', source: 'OpenAQ' },
          { name: 'Arktis-Eisfläche', value: '4.2 Mio km²', score: 30, trend: 'declining', source: 'NSIDC' }
        ]
      },
      society: {
        value: socScore,
        label: socScore < 40 ? 'BESORGNISERREGEND' : socScore < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: socScore < 40 ? 'concerning' : socScore < 60 ? 'mixed' : 'positive',
        weight: 0.25,
        trend: 'stable',
        change: Math.round((socScore - (existing?.subScores?.society?.value || socScore)) * 10) / 10,
        indicators: [
          { name: 'Lebenserwartung', value: `${lifeExpCurrent} Jahre`, score: Math.round(socLifeScore), trend: 'improving', source: 'World Bank' },
          { name: 'Kindersterblichkeit', value: `${childMortCurrent}/1000`, score: Math.round(socMortScore), trend: 'improving', source: 'World Bank' },
          { name: 'Aktive Konflikte', value: conflicts.activeCount, score: 25, trend: 'declining', source: 'ACLED' },
          { name: 'Elektrizitätszugang', value: `${electricityCurrent}%`, score: Math.round(socElecScore), trend: 'improving', source: 'World Bank' },
          { name: 'Trinkwasserzugang', value: `${waterCurrent}%`, score: Math.round(socWaterScore), trend: 'improving', source: 'World Bank' },
          { name: 'Menschen auf der Flucht', value: '108.4 Mio', score: 20, trend: 'declining', source: 'UNHCR' }
        ]
      },
      economy: {
        value: ecoScore,
        label: ecoScore < 40 ? 'BESORGNISERREGEND' : ecoScore < 60 ? 'GEMISCHT' : 'POSITIV',
        zone: ecoScore < 40 ? 'concerning' : ecoScore < 60 ? 'mixed' : 'positive',
        weight: 0.20,
        trend: gdpGrowth > 2 ? 'improving' : 'stable',
        change: Math.round((ecoScore - (existing?.subScores?.economy?.value || ecoScore)) * 10) / 10,
        indicators: [
          { name: 'BIP-Wachstum', value: `${gdpGrowth}%`, score: Math.round(ecoGDPScore), trend: gdpGrowth > 2 ? 'improving' : 'stable', source: 'World Bank / IMF' },
          { name: 'Gini-Index', value: giniCurrent, score: Math.round(ecoGiniScore), trend: 'stable', source: 'World Bank' },
          { name: 'Inflation', value: `${inflationCurrent}%`, score: Math.round(ecoInflScore), trend: 'stable', source: 'World Bank' },
          { name: 'Arbeitslosigkeit', value: `${unemploymentCurrent}%`, score: Math.round(ecoUnempScore), trend: 'stable', source: 'World Bank / ILO' },
          { name: 'Extreme Armut', value: '8.5%', score: 55, trend: 'improving', source: 'World Bank' }
        ]
      },
      progress: {
        value: progScore,
        label: progScore < 40 ? 'BESORGNISERREGEND' : progScore < 60 ? 'GEMISCHT' : progScore < 80 ? 'POSITIV' : 'EXZELLENT',
        zone: progScore < 40 ? 'concerning' : progScore < 60 ? 'mixed' : progScore < 80 ? 'positive' : 'excellent',
        weight: 0.20,
        trend: 'improving',
        change: Math.round((progScore - (existing?.subScores?.progress?.value || progScore)) * 10) / 10,
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
        globalAvgAQI: 68,
        cleanestCities,
        mostPolluted,
        source: 'OpenAQ / WAQI'
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
      refugees: existing?.society?.refugees || {
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
      },
      freedom: existing?.society?.freedom || {
        free: 84, partlyFree: 56, notFree: 55, trendDecline: true, yearDecline: 18, source: 'Freedom House'
      },
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
    { name: 'OpenAQ', url: 'https://openaq.org/', trust: 2, lastUpdate: today, category: 'environment' },
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
buildWorldState();
