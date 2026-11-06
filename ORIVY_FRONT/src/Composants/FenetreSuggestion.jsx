import { useEffect, useRef, useState } from 'react';
import { suggerer } from '../Services/Suggestion/SuggestionService.js';
import { LISTE_CATEGORIES } from '../Constants/categories.js';
import Bouton from './Bouton.jsx';
import Icone from './Icone.jsx';
import { Champ, Interrupteur } from './Formulaire.jsx';

/*
 * <FenetreSuggestion ouverte={…} centre={{ lat, lng }} onFermer={…} onEnvoye={…} />
 * Bouton « Suggérer » de la carte. Deux sortes de suggestions :
 *   - « Un lieu à ajouter » : nom, catégorie, adresse (ou ville), et un mot facultatif ;
 *     si le membre a centré la carte sur le lieu, il peut joindre ce point (centre) ;
 *   - « Une idée » : un message libre.
 * L'admin les retrouve dans sa page, section « Suggestions à traiter ».
 */
const VIDE = { type: 'lieu', nomLieu: '', categorie: '', adresse: '', message: '', avecCentre: false };

const FenetreSuggestion = ({ ouverte, centre, onFermer, onEnvoye }) => {
    const dialogue = useRef(null);
    const [form, setForm] = useState(VIDE);
    const [erreurs, setErreurs] = useState({});
    const [erreurEnvoi, setErreurEnvoi] = useState(null);
    const [enCours, setEnCours] = useState(false);

    useEffect(() => {
        const d = dialogue.current;
        if (ouverte && !d.open) { setForm(VIDE); setErreurs({}); setErreurEnvoi(null); d.showModal(); }
        if (!ouverte && d.open) d.close();
    }, [ouverte]);

    const changer = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const lieu = form.type === 'lieu';

    const envoyer = async (event) => {
        event.preventDefault();
        const manque = {};
        if (lieu && !form.nomLieu.trim()) manque.nomLieu = 'Comment s\'appelle ce lieu ?';
        if (lieu && !form.adresse.trim()) manque.adresse = 'Donne son adresse, ou au moins sa ville.';
        if (!lieu && !form.message.trim()) manque.message = 'Écris ton idée en quelques mots.';
        setErreurs(manque);
        if (Object.keys(manque).length) return;

        setEnCours(true);
        setErreurEnvoi(null);
        try {
            await suggerer(lieu
                ? {
                    type: 'lieu', nomLieu: form.nomLieu.trim(), categorie: form.categorie || null, adresse: form.adresse.trim(),
                    message: form.message.trim() || null,
                    latitude: form.avecCentre && centre ? centre.lat : null,
                    longitude: form.avecCentre && centre ? centre.lng : null,
                }
                : { type: 'idee', message: form.message.trim() });
            onEnvoye(lieu ? 'Merci ! On regarde ce lieu et on l\'ajoute s\'il est ouvert au public.' : 'Merci pour ton idée !');
        } catch (e) {
            setErreurEnvoi(e.message || "La suggestion n'a pas pu partir. Réessaie dans un instant.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <dialog className="fenetre fenetre--suggestion" ref={dialogue} aria-labelledby="t-suggestion" onCancel={onFermer}>
            <h2 id="t-suggestion">Une suggestion ?</h2>
            <form className="formulaire" onSubmit={envoyer} noValidate style={{ gap: 'var(--espace-3)' }}>
                <fieldset className="choix-suggestion">
                    <legend className="visuellement-cache">Ta suggestion concerne</legend>
                    {[['lieu', 'Un lieu à ajouter'], ['idee', 'Une idée pour ORIVY']].map(([valeur, texte]) => (
                        <label key={valeur} className="puce">
                            <input type="radio" name="type-suggestion" className="visuellement-cache" value={valeur}
                                   checked={form.type === valeur} onChange={changer('type')} />
                            {texte}
                        </label>
                    ))}
                </fieldset>

                {lieu && (
                    <>
                        <Champ label="Nom du lieu" required maxLength={255} value={form.nomLieu} onChange={changer('nomLieu')}
                               erreur={erreurs.nomLieu} placeholder="Ex. : Le Café des Arts" />
                        <div className="champ">
                            <label className="champ__label" htmlFor="suggestion-categorie">Catégorie</label>
                            <select id="suggestion-categorie" className="champ__saisie" value={form.categorie} onChange={changer('categorie')}>
                                <option value="">Je ne sais pas</option>
                                {LISTE_CATEGORIES.filter((c) => c.cle !== 'autre').map((c) => (
                                    <option key={c.cle} value={c.cle}>{c.emoji} {c.nom}</option>
                                ))}
                            </select>
                        </div>
                        <Champ label="Adresse ou ville" required maxLength={255} value={form.adresse} onChange={changer('adresse')}
                               erreur={erreurs.adresse} placeholder="Ex. : 12 rue de la Paix, Nantes" />
                        {centre && (
                            <Interrupteur label="Le lieu est au centre de la carte" checked={form.avecCentre} onChange={changer('avecCentre')}
                                          detail="On joint ce point à ta demande : l'ajout sera plus rapide." />
                        )}
                    </>
                )}
                <Champ label={lieu ? 'Un mot pour nous (facultatif)' : 'Ton idée'} multiligne rows={4} maxLength={1000}
                       value={form.message} onChange={changer('message')} erreur={erreurs.message}
                       aide={lieu ? 'Pourquoi ce lieu vaut le détour, ses horaires…' : 'Une catégorie qui manque, une fonction, une remarque…'} />

                {erreurEnvoi && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreurEnvoi}</p>}
                <div className="fenetre__actions" style={{ marginTop: 0 }}>
                    <Bouton variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                    <Bouton type="submit" icone="envoyer" disabled={enCours} aria-busy={enCours}>Envoyer</Bouton>
                </div>
            </form>
        </dialog>
    );
};

export default FenetreSuggestion;
