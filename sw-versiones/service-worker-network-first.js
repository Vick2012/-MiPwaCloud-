/* =====================================================================
   SERVICE WORKER - VERSIÓN 2: NETWORK-FIRST (primero red, luego cache)
   Agenda UMB · Grupo 7 · Laboratorio 5 (Desafío)
   ---------------------------------------------------------------------
   ¿Cómo funciona?
   1. Ante cada petición, intenta primero ir a la red.
   2. Si la red responde, entrega esa respuesta FRESCA y además guarda
      una copia en el cache (para tenerla disponible si luego no hay red).
   3. Si la red falla (sin internet), responde con la copia del cache.
   Diferencias con Cache-First:
   - El contenido siempre está actualizado cuando hay conexión.
   - Es más lento: siempre espera a la red (y a su timeout si es lenta).
   - Sin conexión solo funciona para lo que ya está en cache
     (precacheado en install o visitado antes).
   Se cambia CACHE_NAME a 'mi-pwa-v2' para que el evento activate borre
   el cache viejo 'mi-pwa-v1' de la versión Cache-First.
   ===================================================================== */

const CACHE_NAME = 'mi-pwa-v2';

const ARCHIVOS_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// INSTALL: igual que en Cache-First, deja una copia base para offline.
// skipWaiting() activa la nueva versión sin esperar a cerrar las pestañas.
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando (Network-First)...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Guardando archivos en cache');
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
});

// ACTIVATE: borra caches viejos (aquí elimina 'mi-pwa-v1') y toma el
// control de las páginas abiertas con clients.claim().
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando (Network-First)...');
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres.filter(n => n !== CACHE_NAME).map((n) => {
          console.log('[SW] Borrando cache viejo:', n);
          return caches.delete(n);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Network-First
self.addEventListener('fetch', (event) => {
  // Solo se cachean peticiones GET (POST/PUT no se pueden guardar en cache)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((respuestaRed) => {
        // 1. Hay red: se guarda una copia actualizada en el cache.
        //    clone() porque una respuesta solo se puede leer una vez.
        const copia = respuestaRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        console.log('[SW] Desde la red:', event.request.url);
        return respuestaRed;
      })
      .catch(() => {
        // 2. No hay red: se responde con lo que haya en cache.
        console.log('[SW] Sin red, usando cache:', event.request.url);
        return caches.match(event.request);
      })
  );
});

// EXTENSIÓN: notificaciones push (igual que en la versión 1)
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/index.html'));
});
