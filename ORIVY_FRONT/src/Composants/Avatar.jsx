/*
 * <Avatar personne={{ prenom: 'Inès', nom: 'Nakamura' }} taille="l" />
 * Rond avec les initiales (pas de photo de profil pour l'instant).
 *
 * taille : "s" (32px) | défaut (44px) | "l" (64px) | "xl" (96px)
 * La couleur de fond est choisie d'après le nom : la même personne a
 * toujours la même couleur, sans rien stocker.
 */
const COULEURS = ['a', 'b', 'c', 'd', 'e'];

export const initialesDe = (personne) => {
    if (!personne) return '?';
    const texte = [personne.prenom, personne.nom].filter(Boolean).map((mot) => mot[0]).join('');
    return (texte || personne.email?.[0] || '?').toUpperCase();
};

/* Petit calcul : on additionne les codes des lettres pour piocher une couleur */
const couleurDe = (texte) => COULEURS[[...texte].reduce((somme, c) => somme + c.charCodeAt(0), 0) % COULEURS.length];

const Avatar = ({ personne, taille, className = '' }) => {
    const initiales = initialesDe(personne);
    const classes = ['avatar', taille && `avatar--${taille}`, `avatar--${couleurDe(initiales)}`, className].filter(Boolean).join(' ');
    // Décoratif : le nom de la personne est toujours écrit à côté, ou dans un aria-label du parent
    return <span className={classes} aria-hidden="true">{initiales}</span>;
};

/*
 * <PileAvatars personnes={inscrits} total={8} />
 * Les 3 premiers avatars qui se chevauchent, puis « +5 ».
 */
export const PileAvatars = ({ personnes = [], total = personnes.length, max = 3 }) => (
    <div className="pile-avatars" aria-label={`${total} inscrit${total > 1 ? 's' : ''}`}>
        {personnes.slice(0, max).map((p, i) => <Avatar key={p.id ?? i} personne={p} taille="s" />)}
        {total > max && <span className="pile-avatars__reste" aria-hidden="true">+{total - max}</span>}
    </div>
);

export default Avatar;
