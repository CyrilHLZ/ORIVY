import { useEffect, useRef, useState } from 'react';
import { signaler } from '../Services/Signalement/SignalementService.js';
import Bouton from './Bouton.jsx';
import { Champ } from './Formulaire.jsx';

/*
 * <FenetreSignalement ouverte={…} cibleType="membre" cibleId={12} nom="Inès" onFermer={…} onEnvoye={…} />
 * Le membre explique ce qui ne va pas ; l'admin le verra dans « Signalements à traiter ».
 */
const FenetreSignalement = ({ ouverte, cibleType, cibleId, nom, onFermer, onEnvoye }) => {
    const dialogue = useRef(null);
    const [motif, setMotif] = useState('');
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);

    useEffect(() => {
        const d = dialogue.current;
        if (ouverte && !d.open) { setMotif(''); setErreur(null); d.showModal(); }
        if (!ouverte && d.open) d.close();
    }, [ouverte]);

    const envoyer = async (event) => {
        event.preventDefault();
        if (!motif.trim()) { setErreur('Explique en quelques mots ce qui ne va pas.'); return; }
        setEnCours(true);
        try {
            await signaler(cibleType, cibleId, motif.trim());
            onEnvoye();
        } catch (e) {
            setErreur(e.message || "Le signalement n'a pas pu partir.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <dialog className="fenetre" ref={dialogue} aria-labelledby="t-signalement" onCancel={onFermer}>
            <h2 id="t-signalement">Signaler {nom}</h2>
            <form className="formulaire" onSubmit={envoyer} noValidate style={{ gap: 'var(--espace-3)' }}>
                <Champ label="Qu'est-ce qui ne va pas ?" multiligne rows={4} maxLength={500} value={motif}
                       onChange={(e) => setMotif(e.target.value)} erreur={erreur}
                       aide="Ton signalement reste anonyme : seule l'équipe ORIVY le lit." />
                <div className="fenetre__actions" style={{ marginTop: 0 }}>
                    <Bouton variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                    <Bouton type="submit" icone="drapeau" disabled={enCours} aria-busy={enCours}>Envoyer</Bouton>
                </div>
            </form>
        </dialog>
    );
};

export default FenetreSignalement;
