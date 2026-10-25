import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPoint, deletePoint, getMapData, updatePoint } from '../../../Services/Carte/CarteService.js';
import { getSorties } from '../../../Services/Sortie/SortieService.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import { EtatErreur, EtatVide } from '../../../Composants/Etats.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';

/*
 * Administration des lieux (maquette design/maquettes/admin.html).
 * Gère les points d'intérêt : /api/points-interet (GET, POST, PUT, DELETE).
 * Mobile : chaque ligne du tableau devient une carte (pages.css, data-label).
 */

const PAR_PAGE = 25;
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
            setForm(point.id ? { ...VIDE, ...point, latitude: String(point.latitude ?? ''), longitude: String(point.longitude ?? ''),
                description: point.description ?? '', adresse: point.adresse ?? '', imageUrl: point.imageUrl ?? '' } : VIDE);
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

const AdminPage = () => {
    const [points, setPoints] = useState([]);
    const [stats, setStats] = useState({ sorties: null });
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [filtre, setFiltre] = useState('');
    const [page, setPage] = useState(1);
    const [edition, setEdition] = useState(null);       // null = fermé ; {} = ajout ; point = modification
    const [aSupprimer, setASupprimer] = useState(null);
    const [message, setMessage] = useState(null);

    const charger = () => {
        setChargement(true);
        getMapData()
            .then(({ pointsInteret }) => setPoints(pointsInteret))
            .catch(() => setErreur('Impossible de charger les lieux.'))
            .finally(() => setChargement(false));
    };
    useEffect(() => {
        charger();
        getSorties().then((s) => setStats({ sorties: s.length })).catch(() => {});
    }, []);

    useEffect(() => {
        if (!message) return undefined;
        const minuteur = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(minuteur);
    }, [message]);

    // Nouvelle recherche ou nouveau filtre : retour à la première page
    useEffect(() => { setPage(1); }, [recherche, filtre]);

    const visibles = useMemo(() => {
        const q = recherche.trim().toLowerCase();
        return points
            .filter((p) => !filtre || categorie(p.type).cle === filtre)
            .filter((p) => !q || `${p.nom} ${p.adresse ?? ''}`.toLowerCase().includes(q))
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    }, [points, recherche, filtre]);

    const nbPages = Math.max(1, Math.ceil(visibles.length / PAR_PAGE));
    const pageVisible = visibles.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
    const aClasser = points.filter((p) => categorie(p.type).cle === 'autre').length;
    const sansImage = points.filter((p) => !p.imageUrl).length;

    const enregistre = (texte) => { setEdition(null); setMessage(texte); charger(); };

    const supprimer = async () => {
        try {
            await deletePoint(aSupprimer.id);
            setPoints((liste) => liste.filter((p) => p.id !== aSupprimer.id));
            setMessage('Lieu supprimé.');
        } catch (e) {
            setMessage(e.message || 'La suppression a échoué.');
        } finally {
            setASupprimer(null);
        }
    };

    return (
        <main className="conteneur page-admin">
            <div className="section-titre" style={{ marginTop: 'var(--espace-5)' }}>
                <h1 style={{ margin: 0 }}>Lieux de la carte</h1>
                <Bouton icone="plus" onClick={() => setEdition({})}>Ajoute un lieu</Bouton>
            </div>

            {/* Chiffres clés : cliquer sur « à classer » filtre directement la liste */}
            <div className="admin-stats">
                <div className="encart"><strong>{points.length}</strong><span>lieux sur la carte</span></div>
                <button type="button" className="encart" onClick={() => setFiltre('autre')}
                        style={{ textAlign: 'left', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
                    <strong>{aClasser}</strong><span>à classer (catégorie « Autre ») →</span>
                </button>
                <div className="encart"><strong>{sansImage}</strong><span>sans image</span></div>
                <div className="encart"><strong>{stats.sorties ?? '–'}</strong><span>sorties créées</span></div>
            </div>

            <div className="admin-outils">
                <Champ label="Cherche un lieu" icone="loupe" type="search" placeholder="Nom ou adresse…"
                       value={recherche} onChange={(e) => setRecherche(e.target.value)} />
                <div className="champ">
                    <label className="champ__label" htmlFor="filtre-cat">Catégorie</label>
                    <select id="filtre-cat" className="champ__saisie" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
                        <option value="">Toutes</option>
                        {LISTE_CATEGORIES.map((c) => <option key={c.cle} value={c.cle}>{c.pluriel}</option>)}
                    </select>
                </div>
            </div>

            {chargement && <p aria-busy="true">Chargement des lieux…</p>}
            {erreur && <EtatErreur message={erreur} onReessayer={charger} />}

            {!chargement && !erreur && visibles.length === 0 && (
                <EtatVide icone="epingle" titre="Aucun lieu trouvé"
                          action={<Bouton variante="secondaire" onClick={() => { setRecherche(''); setFiltre(''); }}>Effacer les filtres</Bouton>}>
                    Aucun lieu ne correspond à ta recherche.
                </EtatVide>
            )}

            {!chargement && !erreur && visibles.length > 0 && (
                <>
                    <p aria-live="polite" className="texte-doux" style={{ fontSize: 'var(--taille-s)' }}>
                        {visibles.length} lieu{visibles.length > 1 ? 'x' : ''} · page {page} sur {nbPages}
                    </p>
                    <div className="tableau-cadre">
                        <table className="tableau">
                            <caption className="visuellement-cache">Liste des lieux de la carte</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Lieu</th><th scope="col">Catégorie</th><th scope="col">Adresse</th>
                                    <th scope="col">Image</th><th scope="col"><span className="visuellement-cache">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageVisible.map((p) => (
                                    // data-label : sert d'intitulé quand le tableau devient des cartes sur mobile
                                    <tr key={p.id}>
                                        <td data-label="Lieu"><Link to={`/carte?lieu=point-${p.id}`}>{p.nom}</Link></td>
                                        <td data-label="Catégorie"><BadgeCategorie cle={p.type} /></td>
                                        <td data-label="Adresse">{p.adresse || <span className="texte-doux">—</span>}</td>
                                        <td data-label="Image">
                                            <span className={`statut ${p.imageUrl ? 'statut--publie' : 'statut--attente'}`}>{p.imageUrl ? 'Oui' : 'Non'}</span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="tableau__actions">
                                                <button className="bouton bouton--icone" type="button" aria-label={`Modifier ${p.nom}`} onClick={() => setEdition(p)}>
                                                    <Icone nom="modifier" />
                                                </button>
                                                <button className="bouton bouton--danger" type="button" aria-label={`Supprimer ${p.nom}`} onClick={() => setASupprimer(p)}>
                                                    <Icone nom="supprimer" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {nbPages > 1 && (
                        <nav className="pagination" aria-label="Pages de la liste">
                            <button type="button" className="bouton bouton--icone" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Page précédente">
                                <Icone nom="chevron-gauche" />
                            </button>
                            <span aria-current="page">{page}</span>
                            <span className="texte-doux" style={{ minWidth: 'auto' }}>/ {nbPages}</span>
                            <button type="button" className="bouton bouton--icone" disabled={page === nbPages} onClick={() => setPage(page + 1)} aria-label="Page suivante">
                                <Icone nom="chevron-droit" />
                            </button>
                        </nav>
                    )}
                </>
            )}

            <FenetreLieu point={edition} onFermer={() => setEdition(null)} onEnregistre={enregistre} />

            <FenetreConfirmation ouverte={aSupprimer !== null} titre="Supprimer ce lieu ?" texteConfirmer="Oui, supprimer"
                                 onConfirmer={supprimer} onAnnuler={() => setASupprimer(null)}>
                « {aSupprimer?.nom} » disparaîtra de la carte. Cette action est définitive.
            </FenetreConfirmation>

            {message && <div className="toast" role="status"><Icone nom="valider" />{message}</div>}
        </main>
    );
};

export default AdminPage;
