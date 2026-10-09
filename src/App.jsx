/* =========================================================
   ¡Hala Madrid! — application React (routes, mise en page commune)
   ========================================================= */
import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AdminBar, CartDrawer, Footer, Header, Modal, Toast } from './components/Layout.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import News from './pages/News.jsx';
import NotFound from './pages/NotFound.jsx';
import Product from './pages/Product.jsx';
import Shop from './pages/Shop.jsx';
import Team from './pages/Team.jsx';

const TITLES = { accueil: '¡Hala Madrid!', equipes: 'Équipes', actualites: 'Actualités', boutique: 'Boutique', contact: 'Contact', connexion: 'Espace admin' };

export default function App() {
  const { pathname } = useLocation();
  const main = useRef(null);
  const firstRender = useRef(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const section = pathname.split('/')[1] || 'accueil';

  // À chaque changement de page : titre, retour en haut, focus sur le contenu, menu mobile refermé
  useEffect(() => {
    document.title = `${TITLES[section] || 'Page introuvable'} · Real Madrid, site de supporters`;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!firstRender.current) main.current.focus({ preventScroll: true });
    firstRender.current = false;
    setMenuOpen(false);
  }, [pathname, section]);

  return (
    <>
      <a className="skip-link" href="#app" onClick={(e) => { e.preventDefault(); main.current.focus(); }}>Aller au contenu</a>
      <Header section={section} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AdminBar />
      <main id="app" tabIndex={-1} ref={main}>
        {/* La clé recrée la page à chaque navigation : animation d'entrée et filtres remis à zéro */}
        <div className="page" key={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipes" element={<Team />} />
            <Route path="/equipes/:teamId" element={<Team />} />
            <Route path="/actualites" element={<News />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/boutique/:productId" element={<Product />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <Modal />
      <Toast />
    </>
  );
}
