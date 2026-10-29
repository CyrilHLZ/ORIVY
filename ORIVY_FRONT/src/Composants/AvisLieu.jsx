import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { createCommentaire, getCommentaires, supprimerCommentaire } from '../Services/Commentaire/CommentaireService.js';
import { ilYa } from '../Utils/dates.js';
import Avatar from './Avatar.jsx';
import Bouton from './Bouton.jsx';
import Icone from './Icone.jsx';
import { Champ } from './Formulaire.jsx';

/*
 * <AvisLieu type="point" id={12} onChange={recharger} />
 * Avis d'un lieu = commentaires avec une note (1 à 5). Un seul avis par membre :
 * le back remplace l'ancien s'il en renvoie un. onChange : prévenir la page (moyenne à recalculer).
 */

/* « 4 » → ★★★★☆ (lu « 4 sur 5 » par les lecteurs d'écran) */
export const Etoiles = ({ note }) => (
    <span className="etoiles" role="img" aria-label={`${note} sur 5`}>
        {[1, 2, 3, 4, 5].map((n) => <Icone key={n} nom="etoile" className={n <= note ? 'etoile--pleine' : ''} />)}
    </span>
);

/* Choix de la note : 5 boutons radio cachés derrière des étoiles (clavier : flèches gauche / droite) */
const ChoixNote = ({ valeur, onChange }) => (
    <fieldset className="choix-note">
        <legend className="champ__label">Ta note</legend>
        {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= valeur ? 'etoile--pleine' : ''}>
                <input type="radio" name="note" value={n} checked={valeur === n} onChange={() => onChange(n)}
                       className="visuellement-cache" />
                <Icone nom="etoile" />
                <span className="visuellement-cache">{n} étoile{n > 1 ? 's' : ''}</span>
            </label>
        ))}
    </fieldset>
);

const nomDe = (personne) => [personne?.prenom, personne?.nom].filter(Boolean).join(' ') || 'Un membre';

const AvisLieu = ({ type, id, onChange }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [avis, setAvis] = useState([]);
    const [note, setNote] = useState(0);
    const [texte, setTexte] = useState('');
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);

    // On change de lieu : on recharge ses avis et on pré-remplit avec MON avis s'il existe
    useEffect(() => {
        getCommentaires(type, id)
            .then((liste) => {
                const avecNote = liste.filter((c) => c.note != null);
                setAvis(avecNote);
                const mien = avecNote.find((c) => c.auteur?.id === user?.id);
                setNote(mien?.note ?? 0);
                setTexte(mien?.contenu ?? '');
            })
            .catch(() => setAvis([]));
    }, [type, id, user?.id]);

    const mien = avis.find((c) => c.auteur?.id === user?.id);
    const moyenne = avis.length ? avis.reduce((somme, c) => somme + c.note, 0) / avis.length : null;

    const publier = async (event) => {
        event.preventDefault();
        if (!note) { setErreur('Choisis une note de 1 à 5 étoiles.'); return; }
        if (!texte.trim()) { setErreur('Écris quelques mots sur ce lieu.'); return; }
        setEnCours(true);
        setErreur(null);
        try {
            const enregistre = await createCommentaire({ contenu: texte.trim(), note, cibleType: type, cibleId: id });
            // Le back renvoie le même id s'il a remplacé mon ancien avis
            setAvis((liste) => [enregistre, ...liste.filter((c) => c.id !== enregistre.id)]);
            onChange?.();
        } catch (e) {
            setErreur(e.message || "L'avis n'a pas pu être publié.");
        } finally {
            setEnCours(false);
        }
    };

    const retirer = async (avisId) => {
        try {
            await supprimerCommentaire(avisId);
            setAvis((liste) => liste.filter((c) => c.id !== avisId));
            if (avisId === mien?.id) { setNote(0); setTexte(''); }
            onChange?.();
        } catch (e) {
            setErreur(e.message || "L'avis n'a pas pu être retiré.");
        }
    };

    return (
        <section className="avis-lieu" aria-labelledby="t-avis">
            <h3 id="t-avis">
                Avis {moyenne != null && (
                    <span className="avis-lieu__moyenne">
                        <Etoiles note={Math.round(moyenne)} />
                        {moyenne.toFixed(1).replace('.', ',')} · {avis.length} avis
                    </span>
                )}
            </h3>

            {isAuthenticated ? (
                <form className="formulaire" onSubmit={publier} noValidate style={{ gap: 'var(--espace-3)' }}>
                    <ChoixNote valeur={note} onChange={setNote} />
                    <Champ label={mien ? 'Ton avis (tu peux le modifier)' : 'Ton avis'} multiligne rows={2} maxLength={255}
                           value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Calme, ombragé, parfait pour un pique-nique…" />
                    {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}
                    <Bouton type="submit" variante="secondaire" disabled={enCours} aria-busy={enCours}>
                        {mien ? 'Modifie ton avis' : 'Publie ton avis'}
                    </Bouton>
                </form>
            ) : (
                <p className="texte-doux"><Link to="/connexion">Connecte-toi</Link> pour donner ton avis.</p>
            )}

            {avis.length === 0 && <p className="texte-doux">Pas encore d'avis. Sois le premier !</p>}
            <ul className="commentaires" aria-live="polite">
                {avis.map((c) => (
                    <li className="commentaire" key={c.id}>
                        <Avatar personne={c.auteur ?? {}} taille="s" />
                        <div>
                            <div className="commentaire__bulle">
                                <p className="commentaire__auteur">{nomDe(c.auteur)} <Etoiles note={c.note} /></p>
                                <p className="commentaire__texte" style={{ whiteSpace: 'pre-line' }}>{c.contenu}</p>
                            </div>
                            <div className="commentaire__actions">
                                {c.dateCreation && <span>{ilYa(c.dateCreation)}</span>}
                                {(c.auteur?.id === user?.id || isAdmin) && (
                                    <button type="button" className="bouton bouton--fantome" onClick={() => retirer(c.id)}>Retirer</button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AvisLieu;
