// Thème horaire et saison : à importer EN PREMIER, pour poser data-theme
// et data-saison sur <html> avant que React n'affiche quoi que ce soit.
import './Style/themes.js';
import './Style/saisons.js';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Feuilles du design, dans cet ordre : chacune redéfinit des variables de la précédente.
import './Style/design-system.css';
import './Style/themes.css';
import './Style/saisons.css';
import './Style/composants.css';
// Mise en page propre à chaque écran (carte, sorties, profil…) et à l'accueil
import './Style/pages.css';
import './Style/accueil.css';
// Les 100 animations (photos, saisons, interface, pages) : après tout le reste
import './Style/animations.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
