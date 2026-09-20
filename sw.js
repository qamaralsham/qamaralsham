// ==============================================
// sw.js v36 — Network First + Cache Cleanup
// ==============================================

const CACHE_NAME = 'qamar-v36-' + Date.now();
const NETWORK_FIRST = ['.html', '.css', '.js', 'manifest.json', '/'];
const CACHE_FIRST = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf'];

self.addEventListener('install', function(e) {
    console.log('🔧 SW v36 installing...');
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('✅ Cache opened');
            return Promise.resolve();
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('🚀 SW v36 activating...');
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) {
                        console.log('🗑️ Deleting old cache:', k);
                        return caches.delete(k);
                    })
            );
        }).then(function() {
            console.log('✅ Old caches cleared');
            return self.clients.claim();
        }).then(function() {
            // إخباري كل التطبيقات المسجلة بالتحديث
            return self.clients.matchAll({ type: 'window' }).then(function(clients) {
                clients.forEach(function(client) {
                    client.postMessage({ type: 'SW_UPDATED', version: 'v36' });
                });
            });
        })
    );
});

self.addEventListener('fetch', function(e) {
    var url = e.request.url;

    // تجاهل Firebase و Google APIs
    if (url.includes('firebaseio.com') ||
        url.includes('googleapis.com') ||
        url.includes('gstatic.com') ||
        url.includes('imgbb.com') ||
        url.includes('ui-avatars.com') ||
        url.includes('jsdelivr.net') ||
        url.includes('cloudflare.com') ||
        url.includes('unsplash.com') ||
        url.includes('github.com') ||
        url.includes('githubusercontent.com')) {
        return;
    }

    // فقط GET requests
    if (e.request.method !== 'GET') return;

    var isHtmlOrJs = NETWORK_FIRST.some(function(ext) { return url.includes(ext); });

    if (isHtmlOrJs) {
        // ⭐ Network First — للـ HTML/CSS/JS
        e.respondWith(
            fetch(e.request).then(function(response) {
                if (response && response.status === 200 && response.type === 'basic') {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                // Offline fallback
                return caches.match(e.request);
            })
        );
    } else {
        // ⭐ Cache First — للصور والخطوط
        e.respondWith(
            caches.match(e.request).then(function(cached) {
                if (cached) return cached;
                return fetch(e.request).then(function(response) {
                    if (response && response.status === 200 && response.type === 'basic') {
                        var clone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(e.request, clone);
                        });
                    }
                    return response;
                });
            })
        );
    }
});

self.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
