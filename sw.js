// BFMIDI Editor — Service Worker (gerado por webApp/build.mjs).
const CACHE_NAME = 'bfmidi-prod-cf39f1a7ae8c';
const APP_SHELL = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './icons/app.svg',
  './icons/app-192.png',
  './icons/app-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Cross-origin (ex: API HTTP do dispositivo em outro IP) -> passthrough.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.ok) {
          const p = url.pathname.toLowerCase();
          if (p.endsWith('.js')   || p.endsWith('.css') ||
              p.endsWith('.svg')  || p.endsWith('.png') ||
              p.endsWith('.webmanifest') || p.endsWith('.json')) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
        }
        return resp;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});
