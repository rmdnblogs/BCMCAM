// sw.js - simple cache-first service worker
const CACHE_NAME = 'gudangcam-v1';
const BASE = './';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  // For navigation requests, return cached index.html (SPA support)
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      fetch(evt.request).catch(()=>caches.match(BASE + 'index.html'))
    );
    return;
  }

  // For others, try cache first then network
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request).then(networkResp => {
        // Optionally cache new requests (dynamic cache) - minimal
        // Don't cache POST/opaque requests here to avoid issues
        if (evt.request.method === 'GET' && networkResp && networkResp.type !== 'opaque') {
          const copy = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(evt.request, copy));
        }
        return networkResp;
      });
    }).catch(() => {
      // If nothing in cache, fallback to index (so UI still loads)
      return caches.match(BASE + 'index.html');
    })
  );
});
