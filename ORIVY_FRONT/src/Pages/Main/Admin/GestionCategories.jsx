import { useState } from 'react';
import { useCategories, useRechargerCategories } from '../../../Context/CategoriesContext.jsx';
import { creerCategorie, modifierCategorie, supprimerCategorie } from '../../../Services/Categorie/CategorieService.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';

/*
 * Admin : créer / modifier / supprimer les catégories.
 * La clé (« parc ») n'est jamais modifiable : les lieux et sorties s'y réfèrent. À la création,
 * le back la fabrique à partir du nom. Après chaque changement, on recharge le contexte pour que
 * toute l'app (filtres, carte, menus) voie la mise à jour tout de suite.
 */
const VIDE = { nom: '', pluriel: '', emoji: '', couleur: '#A34E2C' };

const GestionCategories = () => {
    const categories = useCategories();
    const recharger = useRechargerCategories();
    const [edition, setEdition] = useState(null);     // null = fermé ; {} = ajout ; catégorie = modification
    const [form, setForm] = useState(VIDE);
    const [erreur, setErreur] = useState(null);
    const [aSupprimer, setASupprimer] = useState(null);
    const [message, setMessage] = useState(null);

    const ouvrir = (cat) => {
        setEdition(cat);
        setForm(cat && cat.cle ? { nom: cat.nom, pluriel: cat.pluriel, emoji: cat.emoji || '', couleur: cat.couleur || '#A34E2C' } : VIDE);
        setErreur(null);
    };

    const enregistrer = async (event) => {
        event.preventDefault();
        if (!form.nom.trim()) { setErreur('Donne un nom à la catégorie.'); return; }
        if (!form.pluriel.trim()) { setErreur('Donne le pluriel (ex. « Plages »).'); return; }
        try {
            if (edition.cle) await modifierCategorie(edition.id, { ...edition, ...form });
            else await creerCategorie(form);
            await recharger();
            setEdition(null);
            setMessage(edition.cle ? 'Catégorie modifiée.' : 'Catégorie ajoutée.');
        } catch (e) {
            setErreur(e.message || "L'enregistrement a échoué.");
        }
    };

    const supprimer = async () => {
        try {
            await supprimerCategorie(aSupprimer.id);
            await recharger();
            setMessage('Catégorie supprimée.');
        } catch (e) {
            setMessage(e.message);
        } finally {
            setASupprimer(null);
        }
    };

    return (
        <section className="encart" aria-labelledby="t-categories" style={{ marginBottom: 'var(--espace-6)' }}>
            <div className="section-titre" style={{ marginTop: 0 }}>
                <h2 id="t-categories" style={{ fontSize: 'var(--taille-xl)', margin: 0 }}>Catégories</h2>
                <Bouton icone="plus" onClick={() => ouvrir({})}>Nouvelle catégorie</Bouton>
            </div>

            {/* Formulaire d'ajout / de modification */}
            {edition && (
                <form className="formulaire categorie-form" onSubmit={enregistrer} noValidate style={{ margin: 'var(--espace-3) 0' }}>
                    <div className="deux-champs">
                        <Champ label="Nom (singulier)" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                        <Champ label="Pluriel" value={form.pluriel} onChange={(e) => setForm({ ...form, pluriel: e.target.value })} required />
                    </div>
                    <div className="deux-champs">
                        <Champ label="Emoji" value={form.emoji} maxLength={4} placeholder="🏖️"
                               onChange={(e) => setForm({ ...form, emoji: e.target.value })} aide="Colle un emoji (touche Windows + .)." />
                        <div className="champ">
                            <label className="champ__label" htmlFor="cat-couleur">Couleur</label>
                            <input id="cat-couleur" type="color" className="champ__saisie champ__couleur"
                                   value={form.couleur} onChange={(e) => setForm({ ...form, couleur: e.target.value })} />
                        </div>
                    </div>
                    {edition.cle && <p className="champ__aide">Clé : <code>{edition.cle}</code> (non modifiable).</p>}
                    {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}
                    <div className="ligne-actions">
                        <Bouton type="submit">{edition.cle ? 'Enregistre' : 'Ajoute la catégorie'}</Bouton>
                        <Bouton variante="fantome" onClick={() => setEdition(null)}>Annuler</Bouton>
                    </div>
                </form>
            )}

            <ul className="liste-categories">
                {categories.map((c) => (
                    <li key={c.cle}>
                        <span className="emoji-cat" aria-hidden="true" style={{ fontSize: 'var(--taille-l)' }}>{c.emoji}</span>
                        <span className="pastille-couleur" aria-hidden="true" style={{ background: c.couleur }} />
                        <span style={{ flex: 1 }}><strong>{c.nom}</strong> <span className="texte-doux">· {c.pluriel}</span></span>
                        <button type="button" className="bouton bouton--icone" aria-label={`Modifier ${c.nom}`} onClick={() => ouvrir(c)}>
                            <Icone nom="modifier" />
                        </button>
                        {c.cle !== 'autre' && (
                            <button type="button" className="bouton bouton--icone bouton--danger" aria-label={`Supprimer ${c.nom}`} onClick={() => setASupprimer(c)}>
                                <Icone nom="supprimer" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <FenetreConfirmation ouverte={aSupprimer !== null} titre="Supprimer cette catégorie ?" texteConfirmer="Oui, supprimer"
                                 onConfirmer={supprimer} onAnnuler={() => setASupprimer(null)}>
                « {aSupprimer?.nom} » sera retirée. Les lieux et sorties qui la portaient s'afficheront en « Autre ».
            </FenetreConfirmation>

            {message && <div className="toast" role="status"><Icone nom="valider" />{message}</div>}
        </section>
    );
};

export default GestionCategories;
