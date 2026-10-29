import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { getConversations, getMessages, sendMessage } from '../../Services/Message/MessageService.js';
import { getUserProfile } from '../../Services/Utilisateur/UtilisateurService.js';
import Avatar from '../../Composants/Avatar.jsx';
import Bouton, { BoutonIcone } from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { Chargement, EtatVide } from '../../Composants/Etats.jsx';
import { ilYa } from '../../Utils/dates.js';
import CartePartagee from '../../Composants/CartePartagee.jsx';

const nomDe = (p) => [p?.prenom, p?.nom].filter(Boolean).join(' ') || 'Membre';
const heure = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const MessagesPage = () => {
    const { user } = useAuth();
    const [parametres, setParametres] = useSearchParams();
    const avecId = parametres.get('avec');

    const [conversations, setConversations] = useState(null);   // null = chargement
    const [membre, setMembre] = useState(null);
    const [messages, setMessages] = useState([]);
    const [texte, setTexte] = useState('');
    const [erreur, setErreur] = useState(null);
    const finDuFil = useRef(null);

    const chargerConversations = () => getConversations().then(setConversations).catch(() => setConversations([]));
    useEffect(() => { chargerConversations(); }, []);

    // Ouverture d'une conversation : le fil, et qui est la personne
    useEffect(() => {
        if (!avecId) { setMembre(null); setMessages([]); return undefined; }
        setErreur(null);
        const charger = () => getMessages(avecId).then(setMessages).catch(() => {});
        charger().then(chargerConversations);   // les messages reçus sont maintenant lus
        getUserProfile(avecId).then(setMembre).catch(() => setMembre(null));
        // Nouveaux messages : on regarde toutes les 10 secondes
        const minuteur = setInterval(charger, 10000);
        return () => clearInterval(minuteur);
    }, [avecId]);

    // Toujours voir le dernier message
    useEffect(() => { finDuFil.current?.scrollIntoView({ block: 'end' }); }, [messages]);

    const envoyer = async (event) => {
        event.preventDefault();
        if (!texte.trim()) return;
        try {
            const nouveau = await sendMessage(avecId, texte.trim());
            setMessages((liste) => [...liste, nouveau]);
            setTexte('');
            chargerConversations();
        } catch (e) {
            setErreur(e.message || "Ton message n'a pas pu partir.");
        }
    };

    // Entrée envoie, Maj+Entrée va à la ligne
    const touche = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) envoyer(event);
    };

    if (conversations === null) return <main className="conteneur"><Chargement /></main>;

    return (
        <main className="conteneur" style={{ paddingInline: 0 }}>
            <h1 className="visuellement-cache">Messages</h1>
            <div className={`messagerie${avecId ? ' messagerie--ouverte' : ''}`}>

                {/* Liste des conversations */}
                <section className="liste-conversations" aria-labelledby="t-conversations">
                    <h2 id="t-conversations" style={{ fontSize: 'var(--taille-2xl)', margin: 0, padding: 'var(--espace-4) var(--marge-page) var(--espace-2)' }}>
                        Messages
                    </h2>
                    {conversations.length === 0 ? (
                        <EtatVide icone="messages" titre="Pas encore de message"
                                  action={<Bouton variante="secondaire" icone="utilisateurs" vers="/communaute">Trouve des membres</Bouton>}>
                            Écris à un membre depuis son profil.
                        </EtatVide>
                    ) : (
                        <ul className="conversations">
                            {conversations.map((c) => (
                                <li key={c.membre.id}>
                                    <Link to={`/messages?avec=${c.membre.id}`} className={c.nonLus > 0 ? 'non-lu' : undefined}
                                          aria-current={String(c.membre.id) === avecId ? 'true' : undefined}>
                                        <Avatar personne={c.membre} />
                                        <div style={{ minWidth: 0 }}><strong>{nomDe(c.membre)}</strong><p>{c.dernierMessage}</p></div>
                                        <div>
                                            <time dateTime={c.date}>{ilYa(c.date)}</time>
                                            {c.nonLus > 0 && <><br /><span className="compteur-non-lus" aria-label={`${c.nonLus} non lus`}>{c.nonLus}</span></>}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Conversation ouverte */}
                <section className="conversation" aria-labelledby="t-conv">
                    {avecId ? (
                        <>
                            <header className="conversation__tete">
                                <BoutonIcone icone="retour" label="Retour aux conversations" className="bouton-retour" onClick={() => setParametres({})} />
                                <Avatar personne={membre} taille="s" />
                                <h2 id="t-conv" style={{ fontFamily: 'var(--police-texte)', fontSize: 'var(--taille-m)', margin: 0 }}>
                                    <Link to={`/profil/${avecId}`}>{nomDe(membre)}</Link>
                                </h2>
                            </header>
                            <div className="conversation__fil">
                                {messages.length === 0 && <p className="texte-doux" style={{ textAlign: 'center' }}>Écris le premier message 👋</p>}
                                <ul className="fil-messages" aria-live="polite">
                                    {messages.map((m) => (
                                        <li key={m.id} className={`bulle${m.expediteurId === user?.id ? ' bulle--moi' : ''}`}>
                                            <p style={{ whiteSpace: 'pre-line' }}>{m.contenu}</p>
                                            <CartePartagee texte={m.contenu} />
                                            <span className="bulle__heure">{heure(m.dateEnvoi)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div ref={finDuFil} />
                            </div>
                            <form className="conversation__saisie" onSubmit={envoyer}>
                                {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
                                <div className="saisie-message">
                                    <label className="visuellement-cache" htmlFor="message">Ton message</label>
                                    <textarea id="message" rows={1} maxLength={2000} placeholder="Écris un message…"
                                              value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={touche} required />
                                    <button className="bouton bouton--icone bouton--principal" type="submit" aria-label="Envoyer">
                                        <Icone nom="envoyer" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <EtatVide icone="messages" titre="Choisis une conversation">Ou écris à un membre depuis son profil.</EtatVide>
                    )}
                </section>
            </div>
        </main>
    );
};

export default MessagesPage;
