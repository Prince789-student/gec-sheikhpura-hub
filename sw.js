/**
 * GEC Sheikhpura Student Life Hub - Progressive Web App Service Worker
 * Version: gec-hub-cache-v3
 * Provides safe offline asset caching, network-first page navigation with offline fallback,
 * stale-while-revalidate for static assets, and strict security exclusion for auth tokens.
 */

const CACHE_NAME = 'gec-hub-cache-v3';
const OFFLINE_URL = 'offline.html';

const PRECACHE_ASSETS = [
  'index.html',
  'offline.html',
  'community.html',
  'emergency.html',
  'explore-nearby.html',
  'student-tools.html',
  'college-info.html',
  'manifest.json',
  'assets/css/style.css',
  'assets/css/components.css',
  'assets/js/data.js',
  'assets/js/supabase-config.js',
  'assets/js/logger.js',
  'assets/js/db-service.js',
  'assets/js/community.js',
  'assets/js/app.js',
  'assets/images/logo.svg',
  'assets/images/icons/icon-192.png',
  'assets/images/icons/icon-512.png'
];

// Security guard: paths and origins that must NEVER be cached
function isUncacheable(request) {
  const url = new URL(request.url);
  // Never cache POST, PUT, DELETE, etc.
  if (request.method !== 'GET') return true;
  // Never cache Supabase auth, storage uploads, or realtime websockets
  if (url.pathname.includes('/auth/v1') || url.pathname.includes('/storage/v1')) return true;
  // Never cache private enquiry submissions or reports endpoints
  if (url.searchParams.has('apikey') || url.pathname.includes('/rest/v1/marketplace_enquiries')) return true;
  return false;
}

// 1. Install Event: Pre-cache core shell and offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell & assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent routing
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET or uncacheable sensitive requests
  if (isUncacheable(request)) {
    return;
  }

  // On localhost, always fetch fresh from network to prevent stale cache during development
  const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Handle page navigation (HTML document requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, update cache in background
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed: try cache for the requested page
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache, deliver dedicated offline fallback page
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response('You are offline. Please check your internet connection.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, Fonts, Images)
  // Strategy: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline asset fetch failure is ignored if cachedResponse exists
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Push Event: Safe Browser Push Notification Handler (Phase 8)
self.addEventListener('push', (event) => {
  let data = {
    title: 'GEC Sheikhpura Hub Alert',
    body: 'New update on your student account.',
    icon: 'assets/images/icons/icon-192.png',
    badge: 'assets/images/icons/icon-192.png',
    data: { url: 'dashboard.html?tab=notifications' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event: Navigate to associated page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || 'dashboard.html?tab=notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

