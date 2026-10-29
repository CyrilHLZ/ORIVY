import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { changerEmail, changerMotDePasse, changerPhoto, getUserProfile, supprimerMonCompte, updateUserProfile } from '../../Services/Utilisateur/UtilisateurService.js';
import Avatar from '../../Composants/Avatar.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { Champ, ChampMotDePasse, Interrupteur } from '../../Composants/Formulaire.jsx';
import { ChoixSegmente } from '../../Composants/Filtres.jsx';
import { EtatErreur } from '../../Composants/Etats.jsx';
import { getSortieById, getSortiesMembre } from '../../Services/Sortie/SortieService.js';
import CarteSortie from '../../Composants/CarteSortie.jsx';
import CarteLieu from '../../Composants/CarteLieu.jsx';
import { useFavoris } from '../../Context/FavorisContext.jsx';
import { useLieux } from '../../Hooks/useLieux.js';
import { getMediasDuMembre } from '../../Services/Fil/FilService.js';
import Photo, { estVideo } from '../../Composants/Photo.jsx';
import { bloquer, debloquer, followUser, getFollowers, getFollowing, getMesBlocages, unfollowUser } from '../../Services/Social/SocialService.js';
import MenuOptions from '../../Composants/MenuOptions.jsx';
import FenetreConfirmation from '../../Composants/Fenetre.jsx';
import FenetreSignalement from '../../Composants/FenetreSignalement.jsx';


const OPTIONS_THEME = [
    { valeur: 'auto', texte: 'Automatique' },
    { valeur: 'jour', texte: 'Jour' },
    { valeur: 'nuit', texte: 'Nuit' },
];

/* ---- Réglages : branchés sur les scripts des thèmes et des saisons (window.orivyTheme…) ---- */
const Reglages = () => {
    // On lit le choix enregistré une seule fois, au premier rendu
    const [theme, setTheme] = useState(() => window.orivyTheme?.preference() ?? 'auto');
    const [decorations, setDecorations] = useState(() => window.orivySaison?.decorations() ?? true);

    // (98) Le nouveau thème s'étend en cercle depuis l'endroit cliqué
    const changerTheme = (valeur) => {
        const actif = document.activeElement?.getBoundingClientRect?.();
        if (actif) {
            document.documentElement.style.setProperty('--vague-x', `${actif.left + actif.width / 2}px`);
            document.documentElement.style.setProperty('--vague-y', `${actif.top + actif.height / 2}px`);
            document.documentElement.classList.add('vt-vague');
        }
        setTheme(valeur);
        window.orivyTheme?.choisir(valeur);
    };
    const changerDecorations = (actif) => { setDecorations(actif); window.orivySaison?.activerDecorations(actif); };

    return (
        <section className="encart reglages" aria-labelledby="t-reglages">
            <h2 id="t-reglages" style={{ fontSize: 'var(--taille-xl)', margin: 0 }}>Réglages</h2>
            <h3>Apparence</h3>
            {/* (81) Soleil ou lune selon le thème choisi : l'icône tourne en changeant */}
            <span className="icone-theme" key={theme} aria-hidden="true"><Icone nom={theme === 'nuit' ? 'lune' : 'soleil'} taille="grande" /></span>
            <ChoixSegmente nom="theme" legende="Thème" valeur={theme} onChange={changerTheme} options={OPTIONS_THEME} />
            <p className="champ__aide">Automatique : l'app suit le soleil, de l'aube à la nuit.</p>
            <Interrupteur label="Décorations saisonnières" detail="Citrouilles, flocons, fleurs…"
                          checked={decorations} onChange={(e) => changerDecorations(e.target.checked)} />
            <p className="champ__aide">Ces réglages sont enregistrés sur cet appareil.</p>
        </section>
    );
};

