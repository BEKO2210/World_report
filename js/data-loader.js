/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Data Loader & Cache
   ═══════════════════════════════════════════════════════════ */

import { i18n } from './i18n.js';

export class DataLoader {
  constructor(options = {}) {
    this.dataUrl = options.url || 'data/processed/world-state.json';
    this.cacheKey = options.cacheKey || 'world-one-data';
    this.cacheTTL = options.cacheTTL || 6 * 60 * 60 * 1000; // 6 hours
    this.data = null;
    this.loading = false;
    this.error = null;
  }

  // ─── Load data with cache ───
  async load() {
    // Always prefer fresh data so workflow updates become visible immediately.
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(this.dataUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      if (!this._validate(json)) {
        throw new Error('Invalid world-state.json structure');
      }
      this.data = json;
      this._saveToCache(this.data);
      return this.data;
    } catch (err) {
      this.error = err;
      console.warn('[DataLoader] Fetch failed, trying cache fallback:', err.message);

      // Try non-expired cache first, then stale cache.
      const cached = this._getFromCache();
      if (cached) {
        this.data = cached;
        return this.data;
      }

      const stale = this._getFromCache(true);
      if (stale) {
        this.data = stale;
        return this.data;
      }

      throw err;
    } finally {
      this.loading = false;
    }
  }

  // ─── Cache operations ───
  _getFromCache(ignoreExpiry = false) {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;

      const { data, timestamp } = JSON.parse(raw);
      const age = Date.now() - timestamp;

      if (!ignoreExpiry && age > this.cacheTTL) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  _saveToCache(data) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // localStorage might be full or disabled
    }
  }

  // ─── Computed Values ───
  getWorldIndex() {
    return this.data?.worldIndex || { value: 0, label: 'N/A', zone: 'mixed' };
  }

  getSubScores() {
    return this.data?.subScores || {};
  }

  getEnvironmentData() {
    return this.data?.environment || {};
  }

  getSocietyData() {
    return this.data?.society || {};
  }

  getEconomyData() {
    return this.data?.economy || {};
  }

  getProgressData() {
    return this.data?.progress || {};
  }

  getRealtimeData() {
    return this.data?.realtime || {};
  }

  getMomentumData() {
    return this.data?.momentum || {};
  }

  getScenariosData() {
    return this.data?.scenarios || {};
  }

  getDataSources() {
    return this.data?.dataSources || [];
  }

  getMeta() {
    return this.data?.meta || {};
  }

  // ─── Validate loaded data has required structure ───
  _validate(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.worldIndex || typeof data.worldIndex.value !== 'number') return false;
    if (!data.subScores) return false;
    if (!data.environment || !data.society || !data.economy) return false;
    return true;
  }

  // ─── Load historical snapshot (cached — snapshots are immutable) ───
  async loadSnapshot(snapshotId) {
    if (!snapshotId || snapshotId === 'live') {
      return this.load();
    }
    // In-memory cache — snapshots never change, so cache indefinitely
    if (!this._snapCache) this._snapCache = new Map();
    if (this._snapCache.has(snapshotId)) {
      this.data = this._snapCache.get(snapshotId);
      return this.data;
    }
    const url = `data/history/snapshot-${snapshotId}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Snapshot ${snapshotId} not found`);
    const json = await response.json();
    if (!this._validate(json)) throw new Error('Invalid snapshot structure');
    this._snapCache.set(snapshotId, json);
    // Keep cache bounded (LRU-style: drop oldest when > 20 entries)
    if (this._snapCache.size > 20) {
      this._snapCache.delete(this._snapCache.keys().next().value);
    }
    this.data = json;
    return this.data;
  }

  // ─── Load timeline manifest ───
  async loadManifest() {
    try {
      const response = await fetch('data/history/manifest.json', { cache: 'no-store' });
      if (!response.ok) return { snapshots: [] };
      return response.json();
    } catch {
      return { snapshots: [] };
    }
  }

  // ─── Format timestamp ───
  getLastUpdated() {
    const ts = this.data?.meta?.generated || this.data?.realtime?.lastUpdated;
    if (!ts) return i18n.t('js.unknown');
    const d = new Date(ts);
    const locale = i18n.lang === 'en' ? 'en-US' : 'de-DE';
    return d.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
