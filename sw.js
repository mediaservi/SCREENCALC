/* SCREENCALC · service worker: uso sin conexión.
   Estrategia: red primero (datos siempre actualizados) y, si no hay red, la copia guardada
   (aplicación, librerías e imágenes). */
const CACHE = 'screencalc-offline-v1';
const EXCLUIR = /youtube|googlevideo|ytimg|google-analytics|script\.google\.com|docs\.google\.com|googleusercontent|google\.com/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url) || EXCLUIR.test(req.url)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: false }) || (req.mode === 'navigate' ? await cache.match('./index.html') || await cache.match(self.registration.scope) : null);
      if (hit) return hit;
      throw err;
    }
  })());
});
