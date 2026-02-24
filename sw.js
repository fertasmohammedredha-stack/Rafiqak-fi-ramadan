// ===============================
// رفيقك في رمضان - Final SW
// ===============================

const VERSION = 'v2'; // 🔥 غير الرقم فقط عند أي تحديث مهم
const CACHE_NAME = `ramadan-app-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html'
];

// ===============================
// INSTALL
// ===============================
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// ===============================
// FETCH STRATEGY
// ===============================
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // -------- API REQUESTS --------
  if (url.hostname.includes('aladhan.com') || 
      url.hostname.includes('alquran.cloud')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // -------- APP FILES (Network First) --------
  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});