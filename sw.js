const CACHE_NAME = 'wardak-cache-v2';
const urlsToCache = [
    './',
    './index.html',
    './mushaf.html',
    './reader.html',
    './style.css',
    './reader.css',
    './script.js',
    './mushaf.js',
    './reader.js',
    './api.js',
    './storage.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // تفعيل النسخة الجديدة فوراً
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    // مسح أي كاش قديم (النسخة المعلقة على موبايلك)
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // جلب أحدث نسخة من الإنترنت أولاً (Network First)
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
