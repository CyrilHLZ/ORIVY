import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import Icone from '../../Composants/Icone.jsx';
import { ONGLETS, estActif } from './navigation.js';

/*
 * Barre d'onglets en bas de l'écran (mobile et tablette, cachée ≥ 1024px par le CSS).
 * 5 onglets au pouce : les 4 de navigation.js + Profil (ou Connexion si déconnecté).
 */
const BarreOnglets = () => {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    // La classe avec-onglets laisse de la place en bas de page pour la barre fixe
    useEffect(() => {
        document.body.classList.add('avec-onglets');
        return () => document.body.classList.remove('avec-onglets');
    }, []);

    const profil = isAuthenticated
        ? { nom: 'Profil', icone: 'utilisateur', lien: '/profil', chemins: ['/profil', '/admin'] }
        : { nom: 'Connexion', icone: 'utilisateur', lien: '/connexion', chemins: ['/connexion', '/inscription'] };

    return (
        <nav className="onglets" aria-label="Navigation principale">
            {[...ONGLETS, profil].map((onglet) => (
                <Link key={onglet.lien} to={onglet.lien} viewTransition aria-current={estActif(onglet, pathname) ? 'page' : undefined}>
                    <Icone nom={onglet.icone} />
                    <span>{onglet.nom}</span>
                </Link>
            ))}
        </nav>
    );
};

export default BarreOnglets;
