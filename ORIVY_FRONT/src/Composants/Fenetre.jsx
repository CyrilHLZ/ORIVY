import { useEffect, useId, useRef } from 'react';
import Bouton from './Bouton.jsx';

/*
 * <FenetreConfirmation ouverte={…} titre="Supprimer cette sortie ?" texteConfirmer="Oui, supprimer"
 *                      onConfirmer={…} onAnnuler={…}>Les 8 inscrits seront prévenus.</FenetreConfirmation>
 *
 * Utilise la balise <dialog> du navigateur : elle bloque le reste de la page,
 * garde le focus à l'intérieur et se ferme avec Échap, sans librairie.
 * danger : le bouton de confirmation est rouge plein (le SEUL endroit où il l'est).
 */
const FenetreConfirmation = ({ ouverte, titre, children, texteConfirmer = 'Confirmer', texteAnnuler = 'Annuler', danger = true, onConfirmer, onAnnuler }) => {
    const dialogue = useRef(null);
    const idTitre = useId();   // identifiant unique : plusieurs fenêtres peuvent cohabiter dans une page

    // Le dialog s'ouvre/se ferme avec des méthodes, pas avec un attribut : on les appelle quand « ouverte » change
    useEffect(() => {
        const d = dialogue.current;
        if (ouverte && !d.open) d.showModal();
        if (!ouverte && d.open) d.close();
    }, [ouverte]);

    return (
        // onCancel : déclenché par la touche Échap
        <dialog className="fenetre" ref={dialogue} aria-labelledby={idTitre} onCancel={onAnnuler}>
            <h2 id={idTitre}>{titre}</h2>
            {children && <p>{children}</p>}
            <div className="fenetre__actions">
                <Bouton variante="secondaire" onClick={onAnnuler}>{texteAnnuler}</Bouton>
                <Bouton variante={danger ? 'danger-plein' : 'principal'} icone={danger ? 'supprimer' : undefined} onClick={onConfirmer}>
                    {texteConfirmer}
                </Bouton>
            </div>
        </dialog>
    );
};

export default FenetreConfirmation;
