const CACHE_NAME = 'neoncalc-max-v1.0-beta1';

const assets = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './PWA/icon-192.png',
  './PWA/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      if (cacheRes) return cacheRes;
      return fetch(event.request).catch(() => {
        console.warn('[SW] Resource not available offline:', event.request.url);
      });
    })
  );
});
