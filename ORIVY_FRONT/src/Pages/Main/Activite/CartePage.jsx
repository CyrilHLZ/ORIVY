import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { useLieux } from '../../../Hooks/useLieux.js';
import { getPromenades, updatePoint } from '../../../Services/Carte/CarteService.js';
import { ICONES } from '../../../Composants/icones.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import { demanderPosition, distanceKm, formaterDistance, trouverVille, adresseDe } from '../../../Utils/proximite.js';
import Bouton, { BoutonIcone } from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import Photo from '../../../Composants/Photo.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import BoutonFavori from '../../../Composants/BoutonFavori.jsx';
import FenetreLieu from '../../../Composants/FenetreLieu.jsx';
import { ChoixSegmente, OPTIONS_RAYON, Puce, Puces } from '../../../Composants/Filtres.jsx';
import AvisLieu from '../../../Composants/AvisLieu.jsx';

/*
 * Page Carte (maquette design/maquettes/carte.html) :
 *   - plein écran, centrée sur la France entière ;
 *   - épingles colorées par catégorie, accessibles au clavier (Tab puis Entrée) ;
 *   - « Me localiser » (position demandée au clic seulement), point bleu, cercle du rayon ;
 *   - clic sur une épingle : tiroir de détail (monte du bas sur mobile) ;
 *   - à l'arrivée, une fenêtre demande les catégories à afficher (765 lieux d'un coup, c'est illisible) ;
 *   - les promenades sont tracées (ligne) avec la catégorie « Randonnées » ;
 *   - admin : « Ajouter un lieu », puis clic sur la carte → fenêtre pré-remplie (coordonnées + adresse).
 * Adresses comprises :
 *   /carte?cat=parc                 → filtre une catégorie
 *   /carte?lieu=point-12            → ouvre la fiche d'un lieu (liens des cartes de lieu)
 *   /carte?lat=…&lng=…&nom=…        → centre sur un endroit précis (ex. le lieu d'une sortie)
 */

const FRANCE = [46.6, 2.4];

/* ---- Icônes d'épingle (Leaflet veut du HTML en texte) ----
   On les fabrique une seule fois par catégorie et par état, puis on les réutilise :
   765 épingles ne créent donc que quelques dizaines d'icônes. */