/* ---- Formulaire de modification du profil ---- */
const ModifierProfil = ({ profil, onEnregistre, onAnnuler }) => {
    const [valeurs, setValeurs] = useState({
        prenom: profil.prenom ?? '', nom: profil.nom ?? '', ville: profil.ville ?? '', numeroTelephone: profil.numeroTelephone ?? '', bio: profil.bio ?? '',
    });
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const changer = (e) => setValeurs({ ...valeurs, [e.target.name]: e.target.value });

    const envoyer = async (event) => {
        event.preventDefault();
        if (!valeurs.prenom.trim()) { setErreur('Ton prénom ne peut pas être vide.'); return; }
        setEnCours(true);
        try {
            // Profil complet : le back remplace tous les champs modifiables
            const nouveau = await updateUserProfile(profil.id, { ...profil, ...valeurs });
            onEnregistre(nouveau);
        } catch (e) {
            setErreur(e.message || "L'enregistrement a échoué.");
            setEnCours(false);
        }
    };

    return (
        <form className="formulaire encart" onSubmit={envoyer} aria-labelledby="t-modifier">
            <h2 id="t-modifier" style={{ fontSize: 'var(--taille-xl)', margin: 0 }}>Modifier le profil</h2>
            <div className="deux-champs">
                <Champ label="Prénom" name="prenom" autoComplete="given-name" value={valeurs.prenom} onChange={changer} required />
                <Champ label="Nom" name="nom" autoComplete="family-name" value={valeurs.nom} onChange={changer} />
            </div>
            <Champ label="Ville" name="ville" autoComplete="address-level2" placeholder="Lyon" value={valeurs.ville} onChange={changer} />
            <Champ label="Bio" name="bio" multiligne rows={3} maxLength={500} value={valeurs.bio} onChange={changer}
                   aide="Quelques mots sur toi, visibles par les autres membres." />
            <Champ label="Téléphone" name="numeroTelephone" type="tel" autoComplete="tel" value={valeurs.numeroTelephone} onChange={changer}
                   aide="Facultatif. Il n'est pas affiché aux autres membres." />
            <p className="champ__aide">Ton e-mail ({profil.email}) ne se modifie pas ici.</p>
            {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}
            <div className="formulaire__pied">
                <Bouton variante="fantome" onClick={onAnnuler}>Annuler</Bouton>
                <Bouton type="submit" disabled={enCours} aria-busy={enCours}>{enCours ? 'Enregistrement…' : 'Enregistre'}</Bouton>
            </div>
        </form>
    );
};

