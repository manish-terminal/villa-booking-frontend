/**
 * Service Worker for VillaBook PWA
 * Handles caching strategies for offline support and performance
 */

const CACHE_NAME = 'villabook-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Minimal cache for installability
                return cache.addAll(URLS_TO_CACHE).catch(err => {
                    console.warn('Cache addAll failed', err);
                });
            })
    );
    // Force activation immediately
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of clients immediately
    self.clients.claim();
});

// Fetch Event - Network First strategy suitable for dynamic booking apps
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone for caching
                const responseToCache = response.clone();

                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            // Don't cache API calls if possible, simple heuristic
                            if (!event.request.url.includes('/api/')) {
                                cache.put(event.request, responseToCache);
                            }
                        });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});
