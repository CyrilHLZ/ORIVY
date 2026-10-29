import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePoint, getMapData } from '../../../Services/Carte/CarteService.js';
import { getSorties } from '../../../Services/Sortie/SortieService.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import { EtatErreur, EtatVide } from '../../../Composants/Etats.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';
import FenetreLieu from '../../../Composants/FenetreLieu.jsx';
import Signalements from './Signalements.jsx';

/*
 * Administration des lieux (maquette design/maquettes/admin.html).
 * Gère les points d'intérêt : /api/points-interet (GET, POST, PUT, DELETE).
 * Mobile : chaque ligne du tableau devient une carte (pages.css, data-label).
 */

const PAR_PAGE = 25;

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
            <div style={{ marginTop: 'var(--espace-5)' }}><Signalements /></div>
            <div className="section-titre">
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