const BoutonPhoto = ({ onChange }) => {
    const [erreur, setErreur] = useState(null);

    const choisir = async (event) => {
        const fichier = event.target.files[0];
        if (!fichier) return;
        try {
            onChange(await changerPhoto(fichier));
            setErreur(null);
        } catch (e) {
            setErreur(e.message);
        }
        event.target.value = '';   // permet de rechoisir le même fichier
    };

    return (
        <>
            <label className="bouton bouton--fantome">
                <Icone nom="appareil-photo" />Changer la photo
                <input type="file" accept="image/jpeg,image/png,image/webp" className="visuellement-cache" onChange={choisir} />
            </label>
            {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
        </>
    );
};

const FormMotDePasse = () => {
    const [ancien, setAncien] = useState('');
    const [nouveau, setNouveau] = useState('');
    const [retour, setRetour] = useState(null);  

    const envoyer = async (event) => {
        event.preventDefault();
        try {
            await changerMotDePasse(ancien, nouveau);
            setAncien(''); setNouveau('');
            setRetour({ ok: true, texte: 'Mot de passe modifié.' });
        } catch (e) {
            setRetour({ ok: false, texte: e.message });
        }
    };

    return (
        <form className="formulaire" onSubmit={envoyer}>
            <h3 style={{ margin: 0 }}>Mot de passe</h3>
            <ChampMotDePasse label="Mot de passe actuel" value={ancien} onChange={(e) => setAncien(e.target.value)}
                             autoComplete="current-password" required />
            <ChampMotDePasse label="Nouveau mot de passe" value={nouveau} onChange={(e) => setNouveau(e.target.value)}
                             autoComplete="new-password" required />
            {retour && <p className={retour.ok ? 'texte-doux' : 'champ__erreur'} role="status">{retour.texte}</p>}
            <Bouton type="submit" variante="secondaire">Changer le mot de passe</Bouton>
        </form>
    );
};

/* ---- Changer d'email ---- */
const FormEmail = ({ onChange }) => {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [retour, setRetour] = useState(null);

    const envoyer = async (event) => {
        event.preventDefault();
        try {
            const nouveau = await changerEmail(motDePasse, email);
            onChange(nouveau);   // met à jour l'email affiché partout
            setEmail(''); setMotDePasse('');
            setRetour({ ok: true, texte: 'Email modifié.' });
        } catch (e) {
            setRetour({ ok: false, texte: e.message });
        }
    };

    return (
        <form className="formulaire" onSubmit={envoyer}>
            <h3 style={{ margin: 0 }}>Email</h3>
            <Champ label="Nouvel email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   autoComplete="email" required />
            <ChampMotDePasse label="Mot de passe actuel" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                             autoComplete="current-password" required />
            {retour && <p className={retour.ok ? 'texte-doux' : 'champ__erreur'} role="status">{retour.texte}</p>}
            <Bouton type="submit" variante="secondaire">Changer l'email</Bouton>
        </form>
    );
};

/* ---- Supprimer mon compte (RGPD) : mot de passe + confirmation, puis déconnexion ----
   Le bouton rouge plein n'apparaît que dans la fenêtre de confirmation (règle du design). */
const FormSuppression = ({ onSupprime }) => {
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState(false);
    const [erreur, setErreur] = useState(null);

    const demander = (event) => {
        event.preventDefault();
        if (!motDePasse) { setErreur('Tape ton mot de passe pour confirmer que c\'est bien toi.'); return; }
        setErreur(null);
        setConfirmation(true);
    };

    const supprimer = async () => {
        setConfirmation(false);
        try {
            await supprimerMonCompte(motDePasse);
            onSupprime();
        } catch (e) {
            setErreur(e.message || "Le compte n'a pas pu être supprimé.");
        }
    };

    return (
        <form className="formulaire zone-danger" onSubmit={demander}>
            <h3 style={{ margin: 0 }}>Supprimer mon compte</h3>
            <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>
                Tes sorties, messages, photos, avis et abonnements seront effacés. C'est définitif.
            </p>
            <ChampMotDePasse label="Mot de passe actuel" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                             autoComplete="current-password" erreur={erreur} />
            <Bouton type="submit" variante="danger" icone="supprimer">Supprimer mon compte</Bouton>
            <FenetreConfirmation ouverte={confirmation} titre="Supprimer ton compte ?" texteConfirmer="Oui, tout supprimer"
                                 texteAnnuler="Garder mon compte" onConfirmer={supprimer} onAnnuler={() => setConfirmation(false)}>
                Tout ce que tu as créé sur ORIVY disparaîtra, et on ne pourra pas le récupérer.
            </FenetreConfirmation>
        </form>
    );
};

/* ---- Ses photos et vidéos : ce que le membre a posté dans les albums des sorties (= le Fil) ----
   Le titre suit le contenu : « Tes photos », « Tes vidéos » ou « Tes photos et vidéos ».
   Chaque vignette mène à la sortie d'où elle vient. Rien de posté : la section ne s'affiche pas. */
const MesMedias = ({ membreId, estMoi }) => {
    const [medias, setMedias] = useState([]);

    useEffect(() => {
        getMediasDuMembre(membreId).then(setMedias).catch(() => setMedias([]));
    }, [membreId]);

    if (medias.length === 0) return null;

    const videos = medias.filter((m) => estVideo(m.url)).length;
    const quoi = videos === 0 ? 'photos' : videos === medias.length ? 'vidéos' : 'photos et vidéos';
    const titre = `${estMoi ? 'Tes' : 'Ses'} ${quoi}`;

    return (
        <section className="encart" aria-labelledby="t-medias" style={{ marginTop: 'var(--espace-5)' }}>
            <h2 id="t-medias" style={{ fontSize: 'var(--taille-xl)' }}>{titre}</h2>
            <div className="galerie galerie--profil">
                {medias.map((m) => (
                    <Link key={m.id} to={`/sorties/${m.sortieId}`} aria-label={`${estVideo(m.url) ? 'Vidéo' : 'Photo'} de la sortie « ${m.sortieNom} »`}>
                        <Photo src={m.url} alt="" />
                    </Link>
                ))}
            </div>
        </section>
    );
};

/* ---- Mes favoris (seulement sur MON profil) ----
   Le back ne renvoie que { cibleType, cibleId } : on retrouve les lieux dans useLieux
   (leurs id sont « point-12 », « activite-3 ») et on charge chaque sortie aimée. */
const MesFavoris = () => {
    const { favoris } = useFavoris();
    const { lieux } = useLieux();
    const [sorties, setSorties] = useState([]);

    const idsSorties = favoris.filter((f) => f.cibleType === 'sortie').map((f) => f.cibleId);
    useEffect(() => {
        Promise.all(idsSorties.map((id) => getSortieById(id).catch(() => null)))
            .then((liste) => setSorties(liste.filter(Boolean)));   // une sortie supprimée entre-temps est ignorée
    }, [idsSorties.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    const lieuxAimes = favoris
        .filter((f) => f.cibleType !== 'sortie')
        .map((f) => lieux.find((l) => l.id === `${f.cibleType}-${f.cibleId}`))
        .filter(Boolean);

    return (
        <section className="encart" aria-labelledby="t-favoris" style={{ marginTop: 'var(--espace-5)' }}>
            <h2 id="t-favoris" style={{ fontSize: 'var(--taille-xl)' }}>Tes favoris</h2>
            {lieuxAimes.length > 0 && (
                <>
                    <h3>Lieux</h3>
                    <div className="carrousel">
                        {lieuxAimes.map((l) => <CarteLieu key={l.id} lieu={l} />)}
                    </div>
                </>
            )}
            {sorties.length > 0 && (
                <>
                    <h3>Sorties</h3>
                    <div className="carrousel">
                        {sorties.map((s) => <CarteSortie key={s.id} sortie={s} />)}
                    </div>
                </>
            )}
            {lieuxAimes.length === 0 && sorties.length === 0 && (
                <p className="texte-doux">Touche le ♡ d'un lieu ou d'une sortie pour le retrouver ici.</p>
            )}
        </section>
    );
};

const ProfilPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, logout, mettreAJourUtilisateur } = useAuth();

    // C'est « mon » profil si l'adresse n'a pas d'id, ou si l'id est le mien
    const estMoi = !id || String(id) === String(user?.id);
    const idProfil = estMoi ? user?.id : id;

    const [profil, setProfil] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [edition, setEdition] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setProfil(null);
        setErreur(null);
        if (!idProfil) {
            // Utilisateur connecté mais sans id (ancienne connexion) : on se contente de ce qu'on a
            if (estMoi && user) setProfil(user);
            return;
        }
        getUserProfile(idProfil)
            .then(setProfil)
            .catch(() => (estMoi && user ? setProfil(user) : setErreur("Ce profil n'existe pas.")));
    }, [idProfil]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sorties organisées et rejointes par ce membre
    const [sorties, setSorties] = useState({ organisees: [], rejointes: [] });
    useEffect(() => {
        if (!idProfil) return;
        getSortiesMembre(idProfil)
            .then(setSorties)
            .catch(() => {});   // sans sorties, le profil reste utilisable
    }, [idProfil]);

    // Abonnés / abonnements de ce membre ; « je le suis » si je suis dans ses abonnés
    const [abonnes, setAbonnes] = useState([]);
    const [abonnements, setAbonnements] = useState([]);
    useEffect(() => {
        if (!idProfil) return;
        getFollowers(idProfil).then(setAbonnes).catch(() => {});
        getFollowing(idProfil).then(setAbonnements).catch(() => {});
    }, [idProfil]);
    const jeSuis = abonnes.some((a) => a.id === user?.id);

    const basculerAbonnement = async () => {
        try {
            if (jeSuis) {
                await unfollowUser(idProfil);
                setAbonnes((liste) => liste.filter((a) => a.id !== user.id));
            } else {
                await followUser(idProfil);
                setAbonnes((liste) => [...liste, user]);
            }
        } catch (e) {
            setMessage(e.message);
        }
    };

    // Blocage : est-ce que J'AI bloqué ce membre ? (la liste ne contient que mes blocages)
    const [bloque, setBloque] = useState(false);
    const [confirmerBlocage, setConfirmerBlocage] = useState(false);
    const [signalementOuvert, setSignalementOuvert] = useState(false);
    useEffect(() => {
        if (estMoi || !user) return;
        getMesBlocages().then((liste) => setBloque(liste.some((m) => String(m.id) === String(idProfil)))).catch(() => {});
    }, [idProfil]); // eslint-disable-line react-hooks/exhaustive-deps

    const basculerBlocage = async () => {
        setConfirmerBlocage(false);
        try {
            if (bloque) {
                await debloquer(idProfil);
                setBloque(false);
                setMessage('Membre débloqué.');
            } else {
                await bloquer(idProfil);
                setBloque(true);
                // Le back a supprimé nos abonnements dans les deux sens : on recharge les compteurs
                getFollowers(idProfil).then(setAbonnes).catch(() => {});
                getFollowing(idProfil).then(setAbonnements).catch(() => {});
                setMessage('Membre bloqué.');
            }
        } catch (e) {
            setMessage(e.message);
        }
    };

    useEffect(() => {
        if (!message) return undefined;
        const minuteur = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(minuteur);
    }, [message]);

    if (erreur) return <main className="conteneur"><EtatErreur titre="Profil introuvable" message={erreur} /></main>;
    if (!profil) return <main className="conteneur" aria-busy="true"><p style={{ paddingTop: 'var(--espace-6)' }}>Chargement du profil…</p></main>;

    const nomComplet = [profil.prenom, profil.nom].filter(Boolean).join(' ') || profil.email;

    const enregistre = (nouveau) => {
        setProfil(nouveau);
        mettreAJourUtilisateur(nouveau);
        setEdition(false);
        setMessage('Profil enregistré.');
    };

    const deconnexion = () => { logout(); navigate('/'); };

    return (
        <main className="conteneur">
            <div className={estMoi ? 'profil-mise-en-page' : undefined}>
                <div>
                    <header className="profil-tete">
                        {/* (80) Anneau de la couleur de saison qui tourne doucement autour de l'avatar */}
                        <span className="anneau-avatar"><Avatar personne={profil} taille="xl" /></span>
                        <div className="profil-tete__infos">
                            <h1>{nomComplet}</h1>
                            {profil.ville && (
                                <p className="texte-doux" style={{ margin: 0, display: 'inline-flex', gap: 'var(--espace-1)', alignItems: 'center' }}>
                                    <Icone nom="epingle" taille="petite" />{profil.ville}
                                </p>
                            )}
                            <p className="texte-doux" style={{ margin: 0 }}>
                                <strong>{abonnes.length}</strong> abonné{abonnes.length > 1 ? 's' : ''}
                                {' · '}
                                <strong>{abonnements.length}</strong> abonnement{abonnements.length > 1 ? 's' : ''}
                            </p>
                            {/* pre-line : garde les retours à la ligne tapés par le membre */}
                            {profil.bio && <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{profil.bio}</p>}
                            {estMoi && !edition && (
                                <div className="ligne-actions">
                                    <Bouton variante="secondaire" icone="modifier" onClick={() => setEdition(true)}>Modifier le profil</Bouton>
                                    <BoutonPhoto onChange={enregistre} />
                                    {isAdmin && <Bouton variante="fantome" icone="bouclier" vers="/admin">Administration</Bouton>}
                                </div>
                            )}
                            {!estMoi && user && (
                                <div className="ligne-actions">
                                    {bloque ? (
                                        <p className="texte-doux" style={{ margin: 0 }}>Tu as bloqué ce membre : vous ne pouvez plus vous écrire ni vous suivre.</p>
                                    ) : (
                                        <>
                                            <Bouton variante={jeSuis ? 'secondaire' : 'principal'} icone={jeSuis ? 'abonne' : 'suivre'}
                                                    aria-pressed={jeSuis} onClick={basculerAbonnement}>
                                                {jeSuis ? 'Abonné' : 'Suivre'}
                                            </Bouton>
                                            <Bouton variante="secondaire" icone="messages" vers={`/messages?avec=${profil.id}`}>Écrire</Bouton>
                                        </>
                                    )}
                                    <MenuOptions label={`Plus d'options pour ${profil.prenom || 'ce membre'}`} options={[
                                        { texte: 'Signaler', icone: 'drapeau', onClick: () => setSignalementOuvert(true) },
                                        bloque
                                            ? { texte: 'Débloquer', icone: 'cadenas', onClick: basculerBlocage }
                                            : { texte: 'Bloquer', icone: 'cadenas', danger: true, onClick: () => setConfirmerBlocage(true) },
                                    ]} />
                                </div>
                            )}
                        </div>
                    </header>

                    {estMoi && edition && (
                        <ModifierProfil profil={profil} onEnregistre={enregistre} onAnnuler={() => setEdition(false)} />
                    )}

                    <section className="encart" aria-labelledby="t-sorties" style={{ marginTop: 'var(--espace-5)' }}>
                        <h2 id="t-sorties" style={{ fontSize: 'var(--taille-xl)' }}>{estMoi ? 'Tes sorties' : 'Ses sorties'}</h2>
                        {sorties.organisees.length > 0 && (
                            <>
                                <h3>Organisées</h3>
                                <div className="carrousel">
                                    {sorties.organisees.map((s) => <CarteSortie key={s.id} sortie={s} />)}
                                </div>
                            </>
                        )}
                        {sorties.rejointes.length > 0 && (
                            <>
                                <h3>Rejointes</h3>
                                <div className="carrousel">
                                    {sorties.rejointes.map((s) => <CarteSortie key={s.id} sortie={s} />)}
                                </div>
                            </>
                        )}
                        {sorties.organisees.length === 0 && sorties.rejointes.length === 0 && (
                            <p className="texte-doux">
                                {estMoi ? "Tu n'as pas encore de sortie." : `${profil.prenom || 'Ce membre'} n'a pas encore de sortie.`}
                            </p>
                        )}
                        <div className="ligne-actions">
                            <Bouton variante="secondaire" icone="calendrier" vers="/sorties">Voir les sorties</Bouton>
                            {estMoi && <Bouton icone="plus" vers="/sorties/creation">Crée une sortie</Bouton>}
                        </div>
                    </section>

                    {profil.id && <MesMedias membreId={profil.id} estMoi={estMoi} />}
                    {estMoi && <MesFavoris />}
                </div>

                {/* Réglages et compte : seulement sur MON profil */}
                {estMoi && (
                    <aside className="pile" id="reglages">
                        <Reglages />
                        <section className="encart reglages" aria-labelledby="t-compte">
                            <h2 id="t-compte" style={{ fontSize: 'var(--taille-xl)', margin: 0 }}>Compte</h2>
                            <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>Connecté·e avec {profil.email}</p>
                            <FormEmail onChange={(nouveau) => { setProfil(nouveau); mettreAJourUtilisateur(nouveau); }} />
                            <FormMotDePasse />
                            <Bouton variante="fantome" icone="deconnexion" onClick={deconnexion} style={{ justifyContent: 'flex-start' }}>
                                Se déconnecter
                            </Bouton>
                            {!isAdmin && <FormSuppression onSupprime={deconnexion} />}
                        </section>
                    </aside>
                )}
            </div>
            {message && <div className="toast" role="status"><Icone nom="valider" />{message}</div>}

            {!estMoi && (
                <>
                    <FenetreConfirmation ouverte={confirmerBlocage} titre={`Bloquer ${profil.prenom || 'ce membre'} ?`}
                                         texteConfirmer="Oui, bloquer" onConfirmer={basculerBlocage} onAnnuler={() => setConfirmerBlocage(false)}>
                        Vous ne pourrez plus vous écrire ni vous suivre. Tu pourras le débloquer à tout moment.
                    </FenetreConfirmation>
                    <FenetreSignalement ouverte={signalementOuvert} cibleType="membre" cibleId={profil.id} nom={profil.prenom || 'ce membre'}
                                        onFermer={() => setSignalementOuvert(false)}
                                        onEnvoye={() => { setSignalementOuvert(false); setMessage("Merci, l'équipe va regarder."); }} />
                </>
            )}
        </main>
    );
};

export default ProfilPage;
