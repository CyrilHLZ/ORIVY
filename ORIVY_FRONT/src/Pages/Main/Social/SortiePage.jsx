import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { deleteSortie, desinscriptionSortie, getSortieById, inscriptionSortie, quitterAttente, rejoindreAttente, getAlbum, ajouterAuAlbum, retirerDeLAlbum } from '../../../Services/Sortie/SortieService';
import { createCommentaire, getCommentaires } from '../../../Services/Commentaire/CommentaireService.js';
import { categorie } from '../../../Constants/categories.js';
import { dateLisible, dateLongue, ilYa } from '../../../Utils/dates.js';
import Bouton, { BoutonIcone } from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import Photo from '../../../Composants/Photo.jsx';
import Avatar, { PileAvatars } from '../../../Composants/Avatar.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { EtatErreur } from '../../../Composants/Etats.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';
import Confettis from '../../../Composants/Confettis.jsx';
import { telechargerIcs } from '../../../Utils/agenda.js';
import { meteoDeLaSortie } from '../../../Utils/meteo.js';
import BoutonFavori from '../../../Composants/BoutonFavori.jsx';


/*
 * Détail d'une sortie (maquette design/maquettes/sortie.html).
 * Mobile : bouton d'inscription collé en bas. Ordinateur : encart à droite qui suit le défilement.
 *
 * Données du back : { id, nom, description, categorie, dateDebut, lieu, latitude, longitude,
 *                     organisateur, participants, attente, nombreMax, imageUrl }.
 * Commentaires : GET /api/sortie/{id}/commentaires · Album : GET /api/sorties/{id}/album.
 */

/* Nom affiché d'une personne : « Inès Nakamura », sinon son e-mail */
const nomDe = (personne) => [personne?.prenom, personne?.nom].filter(Boolean).join(' ') || personne?.email || 'Quelqu\'un';

/* ---- Encart d'inscription (le même contenu sert sur mobile et sur ordinateur) ----
   En dehors de SortiePage : un composant écrit DANS un autre serait recréé à chaque affichage. */
const BoutonInscription = ({ connecte, inscrit, complet, position, enCours, onBasculer, onAttente }) => {
    if (!connecte) return <Bouton vers="/connexion" bloc>Connecte-toi pour participer</Bouton>;

    // Complète (et pas inscrit) : liste d'attente. Le texte dit toujours que c'est complet ;
    // le 1er de la file prend la prochaine place libre (géré par le back).
    if (complet && !inscrit) {
        return (
            <Bouton variante={position ? 'secondaire' : 'principal'} bloc aria-pressed={position > 0}
                    disabled={enCours} aria-busy={enCours} onClick={onAttente}>
                {position ? `Tu es n°${position} sur la liste · Quitter` : 'Complet · Préviens-moi'}
            </Bouton>
        );
    }

    // Sinon : rejoindre, ou se désinscrire (un inscrit peut toujours partir, même si c'est complet)
    return (
        <Bouton variante={inscrit ? 'secondaire' : 'principal'} bloc aria-pressed={inscrit}
                disabled={enCours} aria-busy={enCours} onClick={onBasculer}>
            {inscrit ? 'Tu es inscrit·e ✓ (te désinscrire)' : 'Rejoins la sortie'}
        </Bouton>
    );
};

const SortiePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [sortie, setSortie] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const [commentaires, setCommentaires] = useState([]);
    const [texte, setTexte] = useState('');
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState(null);
    const [fete, setFete] = useState(0);   // (75) compteur : chaque inscription relance les confettis
    const [meteo, setMeteo] = useState(null);
    const [album, setAlbum] = useState([]);

    useEffect(() => {
        document.body.classList.add('page-sortie');
        return () => document.body.classList.remove('page-sortie');
    }, []);

    /* Chargement de la sortie et de ses commentaires quand l'id de l'adresse change */
    useEffect(() => {
        setSortie(null);
        setErreur(null);
        getSortieById(id)
            .then(setSortie)
            .catch(() => setErreur("Cette sortie n'existe pas, ou a été supprimée."));
        getCommentaires('sortie', id)
            .then(setCommentaires)
            .catch(() => setCommentaires([]));
        getAlbum(id).then(setAlbum).catch(() => setAlbum([]));
    }, [id]);

    /* Météo du jour J, une fois la sortie chargée (pas rechargée à chaque inscription) */
    useEffect(() => {
        if (!sortie) return;
        meteoDeLaSortie(sortie).then(setMeteo).catch(() => setMeteo(null));   // sans météo, la page reste utilisable
    }, [sortie?.id, sortie?.dateDebut]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!message) return undefined;
        const minuteur = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(minuteur);
    }, [message]);

    if (erreur) {
        return (
            <main className="conteneur">
                <EtatErreur titre="Sortie introuvable" message={erreur} />
                <div style={{ display: 'flex', justifyContent: 'center' }}><Bouton vers="/sorties" variante="secondaire">Voir les sorties</Bouton></div>
            </main>
        );
    }
    if (!sortie) return <main className="conteneur" aria-busy="true"><p style={{ paddingTop: 'var(--espace-6)' }}>Chargement de la sortie…</p></main>;

    const cat = categorie(sortie.categorie);
    const participants = sortie.participants || [];
    const placesRestantes = sortie.nombreMax ? Math.max(0, sortie.nombreMax - participants.length) : null;
    const peutGerer = isAdmin || sortie.organisateur?.id === user?.id;
    // Inscrit = présent dans la liste renvoyée par le back (vrai aussi après un rechargement)
    const inscrit = participants.some((p) => p.id === user?.id);
    // L'album : les participants et l'organisateur peuvent y partager leurs photos
    const peutPartager = inscrit || sortie.organisateur?.id === user?.id;
    const complet = sortie.nombreMax != null && participants.length >= sortie.nombreMax;
    // Position dans la file d'attente : 1, 2, 3… (0 = pas en attente)
    const position = (sortie.attente ?? []).findIndex((p) => p.id === user?.id) + 1;

    const basculerInscription = async () => {
        setEnCours(true);
        try {
            // Le back renvoie la sortie à jour : participants et avatars se rafraîchissent
            if (inscrit) { setSortie(await desinscriptionSortie(id)); setMessage('Tu t\'es désinscrit·e de la sortie.'); }
            else { setSortie(await inscriptionSortie(id)); setFete((n) => n + 1); setMessage("C'est noté, à bientôt !"); }
        } catch (e) {
            setMessage(e.message || "Ça n'a pas fonctionné. Réessaie plus tard.");
        } finally {
            setEnCours(false);
        }
    };

    const basculerAttente = async () => {
        setEnCours(true);
        try {
            if (position) { setSortie(await quitterAttente(id)); setMessage("Tu n'es plus sur la liste d'attente."); }
            else { setSortie(await rejoindreAttente(id)); setMessage('On te prévient dès qu\'une place se libère.'); }
        } catch (e) {
            setMessage(e.message || "Ça n'a pas fonctionné. Réessaie plus tard.");
        } finally {
            setEnCours(false);
        }
    };

    const publierCommentaire = async (event) => {
        event.preventDefault();
        if (!texte.trim()) return;
        try {
            // L'auteur n'est pas envoyé : le back le lit dans le jeton
            const nouveau = await createCommentaire({ contenu: texte.trim(), cibleType: 'sortie', cibleId: Number(id) });
            // On ajoute la réponse du back à la liste (sans tout recharger)
            setCommentaires((liste) => [...liste, nouveau]);
            setTexte('');
        } catch (e) {
            setMessage(e.message || "Ton commentaire n'a pas pu être publié.");
        }
    };

    const supprimer = async () => {
        try {
            await deleteSortie(id);
            navigate('/sorties');
        } catch (e) {
            setConfirmation(false);
            setMessage(e.message || 'La suppression a échoué.');
        }
    };

    const partager = async () => {
        try {
            if (navigator.share) await navigator.share({ title: sortie.nom, url: window.location.href });
            else { await navigator.clipboard.writeText(window.location.href); setMessage('Lien copié !'); }
        } catch { /* partage annulé */ }
    };

    const lienCarte = sortie.latitude != null && sortie.longitude != null
        ? `/carte?lat=${sortie.latitude}&lng=${sortie.longitude}&nom=${encodeURIComponent(sortie.nom)}`
        : null;

    const ajouterPhoto = async (event) => {
        const fichier = event.target.files[0];
        event.target.value = '';
        if (!fichier) return;
        try {
            const nouvelle = await ajouterAuAlbum(id, fichier);
            setAlbum((liste) => [nouvelle, ...liste]);   // la plus récente en premier
            setMessage('Merci pour le souvenir !');
        } catch (e) {
            setMessage(e.message || "L'envoi a échoué.");
        }
    };

    const retirerPhoto = async (photoId) => {
        try {
            await retirerDeLAlbum(id, photoId);
            setAlbum((liste) => liste.filter((p) => p.id !== photoId));
        } catch (e) {
            setMessage(e.message || 'Impossible de retirer cette photo.');
        }
    };

    return (
        <main>
            {/* Photo du lieu, avec retour et partage */}
            <div className="conteneur" style={{ paddingInline: 0 }}>
                <div className="sortie-hero">
                    <Photo src={sortie.imageUrl || cat.image} alt="" cle={cat.cle} paresseuse={false} />
                    <div className="sortie-hero__actions">
                        <Link className="bouton bouton--icone bouton--flottant" to="/sorties" aria-label="Retour aux sorties"><Icone nom="retour" /></Link>
                        <span style={{ display: 'flex', gap: 'var(--espace-2)' }}>
                            <BoutonFavori type="sortie" id={sortie.id} nom={sortie.nom} flottant />
                            <BoutonIcone icone="partager" label="Partager la sortie" flottant onClick={partager} />
                        </span>
                    </div>
                </div>
            </div>

            <div className="conteneur">
                <header className="sortie-tete">
                    <span style={{ alignSelf: 'flex-start' }}><BadgeCategorie cle={cat.cle} /></span>
                    <h1>{sortie.nom}</h1>
                    {sortie.organisateur && (
                        <p className="texte-doux" style={{ margin: 0 }}>Organisée par {nomDe(sortie.organisateur)}</p>
                    )}
                </header>

                <div className="sortie-grille">
                    <div className="pile" style={{ gap: 'var(--espace-7)' }}>
                        <section aria-label="Infos pratiques">
                            <ul className="infos">
                                <li><Icone nom="calendrier" />
                                    <div>
                                        <strong>{dateLongue(sortie.dateDebut)}</strong>
                                        {/* Inscrit : on peut l'ajouter à son agenda (fichier .ics fabriqué par le navigateur) */}
                                        {inscrit && (
                                            <Bouton variante="fantome" icone="calendrier" onClick={() => telechargerIcs(sortie)}
                                                    style={{ alignSelf: 'flex-start', paddingInline: 0 }}>
                                                Ajouter à mon agenda
                                            </Bouton>
                                        )}
                                    </div>
                                </li>
                                {meteo && (
                                    <li>
                                        <span aria-hidden="true" style={{ fontSize: '1.4em', lineHeight: 1 }}>{meteo.emoji}</span>
                                        <div>
                                            <strong>{meteo.temperature} °C · {meteo.texte}</strong>
                                            <span>{meteo.pluie} % de risque de pluie · prévision Open-Meteo</span>
                                        </div>
                                    </li>
                                )}
                                {sortie.lieu && (
                                    <li><Icone nom="epingle" />
                                        <div>
                                            <strong>{lienCarte ? <Link to={lienCarte}>{sortie.lieu}</Link> : sortie.lieu}</strong>
                                            {lienCarte && <span>Touche le lieu pour le voir sur la carte</span>}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </section>

                        {sortie.description && (
                            <section aria-labelledby="t-programme">
                                <h2 id="t-programme" style={{ fontSize: 'var(--taille-xl)' }}>Le programme</h2>
                                {/* Respecte les retours à la ligne tapés par l'organisateur */}
                                <p style={{ whiteSpace: 'pre-line' }}>{sortie.description}</p>
                            </section>
                        )}

                        <section aria-labelledby="t-participants">
                            <h2 id="t-participants" style={{ fontSize: 'var(--taille-xl)' }}>
                                Participants{participants.length > 0 && ` (${participants.length})`}
                            </h2>
                            {participants.length > 0 ? (
                                <ul className="participants">
                                    {participants.map((p) => (
                                        <li key={p.id ?? nomDe(p)}><Avatar personne={p} taille="l" />{p.prenom || nomDe(p)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="texte-doux">Personne pour l'instant. Sois le premier ou la première à rejoindre !</p>
                            )}
                        </section>

                        <section aria-labelledby="t-commentaires" id="commentaires">
                            <h2 id="t-commentaires" style={{ fontSize: 'var(--taille-xl)' }}>
                                Commentaires{commentaires.length > 0 && ` (${commentaires.length})`}
                            </h2>
                            {commentaires.length === 0 && <p className="texte-doux">Pas encore de commentaire. Une question ? Lance la discussion !</p>}
                            <ul className="commentaires" aria-live="polite">
                                {commentaires.map((c) => (
                                    <li className="commentaire" key={c.id}>
                                        {/* auteur = { id, prenom, nom, ville }, ou null pour les anciens commentaires */}
                                        <Avatar personne={c.auteur ?? {}} taille="s" />
                                        <div>
                                            <div className="commentaire__bulle">
                                                <p className="commentaire__auteur">{nomDe(c.auteur)}</p>
                                                <p className="commentaire__texte" style={{ whiteSpace: 'pre-line' }}>{c.contenu}</p>
                                            </div>
                                            {c.dateCreation && <div className="commentaire__actions"><span>{ilYa(c.dateCreation)}</span></div>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {isAuthenticated ? (
                                <form className="saisie-message" onSubmit={publierCommentaire} style={{ marginTop: 'var(--espace-4)' }}>
                                    <label className="visuellement-cache" htmlFor="commentaire">Ton commentaire</label>
                                    <textarea id="commentaire" rows={1} placeholder="Écris un commentaire…" value={texte}
                                              onChange={(e) => setTexte(e.target.value)} required />
                                    <button className="bouton bouton--icone bouton--principal" type="submit" aria-label="Publier le commentaire">
                                        <Icone nom="envoyer" />
                                    </button>
                                </form>
                            ) : (
                                <p className="texte-doux" style={{ marginTop: 'var(--espace-3)' }}><Link to="/connexion">Connecte-toi</Link> pour commenter.</p>
                            )}
                        </section>

                        <section aria-labelledby="t-album">
                            <h2 id="t-album" style={{ fontSize: 'var(--taille-xl)' }}>
                                Album{album.length > 0 && ` (${album.length})`}
                            </h2>
                            {album.length > 0 ? (
                                <div className="galerie">
                                    {album.map((p) => (
                                        <Photo key={p.id} src={p.url} alt={`Souvenir partagé par ${p.auteur?.prenom ?? 'un membre'}`} />
                                    ))}
                                </div>
                            ) : (
                                <p className="texte-doux">Pas encore de souvenir. Après la sortie, partagez vos photos ici !</p>
                            )}
                            {peutPartager && (
                                <label className="bouton bouton--secondaire" style={{ marginTop: 'var(--espace-3)' }}>
                                    <Icone nom="appareil-photo" />Ajouter mes photos
                                    <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                        className="visuellement-cache" onChange={ajouterPhoto} />
                                </label>
                            )}
                        </section>

                        {peutGerer && (
                            <section className="zone-orga" aria-labelledby="t-orga">
                                <h2 id="t-orga" style={{ fontSize: 'var(--taille-l)' }}>Gérer la sortie</h2>
                                <div className="ligne-actions">
                                    <Bouton variante="secondaire" icone="modifier" vers={`/sorties/modification/${sortie.id}`}>Modifier la sortie</Bouton>
                                    <Bouton variante="danger" icone="supprimer" onClick={() => setConfirmation(true)}>Supprimer la sortie</Bouton>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Encart d'inscription : à droite sur ordinateur */}
                    <aside className="inscription--ordinateur">
                        <div className="encart inscription">
                            <p className="inscription__date">{dateLisible(sortie.dateDebut)}</p>
                            {sortie.nombreMax && (
                                <>
                                    <div className="jauge" aria-hidden="true">
                                        <span style={{ '--rempli': `${Math.min(100, (participants.length / sortie.nombreMax) * 100)}%` }} />
                                    </div>
                                    <p className="inscription__places">{participants.length} inscrits · <strong>{placesRestantes} places restantes</strong></p>
                                    {sortie.attente?.length > 0 && <p className="texte-doux" style={{ margin: 0 }}>{sortie.attente.length} en liste d'attente</p>}
                                </>
                            )}
                            {participants.length > 0 && <PileAvatars personnes={participants} />}
                            <BoutonInscription connecte={isAuthenticated} inscrit={inscrit} complet={complet} position={position} enCours={enCours} onBasculer={basculerInscription} onAttente={basculerAttente} />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Barre d'inscription collée en bas (mobile) */}
            <div className="inscription-mobile">
                <p>{placesRestantes != null ? <><strong>{placesRestantes} places</strong><br />restantes</> : <strong>{dateLisible(sortie.dateDebut)}</strong>}</p>
                <BoutonInscription connecte={isAuthenticated} inscrit={inscrit} complet={complet} position={position} enCours={enCours} onBasculer={basculerInscription} onAttente={basculerAttente} />
            </div>

            <FenetreConfirmation
                ouverte={confirmation}
                titre="Supprimer cette sortie ?"
                texteConfirmer="Oui, supprimer"
                texteAnnuler="Garder la sortie"
                onConfirmer={supprimer}
                onAnnuler={() => setConfirmation(false)}
            >
                {participants.length > 0 ? `Les ${participants.length} inscrits seront prévenus. ` : ''}Cette action est définitive.
            </FenetreConfirmation>

            {message && <div className="toast" role="status"><Icone nom="info" />{message}</div>}
            <Confettis key={fete} actif={fete > 0} />
        </main>
    );
};

export default SortiePage;
