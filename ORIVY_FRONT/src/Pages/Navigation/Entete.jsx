import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import Icone from '../../Composants/Icone.jsx';
import Logo from '../../Composants/Logo.jsx';
import MenuProfil from './MenuProfil.jsx';
import { ONGLETS, estActif } from './navigation.js';

/*
 * En-tête de toutes les pages (classe .entete de composants.css).
 * Mobile : logo + loupe + cloche (les onglets sont en bas, voir BarreOnglets).
 * Ordinateur (≥ 1024px) : les onglets passent ici, et le profil devient l'avatar.
 *
 * nonLues : nombre de notifications non lues. Pas encore branché (le back n'a
 * pas de modèle Notification) : la pastille ne s'affiche que s'il est > 0.
 */
const Entete = ({ nonLues = 0 }) => {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    return (
        <header className="entete">
            <div className="entete__interieur">
                {/* Décoration de saison (citrouille, flocons…) : décorative, ne bloque aucun clic */}
                <span className="deco-coin" aria-hidden="true" />

                <Link className="entete__logo" to="/" aria-label="ORIVY, retour à l'accueil">
                    <Logo />
                    <span className="deco-mini" aria-hidden="true" />
                </Link>

                {/* Visible seulement sur ordinateur (CSS) */}
                <nav className="entete__nav" aria-label="Navigation principale">
                    {ONGLETS.map((onglet) => (
                        <Link key={onglet.lien} to={onglet.lien} viewTransition aria-current={estActif(onglet, pathname) ? 'page' : undefined}>
                            <Icone nom={onglet.icone} />{onglet.nom}
                        </Link>
                    ))}
                </nav>

                <div className="entete__actions">
                    <NavLink className="bouton bouton--icone" to="/communaute" aria-label="Communauté : trouver des profils">
                        <Icone nom="loupe" />
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink
                                className="bouton bouton--icone"
                                to="/notifications"
                                aria-label={nonLues > 0 ? `Notifications, ${nonLues} non lues` : 'Notifications'}
                            >
                                <Icone nom="cloche" />
                                {nonLues > 0 && <span className="pastille" aria-hidden="true">{nonLues}</span>}
                            </NavLink>
                            <MenuProfil />
                        </>
                    ) : (
                        <Link className="bouton bouton--secondaire bouton--pilule entete__connexion" to="/connexion">
                            Connexion
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Entete;
