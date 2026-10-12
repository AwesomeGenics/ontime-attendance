const CACHE_NAME = 'ontime-v1';
const STATIC_ASSETS = [
  '/',
  '/static/css/app.css',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/icons/icon.svg',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/favicon.svg',
  '/static/icons/favicon-32x32.png',
  '/static/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Static assets: Cache-first with network fallback
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Dynamic pages: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fallback for document requests
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
          const homeCached = await caches.match('/home');
          if (homeCached) return homeCached;
        }
        return new Response(
          '<div style="font-family:sans-serif;padding:30px;text-align:center;color:#64748b;"><h1>Offline</h1><p>You appear to be offline. Reconnect to track attendance.</p></div>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
  );
});
