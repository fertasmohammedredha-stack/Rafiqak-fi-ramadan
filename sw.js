// رفيقك في رمضان - Service Worker
// يحفظ الموقع كاملاً للعمل بدون إنترنت

const CACHE_NAME = 'ramadan-app-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
];

// On install: cache the main page
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// On activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy: Cache First for app shell, Network First for APIs
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch API calls from network, fall back to nothing
  if (url.hostname.includes('aladhan.com') || url.hostname.includes('alquran.cloud')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For fonts and static assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
