import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { useFavoris } from '../Context/FavorisContext.jsx';
import Icone from './Icone.jsx';

/*
 * <BoutonFavori type="point" id={12} nom="Parc de la Tête d'Or" />
 * Cœur à cocher : plein = en favori. Déconnecté → page de connexion.
 * flottant : fond blanc et ombre, pour être posé sur une photo.
 */
const BoutonFavori = ({ type, id, nom, flottant = false }) => {
    const { isAuthenticated } = useAuth();
    const { estFavori, basculer } = useFavoris();
    const navigate = useNavigate();
    const actif = estFavori(type, id);

    const cliquer = (event) => {
        event.preventDefault();      // le cœur est souvent DANS une carte cliquable : on n'ouvre pas la page
        event.stopPropagation();
        if (!isAuthenticated) { navigate('/connexion'); return; }
        basculer(type, id);
    };

    return (
        <button type="button"
                className={['bouton', 'bouton--icone', 'bouton-favori', flottant && 'bouton--flottant', actif && 'bouton-favori--actif']
                    .filter(Boolean).join(' ')}
                aria-pressed={actif}
                aria-label={actif ? `Retirer ${nom} des favoris` : `Ajouter ${nom} aux favoris`}
                onClick={cliquer}>
            <Icone nom="coeur" />
        </button>
    );
};

export default BoutonFavori;
