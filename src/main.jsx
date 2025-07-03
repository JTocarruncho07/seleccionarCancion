import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker } from './registerSW'

// Registrar service worker solo para admin
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registrado con éxito:', registration);
      })
      .catch((registrationError) => {
        console.log('SW falló al registrarse:', registrationError);
      });
  });
}

registerServiceWorker(() => {
  if (window.confirm('¡Hay una nueva versión disponible! ¿Actualizar ahora?')) {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)