const CACHE_NAME = 'solicitar-cancion-v1';
const urlsToCache = [
  '/',
  '/icon.svg',
  '/manifest.json',
  '/musica.png',
  '/vite.svg'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Estrategia de cache: cache first, fallback a red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Notificaciones push (opcional, si usas esta lógica)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NUEVA_CANCION') {
    const { cancion, artista } = event.data;
    self.registration.showNotification('🎵 Nueva solicitud de canción', {
      body: `${cancion} - ${artista}`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'nueva-cancion',
      requireInteraction: true,
      actions: [
        {
          action: 'ver',
          title: 'Ver solicitudes'
        }
      ]
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'ver') {
    event.waitUntil(
      self.clients.openWindow('/admin')
    );
  }
});

// Activación y limpieza de caches viejos
self.addEventListener('activate', (event) => {
  self.clients.claim();
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
});