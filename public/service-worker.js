const CACHE_NAME = 'solicitar-cancion-v1';
const urlsToCache = [
  '/',
  '/admin',
  '/usuario',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon.svg'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Estrategia de cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Escuchar mensajes para mostrar notificaciones
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

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'ver') {
    event.waitUntil(
      self.clients.openWindow('/admin')
    );
  }
});

// Actualización del service worker
self.addEventListener('activate', (event) => {
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