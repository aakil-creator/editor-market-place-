// Service Worker for Editor Marketplace PWA
const CACHE_NAME = 'editor-marketplace-v12-apple-and-payments';
const PRECACHE_ASSETS = [
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/favicon.png',
  '/static/icons/icon.svg'
];

// Install: Cache shell assets & activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate: Clean ALL old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for code/pages, cache only for icons/images
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests: Network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ detail: 'You are currently offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Scripts, stylesheets, HTML, and root routes: ALWAYS fetch from network
  if (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/login' ||
    url.pathname === '/register'
  ) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Static images and icons: Cache-first fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
