import Icone from './Icone.jsx';
import Bouton from './Bouton.jsx';

/*
 * Les trois états d'une liste qui charge depuis l'API :
 *   chargement → <Chargement />, erreur → <EtatErreur />, rien → <EtatVide />
 */

/*
 * <EtatVide icone="calendrier" titre="Aucune sortie par ici">Et si tu lançais la première ?</EtatVide>
 * La décoration de saison (citrouille, flocons…) s'affiche au-dessus ;
 * si l'utilisateur a coupé les décorations, c'est l'icône qui la remplace (CSS).
 */
export const EtatVide = ({ icone = 'info', titre, children, action }) => (
    <div className="etat">
        <span className="deco-vide" aria-hidden="true" />
        <span className="etat__icone" aria-hidden="true"><Icone nom={icone} taille="grande" /></span>
        <h3>{titre}</h3>
        {children && <p>{children}</p>}
        {action}
    </div>
);

/* <EtatErreur message="…" onReessayer={recharger} /> */
export const EtatErreur = ({ titre = 'Oups, ça ne charge pas', message, onReessayer }) => (
    <div className="etat etat--erreur" role="alert">
        <span className="etat__icone" aria-hidden="true"><Icone nom="alerte" taille="grande" /></span>
        <h3>{titre}</h3>
        <p>{message || 'Vérifie ta connexion, puis réessaie.'}</p>
        {onReessayer && <Bouton variante="secondaire" icone="rafraichir" onClick={onReessayer}>Réessaie</Bouton>}
    </div>
);

/*
 * <Chargement nombre={3} />
 * Squelettes de cartes qui « respirent » (opacité seulement) pendant le chargement.
 * aria-busy prévient les lecteurs d'écran que le contenu arrive.
 */
export const Chargement = ({ nombre = 3, label = 'Chargement…' }) => (
    <>
    {/* (92) L'épingle ORIVY rebondit pendant l'attente */}
    <div className="epingle-attente" aria-hidden="true"><i /></div>
    <div className="grille-lieux" aria-busy="true" aria-label={label}>
        {Array.from({ length: nombre }, (_, i) => (
            <div key={i}>
                <div className="squelette squelette--photo" />
                <div className="squelette squelette--ligne" style={{ marginTop: 'var(--espace-3)' }} />
                <div className="squelette squelette--ligne squelette--court" style={{ marginTop: 'var(--espace-2)' }} />
            </div>
        ))}
    </div>
    </>
);
