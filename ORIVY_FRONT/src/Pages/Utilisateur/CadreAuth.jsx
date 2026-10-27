import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PhotoAnimee from '../Accueil/PhotoAnimee.jsx';
import { FONDS_AUTH } from '../EcransAccueil.js';
import Compteur from '../../Composants/Compteur.jsx';
import { useLieux } from '../../Hooks/useLieux.js';

/*
 * Cadre commun à la connexion et à l'inscription (piste A, 2026-10-25) :
 *   - une photo animée en plein écran, comme les écrans de l'accueil (FONDS_AUTH) ;
 *     connexion = la guinguette du bord de mer, inscription = l'ami qui rejoint la bande ;
 *   - le formulaire dans une carte en verre dépoli, à droite sur ordinateur ;
 *   - deux onglets (de vrais liens : /connexion et /inscription) ;
 *   - pas de barre d'onglets du bas avant d'être connecté.
 */
const CadreAuth = ({ children }) => {
    const { pathname } = useLocation();
    const { lieux } = useLieux();
    const photo = FONDS_AUTH[pathname] ?? FONDS_AUTH['/connexion'];

    // La classe page-auth cache la barre d'onglets du bas (pages.css)
    useEffect(() => {
        document.body.classList.add('page-auth');
        return () => document.body.classList.remove('page-auth');
    }, []);

    const onglet = (chemin, texte) => (
        <Link to={chemin} aria-current={pathname === chemin ? 'page' : undefined}>{texte}</Link>
    );

    return (
        <main className="auth">
            {/* key : on change de photo en passant d'un onglet à l'autre, les effets repartent de zéro */}
            <PhotoAnimee key={pathname} className="auth__photo" src={photo.fond} ratio={photo.ratio}
                         cadrage={photo.cadrage} effets={photo.effets} chargement="eager" />

            <p className="auth__signature" aria-hidden="true">
                Découvre. Vis. Profite.
                <small>
                    {lieux.length > 0 ? <><Compteur valeur={lieux.length} /> lieux à explorer, partout en France.</> : 'Des lieux à explorer, partout en France.'}
                </small>
            </p>

            <div className="auth__carte">
                <nav className="onglets-section" aria-label="Connexion ou inscription">
                    {onglet('/connexion', 'Connexion')}
                    {onglet('/inscription', 'Inscription')}
                </nav>
                {children}
            </div>
        </main>
    );
};

export default CadreAuth;
