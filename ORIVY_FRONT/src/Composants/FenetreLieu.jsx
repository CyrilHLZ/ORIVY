import { useEffect, useRef, useState } from 'react';
import { createPoint, updatePoint } from '../Services/Carte/CarteService.js';
import { LISTE_CATEGORIES } from '../Constants/categories.js';
import Bouton from './Bouton.jsx';
import Icone from './Icone.jsx';
import { Champ } from './Formulaire.jsx';

/*
 * Fenêtre d'ajout / de modification d'un lieu (point d'intérêt), réservée à l'admin.
 * Utilisée par la page Admin ET par la carte (clic sur la carte → coordonnées pré-remplies).
 *   point = null : fermée · {} : ajout · { latitude, longitude, adresse } : ajout pré-rempli · lieu : modification
 */
// couleur : champ encore présent dans le back, mais plus utilisé par la carte
// (la couleur d'une épingle vient de sa catégorie, dans le CSS). On garde une valeur neutre.
const VIDE = { nom: '', type: 'autre', description: '', adresse: '', latitude: '', longitude: '', imageUrl: '', couleur: '#6B7280' };

/* ---- Fenêtre d'ajout / de modification d'un lieu (balise <dialog>) ---- */
const FenetreLieu = ({ point, onFermer, onEnregistre }) => {
    const dialogue = useRef(null);
    const [form, setForm] = useState(VIDE);
    const [erreurs, setErreurs] = useState({});
    const [erreurEnvoi, setErreurEnvoi] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const ouvert = point !== null;

    // À chaque ouverture : on remplit le formulaire (vide pour un ajout) et on ouvre la fenêtre
    useEffect(() => {
        const d = dialogue.current;
        if (ouvert) {
            // point = {} (ajout vide), { latitude, longitude, adresse } (clic sur la carte) ou un lieu existant
            setForm({ ...VIDE, ...point, latitude: String(point.latitude ?? ''), longitude: String(point.longitude ?? ''),
                description: point.description ?? '', adresse: point.adresse ?? '', imageUrl: point.imageUrl ?? '' });
            setErreurs({});
            setErreurEnvoi(null);
            if (!d.open) d.showModal();
        } else if (d.open) d.close();
    }, [point]); // eslint-disable-line react-hooks/exhaustive-deps

    const changer = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const envoyer = async (event) => {
        event.preventDefault();
        const e = {};
        const lat = Number(form.latitude);
        const lng = Number(form.longitude);
        if (!form.nom.trim()) e.nom = 'Le nom est obligatoire.';
        if (form.latitude === '' || Number.isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Entre -90 et 90 (ex. : 45.7640).';
        if (form.longitude === '' || Number.isNaN(lng) || lng < -180 || lng > 180) e.longitude = 'Entre -180 et 180 (ex. : 4.8357).';
        setErreurs(e);
        if (Object.keys(e).length) return;

        setEnCours(true);
        try {
            const payload = { ...form, nom: form.nom.trim(), latitude: lat, longitude: lng, imageUrl: form.imageUrl || null };
            if (point.id) await updatePoint(point.id, payload);
            else await createPoint(payload);
            onEnregistre(point.id ? 'Lieu modifié.' : 'Lieu ajouté.');
        } catch (err) {
            setErreurEnvoi(err.message || "L'enregistrement a échoué.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <dialog className="fenetre" ref={dialogue} aria-labelledby="t-fenetre-lieu" onCancel={onFermer}
                style={{ width: 'min(100% - 2 * var(--marge-page), calc(var(--espace-9) * 7))' }}>
            <h2 id="t-fenetre-lieu">{point?.id ? 'Modifier le lieu' : 'Ajouter un lieu'}</h2>
            <form className="formulaire" onSubmit={envoyer} noValidate style={{ gap: 'var(--espace-4)' }}>
                <Champ label="Nom" name="nom" value={form.nom} onChange={changer} erreur={erreurs.nom} required />
                <div className="champ">
                    <label className="champ__label" htmlFor="admin-type">Catégorie</label>
                    <select id="admin-type" className="champ__saisie" name="type" value={form.type} onChange={changer}>
                        {LISTE_CATEGORIES.map((c) => <option key={c.cle} value={c.cle}>{c.nom}</option>)}
                    </select>
                </div>
                <Champ label="Adresse" name="adresse" value={form.adresse} onChange={changer} placeholder="Ville ou adresse" />
                <div className="deux-champs">
                    <Champ label="Latitude" name="latitude" inputMode="decimal" value={form.latitude} onChange={changer} erreur={erreurs.latitude} required />
                    <Champ label="Longitude" name="longitude" inputMode="decimal" value={form.longitude} onChange={changer} erreur={erreurs.longitude} required />
                </div>
                <p className="champ__aide" style={{ marginTop: 'calc(var(--espace-2) * -1)' }}>
                    Astuce : clic droit sur Google Maps, puis clic sur les coordonnées pour les copier.
                </p>
                <Champ label="Description" name="description" multiligne value={form.description} onChange={changer} />
                <Champ label="Adresse de l'image" name="imageUrl" type="url" placeholder="https://…" value={form.imageUrl} onChange={changer}
                       aide="Image publique. Sans image, la photo de la catégorie est utilisée." />
                {erreurEnvoi && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreurEnvoi}</p>}
                <div className="fenetre__actions" style={{ marginTop: 0 }}>
                    <Bouton variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                    <Bouton type="submit" disabled={enCours} aria-busy={enCours}>{point?.id ? 'Enregistre' : 'Ajoute le lieu'}</Bouton>
                </div>
            </form>
        </dialog>
    );
};

export default FenetreLieu;