const cacheIcones = {};
const iconeEpingle = (cle, active) => {
    const id = `${cle}-${active}`;
    if (!cacheIcones[id]) {
        cacheIcones[id] = L.divIcon({
            className: '',
            iconSize: [48, 60],
            iconAnchor: [24, 58],   // la pointe de la goutte touche le lieu
            html:
                `<div class="epingle cat-${cle}${active ? ' epingle--active' : ''}">` +
                '<svg class="goutte" viewBox="0 0 48 60" aria-hidden="true"><path d="M24 58 C24 58 4 36 4 22 A20 20 0 0 1 44 22 C44 36 24 58 24 58 Z"/></svg>' +
                `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">${ICONES[`cat-${cle}`] || ''}</svg>` +
                '</div>',
        });
    }
    return cacheIcones[id];
};
const ICONE_POSITION = L.divIcon({ className: '', html: '<div class="position-point"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });

/* ---- Pilote : déplace la carte quand la page le demande ----
   useMap() donne accès à l'objet Leaflet, mais SEULEMENT dans un enfant de <MapContainer>. */
const PiloteCarte = ({ vue }) => {
    const carte = useMap();
    useEffect(() => {
        if (!vue) return;
        if (vue.limites) carte.fitBounds(vue.limites, { padding: [24, 24] });
        else carte.setView(vue.centre, vue.zoom ?? carte.getZoom());
    }, [carte, vue]);
    return null;
};

/* ---- Suit le niveau de zoom (même règle : seulement dans un enfant de <MapContainer>) ----
   Piège : useMapEvents réinstalle ses écouteurs si on lui donne un NOUVEL objet à chaque rendu.
   Or React fait tous les nettoyages AVANT les effets : pendant ce court instant, aucun écouteur,
   et le moveend déclenché par le pilote (setView) est perdu. D'où useMemo : un objet stable. */
const SuiviZoom = ({ onZoom }) => {
    const ecouteurs = useMemo(() => ({
        zoomend: (e) => onZoom(e.target.getZoom()),
        moveend: (e) => onZoom(e.target.getZoom()),   // après tout déplacement, zoom compris
    }), [onZoom]);
    const carte = useMapEvents(ecouteurs);
    // Le zoom a pu changer avant que l'écouteur ne soit branché
    useEffect(() => { onZoom(carte.getZoom()); }, [carte, onZoom]);
    return null;
};

/* ---- Mode « ajout d'un lieu » (admin) : un clic sur la carte donne ses coordonnées ---- */
const ClicCarte = ({ onClic }) => {
    const ecouteurs = useMemo(() => ({ click: (e) => onClic(e.latlng) }), [onClic]);
    useMapEvents(ecouteurs);
    return null;
};

/* En dessous de ce zoom, les épingles s'empileraient : on montre de petits points */
const ZOOM_EPINGLES = 9;

/* Dernier choix de catégories, retrouvé à la visite suivante (sur cet appareil seulement) */
const CLE_CHOIX = 'orivy.carte.categories';
const lireChoix = () => {
    try { return JSON.parse(localStorage.getItem(CLE_CHOIX)) || []; } catch { return []; }
};
const enregistrerChoix = (liste) => {
    try { localStorage.setItem(CLE_CHOIX, JSON.stringify(liste)); } catch { /* navigation privée : tant pis */ }
};

/* L'itinéraire d'une promenade est rangé en texte JSON : [[lat, lng], …] */
const pointsDe = (promenade) => {
    try { return JSON.parse(promenade.parcoursJson || '[]'); } catch { return []; }
};

/* ---- Fenêtre de choix des catégories (avant d'afficher la carte) ----
   Même principe que FenetreConfirmation : <dialog> du navigateur, focus gardé, Échap ferme. */
const ChoixCategories = ({ ouverte, choix, nombres, onValider, onFermer }) => {
    const dialogue = useRef(null);
    const [coches, setCoches] = useState(choix);

    useEffect(() => {
        const d = dialogue.current;
        if (ouverte && !d.open) {
            setCoches(choix);
            d.showModal();
            // Le navigateur donnerait le focus à la 1re case (elle aurait l'air cochée) : on le met sur le titre
            d.querySelector('h2')?.focus();
        }
        if (!ouverte && d.open) d.close();
    }, [ouverte]); // eslint-disable-line react-hooks/exhaustive-deps

    const basculer = (cle) => setCoches((l) => (l.includes(cle) ? l.filter((c) => c !== cle) : [...l, cle]));
    const total = coches.reduce((n, cle) => n + (nombres[cle] || 0), 0);

    return (
        <dialog className="fenetre fenetre--categories" ref={dialogue} aria-labelledby="choix-titre" onCancel={onFermer}>
            <div className="fenetre--categories__tete">
                <h2 id="choix-titre" tabIndex={-1} style={{ outline: 'none' }}>Qu'est-ce qui te tente ?</h2>
                <BoutonIcone icone="fermer" label="Fermer" onClick={onFermer} />
            </div>
            {/* Petites pastilles à cocher : icône + nom, de la couleur de la catégorie une fois cochées */}
            <fieldset className="choix-categories">
                <legend className="visuellement-cache">Catégories à afficher sur la carte</legend>
                {LISTE_CATEGORIES.filter((c) => c.cle !== 'autre').map((c) => (
                    <label key={c.cle} className={`choix-categorie cat-${c.cle}`}>
                        <input type="checkbox" className="visuellement-cache" checked={coches.includes(c.cle)} onChange={() => basculer(c.cle)} />
                        <Icone nom={`cat-${c.cle}`} />{c.pluriel}
                    </label>
                ))}
            </fieldset>
            <div className="choix-categories__actions">
                <Bouton variante="secondaire" onClick={() => onValider([])}>Tout</Bouton>
                <Bouton icone="carte" disabled={coches.length === 0} onClick={() => onValider(coches)}>
                    {coches.length === 0 ? 'Choisis' : `Voir ${total} ${total > 1 ? 'lieux' : 'lieu'}`}
                </Bouton>
            </div>
        </dialog>
    );
};

const CartePage = () => {
    const { isAdmin } = useAuth();
    const { lieux, chargement, erreur, recharger } = useLieux();
    const [parametres] = useSearchParams();

    // On arrive d'un lien précis (?cat, ?lieu, ?lat) : pas de fenêtre, on montre directement
    const arriveeDirecte = parametres.has('cat') || parametres.has('lieu') || parametres.has('lat');
    const [actives, setActives] = useState(() => (parametres.get('cat') ? [parametres.get('cat')] : lireChoix()));
    const [choixOuvert, setChoixOuvert] = useState(!arriveeDirecte);
    const [promenades, setPromenades] = useState([]);
    const [position, setPosition] = useState(null);   // { lat, lng, gps }
    const [rayon, setRayon] = useState(10);
    const [ville, setVille] = useState('');
    const [localisation, setLocalisation] = useState(false);
    const [selection, setSelection] = useState(null);
    const [vue, setVue] = useState(null);
    const [zoom, setZoom] = useState(window.innerWidth < 768 ? 5 : 6);
    const [message, setMessage] = useState(null);
    const champVille = useRef(null);
    const tiroir = useRef(null);
    const marqueurs = useRef({});   // id du lieu → marqueur Leaflet (pour rendre le focus)
    const [placement, setPlacement] = useState(false);   // admin : « clique sur la carte »
    const [nouveauLieu, setNouveauLieu] = useState(null); // ouvre FenetreLieu pré-remplie

    /* Cette page occupe tout l'écran : classe sur <body> (voir pages.css) */
    useEffect(() => {
        document.body.classList.add('page-carte');
        return () => document.body.classList.remove('page-carte');
    }, []);

    /* Message éphémère (toast) qui disparaît au bout de 5 secondes */
    useEffect(() => {
        if (!message) return undefined;
        const minuteur = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(minuteur);
    }, [message]);

    /* Lieux visibles selon les catégories cochées (aucune = toutes) */
    const visibles = useMemo(
        () => lieux.filter((l) => l.latitude != null && (actives.length === 0 || actives.includes(l.categorie))),
        [lieux, actives],
    );

    const basculerCategorie = (cle) => setActives((liste) => (liste.includes(cle) ? liste.filter((c) => c !== cle) : [...liste, cle]));

    /* Promenades (itinéraires tracés) : affichées avec la catégorie « Randonnées » */
    useEffect(() => {
        getPromenades().then(setPromenades).catch(() => {});   // sans promenades, la carte reste utilisable
    }, []);
    const promenadesVisibles = actives.length === 0 || actives.includes('promenade') ? promenades : [];

    /* Nombre de lieux par catégorie, affiché dans la fenêtre de choix */
    const nombres = useMemo(() => {
        const n = {};
        lieux.forEach((l) => { n[l.categorie] = (n[l.categorie] || 0) + 1; });
        n.promenade = (n.promenade || 0) + promenades.length;
        return n;
    }, [lieux, promenades]);

    const validerChoix = (liste) => {
        setActives(liste);
        enregistrerChoix(liste);
        setChoixOuvert(false);
    };

    /* ---- Position ---- */
    const placerPosition = (pos) => {
        setPosition(pos);
        setVue({ limites: L.latLng(pos.lat, pos.lng).toBounds(rayon * 2000) });
    };

    const meLocaliser = async () => {
        setLocalisation(true);
        try {
            placerPosition({ ...(await demanderPosition()), gps: true });
            setMessage('Te voilà sur la carte.');
        } catch (e) {
            setMessage(e.message);
            champVille.current?.focus();
        } finally {
            setLocalisation(false);
        }
    };

    const chercherVille = async (event) => {
        event.preventDefault();
        try {
            const trouvee = await trouverVille(ville);
            if (trouvee) placerPosition({ ...trouvee, gps: false });
            else setMessage(`Aucune commune ne s'appelle « ${ville} ». Vérifie l'orthographe.`);
        } catch (e) {
            setMessage(e.message);
        }
    };

    const placerLieu = async ({ lat, lng }) => {
        setPlacement(false);
        const adresse = await adresseDe(lat, lng).catch(() => '');
        setNouveauLieu({ latitude: lat.toFixed(6), longitude: lng.toFixed(6), adresse });
    };

    const changerRayon = (km) => {
        setRayon(km);
        if (position) setVue({ limites: L.latLng(position.lat, position.lng).toBounds(km * 2000) });
    };

    /* ---- Tiroir ---- */
    const ouvrir = (lieu) => {
        setSelection(lieu);
        // Depuis la vue éloignée, on rapproche la carte pour voir les épingles autour
        setVue({ centre: [lieu.latitude, lieu.longitude], zoom: Math.max(zoom, 12) });
    };
    const fermer = () => {
        const id = selection?.id;
        setSelection(null);
        // On rend le focus à l'épingle d'où l'on venait (navigation au clavier)
        marqueurs.current[id]?.getElement()?.focus();
    };

    // À l'ouverture, le focus va dans le tiroir ; Échap le ferme
    useEffect(() => {
        if (!selection) return undefined;
        tiroir.current?.focus();
        const echap = (e) => { if (e.key === 'Escape') fermer(); };
        document.addEventListener('keydown', echap);
        return () => document.removeEventListener('keydown', echap);
    }, [selection]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Arrivée avec ?lieu=point-12 : on ouvre sa fiche dès que les lieux sont chargés */
    useEffect(() => {
        const demande = parametres.get('lieu');
        if (!demande || lieux.length === 0) return;
        const lieu = lieux.find((l) => l.id === demande);
        if (lieu) { setSelection(lieu); setVue({ centre: [lieu.latitude, lieu.longitude], zoom: 13 }); }
    }, [lieux, parametres]);

    /* Arrivée avec ?lat=…&lng=…&nom=… (ex. depuis une sortie) */
    const repere = useMemo(() => {
        const lat = Number(parametres.get('lat'));
        const lng = Number(parametres.get('lng'));
        return parametres.has('lat') && Number.isFinite(lat) && Number.isFinite(lng)
            ? { centre: [lat, lng], nom: parametres.get('nom') || 'Lieu sélectionné' }
            : null;
    }, [parametres]);
    useEffect(() => { if (repere) setVue({ centre: repere.centre, zoom: 15 }); }, [repere]);

    const km = (l) => (position ? distanceKm(position.lat, position.lng, l.latitude, l.longitude) : null);

    return (
        <main className={placement ? "carte-zone carte-zone--placement" : "carte-zone"}>
            <h1 className="visuellement-cache">Carte des lieux</h1>

            <MapContainer
                id="carte"
                center={FRANCE}
                zoom={window.innerWidth < 768 ? 5 : 6}
                zoomControl={false}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">les contributeurs OpenStreetMap</a>'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
                <ZoomControl position="bottomleft" />
                <PiloteCarte vue={vue} />
                <SuiviZoom onZoom={setZoom} />

                {/* Promenades : une ligne qui relie les points de l'itinéraire, clic = fiche */}
                {promenadesVisibles.map((p) => {
                    const points = pointsDe(p);
                    if (points.length < 2) return null;
                    return (
                        // className en prop directe (comme pour CircleMarker) : couleur prise dans le CSS
                        <Polyline key={`promenade-${p.id}`} positions={points} className="trace-promenade">
                            <Popup>
                                <strong>{p.nom}</strong><br />
                                {[p.distanceKm && `${p.distanceKm} km`, p.dureeMinutes && `${p.dureeMinutes} min`, p.difficulte]
                                    .filter(Boolean).join(' · ')}
                                {p.description && <p style={{ margin: '0.5em 0 0' }}>{p.description}</p>}
                            </Popup>
                        </Polyline>
                    );
                })}

                {/* Vue éloignée : de petits points de couleur (lisibles même à 765 lieux) */}
                {zoom < ZOOM_EPINGLES && visibles.map((lieu) => (
                    <CircleMarker
                        key={lieu.id}
                        center={[lieu.latitude, lieu.longitude]}
                        radius={6}
                        // className en prop directe : dans pathOptions, react-leaflet l'ignorerait
                        className={`point-lieu cat-${categorie(lieu.categorie).cle}`}
                        eventHandlers={{ click: () => ouvrir(lieu) }}
                    />
                ))}

                {/* Vue rapprochée : les vraies épingles (et toujours celle du lieu ouvert) */}
                {visibles.filter((lieu) => zoom >= ZOOM_EPINGLES || selection?.id === lieu.id).map((lieu) => {
                    const distance = km(lieu);
                    return (
                        <Marker
                            key={lieu.id}
                            position={[lieu.latitude, lieu.longitude]}
                            icon={iconeEpingle(categorie(lieu.categorie).cle, selection?.id === lieu.id)}
                            title={`${lieu.nom} (${categorie(lieu.categorie).nom})`}
                            alt={lieu.nom}
                            keyboard
                            riseOnHover
                            // Hors du rayon : épingle estompée
                            opacity={distance != null && distance > rayon ? 0.45 : 1}
                            ref={(m) => { if (m) marqueurs.current[lieu.id] = m; }}
                            eventHandlers={{ click: () => ouvrir(lieu) }}
                        />
                    );
                })}

                {position?.gps && <Marker position={[position.lat, position.lng]} icon={ICONE_POSITION} interactive={false} keyboard={false} />}
                {position && (
                    <Circle center={[position.lat, position.lng]} radius={rayon * 1000} interactive={false}
                            className="cercle-rayon" />
                )}
                {repere && <Marker position={repere.centre} icon={iconeEpingle('autre', true)} title={repere.nom} />}
                {placement && <ClicCarte onClic={placerLieu} />}
            </MapContainer>

            {/* Recherche et filtres posés sur la carte */}
            <div className="carte-outils">
                <form role="search" onSubmit={chercherVille}>
                    <Champ ref={champVille} label="Cherche une ville" cacherLabel icone="loupe" type="search"
                           placeholder="Cherche une ville : Nantes, Annecy…" autoComplete="off"
                           value={ville} onChange={(e) => setVille(e.target.value)} />
                </form>
                <Puces label="Filtrer par catégorie">
                    <Puce actif={actives.length === 0} onClick={() => setActives([])}>Tout</Puce>
                    {LISTE_CATEGORIES.filter((c) => c.cle !== 'autre').map((c) => (
                        <Puce key={c.cle} cle={c.cle} actif={actives.includes(c.cle)} onClick={() => basculerCategorie(c.cle)}>
                            {c.pluriel}
                        </Puce>
                    ))}
                </Puces>
            </div>

            {/* Boutons flottants */}
            <div className="carte-flottants">
                {position && (
                    <div className="carte-rayon">
                        <ChoixSegmente nom="rayon" legende="Rayon autour de toi" valeur={rayon} onChange={changerRayon} options={OPTIONS_RAYON} />
                    </div>
                )}
                {isAdmin && (
                    <Bouton variante={placement ? 'principal' : 'secondaire'} pilule icone="plus"
                            onClick={() => { setPlacement(!placement); setMessage(placement ? null : "Touche la carte à l'endroit du nouveau lieu."); }}>
                        {placement ? 'Annuler' : 'Ajouter un lieu'}
                    </Bouton>
                )}
                <Bouton variante="secondaire" pilule icone="filtres" onClick={() => setChoixOuvert(true)}>Catégories</Bouton>
                <Bouton variante="secondaire" pilule icone="liste" vers="/activites">Liste</Bouton>
                <button className="bouton bouton--icone bouton--flottant" type="button" onClick={meLocaliser}
                        disabled={localisation} aria-busy={localisation} aria-label="Me localiser">
                    {localisation ? <span className="radar" aria-hidden="true"><i /></span> : <Icone nom="localiser" />}
                </button>
            </div>

            {/* Tiroir de détail (hidden : il glisse hors de l'écran) */}
            <aside className="tiroir" ref={tiroir} hidden={!selection} tabIndex={-1}
                   aria-labelledby="tiroir-titre">
                {selection && (
                    <DetailLieu
                        lieu={selection}
                        km={km(selection)}
                        modifiable={isAdmin && selection.source === 'point'}
                        onFermer={fermer}
                        onModifie={() => { recharger(); setMessage('Point enregistré.'); }}
                        onAvis={recharger}
                    />
                )}
            </aside>

            <ChoixCategories ouverte={choixOuvert} choix={actives} nombres={nombres}
                             onValider={validerChoix} onFermer={() => setChoixOuvert(false)} />

            {/* États de chargement et messages (lus par les lecteurs d'écran) */}
            <p className="visuellement-cache" aria-live="polite">
                {chargement ? 'Chargement des lieux…' : `${visibles.length} lieux affichés sur la carte.`}
            </p>
            {erreur && (
                <div className="toast" role="alert">
                    <Icone nom="alerte" />{erreur}
                    <button className="bouton bouton--fantome" type="button" onClick={recharger} style={{ color: 'inherit' }}>Réessaie</button>
                </div>
            )}
            {message && !erreur && <div className="toast" role="status"><Icone nom="info" />{message}</div>}
            <FenetreLieu point={nouveauLieu} onFermer={() => setNouveauLieu(null)}
                         onEnregistre={(texte) => { setNouveauLieu(null); setMessage(texte); recharger(); }} />
        </main>
    );
};

/* ---- Contenu du tiroir : fiche d'un lieu (+ modification pour les admins) ---- */
const DetailLieu = ({ lieu, km, modifiable, onFermer, onModifie, onAvis }) => {
    const [edition, setEdition] = useState(null);   // null = lecture ; objet = formulaire ouvert
    const [statut, setStatut] = useState('');

    const enregistrer = async (event) => {
        event.preventDefault();
        try {
            // Le back attend un point d'intérêt complet : on renvoie ses champs d'origine + les modifs
            await updatePoint(lieu.idNum, { id: lieu.idNum, nom: lieu.nom, description: lieu.description, type: lieu.categorie,
                latitude: lieu.latitude, longitude: lieu.longitude, adresse: lieu.lieu, imageUrl: lieu.imageUrl, ...edition });
            setEdition(null);
            onModifie();
        } catch {
            setStatut("Impossible d'enregistrer les modifications.");
        }
    };

    const coord = `${lieu.latitude},${lieu.longitude}`;

    return (
        <>
            <span className="tiroir__poignee" aria-hidden="true" />
            <div className={`detail-lieu cat-${categorie(lieu.categorie).cle}`}>
                <div className="detail-lieu__tete">
                    <BadgeCategorie cle={lieu.categorie} />
                    <span style={{ display: 'flex', gap: 'var(--espace-1)' }}>
                        <BoutonFavori type={lieu.source} id={lieu.idNum} nom={lieu.nom} />
                        <BoutonIcone icone="fermer" label="Fermer la fiche du lieu" onClick={onFermer} />
                    </span>
                </div>
                <Photo src={lieu.imageUrl || categorie(lieu.categorie).image} alt="" cle={lieu.categorie} paresseuse={false} />
                <h2 id="tiroir-titre">{lieu.nom}</h2>
                <div className="detail-lieu__infos">
                    {lieu.lieu && <span className="badge-distance"><Icone nom="epingle" />{lieu.lieu}</span>}
                    {km != null && <span className="badge-distance"><Icone nom="autour" />{formaterDistance(km)}</span>}
                </div>
                {lieu.description && <p className="texte-doux" style={{ margin: 0 }}>{lieu.description}</p>}

                <div className="ligne-actions">
                    <Link className="bouton bouton--principal" to={`/sorties/creation?lieu=${lieu.id}`}>
                        <Icone nom="plus" />Crée une sortie ici
                    </Link>
                    <a className="bouton bouton--secondaire" href={`https://www.google.com/maps/search/?api=1&query=${coord}`} target="_blank" rel="noreferrer">
                        <Icone nom="autour" />Google Maps
                    </a>
                    <a className="bouton bouton--secondaire" href={`https://waze.com/ul?ll=${encodeURIComponent(coord)}&navigate=yes`} target="_blank" rel="noreferrer">
                        Waze
                    </a>
                </div>

                <AvisLieu type={lieu.source} id={lieu.idNum} onChange={onAvis} />

                {/* Réservé aux admins : modifier un point d'intérêt */}
                {modifiable && !edition && (
                    <Bouton variante="fantome" icone="modifier"
                            onClick={() => setEdition({ nom: lieu.nom || '', adresse: lieu.lieu || '', imageUrl: lieu.imageUrl || '' })}>
                        Modifier ce point
                    </Bouton>
                )}
                {modifiable && edition && (
                    <form className="formulaire" onSubmit={enregistrer} style={{ gap: 'var(--espace-3)' }}>
                        <Champ label="Nom" value={edition.nom} required onChange={(e) => setEdition({ ...edition, nom: e.target.value })} />
                        <Champ label="Adresse" value={edition.adresse} onChange={(e) => setEdition({ ...edition, adresse: e.target.value })} />
                        <Champ label="Adresse de l'image" type="url" placeholder="https://…" value={edition.imageUrl}
                               onChange={(e) => setEdition({ ...edition, imageUrl: e.target.value })} />
                        {statut && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{statut}</p>}
                        <div className="ligne-actions">
                            <Bouton type="submit">Enregistrer</Bouton>
                            <Bouton variante="fantome" onClick={() => setEdition(null)}>Annuler</Bouton>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default CartePage;
