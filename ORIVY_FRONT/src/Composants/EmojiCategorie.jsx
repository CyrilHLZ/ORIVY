import { categorie } from '../Constants/categories.js';

/*
 * <EmojiCategorie cle="parc" /> → l'emoji de la catégorie (🌳).
 * Remplace l'ancienne icône SVG : maintenant chaque catégorie a un emoji (modifiable par l'admin).
 * aria-hidden : l'emoji est décoratif, le nom de la catégorie est toujours écrit à côté.
 */
const EmojiCategorie = ({ cle, className = '' }) => (
    <span className={`emoji-cat ${className}`} aria-hidden="true">{categorie(cle).emoji}</span>
);

export default EmojiCategorie;
