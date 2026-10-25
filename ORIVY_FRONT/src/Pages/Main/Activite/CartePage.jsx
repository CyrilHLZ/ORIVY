import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Circle, CircleMarker, MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { useLieux } from '../../../Hooks/useLieux.js';
import { updatePoint } from '../../../Services/Carte/CarteService.js';
import { ICONES } from '../../../Composants/icones.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import { demanderPosition, distanceKm, formaterDistance, trouverVille } from '../../../Utils/proximite.js';
import Bouton, { BoutonIcone } from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import Photo from '../../../Composants/Photo.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import { ChoixSegmente, OPTIONS_RAYON, Puce, Puces } from '../../../Composants/Filtres.jsx';

/*
 * Page Carte (maquette design/maquettes/carte.html) :
 *   - plein écran, centrée sur la France entière ;
 *   - épingles colorées par catégorie, accessibles au clavier (Tab puis Entrée) ;
 *   - « Me localiser » (position demandée au clic seulement), point bleu, cercle du rayon ;
 *   - clic sur une épingle : tiroir de détail (monte du bas sur mobile).
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

/* En dessous de ce zoom, les épingles s'empileraient : on montre de petits points */
const ZOOM_EPINGLES = 9;

const CartePage = () => {
    const { isAdmin } = useAuth();
    const { lieux, chargement, erreur, recharger } = useLieux();
    const [parametres] = useSearchParams();

    const [actives, setActives] = useState(() => (parametres.get('cat') ? [parametres.get('cat')] : []));
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

    const chercherVille = (event) => {
        event.preventDefault();
        const trouvee = trouverVille(ville);
        if (trouvee) placerPosition({ ...trouvee, gps: false });
        else setMessage(`On ne connaît pas encore « ${ville} ». Essaie une grande ville voisine.`);
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
        <main className="carte-zone">
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
                    />
                )}
            </aside>

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
        </main>
    );
};

/* ---- Contenu du tiroir : fiche d'un lieu (+ modification pour les admins) ---- */
const DetailLieu = ({ lieu, km, modifiable, onFermer, onModifie }) => {
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
                    <BoutonIcone icone="fermer" label="Fermer la fiche du lieu" onClick={onFermer} />
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
