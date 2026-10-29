import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSorties, inscriptionSortie, searchSorties } from '../../../Services/Sortie/SortieService';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { categorie } from '../../../Constants/categories.js';
import { dateLisible, lireDate } from '../../../Utils/dates.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import Photo from '../../../Composants/Photo.jsx';
import Avatar from '../../../Composants/Avatar.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Puce, Puces } from '../../../Composants/Filtres.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import { EtatErreur, EtatVide } from '../../../Composants/Etats.jsx';

const SocialPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [sorties, setSorties] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [filtre, setFiltre] = useState('tout');
    const [message, setMessage] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [resultats, setResultats] = useState(null);

    const charger = () => {
        setChargement(true);
        setErreur(null);
        getSorties()
            .then(setSorties)
            .catch(() => setErreur('Une erreur est survenue lors de la récupération des sorties.'))
            .finally(() => setChargement(false));
    };
    useEffect(charger, []);

    // Mise en page plein écran (pages.css) : classe sur <body>
    useEffect(() => {
        document.body.classList.add('page-sorties');
        return () => document.body.classList.remove('page-sorties');
    }, []);

    useEffect(() => {
        if (!message) return undefined;
        const minuteur = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(minuteur);
    }, [message]);

    useEffect(() => {
        const mot = recherche.trim();
        if (mot.length < 2) { setResultats(null); return undefined; }
        const minuteur = setTimeout(() => {
            searchSorties(mot).then(setResultats).catch(() => setResultats([]));
        }, 300);
        return () => clearTimeout(minuteur);
    }, [recherche])

    /* Sorties à venir, de la plus proche à la plus lointaine */
    const aVenir = useMemo(() => {
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        return sorties
            .filter((s) => s.dateDebut && lireDate(s.dateDebut) >= aujourdhui)
            .sort((a, b) => lireDate(a.dateDebut) - lireDate(b.dateDebut));
    }, [sorties]);

    /* Les puces de catégorie : seulement celles qui ont des sorties */
    const categoriesPresentes = useMemo(() => [...new Set(aVenir.map((s) => categorie(s.categorie).cle))], [aVenir]);

    const affichees = useMemo(() => {
        if (resultats) return resultats;
        if (filtre === 'tout') return aVenir;
        if (filtre === 'weekend') {
            const [debut, fin] = bornesWeekend();
            return aVenir.filter((s) => { const d = lireDate(s.dateDebut); return d >= debut && d <= fin; });
        }
        return aVenir.filter((s) => categorie(s.categorie).cle === filtre);
    }, [aVenir, filtre, resultats]);

    const rejoindre = async (sortie) => {
        if (!isAuthenticated) { navigate('/connexion'); return; }
        try {
            // Le back renvoie la sortie à jour : on la remplace dans la liste
            const aJour = await inscriptionSortie(sortie.id);
            setSorties((liste) => liste.map((s) => (s.id === aJour.id ? aJour : s)));
            setMessage("C'est noté, à bientôt !");
        } catch (e) {
            setMessage(e.message || "L'inscription n'a pas fonctionné. Réessaie plus tard.");
        }
    };

    const bornesWeekend = () => {
        const auj = new Date();
        const samedi = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + ((6 - auj.getDay() + 7) % 7));
        if (auj.getDay() === 0) samedi.setDate(samedi.getDate() - 1);   // dimanche : le week-end a commencé hier
        const finDimanche = new Date(samedi.getFullYear(), samedi.getMonth(), samedi.getDate() + 1, 23, 59, 59);
        return [samedi, finDimanche];
    };

    /* Partager : la feuille de partage du téléphone si elle existe, sinon on copie le lien */
    const partager = async (sortie, signaler) => {
        const url = `${window.location.origin}/sorties/${sortie.id}`;
        try {
            if (navigator.share) await navigator.share({ title: sortie.nom, url });
            else { await navigator.clipboard.writeText(url); signaler('Lien copié !'); }
        } catch {
            // l'utilisateur a fermé la feuille de partage : rien à faire
        }
    };

    const DiapoSortie = ({ sortie, premiere, inscrit, onRejoindre, onPartager }) => {
        const cat = categorie(sortie.categorie);
        const titreId = `sortie-${sortie.id}`;
        const nbInscrits = sortie.participants?.length;
        const complet = sortie.nombreMax != null && (nbInscrits ?? 0) >= sortie.nombreMax;

        return (
            <article className={`diapo cat-${cat.cle}`} aria-labelledby={titreId}>
                <Photo src={sortie.imageUrl || cat.image} alt="" cle={cat.cle} paresseuse={!premiere} />
                {/* Voile sombre en bas de la photo : le texte reste lisible quelle que soit l'image */}
                <div className="diapo__voile" aria-hidden="true" />

                <div className="diapo__contenu">
                    <span style={{ alignSelf: 'flex-start' }}><BadgeCategorie cle={cat.cle} /></span>
                    <h2 id={titreId}><Link to={`/sorties/${sortie.id}`}>{sortie.nom}</Link></h2>
                    <p className="diapo__meta">
                        <span><Icone nom="horloge" taille="petite" />{dateLisible(sortie.dateDebut)}</span>
                        {sortie.lieu && <span><Icone nom="epingle" taille="petite" />{sortie.lieu}</span>}
                    </p>
                    {sortie.organisateur && (
                        <div className="diapo__orga">
                            <Avatar personne={sortie.organisateur} taille="s" />
                            <span>
                                Par {sortie.organisateur.prenom}
                                {nbInscrits != null && ` · ${nbInscrits}${sortie.nombreMax ? `/${sortie.nombreMax}` : ''} inscrits`}
                            </span>
                        </div>
                    )}
                    <div className="diapo__boutons">
                        <Bouton variante={inscrit ? 'secondaire' : 'principal'} aria-pressed={inscrit} disabled={inscrit || complet}
                                onClick={() => onRejoindre(sortie)}>
                            {inscrit ? 'Inscrit·e ✓' : complet ? 'Complet' : 'Rejoins'}
                        </Bouton>
                        <Bouton variante="secondaire" vers={`/sorties/${sortie.id}`}>Détails</Bouton>
                    </div>
                </div>

                {/* Actions au pouce, à droite (façon TikTok) */}
                <div className="diapo__actions">
                    <Link className="bouton bouton--icone" to={`/sorties/${sortie.id}#commentaires`} aria-label={`Commentaires de « ${sortie.nom} »`}>
                        <Icone nom="commentaire" />
                    </Link>
                    <button className="bouton bouton--icone" type="button" aria-label={`Partager « ${sortie.nom} »`} onClick={() => onPartager(sortie)}>
                        <Icone nom="partager" />
                    </button>
                </div>

                {premiere && (
                    <p className="fil-aide" aria-hidden="true"><Icone nom="chevron-haut" taille="petite" />Glisse pour la suivante</p>
                )}
            </article>
        );
    };

    return (
        <main>
            <h1 className="visuellement-cache">Sorties à venir</h1>
            <div className="conteneur ordinateur-seulement">
                <div className="section-titre">
                    <h2 style={{ margin: 0, fontSize: 'var(--taille-3xl)' }} aria-hidden="true">Sorties à venir</h2>
                    <Bouton icone="plus" vers="/sorties/creation">Crée une sortie</Bouton>
                </div>
            </div>

            <div className="conteneur" style={{ paddingInline: 0 }}>
                {/* Filtres : posés sur le fil en mobile, au-dessus de la grille sur ordinateur */}
                {aVenir.length > 0 && (
                      <div className="fil-filtres conteneur">
                        <form role="search" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 'var(--espace-2)' }}>
                            <Champ label="Cherche une sortie" cacherLabel icone="loupe" type="search"
                                placeholder="Cherche une sortie : pique-nique, Lille…" autoComplete="off"
                                value={recherche} onChange={(e) => setRecherche(e.target.value)} />
                        </form>
                        <Puces label="Filtrer les sorties">
                            {/* Sur ordinateur, le grand bouton « Crée une sortie » la remplace */}
                            <Link className="puce mobile-seulement" to="/sorties/creation"
                                  style={{ background: 'var(--couleur-principale)', borderColor: 'var(--couleur-principale)', color: 'var(--couleur-sur-principale)' }}>
                                <Icone nom="plus" />Crée
                            </Link>
                            <Puce actif={filtre === 'tout'} onClick={() => setFiltre('tout')}>Toutes</Puce>
                            <Puce actif={filtre === 'weekend'} onClick={() => setFiltre('weekend')}>Ce week-end</Puce>
                            {categoriesPresentes.map((cle) => (
                                <Puce key={cle} cle={cle} actif={filtre === cle} onClick={() => setFiltre(cle)}>
                                    {categorie(cle).pluriel}
                                </Puce>
                            ))}
                        </Puces>
                    </div>
                )}

                {chargement && <p className="conteneur" aria-busy="true" style={{ paddingTop: 'var(--espace-6)' }}>Chargement des sorties…</p>}
                {erreur && <div className="conteneur"><EtatErreur message={erreur} onReessayer={charger} /></div>}

                {!chargement && !erreur && affichees.length > 0 && (
                    // tabIndex : le fil défile aussi au clavier (flèches), une fois sélectionné
                    <div className="fil conteneur" tabIndex={0} aria-label="Sorties à venir, fais défiler pour la suivante">
                        {affichees.map((sortie, i) => (
                            <DiapoSortie
                                key={sortie.id}
                                sortie={sortie}
                                premiere={i === 0}
                                inscrit={sortie.participants?.some((p) => p.id === user?.id) ?? false}
                                onRejoindre={rejoindre}
                                onPartager={(s) => partager(s, setMessage)}
                            />
                        ))}
                    </div>
                )}

                {!chargement && !erreur && affichees.length === 0 && (
                    <div className="conteneur">
                        {aVenir.length === 0 ? (
                            <EtatVide icone="calendrier" titre="Aucune sortie prévue pour l'instant"
                                      action={<Bouton icone="plus" vers="/sorties/creation">Crée la première</Bouton>}>
                                Et si tu lançais la première ? Choisis un lieu, une date, et la bande suivra.
                            </EtatVide>
                        ) : resultats ? (
                        <EtatVide icone="loupe" titre="Aucun résultat"
                                action={<Bouton variante="secondaire" onClick={() => setRecherche('')}>Effacer la recherche</Bouton>}>
                            Aucune sortie à venir ne correspond à « {recherche.trim()} ».
                        </EtatVide>
                    ) : (
                        <EtatVide icone="calendrier" titre="Rien pour ce filtre"
                                action={<Bouton variante="secondaire" onClick={() => setFiltre('tout')}>Voir toutes les sorties</Bouton>}>
                            Aucune sortie ne correspond. Essaie un autre filtre.
                        </EtatVide>
                    )}
                    </div>
                )}
            </div>

            {message && <div className="toast" role="status"><Icone nom="info" />{message}</div>}
        </main>
    );
};

export default SocialPage;
