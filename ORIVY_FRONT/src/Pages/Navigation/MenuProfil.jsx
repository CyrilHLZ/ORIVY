import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import Icone from '../../Composants/Icone.jsx';
import Avatar from '../../Composants/Avatar.jsx';

/*
 * Menu sous l'avatar (ordinateur) : profil, administration, déconnexion.
 * Motif « bouton qui déplie une liste » : aria-expanded indique l'état,
 * Échap ou un clic ailleurs referme, et le focus revient sur le bouton.
 */
const MenuProfil = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [ouvert, setOuvert] = useState(false);
    const zone = useRef(null);
    const bouton = useRef(null);

    useEffect(() => {
        if (!ouvert) return undefined;
        const clicDehors = (e) => { if (!zone.current.contains(e.target)) setOuvert(false); };
        const echap = (e) => {
            if (e.key === 'Escape') { setOuvert(false); bouton.current.focus(); }
        };
        document.addEventListener('mousedown', clicDehors);
        document.addEventListener('keydown', echap);
        // Nettoyage : on retire les écouteurs quand le menu se ferme
        return () => {
            document.removeEventListener('mousedown', clicDehors);
            document.removeEventListener('keydown', echap);
        };
    }, [ouvert]);

    const deconnexion = () => {
        setOuvert(false);
        logout();
        navigate('/');
    };

    return (
        <div className="menu-profil" ref={zone}>
            <button
                ref={bouton}
                type="button"
                className="entete__profil"
                aria-expanded={ouvert}
                aria-controls="menu-profil-liste"
                aria-label="Ton compte"
                onClick={() => setOuvert(!ouvert)}
            >
                <Avatar personne={user} taille="s" />
            </button>

            {ouvert && (
                <ul className="menu-profil__liste" id="menu-profil-liste">
                    <li>
                        <Link className="bouton bouton--fantome" to="/profil" onClick={() => setOuvert(false)}>
                            <Icone nom="utilisateur" />Mon profil
                        </Link>
                    </li>
                    {isAdmin && (
                        <li>
                            <Link className="bouton bouton--fantome" to="/admin" onClick={() => setOuvert(false)}>
                                <Icone nom="bouclier" />Administration
                            </Link>
                        </li>
                    )}
                    <li>
                        <button className="bouton bouton--fantome" type="button" onClick={deconnexion}>
                            <Icone nom="deconnexion" />Se déconnecter
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default MenuProfil;
