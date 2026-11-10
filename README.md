# Agenda UMB – PWA en la nube (Grupo 7)

Lista de tareas que funciona sin conexión gracias a un Service Worker. Se creó en el Lab 5
(Service Worker) y en el Lab 7 (Cloud Computing) se publica en **Vercel**, un PaaS gratuito.

**Nuevas Tecnologías del Desarrollo · Universidad Manuela Beltrán**
Julián Lozano Ríos · Miguel Ángel Jara · Víctor Alfonso Alarcón O.

## Estructura

```
index.html          Página principal
styles.css          Estilos
app.js              Lógica de tareas + registro del Service Worker
manifest.json       Manifiesto de la PWA
icons/              Iconos 192x192 y 512x512
service-worker.js   Service Worker activo (versión Network-First)
sw-versiones/
  service-worker-cache-first.js     Versión 1: Cache-First (comentada)
  service-worker-network-first.js   Versión 2: Network-First (comentada)
```

## Despliegue en la nube (Lab 7)

La app es estática: no necesita servidor propio ni compilación. Vercel la publica tal como está.

1. El código vive en este repositorio de GitHub.
2. En Vercel: **Add New Project** → importar este repositorio → **Deploy**, con las opciones por defecto.
3. Cada `git push` a la rama `main` genera un despliegue nuevo de forma automática.

Vercel sirve el sitio con HTTPS, que es obligatorio para que el Service Worker funcione en internet.

## Cómo ejecutarlo en el equipo

1. Abrir la carpeta en VS Code y usar **Live Server** (puerto 5500), o en una terminal: `npx http-server -p 5500 -c-1`.
2. Abrir `http://localhost:5500` en Chrome (el Service Worker solo funciona en `localhost` o con HTTPS).
3. DevTools (F12) > Application > Service workers / Cache storage.

## Cambiar de estrategia

Copiar el archivo deseado de `sw-versiones/` sobre `service-worker.js` y recargar.
Cada versión usa un nombre de cache distinto (`mi-pwa-v1` / `mi-pwa-v2`), así el evento
`activate` borra el cache de la otra versión.
