import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../Context/AuthContext.jsx';
import { getConversations, sendMessage } from '../Services/Message/MessageService.js';
import { getFollowing } from '../Services/Social/SocialService.js';
import Avatar from './Avatar.jsx';
import Bouton from './Bouton.jsx';

/*
 * <FenetreEnvoi ouverte={…} sortie={sortie} onFermer={…} onEnvoye={(nom) => …} />
 * « Envoyer à… » : choisir un membre (mes conversations + les gens que je suis) et lui
 * envoyer la sortie en message. Le lien dans le texte devient une carte dans Messages (CartePartagee).
 */
const nomDe = (p) => [p?.prenom, p?.nom].filter(Boolean).join(' ') || 'Membre';

const FenetreEnvoi = ({ ouverte, sortie, onFermer, onEnvoye }) => {
    const { user } = useAuth();
    const dialogue = useRef(null);
    const [contacts, setContacts] = useState(null);   // null = chargement
    const [envoiA, setEnvoiA] = useState(null);       // id du membre en cours d'envoi
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const d = dialogue.current;
        if (ouverte && !d.open) d.showModal();
        if (!ouverte && d.open) d.close();
        if (!ouverte || !user?.id) return;
        setErreur(null);
        // Conversations d'abord (les plus récentes), puis les abonnements ; chaque membre une seule fois
        Promise.all([getConversations().catch(() => []), getFollowing(user.id).catch(() => [])])
            .then(([conversations, suivis]) => {
                const tous = [...conversations.map((c) => c.membre), ...suivis];
                setContacts(tous.filter((m, i) => tous.findIndex((x) => x.id === m.id) === i));
            });
    }, [ouverte, user?.id]);

    const envoyer = async (membre) => {
        setEnvoiA(membre.id);
        try {
            await sendMessage(membre.id, `Regarde cette sortie : ${window.location.origin}/sorties/${sortie.id}`);
            onEnvoye(membre.prenom || nomDe(membre));
        } catch (e) {
            setErreur(e.message || "Le message n'a pas pu partir.");
        } finally {
            setEnvoiA(null);
        }
    };

    return (
        <dialog className="fenetre" ref={dialogue} aria-labelledby="t-envoi" onCancel={onFermer}>
            <h2 id="t-envoi">Envoyer « {sortie?.nom} »</h2>
            {contacts === null && <p aria-busy="true">Chargement…</p>}
            {contacts?.length === 0 && (
                <p className="texte-doux">Tu n'as encore personne à qui écrire : abonne-toi à des membres depuis la Communauté.</p>
            )}
            {contacts?.length > 0 && (
                <ul className="liste-envoi">
                    {contacts.map((m) => (
                        <li key={m.id}>
                            <Avatar personne={m} taille="s" />
                            <span>{nomDe(m)}</span>
                            <Bouton variante="secondaire" pilule icone="envoyer" disabled={envoiA !== null} aria-busy={envoiA === m.id}
                                    aria-label={`Envoyer à ${nomDe(m)}`} onClick={() => envoyer(m)}>
                                Envoyer
                            </Bouton>
                        </li>
                    ))}
                </ul>
            )}
            {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
            <div className="fenetre__actions">
                <Bouton variante="secondaire" onClick={onFermer}>Fermer</Bouton>
            </div>
        </dialog>
    );
};

export default FenetreEnvoi;
