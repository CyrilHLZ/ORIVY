import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { getUserProfile, updateUserProfile } from '../../Services/Utilisateur/UtilisateurService.js';
import Avatar from '../../Composants/Avatar.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { Champ, Interrupteur } from '../../Composants/Formulaire.jsx';
import { ChoixSegmente } from '../../Composants/Filtres.jsx';
import { EtatErreur } from '../../Composants/Etats.jsx';
import { getSortiesMembre } from '../../Services/Sortie/SortieService.js';
import CarteSortie from '../../Composants/CarteSortie.jsx';


/*
 * Profil (maquette design/maquettes/profil.html).
 *   /profil       → mon profil : modification, réglages, compte
 *   /profil/:id   → le profil d'un autre membre (lecture seule)
 *
 * Affiche l'identité, la ville, la bio et les sorties (organisées / rejointes) du membre.
 * (Pas encore d'abonnés ni de photo dans le back.)
 */

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
                            {/* pre-line : garde les retours à la ligne tapés par le membre */}
                            {profil.bio && <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{profil.bio}</p>}
                            {estMoi && !edition && (
                                <div className="ligne-actions">
                                    <Bouton variante="secondaire" icone="modifier" onClick={() => setEdition(true)}>Modifier le profil</Bouton>
                                    {isAdmin && <Bouton variante="fantome" icone="bouclier" vers="/admin">Administration</Bouton>}
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
                </div>

                {/* Réglages et compte : seulement sur MON profil */}
                {estMoi && (
                    <aside className="pile" id="reglages">
                        <Reglages />
                        <section className="encart reglages" aria-labelledby="t-compte">
                            <h2 id="t-compte" style={{ fontSize: 'var(--taille-xl)', margin: 0 }}>Compte</h2>
                            <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>Connecté·e avec {profil.email}</p>
                            <Bouton variante="fantome" icone="deconnexion" onClick={deconnexion} style={{ justifyContent: 'flex-start' }}>
                                Se déconnecter
                            </Bouton>
                        </section>
                    </aside>
                )}
            </div>
            {message && <div className="toast" role="status"><Icone nom="valider" />{message}</div>}
        </main>
    );
};

export default ProfilPage;
