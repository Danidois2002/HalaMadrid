import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { SiteProvider } from './state/SiteContext.jsx';
import './styles.css';

// Le navigateur ne doit pas restaurer la position de défilement : chaque page repart du haut
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

// HashRouter : adresses en #/… comme avant (GitHub Pages ne sait pas servir les routes côté serveur)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <SiteProvider>
        <App />
      </SiteProvider>
    </HashRouter>
  </StrictMode>,
);
