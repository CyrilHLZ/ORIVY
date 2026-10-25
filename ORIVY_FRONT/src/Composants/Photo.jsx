import { useState } from 'react';
import Icone from './Icone.jsx';
import { categorie } from '../Constants/categories.js';

/*
 * <Photo src={lieu.imageUrl} alt="…" cle="parc" />
 * Photo arrondie avec un repli : si l'image manque ou ne charge pas, on voit
 * un aplat de la couleur de la catégorie et son icône, jamais un cadre vide.
 *
 * alt : décrire ce qu'on VOIT sur la photo. Si elle est purement décorative, alt="".
 */
const Photo = ({ src, alt = '', cle = 'autre', paresseuse = true, className = '' }) => {
    const [enErreur, setEnErreur] = useState(false);
    const cat = categorie(cle);

    return (
        <div className={`photo cat-${cat.cle} ${className}`}>
            <Icone nom={`cat-${cat.cle}`} />
            {src && !enErreur && (
                <img
                    src={src}
                    alt={alt}
                    loading={paresseuse ? 'lazy' : 'eager'}   // chargée seulement quand elle approche de l'écran
                    onError={() => setEnErreur(true)}
                />
            )}
        </div>
    );
};

export default Photo;
