import Icone from './Icone.jsx';
import { categorie } from '../Constants/categories.js';
import { formaterDistance } from '../Utils/proximite.js';
import Compteur from './Compteur.jsx';

/*
 * <BadgeCategorie cle="parc" />
 * Pastille de la couleur de la catégorie, avec son icône ET son nom :
 * l'information ne passe jamais par la couleur seule (accessibilité).
 * La couleur vient de la classe cat-parc (composants.css), qui suit le thème de nuit.
 */
export const BadgeCategorie = ({ cle }) => {
    const cat = categorie(cle);
    return (
        <span className={`badge-cat cat-${cat.cle}`}>
            <Icone nom={`cat-${cat.cle}`} />
            {cat.nom}
        </span>
    );
};

/* <BadgeDistance km={2.3} /> → « à 2,3 km » ; (68) le nombre défile de 0 à la distance */
export const BadgeDistance = ({ km }) => (
    <span className="badge-distance">
        <Icone nom="autour" />
        <Compteur valeur={km} duree={800} format={(n) => formaterDistance(Math.max(n, 0.05))} />
    </span>
);
