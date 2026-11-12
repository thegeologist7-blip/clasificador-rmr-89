
const CACHE_NAME = 'rmr-v12.0';
const CACHE_PREFIX = 'rmr-';

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-512.png'
];

// INSTALACIÓN
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key =>
                        key.startsWith(CACHE_PREFIX) &&
                        key !== CACHE_NAME
                    )
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// PETICIONES
self.addEventListener('fetch', event => {
    const request = event.request;

    // Solo solicitudes GET
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // No interceptar recursos de otros dominios
    if (url.origin !== self.location.origin) return;

    // DOCUMENTOS HTML: primero intenta actualizar desde internet
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));

                    }
                    return response;
                })
                .catch(async () => {
                    return await caches.match(request) ||
                           await caches.match('./index.html') ||
                           Response.error();
                })
        );

        return;
    }

    // RECURSOS ESTÁTICOS
    event.respondWith(
        caches.match(request).then(cachedResponse => {

            const networkRequest = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, copy));
                    }

                    return response;
                });

            return cachedResponse || networkRequest;
        })
    );
});
