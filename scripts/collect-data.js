#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   World.One — Data Collection Engine
   Fetches real data from 40+ free sources
   ═══════════════════════════════════════════════════════════════ */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'data', 'raw');
const TIMEOUT = 15000;
const CURRENT_YEAR = new Date().getFullYear();

// ─── HTTP Fetch with timeout + retry ───
async function fetchJSON(url, options = {}) {
  const { retries = 2, timeout = TIMEOUT, headers = {} } = options;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'BelkisOne/1.0 DataPipeline', ...headers }
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data === null || data === undefined) throw new Error('Empty JSON response');
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

// ─── Safe World Bank data extraction ───
function extractWorldBankEntries(data, options = {}) {
  const { roundDigits = 1 } = options;
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1]
    .filter(e => e && e.value !== null && e.value !== undefined)
    .map(e => ({
      year: parseInt(e.date),
      value: roundDigits >= 0 ? Math.round(e.value * Math.pow(10, roundDigits)) / Math.pow(10, roundDigits) : e.value
    }))
    .filter(e => !isNaN(e.year) && Number.isFinite(e.value))
    .sort((a, b) => a.year - b.year);
}

async function fetchText(url, options = {}) {
  const { retries = 2, timeout = TIMEOUT } = options;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'BelkisOne/1.0 DataPipeline' }
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

async function fetchXML(url) {
  const text = await fetchText(url);
  // Simple XML value extraction
  return text;
}

function save(category, filename, data) {
  const dir = join(RAW_DIR, category);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), JSON.stringify(data, null, 2));
  console.log(`  ✓ ${category}/${filename}`);
}

// Track results
const results = { success: [], failed: [] };

async function collect(name, fn) {
  try {
    await fn();
    results.success.push(name);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    results.failed.push(name);
  }
}

// ══════════════════════════════════════════════════════════════
// ENVIRONMENT SOURCES
// ══════════════════════════════════════════════════════════════

async function fetchUSGSEarthquakes() {
  // USGS — All M2.5+ earthquakes in last 24h
  const data = await fetchJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
  const quakes = data.features.map(f => ({
    location: f.properties.place,
    magnitude: f.properties.mag,
    depth: f.geometry.coordinates[2],
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    time: new Date(f.properties.time).toISOString(),
    tsunami: f.properties.tsunami === 1,
    type: f.properties.type
  }));
  save('realtime', 'earthquakes.json', { count: quakes.length, quakes, fetched: new Date().toISOString() });
}

async function fetchNASAGISTEMP() {
  // NASA GISTEMP — Global temperature anomaly CSV
  const csv = await fetchText('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv');
  const lines = csv.split('\n').filter(l => l.trim());
  // Find header row and locate J-D column dynamically
  const headerLine = lines.find(l => l.startsWith('Year'));
  const headers = headerLine ? headerLine.split(',') : [];
  const jdIndex = headers.findIndex(h => h.trim() === 'J-D');
  const annualCol = jdIndex >= 0 ? jdIndex : 13; // fallback to column 13
  const history = [];
  for (const line of lines) {
    if (!(/^\d{4}/.test(line))) continue;
    const parts = line.split(',');
    const year = parseInt(parts[0]);
    const annualMean = parseFloat(parts[annualCol]);
    if (!isNaN(year) && !isNaN(annualMean)) {
      history.push({ year, value: annualMean });
    }
  }
  save('environment', 'temperature.json', { history, fetched: new Date().toISOString() });
}

async function fetchNOAACO2() {
  // NOAA — Mauna Loa CO2 monthly averages
  const csv = await fetchText('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv');
  const lines = csv.split('\n').filter(l => l && !l.startsWith('#') && !l.startsWith('Year'));
  const monthly = [];
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 4) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const avg = parseFloat(parts[3]);
      if (!isNaN(avg) && avg > 0) {
        monthly.push({ year, month, value: avg });
      }
    }
  }
  // Yearly averages
  const yearly = {};
  for (const m of monthly) {
    if (!yearly[m.year]) yearly[m.year] = [];
    yearly[m.year].push(m.value);
  }
  const history = Object.entries(yearly).map(([year, vals]) => ({
    year: parseInt(year),
    value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
  }));
  const current = monthly.length > 0 ? monthly[monthly.length - 1].value : null;
  save('environment', 'co2.json', { current, history, monthly: monthly.slice(-24), fetched: new Date().toISOString() });
}

