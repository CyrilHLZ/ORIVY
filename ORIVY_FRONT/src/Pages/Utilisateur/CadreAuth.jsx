import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Vite transforme cet import en adresse du fichier (avec un nom unique au build)
import carteTresor from '../../Style/illustrations/carte-tresor.svg';

/*
 * Cadre commun à la connexion et à l'inscription (maquette design/maquettes/auth.html) :
 *   - sur ordinateur, la carte au trésor et la signature occupent la moitié gauche ;
 *   - deux onglets (de vrais liens : /connexion et /inscription) ;
 *   - pas de barre d'onglets du bas avant d'être connecté.
 */
const CadreAuth = ({ children }) => {
    const { pathname } = useLocation();

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
            <div className="auth__illu" aria-hidden="true">
                <img src={carteTresor} alt="" />
                <blockquote>
                    Découvre. Vis. Profite.
                    <br />
                    <small style={{ fontFamily: 'var(--police-texte)', fontSize: 'var(--taille-s)', color: 'var(--couleur-texte-doux)' }}>
                        Des lieux à explorer et des sorties à partager, partout en France.
                    </small>
                </blockquote>
            </div>

            <div className="auth__panneau">
                <div className="auth__carte">
                    <nav className="onglets-section" aria-label="Connexion ou inscription" style={{ marginBottom: 'var(--espace-6)' }}>
                        {onglet('/connexion', 'Connexion')}
                        {onglet('/inscription', 'Inscription')}
                    </nav>
                    {children}
                </div>
            </div>
        </main>
    );
};

export default CadreAuth;
