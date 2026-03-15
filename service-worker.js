/* ═══════════════════════════════════════════════════════════
   World.One 1.0 — Service Worker
   Strategy: Network-first for data, Cache-first for assets
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'worldone-v1';
const DATA_PATHS = ['/world-state.json', '/manifest.json', '/data/'];

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/core.css',
  './css/components.css',
  './css/sections.css',
  './css/animations.css',
  './js/app.js',
  './js/data-loader.js',
  './js/scroll-engine.js',
  './js/i18n.js',
  './js/utils/math.js',
  './js/utils/dom.js',
  './js/visualizations/world-indicator.js',
  './js/visualizations/charts.js',
  './js/visualizations/maps.js',
  './js/visualizations/particles.js',
  './js/visualizations/counters.js',
  './js/visualizations/cinematic.js',
  './assets/icon/icon-192.png',
  './assets/icon/icon-512.png'
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for data, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Data files: network-first (freshness matters)
  const isData = DATA_PATHS.some(p => url.pathname.includes(p));

  if (isData) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets: cache-first (performance)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Only cache same-origin successful responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
