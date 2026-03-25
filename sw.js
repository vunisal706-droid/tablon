const CACHE_NAME = 'ceip-avisos-v1';
const STATIC_ASSETS = [
  './index.html',
  './icono.png',
  './manifest.json'
];

// Lista de dominios que el SW debe ignorar SIEMPRE (dejar pasar sin tocar)
const BYPASS_DOMAINS = [
  'firebase',
  'firebaseio.com',
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com',
  'google.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // Ignorar todo lo que no sea GET
  if (event.request.method !== 'GET') return;

  // Ignorar WebSockets y peticiones de tipo no-http
  if (!url.startsWith('http')) return;

  // Ignorar peticiones a Firebase, Google APIs, fuentes externas
  const shouldBypass = BYPASS_DOMAINS.some(domain => url.includes(domain));
  if (shouldBypass) return;

  // Para el resto: cache-first con fallback a red
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Solo cachear respuestas válidas de nuestro propio origen
        if (response && response.status === 200 && response.type === 'basic') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});