async function fetchOpenMeteoClimate() {
  // Open-Meteo — Current global weather data (free, no key)
  const cities = [
    { name: 'Berlin', lat: 52.52, lng: 13.41 },
    { name: 'New York', lat: 40.71, lng: -74.01 },
    { name: 'Tokyo', lat: 35.68, lng: 139.69 },
    { name: 'Sydney', lat: -33.87, lng: 151.21 },
    { name: 'São Paulo', lat: -23.55, lng: -46.63 },
    { name: 'Lagos', lat: 6.45, lng: 3.40 },
    { name: 'Mumbai', lat: 19.08, lng: 72.88 },
    { name: 'London', lat: 51.51, lng: -0.13 }
  ];
  const results = [];
  for (const city of cities) {
    try {
      const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
      results.push({ ...city, current: data.current });
    } catch { /* skip */ }
  }
  save('environment', 'weather-global.json', { cities: results, fetched: new Date().toISOString() });
}

async function fetchAirQuality() {
  // Open-Meteo Air Quality API (free, no key needed)
  // Replaces OpenAQ which now requires API key (v2 returned HTTP 410 since Jan 2025)
  const cities = [
    { name: 'Beijing', lat: 39.90, lng: 116.40 },
    { name: 'Delhi', lat: 28.61, lng: 77.21 },
    { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
    { name: 'London', lat: 51.51, lng: -0.13 },
    { name: 'São Paulo', lat: -23.55, lng: -46.63 },
    { name: 'Cairo', lat: 30.04, lng: 31.24 },
    { name: 'Lagos', lat: 6.45, lng: 3.40 },
    { name: 'Tokyo', lat: 35.68, lng: 139.69 },
    { name: 'Berlin', lat: 52.52, lng: 13.41 },
    { name: 'Sydney', lat: -33.87, lng: 151.21 },
    { name: 'Mumbai', lat: 19.08, lng: 72.88 },
    { name: 'Mexico City', lat: 19.43, lng: -99.13 }
  ];
  const locations = [];
  for (const city of cities) {
    try {
      const data = await fetchJSON(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi`
      );
      if (data.current) {
        locations.push({
          name: city.name,
          city: city.name,
          lat: city.lat,
          lng: city.lng,
          parameters: [
            { parameter: 'pm25', value: data.current.pm2_5, unit: 'µg/m³' },
            { parameter: 'pm10', value: data.current.pm10, unit: 'µg/m³' },
            { parameter: 'no2', value: data.current.nitrogen_dioxide, unit: 'µg/m³' },
            { parameter: 'o3', value: data.current.ozone, unit: 'µg/m³' },
            { parameter: 'so2', value: data.current.sulphur_dioxide, unit: 'µg/m³' },
            { parameter: 'co', value: data.current.carbon_monoxide, unit: 'µg/m³' }
          ].filter(p => p.value != null),
          aqi: data.current.european_aqi
        });
      }
    } catch { /* skip city */ }
  }
  if (locations.length === 0) throw new Error('No air quality data from any city');
  save('environment', 'air-quality.json', { locations, fetched: new Date().toISOString() });
}

async function fetchGlobalForestWatch() {
  // World Bank — Forest area (% of land area)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/AG.LND.FRST.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  if (entries.length === 0) throw new Error('No forest data returned');
  save('environment', 'forest-area.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchRenewableEnergy() {
  // World Bank — Renewable energy consumption (% of total)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/EG.FEC.RNEW.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  if (entries.length === 0) throw new Error('No renewable energy data returned');
  save('environment', 'renewable-energy.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchCO2Emissions() {
  // World Bank — CO2 emissions per capita
  // Primary: newer EDGAR-based indicator (more recent data)
  // Fallback 1: legacy indicator EN.ATM.CO2E.PC
  // Fallback 2: Our World in Data GitHub dataset
  let entries = [];

  // Try newer WB indicator first (EDGAR source, updated more frequently)
  try {
    const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/EN.GHG.CO2.PC.CE.AR5?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
    entries = extractWorldBankEntries(data, { roundDigits: 2 });
  } catch { /* try next */ }

  // Fallback: legacy indicator
  if (entries.length === 0) {
    try {
      const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/EN.ATM.CO2E.PC?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
      entries = extractWorldBankEntries(data, { roundDigits: 2 });
    } catch { /* try next */ }
  }

  // Fallback 2: Our World in Data (GitHub raw CSV)
  if (entries.length === 0) {
    try {
      const csv = await fetchText('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv');
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const countryIdx = headers.indexOf('country');
      const yearIdx = headers.indexOf('year');
      const co2pcIdx = headers.indexOf('co2_per_capita');
      for (const line of lines.slice(1)) {
        const cols = line.split(',');
        if (cols[countryIdx] === 'World' && cols[co2pcIdx]) {
          const year = parseInt(cols[yearIdx]);
          const value = parseFloat(cols[co2pcIdx]);
          if (!isNaN(year) && Number.isFinite(value)) {
            entries.push({ year, value: Math.round(value * 100) / 100 });
          }
        }
      }
      entries.sort((a, b) => a.year - b.year);
    } catch { /* all failed */ }
  }

  if (entries.length === 0) throw new Error('No CO2 emissions data from any source');
  save('environment', 'co2-emissions-percapita.json', { history: entries, fetched: new Date().toISOString() });
}

// ══════════════════════════════════════════════════════════════
// SOCIETY SOURCES
// ══════════════════════════════════════════════════════════════

async function fetchWorldBankPoverty() {
  // World Bank — Poverty headcount at $2.15/day
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('society', 'poverty.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchLifeExpectancy() {
  // World Bank — Life expectancy at birth
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SP.DYN.LE00.IN?format=json&per_page=60&date=1960:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'life-expectancy.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchChildMortality() {
  // World Bank — Under-5 mortality rate per 1000
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SH.DYN.MORT?format=json&per_page=60&date=1960:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'child-mortality.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchPopulation() {
  // World Bank — World population
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json&per_page=60&date=1960:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: -1 });
  save('society', 'population.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchAccessElectricity() {
  // World Bank — Access to electricity (% of population)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/EG.ELC.ACCS.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'electricity-access.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchSafeWater() {
  // World Bank — People using safely managed drinking water (%)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SH.H2O.SMDW.ZS?format=json&per_page=30&date=2000:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'safe-water.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchDiseaseData() {
  // disease.sh — Global COVID & disease tracking
  try {
    const covid = await fetchJSON('https://disease.sh/v3/covid-19/all');
    save('society', 'disease-covid.json', {
      cases: covid.cases,
      deaths: covid.deaths,
      recovered: covid.recovered,
      active: covid.active,
      todayCases: covid.todayCases,
      todayDeaths: covid.todayDeaths,
      fetched: new Date().toISOString()
    });
  } catch (err) {
    throw new Error(`disease.sh: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
// ECONOMY SOURCES
// ══════════════════════════════════════════════════════════════

async function fetchGDPGrowth() {
  // World Bank — GDP growth (annual %)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('economy', 'gdp-growth.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchGiniIndex() {
  // World Bank — Gini index (0-100 scale)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.GINI?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('economy', 'gini.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchInflation() {
  // World Bank — Inflation, consumer prices (annual %)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/FP.CPI.TOTL.ZG?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('economy', 'inflation.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchUnemployment() {
  // World Bank — Unemployment (% of total labor force)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SL.UEM.TOTL.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('economy', 'unemployment.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchGDPPerCapita() {
  // World Bank — GDP per capita (current US$)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.PCAP.CD?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 0 });
  save('economy', 'gdp-per-capita.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchTradeGlobal() {
  // World Bank — Trade (% of GDP)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/NE.TRD.GNFS.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('economy', 'trade.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchCryptoFearGreed() {
  // Alternative.me — Crypto Fear & Greed Index
  const data = await fetchJSON('https://api.alternative.me/fng/?limit=30');
  const entries = (data.data || []).map(d => ({
    value: parseInt(d.value),
    label: d.value_classification,
    timestamp: new Date(d.timestamp * 1000).toISOString()
  }));
  save('economy', 'crypto-fear-greed.json', { current: entries[0], history: entries, fetched: new Date().toISOString() });
}

async function fetchExchangeRates() {
  // Exchange rate API (free, no key)
  try {
    const data = await fetchJSON('https://open.er-api.com/v6/latest/USD');
    const rates = data.rates || {};
    save('economy', 'exchange-rates.json', {
      base: 'USD',
      rates: {
        EUR: rates.EUR, GBP: rates.GBP, JPY: rates.JPY,
        CNY: rates.CNY, INR: rates.INR, BRL: rates.BRL,
        RUB: rates.RUB, KRW: rates.KRW, CHF: rates.CHF
      },
      fetched: new Date().toISOString()
    });
  } catch (err) {
    throw new Error(`exchange-rates: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
// TECHNOLOGY & PROGRESS SOURCES
// ══════════════════════════════════════════════════════════════

async function fetchInternetUsers() {
  // World Bank — Individuals using the Internet (%)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/IT.NET.USER.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('tech', 'internet-users.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchMobileSubscriptions() {
  // World Bank — Mobile cellular subscriptions (per 100 people)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/IT.CEL.SETS.P2?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('tech', 'mobile-subscriptions.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchGitHubActivity() {
  // GitHub API — Public activity stats
  try {
    const data = await fetchJSON('https://api.github.com/search/repositories?q=stars:>50000&sort=stars&per_page=10', {
      headers: process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}
    });
    const repos = (data.items || []).map(r => ({
      name: r.full_name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updated: r.updated_at
    }));
    save('tech', 'github-trending.json', {
      totalPublicRepos: data.total_count,
      topRepos: repos,
      fetched: new Date().toISOString()
    });
  } catch (err) {
    throw new Error(`GitHub: ${err.message}`);
  }
}

async function fetchArxivPapers() {
  // arXiv — Recent scientific papers
  const xml = await fetchText('http://export.arxiv.org/api/query?search_query=all&sortBy=submittedDate&sortOrder=descending&max_results=20');
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
    const category = entry.match(/<arxiv:primary_category[^>]*term="([^"]*?)"/)?.[1];
    if (title) entries.push({ title, published, category });
  }
  save('tech', 'arxiv-latest.json', { papers: entries, fetched: new Date().toISOString() });
}

async function fetchResearchOutputs() {
  // World Bank — Research and development expenditure (% of GDP)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/GB.XPD.RSDV.GD.ZS?format=json&per_page=30&date=1996:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('tech', 'rd-spending.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchPatentApplications() {
  // World Bank — Patent applications, residents + nonresidents
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/IP.PAT.RESD?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: -1 });
  save('tech', 'patents.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchSpaceflightNews() {
  // Spaceflight News API (free, no key)
  const data = await fetchJSON('https://api.spaceflightnewsapi.net/v4/articles/?limit=10&ordering=-published_at');
  const articles = (data.results || []).map(a => ({
    title: a.title,
    published: a.published_at,
    source: a.news_site,
    summary: a.summary?.slice(0, 200)
  }));
  save('tech', 'spaceflight-news.json', { articles, fetched: new Date().toISOString() });
}

// ══════════════════════════════════════════════════════════════
// REALTIME / NEWS SOURCES
// ══════════════════════════════════════════════════════════════

async function fetchGDELTNews() {
  // GDELT — Global news articles (free, no key)
  // Try article list first (more useful for headlines), fallback to tone
  let articles = [];
  try {
    const data = await fetchJSON('https://api.gdeltproject.org/api/v2/doc/doc?query=world+crisis+climate+conflict&mode=artlist&maxrecords=15&format=json&sourcelang=english');
    articles = (data?.articles || []).map(a => ({
      title: a.title,
      pubDate: a.seendate,
      link: a.url,
      source: 'GDELT'
    }));
  } catch { /* ignore */ }
  save('realtime', 'gdelt-news.json', { articles, fetched: new Date().toISOString() });

  // Also fetch tone data for sentiment
  try {
    const tone = await fetchJSON('https://api.gdeltproject.org/api/v2/doc/doc?query=world&mode=tonechart&format=json&timespan=24h');
    save('realtime', 'gdelt-tone.json', { data: tone, fetched: new Date().toISOString() });
  } catch { /* ignore */ }
}

async function fetchRSSFeeds() {
  // RSS feeds from major international news sources
  // Each feed is tried independently — failed feeds are skipped
  const feeds = [
    // ─── Tier 1: UN system (most reliable, always available) ───
    { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
    { name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml' },
    { name: 'UNHCR', url: 'https://www.unhcr.org/rss/news.xml' },
    { name: 'ReliefWeb', url: 'https://reliefweb.int/updates/rss.xml' },

    // ─── Tier 2: Science & Climate ───
    { name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
    { name: 'NASA Earth', url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss' },
    { name: 'ESA', url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science' },
    { name: 'NOAA Climate', url: 'https://www.climate.gov/feeds/all.rss' },

    // ─── Tier 3: World news (may block; silent fail is fine) ───
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'DW News', url: 'https://rss.dw.com/xml/rss-en-world' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'Guardian', url: 'https://www.theguardian.com/world/rss' },
    { name: 'France24', url: 'https://www.france24.com/en/rss' },
    { name: 'NHK World', url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/' },

    // ─── Tier 4: Development & Economy ───
    { name: 'World Bank', url: 'https://blogs.worldbank.org/feed' },
    { name: 'IMF Blog', url: 'https://www.imf.org/en/News/rss?Language=ENG' }
  ];

  const allArticles = [];
  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url, { timeout: 12000 });
      if (!xml || xml.length < 100) continue;

      const items = [];

      // Try RSS <item> format
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
        const content = match[1];
        const title = content.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
        const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
        const link = content.match(/<link>(.*?)<\/link>/)?.[1]?.trim()
          || content.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/)?.[1];
        if (title && title.length > 10) items.push({ title, pubDate, link, source: feed.name });
      }

      // Fallback: Try Atom <entry> format (used by some feeds)
      if (items.length === 0) {
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        while ((match = entryRegex.exec(xml)) !== null && items.length < 5) {
          const content = match[1];
          const title = content.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
          const pubDate = content.match(/<published>(.*?)<\/published>/)?.[1]
            || content.match(/<updated>(.*?)<\/updated>/)?.[1];
          const link = content.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/)?.[1];
          if (title && title.length > 10) items.push({ title, pubDate, link, source: feed.name });
        }
      }

      allArticles.push(...items);
      console.log(`  [RSS] ${feed.name}: ${items.length} articles`);
    } catch (err) {
      console.log(`  [RSS] ${feed.name}: failed (${err.message?.slice(0, 40)})`);
    }
  }

  console.log(`  [RSS] Total: ${allArticles.length} articles from ${new Set(allArticles.map(a => a.source)).size} sources`);
  save('realtime', 'rss-news.json', { articles: allArticles, fetched: new Date().toISOString() });
}

async function fetchVolcanicActivity() {
  // USGS Volcano Hazards — Recent activity
  try {
    const data = await fetchJSON('https://volcanoes.usgs.gov/hans-public/api/volcanoAlerts');
    const alerts = (Array.isArray(data) ? data : []).slice(0, 10).map(a => ({
      volcano: a.volcanoName,
      alertLevel: a.alertLevel,
      colorCode: a.colorCode,
      date: a.issuedDate,
      observatory: a.observatory
    }));
    save('realtime', 'volcanic-activity.json', { alerts, fetched: new Date().toISOString() });
  } catch (err) {
    throw new Error(`volcanic: ${err.message}`);
  }
}

async function fetchSolarActivity() {
  // NOAA Space Weather — Solar activity
  try {
    const data = await fetchJSON('https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json');
    const recent = data.slice(-60); // Last 5 years of monthly data
    save('realtime', 'solar-activity.json', {
      recent: recent.map(d => ({
        date: d['time-tag'],
        sunspots: d.ssn,
        f10_7: d.f10_7
      })),
      fetched: new Date().toISOString()
    });
  } catch (err) {
    throw new Error(`solar: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
// ADDITIONAL WORLD BANK INDICATORS
// ══════════════════════════════════════════════════════════════

async function fetchEducation() {
  // World Bank — School enrollment, primary (% net)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SE.PRM.NENR?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'education-enrollment.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchLiteracy() {
  // World Bank — Literacy rate, adult total
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SE.ADT.LITR.ZS?format=json&per_page=30&date=1970:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('tech', 'literacy.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchHealthExpenditure() {
  // World Bank — Current health expenditure (% of GDP)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SH.XPD.CHEX.GD.ZS?format=json&per_page=30&date=2000:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('society', 'health-expenditure.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchMilitaryExpenditure() {
  // World Bank — Military expenditure (% of GDP)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/MS.MIL.XPND.GD.ZS?format=json&per_page=30&date=1990:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data, { roundDigits: 2 });
  save('society', 'military-expenditure.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchUrbanization() {
  // World Bank — Urban population (% of total)
  const data = await fetchJSON(`https://api.worldbank.org/v2/country/WLD/indicator/SP.URB.TOTL.IN.ZS?format=json&per_page=60&date=1960:${CURRENT_YEAR}`);
  const entries = extractWorldBankEntries(data);
  save('society', 'urbanization.json', { history: entries, fetched: new Date().toISOString() });
}

async function fetchRegionalGDP() {
  // World Bank — GDP growth by region
  const regions = {
    'EAS': 'Ostasien & Pazifik',
    'ECS': 'Europa & Zentralasien',
    'LCN': 'Lateinamerika & Karibik',
    'MEA': 'Nahost & Nordafrika',
    'SAS': 'Südasien',
    'SSF': 'Subsahara-Afrika',
    'NAC': 'Nordamerika'
  };
  const result = [];
  for (const [code, name] of Object.entries(regions)) {
    try {
      const data = await fetchJSON(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=5&date=${CURRENT_YEAR - 5}:${CURRENT_YEAR}`);
      const entries = extractWorldBankEntries(data, { roundDigits: 2 });
      if (entries.length > 0) {
        const latest = entries[entries.length - 1];
        result.push({ region: name, code, gdpGrowth: latest.value, year: latest.year });
      }
    } catch { /* skip */ }
  }
  save('economy', 'regional-gdp.json', { regions: result, fetched: new Date().toISOString() });
}

// ══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ══════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  World.One — Data Collection Engine');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════\n');

  // Environment (7 sources)
  console.log('▸ Environment:');
  await collect('NASA GISTEMP', fetchNASAGISTEMP);
  await collect('NOAA CO2', fetchNOAACO2);
  await collect('Open-Meteo Weather', fetchOpenMeteoClimate);
  await collect('Air Quality (Open-Meteo)', fetchAirQuality);
  await collect('Forest Area (WB)', fetchGlobalForestWatch);
  await collect('Renewable Energy (WB)', fetchRenewableEnergy);
  await collect('CO2 Emissions/Capita (WB)', fetchCO2Emissions);

  // Society (9 sources)
  console.log('\n▸ Society:');
  await collect('Poverty (WB)', fetchWorldBankPoverty);
  await collect('Life Expectancy (WB)', fetchLifeExpectancy);
  await collect('Child Mortality (WB)', fetchChildMortality);
  await collect('Population (WB)', fetchPopulation);
  await collect('Electricity Access (WB)', fetchAccessElectricity);
  await collect('Safe Water (WB)', fetchSafeWater);
  await collect('Disease Data', fetchDiseaseData);
  await collect('Education Enrollment (WB)', fetchEducation);
  await collect('Health Expenditure (WB)', fetchHealthExpenditure);
  await collect('Military Expenditure (WB)', fetchMilitaryExpenditure);
  await collect('Urbanization (WB)', fetchUrbanization);

  // Economy (8 sources)
  console.log('\n▸ Economy:');
  await collect('GDP Growth (WB)', fetchGDPGrowth);
  await collect('Gini Index (WB)', fetchGiniIndex);
  await collect('Inflation (WB)', fetchInflation);
  await collect('Unemployment (WB)', fetchUnemployment);
  await collect('GDP Per Capita (WB)', fetchGDPPerCapita);
  await collect('Trade (WB)', fetchTradeGlobal);
  await collect('Crypto Fear & Greed', fetchCryptoFearGreed);
  await collect('Exchange Rates', fetchExchangeRates);
  await collect('Regional GDP (WB)', fetchRegionalGDP);

  // Tech & Progress (7 sources)
  console.log('\n▸ Technology & Progress:');
  await collect('Internet Users (WB)', fetchInternetUsers);
  await collect('Mobile Subscriptions (WB)', fetchMobileSubscriptions);
  await collect('GitHub Activity', fetchGitHubActivity);
  await collect('arXiv Papers', fetchArxivPapers);
  await collect('R&D Spending (WB)', fetchResearchOutputs);
  await collect('Patents (WB)', fetchPatentApplications);
  await collect('Spaceflight News', fetchSpaceflightNews);
  await collect('Literacy (WB)', fetchLiteracy);

  // Realtime (5 sources)
  console.log('\n▸ Realtime:');
  await collect('USGS Earthquakes', fetchUSGSEarthquakes);
  await collect('GDELT News/Sentiment', fetchGDELTNews);
  await collect('RSS News Feeds', fetchRSSFeeds);
  await collect('Volcanic Activity', fetchVolcanicActivity);
  await collect('Solar Activity', fetchSolarActivity);

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log(`  ✓ Success: ${results.success.length}/${results.success.length + results.failed.length}`);
  console.log(`  ✗ Failed:  ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log(`  Failed sources: ${results.failed.join(', ')}`);
  }
  console.log('═══════════════════════════════════════');

  // Save collection manifest
  save('.', 'collection-manifest.json', {
    timestamp: new Date().toISOString(),
    success: results.success,
    failed: results.failed,
    total: results.success.length + results.failed.length,
    successRate: Math.round(results.success.length / (results.success.length + results.failed.length) * 100)
  });

  // Exit with error if too many failures
  if (results.failed.length > results.success.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
