/* =====================================================================
   SERVICE WORKER - VERSIÓN 1: CACHE-FIRST (primero cache, luego red)
   Agenda UMB · Grupo 7 · Laboratorio 5
   ---------------------------------------------------------------------
   ¿Cómo funciona?
   1. Ante cada petición, busca primero en el cache.
   2. Si la encuentra, responde de inmediato desde el cache (rápido y
      funciona sin internet).
   3. Si no está en cache, la pide a la red.
   Ventaja: velocidad máxima y soporte offline total para lo precacheado.
   Desventaja: si el archivo cambió en el servidor, el usuario sigue
   viendo la versión vieja hasta que se cambie CACHE_NAME (v1 -> v2).
   ===================================================================== */

// Nombre del cache — cambia la version cuando actualices la app
const CACHE_NAME = 'mi-pwa-v1';

// Archivos que se guardan en cache al instalar (pre-caching)
const ARCHIVOS_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// EVENTO INSTALL: se ejecuta la primera vez que se registra el SW.
// waitUntil() hace que la instalación espere hasta que todo quede en cache.
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Guardando archivos en cache');
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
});

// EVENTO ACTIVATE: se ejecuta después de instalar (o al actualizar).
// Borra todos los caches cuyo nombre no sea el actual.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    })
  );
});

// EVENTO FETCH: Cache-First (primero cache, si no hay, va a la red)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) {
        return respuestaCache;  // responde desde cache
      }
      return fetch(event.request);  // va a la red
    })
  );
});

// EXTENSIÓN: notificaciones push.
// Se puede probar desde DevTools > Application > Service Workers > Push.
self.addEventListener('push', (event) => {
  const texto = event.data ? event.data.text() : 'Tienes tareas pendientes';
  console.log('[SW] Push recibido:', texto);
  event.waitUntil(
    self.registration.showNotification('Agenda UMB', {
      body: texto,
      icon: '/icons/icon-192.png',
    })
  );
});

// Al hacer clic en la notificación, abre la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/index.html'));
});
