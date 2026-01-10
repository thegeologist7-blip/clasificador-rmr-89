const cacheName = 'rmr-v10.0'; // Cambia el número cada vez que actualices tu App
const staticAssets = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// INSTALACIÓN: Guarda los archivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(staticAssets))
  );
  self.skipWaiting(); // Obliga al nuevo SW a tomar el control de inmediato
});

// ACTIVACIÓN: Borra la caché vieja (v9.4) y deja solo la nueva (v9.5)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

// FETCH: Estrategia "Cache First"
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});




