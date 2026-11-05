import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-recover cleanly from stale bundle chunks after a new production deployment
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite Preload] New deployment detected, reloading to fetch latest assets...', event);
  const reloaded = sessionStorage.getItem('chunk_reloaded');
  if (!reloaded) {
    sessionStorage.setItem('chunk_reloaded', 'true');
    window.location.reload();
  }
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Expected a JavaScript-or-Wasm module script')
  ) {
    const reloaded = sessionStorage.getItem('chunk_reloaded');
    if (!reloaded) {
      sessionStorage.setItem('chunk_reloaded', 'true');
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
