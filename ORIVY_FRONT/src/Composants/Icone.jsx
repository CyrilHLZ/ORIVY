import { ICONES } from './icones.js';

/*
 * <Icone nom="carte" />
 * Affiche une icône du style Lucide. Elle prend la couleur du texte autour
 * (currentColor) : pour la colorer, on change la couleur du parent.
 *
 * Props :
 *   nom       : clé dans ICONES (ex. "carte", "cat-parc")
 *   taille    : "petite" (16px), "grande" (32px), sinon 24px par défaut
 *   className : classes en plus (ex. pour la colorer)
 *
 * Accessibilité : l'icône est décorative (aria-hidden). Si elle est seule
 * dans un bouton, c'est le BOUTON qui porte aria-label="…".
 */
const Icone = ({ nom, taille, className = '' }) => {
    const dessin = ICONES[nom];

    // Nom inconnu : on prévient pendant le développement, sans faire planter la page
    if (!dessin) {
        if (import.meta.env.DEV) console.warn(`Icône inconnue : « ${nom} »`);
        return null;
    }

    const classes = ['icone', taille && `icone--${taille}`, className].filter(Boolean).join(' ');

    return (
        <svg
            className={classes}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            // Le dessin vient de notre propre fichier icones.js, jamais d'un utilisateur : sans danger
            dangerouslySetInnerHTML={{ __html: dessin }}
        />
    );
};

export default Icone;
