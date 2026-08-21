const CACHE_NAME = 'wardak-cache-v1';
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});