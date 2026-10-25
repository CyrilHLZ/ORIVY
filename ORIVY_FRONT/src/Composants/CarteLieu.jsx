import { Link } from 'react-router-dom';
import Icone from './Icone.jsx';
import Photo from './Photo.jsx';
import { BadgeCategorie, BadgeDistance } from './Badges.jsx';
import { categorie } from '../Constants/categories.js';

/*
 * <CarteLieu lieu={lieu} km={2.3} lien="/carte?lieu=12" />
 * Photo + texte dessous ; badge de catégorie et distance posés sur la photo.
 *
 * lieu : objet du back { id, nom, categorie, lieu (ville), imageUrl, note?, nombreSorties? }
 * km   : distance (facultative : sans position connue, pas de badge)
 *
 * Toute la carte est cliquable grâce au lien du titre (son ::after la recouvre),
 * mais il n'y a qu'UN arrêt au clavier : le titre.
 */
const CarteLieu = ({ lieu, km, lien }) => {
    const cat = categorie(lieu.categorie);

    return (
        <article className={`carte-lieu cat-${cat.cle}`}>
            <Photo src={lieu.imageUrl || cat.image} alt={lieu.alt ?? ''} cle={cat.cle} />
            <div className="carte-lieu__haut">
                <BadgeCategorie cle={cat.cle} />
                {km != null && <BadgeDistance km={km} />}
            </div>
            <h3 className="carte-lieu__nom">
                <Link to={lien || `/carte?lieu=${lieu.id}`}>{lieu.nom}</Link>
            </h3>
            <p className="carte-lieu__meta">
                {lieu.lieu && <span>{lieu.lieu}</span>}
                {lieu.note != null && (
                    <span>
                        <Icone nom="etoile" />
                        <span className="visuellement-cache">Note : </span>
                        {lieu.note.toFixed(1).replace('.', ',')}
                    </span>
                )}
                {lieu.nombreSorties > 0 && (
                    <span>
                        <Icone nom="calendrier" />
                        {lieu.nombreSorties} sortie{lieu.nombreSorties > 1 ? 's' : ''} prévue{lieu.nombreSorties > 1 ? 's' : ''}
                    </span>
                )}
            </p>
        </article>
    );
};

export default CarteLieu;
