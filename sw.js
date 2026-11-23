// LifeOS Service Worker: macht die App installierbar und offline nutzbar.
// - Seite (index.html): erst Netz, dann Cache – Updates kommen sofort an, offline gibt es die letzte Version.
// - Eigene Dateien (Bilder, Skripte): aus dem Cache, im Hintergrund aktualisiert.
// - Supabase-Bibliothek vom CDN: ebenfalls gecacht, damit die App offline startet.
// - Supabase-API (Cloud-Sync) und alles außer GET wird nie angefasst.
const CACHE = 'lifeos-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const cdn = url.hostname === 'cdn.jsdelivr.net';
  if (!sameOrigin && !cdn) return; // u. a. Supabase-API: immer direkt ans Netz

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(request).then(hit => {
        const network = fetch(request)
          .then(response => {
            if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
            return response;
          })
          .catch(() => hit);
        return hit || network;
      })
    )
  );
});
