import { useState } from 'react';
import Icone from './Icone.jsx';
import { categorie } from '../Constants/categories.js';

/*
 * <Photo src={lieu.imageUrl} alt="…" cle="parc" />
 * Photo OU petite vidéo (adresse en .mp4, .webm, .mov) : la vidéo joue en boucle, sans le son.
 * Photo arrondie avec un repli : si l'image manque ou ne charge pas, on voit
 * un aplat de la couleur de la catégorie et son icône, jamais un cadre vide.
 *
 * alt : décrire ce qu'on VOIT sur la photo. Si elle est purement décorative, alt="".
 */
/* Une adresse de vidéo finit par .mp4, .webm ou .mov (le i ignore les majuscules) */
export const estVideo = (src) => /\.(mp4|webm|mov)$/i.test(src ?? '');

// video : à forcer pour un aperçu local (blob:…), dont l'adresse n'a pas d'extension
const Photo = ({ src, alt = '', cle = 'autre', paresseuse = true, className = '', video = estVideo(src) }) => {
    const [enErreur, setEnErreur] = useState(false);
    const cat = categorie(cle);

    return (
        <div className={`photo cat-${cat.cle} ${className}`}>
            <Icone nom={`cat-${cat.cle}`} />
            {src && !enErreur && (video
                // Vidéo : en boucle, sans le son (sinon le navigateur refuse la lecture automatique),
                // lue sur place (playsInline évite le plein écran forcé sur iPhone)
                ? <video src={src} autoPlay muted loop playsInline preload="metadata"
                         aria-label={alt || undefined} aria-hidden={alt ? undefined : true}
                         onError={() => setEnErreur(true)} />
                : <img
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
