import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFil } from '../../Services/Fil/FilService.js';
import { ilYa } from '../../Utils/dates.js';
import Avatar from '../../Composants/Avatar.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import Photo, { estVideo } from '../../Composants/Photo.jsx';
import { Puce, Puces } from '../../Composants/Filtres.jsx';
import { EtatErreur, EtatVide } from '../../Composants/Etats.jsx';

/*
 * Fil façon TikTok : les photos et vidéos des albums de sorties, une par écran (mobile),
 * en grille sur ordinateur. Réutilise la mise en page .fil / .diapo de la page Sorties (pages.css).
 * Données : GET /api/fil?onglet=…&page=… (10 par page, la suite se charge en arrivant en bas).
 */

const PAR_PAGE = 10;
const ONGLETS = [
    { cle: 'pour-toi', nom: 'Pour toi' },
    { cle: 'abonnements', nom: 'Abonnements' },
];

/* ---- Vidéo du fil : ne joue QUE quand elle est à l'écran (sinon 10 vidéos tourneraient en même temps) ---- */
const VideoFil = ({ src, sonActif }) => {
    const video = useRef(null);

    useEffect(() => {
        const element = video.current;
        // IntersectionObserver : le navigateur nous prévient quand l'élément entre ou sort de l'écran
        const observateur = new IntersectionObserver(([entree]) => {
            if (entree.isIntersecting) element.play().catch(() => {});   // lecture refusée : tant pis, l'image reste
            else element.pause();
        }, { threshold: 0.6 });   // visible à 60 % au moins
        observateur.observe(element);
        return () => observateur.disconnect();
    }, []);

    return (
        <div className="photo">
            <video ref={video} src={src} muted={!sonActif} loop playsInline preload="metadata" aria-hidden="true" />
        </div>
    );
};

/* ---- Une publication = un écran ---- */
const Publication = ({ publication, premiere, sonActif, onSon }) => {
    const { auteur } = publication;
    const video = estVideo(publication.url);
    const titreId = `publication-${publication.id}`;

    return (
        <article className="diapo" aria-labelledby={titreId}>
            {video
                ? <VideoFil src={publication.url} sonActif={sonActif} />
                : <Photo src={publication.url} alt={`Photo de ${auteur.prenom} à « ${publication.sortieNom} »`} paresseuse={!premiere} />}
            <div className="diapo__voile" aria-hidden="true" />

            <div className="diapo__contenu">
                <div className="diapo__orga">
                    <Avatar personne={auteur} taille="s" />
                    <Link to={`/profil/${auteur.id}`} style={{ color: 'inherit', fontWeight: 'var(--graisse-forte)' }}>
                        {[auteur.prenom, auteur.nom].filter(Boolean).join(' ')}
                    </Link>
                    <span>· {ilYa(publication.dateAjout)}</span>
                </div>
                <h2 id={titreId}><Link to={`/sorties/${publication.sortieId}`}>{publication.sortieNom}</Link></h2>
                {publication.sortieLieu && (
                    <p className="diapo__meta"><span><Icone nom="epingle" taille="petite" />{publication.sortieLieu}</span></p>
                )}
            </div>

            <div className="diapo__actions">
                {video && (
                    <button className="bouton bouton--icone" type="button" aria-pressed={sonActif} onClick={onSon}
                            aria-label={sonActif ? 'Couper le son' : 'Activer le son'}>
                        <Icone nom={sonActif ? 'son' : 'son-coupe'} />
                    </button>
                )}
                <Link className="bouton bouton--icone" to={`/sorties/${publication.sortieId}`} aria-label={`Voir la sortie « ${publication.sortieNom} »`}>
                    <Icone nom="calendrier" />
                </Link>
            </div>
            {premiere && <p className="fil-aide" aria-hidden="true"><Icone nom="chevron-haut" taille="petite" />Glisse pour la suivante</p>}
        </article>
    );
};

const FilPage = () => {
    const [onglet, setOnglet] = useState('pour-toi');
    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(0);
    const [fin, setFin] = useState(false);            // plus rien à charger
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [sonActif, setSonActif] = useState(false);  // le son reste coupé tant qu'on ne l'active pas
    const [essai, setEssai] = useState(0);            // « Réessaie » : relance la même requête
    const sentinelle = useRef(null);

    // Plein écran (pages.css) : classe sur <body>
    useEffect(() => {
        document.body.classList.add('page-fil');
        return () => document.body.classList.remove('page-fil');
    }, []);

    // Changement d'onglet : on repart de zéro
    useEffect(() => {
        setPublications([]);
        setPage(0);
        setFin(false);
    }, [onglet]);

    // Chargement d'une page (la 0 au départ, puis la suivante quand la sentinelle apparaît)
    useEffect(() => {
        let annule = false;   // l'onglet a changé pendant la requête : on jette la réponse
        setChargement(true);
        setErreur(null);
        getFil(onglet, page)
            .then((nouvelles) => {
                if (annule) return;
                setPublications((avant) => (page === 0 ? nouvelles : [...avant, ...nouvelles]));
                if (nouvelles.length < PAR_PAGE) setFin(true);
            })
            .catch(() => !annule && setErreur('Le fil ne se charge pas pour le moment.'))
            .finally(() => !annule && setChargement(false));
        return () => { annule = true; };
    }, [onglet, page, essai]);

    // Sentinelle : un élément invisible en bas du fil. Quand il apparaît → page suivante
    useEffect(() => {
        const element = sentinelle.current;
        if (!element || fin || chargement) return undefined;
        const observateur = new IntersectionObserver(([entree]) => {
            if (entree.isIntersecting) setPage((p) => p + 1);
        });
        observateur.observe(element);
        return () => observateur.disconnect();
    }, [fin, chargement, publications.length]);

    const vide = !chargement && !erreur && publications.length === 0;

    return (
        <main>
            <h1 className="visuellement-cache">Fil</h1>

            <div className="fil-filtres conteneur">
                <Puces label="Choisir le fil">
                    {ONGLETS.map((o) => (
                        <Puce key={o.cle} actif={onglet === o.cle} onClick={() => setOnglet(o.cle)}>{o.nom}</Puce>
                    ))}
                </Puces>
            </div>

            <div className="conteneur page-fil__etat">
            {erreur && <EtatErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />}

            {vide && (onglet === 'abonnements' ? (
                <EtatVide icone="suivre" titre="Personne à suivre pour l'instant"
                          action={<Bouton icone="utilisateurs" vers="/communaute">Trouve des membres</Bouton>}>
                    Abonne-toi à des membres : leurs photos et vidéos de sorties apparaîtront ici.
                </EtatVide>
            ) : (
                <EtatVide icone="image" titre="Le fil est encore vide"
                          action={<Bouton icone="calendrier" vers="/sorties">Voir les sorties</Bouton>}>
                    Les photos et vidéos ajoutées aux albums des sorties apparaîtront ici.
                </EtatVide>
            ))}
            </div>

            {publications.length > 0 && (
                <div className="fil conteneur" tabIndex={0} aria-label="Fil de photos et vidéos, fais défiler pour la suivante">
                    {publications.map((p, i) => (
                        <Publication key={p.id} publication={p} premiere={i === 0}
                                     sonActif={sonActif} onSon={() => setSonActif(!sonActif)} />
                    ))}
                    {!fin && <div ref={sentinelle} className="fil-sentinelle" aria-hidden="true" />}
                </div>
            )}
            <p className="visuellement-cache" aria-live="polite">{chargement ? 'Chargement…' : ''}</p>
        </main>
    );
};

export default FilPage;
