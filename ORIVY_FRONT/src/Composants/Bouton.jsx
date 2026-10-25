import { Link } from 'react-router-dom';
import Icone from './Icone.jsx';

/*
 * <Bouton variante="principal" icone="plus">Crée une sortie</Bouton>
 *
 * variante : "principal" | "secondaire" | "danger" | "danger-plein" | "fantome"
 *            (danger = TOUJOURS en contour ; danger-plein = seulement dans une fenêtre de confirmation)
 * icone    : nom d'icône affichée avant le texte
 * pilule   : coins entièrement arrondis    bloc : toute la largeur
 * vers     : si présent, le bouton devient un lien interne (<Link to=…>)
 * Les autres props (onClick, type, disabled, aria-…) passent telles quelles.
 */
const Bouton = ({ variante = 'principal', icone, pilule, bloc, vers, className = '', children, ...autres }) => {
    const classes = [
        'bouton',
        `bouton--${variante}`,
        pilule && 'bouton--pilule',
        bloc && 'bouton--bloc',
        className,
    ].filter(Boolean).join(' ');

    const contenu = <>{icone && <Icone nom={icone} />}{children}</>;

    // viewTransition : fondu doux vers la page suivante (86), si le navigateur sait le faire
    if (vers) return <Link className={classes} to={vers} viewTransition {...autres}>{contenu}</Link>;
    // type="button" par défaut : sinon, dans un <form>, un bouton envoie le formulaire
    return <button className={classes} type="button" {...autres}>{contenu}</button>;
};

/*
 * <BoutonIcone icone="partager" label="Partager la sortie" />
 * Bouton rond avec une icône seule : le label est OBLIGATOIRE (lu par les lecteurs d'écran).
 */
export const BoutonIcone = ({ icone, label, flottant, className = '', ...autres }) => (
    <button
        className={['bouton', 'bouton--icone', flottant && 'bouton--flottant', className].filter(Boolean).join(' ')}
        type="button"
        aria-label={label}
        {...autres}
    >
        <Icone nom={icone} />
    </button>
);

export default Bouton;
