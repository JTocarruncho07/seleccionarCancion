export function registerServiceWorker(onUpdate) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                onUpdate && onUpdate();
              }
            }
          };
        };
      });
    });
  }
} 