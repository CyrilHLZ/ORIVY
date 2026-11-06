import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { normaliserLieux, normaliserPoint } from '../../../Hooks/useLieux.js';
import {
    deletePoint, envoyerPhotoPoint, getLieuxDepartement, getPoint, getPromenades, getZones, retirerPhotoPoint, updatePoint,
} from '../../../Services/Carte/CarteService.js';
import { getActivities } from '../../../Services/Activite/ActiviteService.js';
import { ICONES } from '../../../Composants/icones.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import { demanderPosition, distanceKm, formaterDistance, trouverVille, adresseDe } from '../../../Utils/proximite.js';
import { chargerDecoupage, departementDe } from '../../../Utils/decoupage.js';
import Bouton, { BoutonIcone } from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import Photo from '../../../Composants/Photo.jsx';
import EmojiCategorie from '../../../Composants/EmojiCategorie.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import BoutonFavori from '../../../Composants/BoutonFavori.jsx';
import FenetreLieu from '../../../Composants/FenetreLieu.jsx';
import { ChoixSegmente, OPTIONS_RAYON, Puce, Puces } from '../../../Composants/Filtres.jsx';
import AvisLieu from '../../../Composants/AvisLieu.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';
import FenetreSuggestion from '../../../Composants/FenetreSuggestion.jsx';

/*
 * Page Carte (maquette design/maquettes/carte.html) — parcours par zones, pour rester fluide
 * avec ~100 000 lieux :
 *   1. France : les 18 régions, coloriées selon leur nombre de lieux (catégories cochées) ;
 *      au survol (1er toucher sur mobile), une bulle donne le nombre par catégorie ;
 *   2. clic sur une région : ses départements, coloriés de la même façon ;
 *   3. clic sur un département : SEULS ses lieux sont chargés (points de loin, épingles de près).
 *   « Me localiser » et la recherche de ville ouvrent directement le bon département.
 * Le reste ne change pas : tiroir de détail, promenades tracées, ajout d'un lieu (admin).
 * Adresses comprises :
 *   /carte?cat=parc                 → filtre une catégorie
 *   /carte?lieu=point-12            → ouvre le département du lieu, puis sa fiche
 *   /carte?lat=…&lng=…&nom=…        → centre sur un endroit précis (ex. le lieu d'une sortie)
 */

const FRANCE = [46.6, 2.4];

/* ---- Icônes d'épingle (Leaflet veut du HTML en texte) ----
   On les fabrique une seule fois par catégorie et par état, puis on les réutilise :
   des milliers d'épingles ne créent donc que quelques dizaines d'icônes. */
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
                `<span class="epingle-emoji" aria-hidden="true">${categorie(cle).emoji || ''}</span>` +
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

/* ---- Vue éloignée : un petit point de couleur par lieu ----
   Plusieurs milliers de lieux dans un département : un composant <CircleMarker> par lieu serait trop lent.
   On les dessine tous sur un seul <canvas>, directement avec Leaflet, et on ne les refait
   que si la liste change. */
const RENDU_POINTS = L.canvas({ padding: 0.5 });
const PointsLieux = ({ lieux, onClic }) => {
    const carte = useMap();
    // Le clic passe par une ref : sinon chaque nouveau rendu de la page redessinerait tous les points
    const clic = useRef(onClic);
    useEffect(() => { clic.current = onClic; }, [onClic]);
    useEffect(() => {
        const groupe = L.layerGroup(lieux.map((lieu) => L.circleMarker([lieu.latitude, lieu.longitude], {
            renderer: RENDU_POINTS,
            radius: 5,
            weight: 1.5,
            color: '#fff',
            fillColor: categorie(lieu.categorie).couleur,
            fillOpacity: 1,
        }).on('click', () => clic.current(lieu)))).addTo(carte);
        return () => { groupe.remove(); };
    }, [carte, lieux]);
    return null;
};

/* ---- Zones (régions ou départements) coloriées selon leur nombre de lieux ----
   Plus une zone a de lieux dans les catégories cochées, plus elle est foncée (échelle logarithmique :
   Paris et la Lozère restent comparables). Bulle au survol : le détail par catégorie.
   Sur un écran tactile (pas de survol), le 1er toucher montre la bulle, le 2e ouvre la zone. */
const TACTILE = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches;
const couleurPrincipale = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--couleur-principale').trim() || '#c4572f';

/* Nombre de lieux d'une zone pour les catégories cochées (aucune = toutes) */
const totalZone = (zone, actives) => Object.entries(zone?.nombres ?? {})
    .filter(([cle]) => actives.length === 0 || actives.includes(cle))
    .reduce((somme, [, n]) => somme + n, 0);

const nombre = (n) => n.toLocaleString('fr-FR');
const echapper = (texte) => String(texte).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/* Contenu HTML de la bulle : nom, total, puis les catégories les plus fournies */
const bulleZone = (nom, zone, actives) => {
    const lignes = Object.entries(zone?.nombres ?? {})
        .filter(([cle, n]) => n > 0 && (actives.length === 0 || actives.includes(cle)))
        .sort((a, b) => b[1] - a[1]);
    const total = lignes.reduce((s, [, n]) => s + n, 0);
    const premieres = lignes.slice(0, 8).map(([cle, n]) => {
        const c = categorie(cle);
        return `<li>${c.emoji || ''} <strong>${nombre(n)}</strong> ${echapper(n > 1 ? c.pluriel : c.nom).toLowerCase()}</li>`;
    }).join('');
    const reste = lignes.length > 8 ? `<li class="bulle-zone__reste">+ ${lignes.length - 8} autres catégories</li>` : '';
    return `<strong class="bulle-zone__titre">${echapper(nom)}</strong>`
        + `<span class="bulle-zone__total">${total ? `${nombre(total)} ${total > 1 ? 'lieux' : 'lieu'}` : 'Aucun lieu'}</span>`
        + (lignes.length ? `<ul>${premieres}${reste}</ul>` : '');
};

const CoucheZones = ({ features, zonesParCode, actives, estompees = false, onChoisir }) => {
    const carte = useMap();
    const choisir = useRef(onChoisir);
    useEffect(() => { choisir.current = onChoisir; }, [onChoisir]);

    useEffect(() => {
        if (!features.length) return undefined;
        const couleur = couleurPrincipale();
        const totaux = features.map((f) => totalZone(zonesParCode[f.properties.code], actives));
        const max = Math.max(1, ...totaux);
        const style = (total) => (estompees
            ? { color: couleur, weight: 1, opacity: 0.5, fillColor: couleur, fillOpacity: 0.04, dashArray: '4 4' }
            : {
                color: '#fff', weight: 1.5, opacity: 1, fillColor: couleur,
                fillOpacity: total ? 0.12 + 0.55 * (Math.log1p(total) / Math.log1p(max)) : 0.04,
            });
        let toucheeEnDernier = null;
        const couche = L.geoJSON({ type: 'FeatureCollection', features }, {
            style: (f) => style(totalZone(zonesParCode[f.properties.code], actives)),
            onEachFeature: (f, calque) => {
                const zone = zonesParCode[f.properties.code];
                const total = totalZone(zone, actives);
                calque.bindTooltip(bulleZone(f.properties.nom, zone, actives), { sticky: !TACTILE, className: 'bulle-zone', direction: 'top' });
                calque.on('mouseover', () => calque.setStyle({ weight: 3, color: estompees ? couleur : '#fff', fillOpacity: Math.min(0.85, (style(total).fillOpacity ?? 0) + 0.15) }));
                calque.on('mouseout', () => calque.setStyle(style(total)));
                calque.on('click', () => {
                    if (TACTILE && toucheeEnDernier !== calque) {   // 1er toucher : la bulle seulement
                        toucheeEnDernier = calque;
                        calque.openTooltip();
                        return;
                    }
                    calque.closeTooltip();
                    choisir.current(f);
                });
            },
        }).addTo(carte);
        return () => { couche.remove(); };
    }, [carte, features, zonesParCode, actives, estompees]);
    return null;
};

/* ---- Contour du département ouvert (pas de remplissage : on voit le fond et les lieux) ---- */
const ContourZone = ({ feature }) => {
    const carte = useMap();
    useEffect(() => {
        if (!feature) return undefined;
        const couche = L.geoJSON(feature, {
            interactive: false,
            style: { color: couleurPrincipale(), weight: 2.5, opacity: 0.9, fill: false },
        }).addTo(carte);
        return () => { couche.remove(); };
    }, [carte, feature]);
    return null;
};

/* ---- Suit le niveau de zoom (même règle : seulement dans un enfant de <MapContainer>) ----
   Piège : useMapEvents réinstalle ses écouteurs si on lui donne un NOUVEL objet à chaque rendu.
   Or React fait tous les nettoyages AVANT les effets : pendant ce court instant, aucun écouteur,
   et le moveend déclenché par le pilote (setView) est perdu. D'où useMemo : un objet stable. */
const SuiviZoom = ({ onZoom, onLimites }) => {
    const ecouteurs = useMemo(() => ({
        zoomend: (e) => onZoom(e.target.getZoom()),
        // après tout déplacement, zoom compris : on note aussi la zone affichée
        moveend: (e) => { onZoom(e.target.getZoom()); onLimites(e.target.getBounds()); },
    }), [onZoom, onLimites]);
    const carte = useMapEvents(ecouteurs);
    // Le zoom a pu changer avant que l'écouteur ne soit branché
    useEffect(() => { onZoom(carte.getZoom()); onLimites(carte.getBounds()); }, [carte, onZoom, onLimites]);
    return null;
};

/* ---- Mode « ajout d'un lieu » (admin) : un clic sur la carte donne ses coordonnées ---- */
const ClicCarte = ({ onClic }) => {
    const ecouteurs = useMemo(() => ({ click: (e) => onClic(e.latlng) }), [onClic]);
    useMapEvents(ecouteurs);
    return null;
};

/* En dessous de ce zoom, les épingles s'empileraient : on montre de petits points */
const ZOOM_EPINGLES = 10;

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

/* Rectangle qui entoure une zone (pour y cadrer la carte) */
const limitesDe = (feature) => L.geoJSON(feature).getBounds();

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
                        <EmojiCategorie cle={c.cle} />{c.pluriel}
                    </label>
                ))}
            </fieldset>
            <div className="choix-categories__actions">
                <Bouton variante="secondaire" onClick={() => onValider([])}>Tout</Bouton>
                <Bouton icone="carte" disabled={coches.length === 0} onClick={() => onValider(coches)}>
                    {coches.length === 0 ? 'Choisis' : `Voir ${nombre(total)} ${total > 1 ? 'lieux' : 'lieu'}`}
                </Bouton>
            </div>
        </dialog>
    );
};

const CartePage = () => {
    const { isAdmin, isAuthenticated } = useAuth();
    const [parametres] = useSearchParams();
    const [suggestionOuverte, setSuggestionOuverte] = useState(false);   // fenêtre « Suggérer »

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
    const [limites, setLimites] = useState(null);   // zone affichée (L.LatLngBounds)
    const [message, setMessage] = useState(null);
    const champVille = useRef(null);
    const tiroir = useRef(null);
    const marqueurs = useRef({});   // id du lieu → marqueur Leaflet (pour rendre le focus)
    const [placement, setPlacement] = useState(false);   // admin : « clique sur la carte »
    const [nouveauLieu, setNouveauLieu] = useState(null); // ouvre FenetreLieu pré-remplie

    /* ---- Zones : contours (fichiers statiques) + nombres de lieux (back) ---- */
    const [geo, setGeo] = useState(null);                  // { regions, departements } (GeoJSON)
    const [zones, setZones] = useState(null);              // réponse de /api/carte/zones
    const [erreur, setErreur] = useState(null);
    const [regionChoisie, setRegionChoisie] = useState(null);   // code INSEE de la région ouverte
    const [depChoisi, setDepChoisi] = useState(null);           // code du département ouvert
    const [lieuxDep, setLieuxDep] = useState([]);               // ses lieux
    const [chargementDep, setChargementDep] = useState(false);
    const [activites, setActivites] = useState([]);             // activités ORIVY (peu nombreuses)

    const chargerZones = useCallback(() => {
        setErreur(null);
        Promise.all([chargerDecoupage(), getZones()])
            .then(([contours, nombres]) => { setGeo(contours); setZones(nombres); })
            .catch(() => setErreur('La carte est momentanément indisponible.'));
    }, []);
    useEffect(() => { chargerZones(); }, [chargerZones]);
    useEffect(() => {
        getActivities().then((liste) => setActivites(normaliserLieux({ activites: liste }))).catch(() => {});
    }, []);

    const regionsParCode = useMemo(() => Object.fromEntries((zones?.regions ?? []).map((z) => [z.code, z])), [zones]);
    const depsParCode = useMemo(() => Object.fromEntries((zones?.departements ?? []).map((z) => [z.code, z])), [zones]);
    const featureDep = useMemo(() => geo?.departements.features.find((f) => f.properties.code === depChoisi) ?? null, [geo, depChoisi]);
    const featureRegion = useMemo(() => geo?.regions.features.find((f) => f.properties.code === regionChoisie) ?? null, [geo, regionChoisie]);
    const depsDeLaRegion = useMemo(
        () => (geo && regionChoisie ? geo.departements.features.filter((f) => f.properties.region === regionChoisie) : []),
        [geo, regionChoisie],
    );
    const autresRegions = useMemo(
        () => (geo && regionChoisie ? geo.regions.features.filter((f) => f.properties.code !== regionChoisie) : []),
        [geo, regionChoisie],
    );

    /* ---- Navigation entre les niveaux ---- */
    const allerFrance = () => {
        setRegionChoisie(null); setDepChoisi(null); setSelection(null);
        setVue({ centre: FRANCE, zoom: window.innerWidth < 768 ? 5 : 6 });
    };
    // cadrer = false : quelqu'un d'autre place la carte (position GPS, lien ?lat…)
    const ouvrirDepartement = useCallback((feature, { cadrer = true } = {}) => {
        setRegionChoisie(feature.properties.region);
        setDepChoisi(feature.properties.code);
        if (cadrer) setVue({ limites: limitesDe(feature) });
    }, []);
    const ouvrirRegion = useCallback((feature) => {
        const deps = geo.departements.features.filter((f) => f.properties.region === feature.properties.code);
        // Outre-mer : un seul département, on l'ouvre directement
        if (deps.length === 1) { ouvrirDepartement(deps[0]); return; }
        setRegionChoisie(feature.properties.code);
        setDepChoisi(null);
        setSelection(null);
        setVue({ limites: limitesDe(feature) });
    }, [geo, ouvrirDepartement]);
    const revenirRegion = () => {
        setDepChoisi(null); setSelection(null);
        if (featureRegion) setVue({ limites: limitesDe(featureRegion) });
    };

    /* Lieux du département ouvert : chargés à l'ouverture, oubliés à la fermeture */
    const chargerDepartement = useCallback(() => {
        if (!depChoisi) { setLieuxDep([]); return undefined; }
        let annule = false;   // un autre département a été ouvert entre-temps : réponse ignorée
        setChargementDep(true);
        getLieuxDepartement(depChoisi)
            .then((points) => { if (!annule) setLieuxDep(points.map(normaliserPoint)); })
            .catch(() => { if (!annule) setMessage('Les lieux de ce département sont momentanément indisponibles.'); })
            .finally(() => { if (!annule) setChargementDep(false); });
        return () => { annule = true; };
    }, [depChoisi]);
    useEffect(() => chargerDepartement(), [chargerDepartement]);

    /* Après une modification (admin) : nombres et lieux à jour */
    const recharger = () => {
        getZones().then(setZones).catch(() => {});
        chargerDepartement();
    };

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

    /* Lieux visibles : ceux du département ouvert (+ les activités ORIVY qui s'y trouvent), selon les catégories cochées */
    const visibles = useMemo(() => {
        if (!featureDep) return [];
        const cadre = limitesDe(featureDep);
        const activitesIci = activites.filter((a) => a.latitude != null && cadre.contains([a.latitude, a.longitude]));
        return [...lieuxDep, ...activitesIci]
            .filter((l) => l.latitude != null && (actives.length === 0 || actives.includes(l.categorie)));
    }, [featureDep, lieuxDep, activites, actives]);

    /* Vue rapprochée : les épingles de la zone affichée seulement (+ une marge), et toujours celle du lieu ouvert */
    const epingles = useMemo(() => {
        if (zoom < ZOOM_EPINGLES || !limites) return visibles.filter((l) => l.id === selection?.id);
        const zone = limites.pad(0.2);
        return visibles.filter((l) => l.id === selection?.id || zone.contains([l.latitude, l.longitude]));
    }, [visibles, zoom, limites, selection]);

    const basculerCategorie = (cle) => setActives((liste) => (liste.includes(cle) ? liste.filter((c) => c !== cle) : [...liste, cle]));

    /* Promenades (itinéraires tracés) : affichées avec la catégorie « Randonnées » */
    useEffect(() => {
        getPromenades().then(setPromenades).catch(() => {});   // sans promenades, la carte reste utilisable
    }, []);
    const promenadesVisibles = actives.length === 0 || actives.includes('promenade') ? promenades : [];

    /* Nombre de lieux par catégorie dans toute la France, affiché dans la fenêtre de choix */
    const nombres = useMemo(() => {
        const n = {};
        (zones?.regions ?? []).forEach((r) => Object.entries(r.nombres).forEach(([cle, k]) => { n[cle] = (n[cle] || 0) + k; }));
        activites.forEach((a) => { n[a.categorie] = (n[a.categorie] || 0) + 1; });
        n.promenade = (n.promenade || 0) + promenades.length;
        return n;
    }, [zones, activites, promenades]);

    const validerChoix = (liste) => {
        setActives(liste);
        enregistrerChoix(liste);
        setChoixOuvert(false);
    };

    /* ---- Position : on ouvre le département où l'on se trouve ---- */
    const placerPosition = (pos) => {
        setPosition(pos);
        const dep = geo && departementDe(geo.departements, pos.lat, pos.lng);
        if (dep) ouvrirDepartement(dep, { cadrer: false });
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

    /* Liste déroulante « Aller à… » : même parcours qu'au clic, utilisable au clavier */
    const allerA = (event) => {
        const [niveau, code] = event.target.value.split(':');
        event.target.value = '';
        if (niveau === 'region') ouvrirRegion(geo.regions.features.find((f) => f.properties.code === code));
        if (niveau === 'dep') ouvrirDepartement(geo.departements.features.find((f) => f.properties.code === code));
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

    /* Arrivée avec ?lieu=point-12 : on demande ce lieu, on ouvre son département puis sa fiche */
    useEffect(() => {
        const demande = parametres.get('lieu');
        if (!demande?.startsWith('point-') || !geo) return;
        getPoint(demande.slice('point-'.length)).then((point) => {
            const lieu = normaliserPoint(point);
            const dep = geo.departements.features.find((f) => f.properties.code === point.departement)
                ?? departementDe(geo.departements, lieu.latitude, lieu.longitude);
            if (dep) ouvrirDepartement(dep, { cadrer: false });
            setSelection(lieu);
            setVue({ centre: [lieu.latitude, lieu.longitude], zoom: 13 });
        }).catch(() => setMessage("Ce lieu n'existe plus."));
    }, [geo, parametres, ouvrirDepartement]);

    /* Arrivée avec ?lat=…&lng=…&nom=… (ex. depuis une sortie) */
    const repere = useMemo(() => {
        const lat = Number(parametres.get('lat'));
        const lng = Number(parametres.get('lng'));
        return parametres.has('lat') && Number.isFinite(lat) && Number.isFinite(lng)
            ? { centre: [lat, lng], nom: parametres.get('nom') || 'Lieu sélectionné' }
            : null;
    }, [parametres]);
    useEffect(() => {
        if (!repere || !geo) return;
        const dep = departementDe(geo.departements, repere.centre[0], repere.centre[1]);
        if (dep) ouvrirDepartement(dep, { cadrer: false });
        setVue({ centre: repere.centre, zoom: 15 });
    }, [repere, geo, ouvrirDepartement]);

    const km = (l) => (position ? distanceKm(position.lat, position.lng, l.latitude, l.longitude) : null);

    /* Admin : la photo d'un lieu a changé → on remplace le lieu partout où il est affiché */
    const photoChangee = (point) => {
        setSelection(normaliserPoint(point));
        recharger();
    };
    /* Admin : lieu supprimé → la fiche se ferme et l'épingle disparaît */
    const lieuSupprime = (lieu) => {
        setSelection(null);
        recharger();
        setMessage(`« ${lieu.nom} » est supprimé.`);
    };

    /* Ce que l'on montre à chaque niveau, et le conseil affiché en bas */
    const nomRegion = featureRegion?.properties.nom;
    const nomDep = featureDep?.properties.nom;
    const conseil = !geo ? null
        : !regionChoisie ? 'Touche une région pour voir ses lieux.'
            : !depChoisi ? `Choisis un département de la région ${nomRegion}.`
                : null;

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
                {/* Fond Google Maps (tuiles « routier »). Rendu identique à Google Maps. */}
                <TileLayer
                    attribution="&copy; Google Maps · Contours &copy; IGN (Licence Ouverte)"
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    maxZoom={20}
                />
                <ZoomControl position="bottomleft" />
                <PiloteCarte vue={vue} />
                <SuiviZoom onZoom={setZoom} onLimites={setLimites} />

                {/* 1. France : les régions */}
                {geo && zones && !regionChoisie && (
                    <CoucheZones features={geo.regions.features} zonesParCode={regionsParCode} actives={actives} onChoisir={ouvrirRegion} />
                )}
                {/* 2. Une région : ses départements (les autres régions, estompées, restent cliquables) */}
                {geo && zones && regionChoisie && !depChoisi && (
                    <>
                        <CoucheZones features={autresRegions} zonesParCode={regionsParCode} actives={actives} estompees onChoisir={ouvrirRegion} />
                        <CoucheZones features={depsDeLaRegion} zonesParCode={depsParCode} actives={actives} onChoisir={ouvrirDepartement} />
                    </>
                )}
                {/* 3. Un département : son contour ; ses voisins de la région, estompés, restent cliquables */}
                {geo && zones && depChoisi && (
                    <>
                        <CoucheZones features={depsDeLaRegion.filter((f) => f.properties.code !== depChoisi)}
                                     zonesParCode={depsParCode} actives={actives} estompees onChoisir={ouvrirDepartement} />
                        <ContourZone feature={featureDep} />
                    </>
                )}

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

                {/* Vue éloignée : de petits points de couleur */}
                {zoom < ZOOM_EPINGLES && <PointsLieux lieux={visibles} onClic={ouvrir} />}

                {/* Vue rapprochée : les vraies épingles */}
                {epingles.map((lieu) => {
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
                {/* Fil d'Ariane : où l'on est, et retour au niveau du dessus */}
                <nav className="carte-ariane" aria-label="Zone affichée">
                    <button type="button" className="puce" onClick={allerFrance} aria-current={!regionChoisie ? 'location' : undefined}>
                        France
                    </button>
                    {nomRegion && (
                        <button type="button" className="puce" onClick={revenirRegion} aria-current={!depChoisi ? 'location' : undefined}>
                            {nomRegion}
                        </button>
                    )}
                    {nomDep && <span className="puce puce--active" aria-current="location">{nomDep} ({depChoisi})</span>}
                    {geo && (
                        <label className="carte-ariane__aller">
                            <span className="visuellement-cache">Aller à une région ou un département</span>
                            <select defaultValue="" onChange={allerA}>
                                <option value="" disabled>Aller à…</option>
                                {geo.regions.features.map((r) => (
                                    <optgroup key={r.properties.code} label={r.properties.nom}>
                                        <option value={`region:${r.properties.code}`}>Toute la région</option>
                                        {geo.departements.features
                                            .filter((d) => d.properties.region === r.properties.code)
                                            .map((d) => (
                                                <option key={d.properties.code} value={`dep:${d.properties.code}`}>
                                                    {d.properties.nom} ({d.properties.code})
                                                </option>
                                            ))}
                                    </optgroup>
                                ))}
                            </select>
                        </label>
                    )}
                </nav>
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
                {/* Un lieu manque ? Une idée ? Réservé aux membres connectés (les autres vont se connecter) */}
                {isAuthenticated
                    ? <Bouton variante="secondaire" pilule icone="commentaire" onClick={() => setSuggestionOuverte(true)}>Suggérer</Bouton>
                    : <Bouton variante="secondaire" pilule icone="commentaire" vers="/connexion">Suggérer</Bouton>}
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
                        // Un lieu OpenStreetMap est relu chaque mois : son nom et son adresse seraient écrasés
                        modifiable={isAdmin && selection.source === 'point' && !selection.osm}
                        onFermer={fermer}
                        onModifie={() => { recharger(); setMessage('Point enregistré.'); }}
                        onAvis={() => {}}
                        // Photo et suppression : les points d'intérêt, pas les activités
                        gerable={isAdmin && selection.source === 'point'}
                        onPhoto={photoChangee}
                        onSupprime={lieuSupprime}
                    />
                )}
            </aside>

            <ChoixCategories ouverte={choixOuvert} choix={actives} nombres={nombres}
                             onValider={validerChoix} onFermer={() => setChoixOuvert(false)} />

            {/* États de chargement et messages (lus par les lecteurs d'écran) */}
            <p className="visuellement-cache" aria-live="polite">
                {!zones ? 'Chargement de la carte…'
                    : chargementDep ? `Chargement des lieux : ${nomDep}…`
                        : depChoisi ? `${nombre(visibles.length)} lieux affichés : ${nomDep}.`
                            : conseil}
            </p>
            {erreur && (
                <div className="toast" role="alert">
                    <Icone nom="alerte" />{erreur}
                    <button className="bouton bouton--fantome" type="button" onClick={chargerZones} style={{ color: 'inherit' }}>Réessaie</button>
                </div>
            )}
            {message && !erreur && <div className="toast" role="status"><Icone nom="info" />{message}</div>}
            {!message && !erreur && (chargementDep || conseil) && (
                <div className="toast" aria-hidden="true">
                    <Icone nom="info" />{chargementDep ? `Chargement des lieux : ${nomDep}…` : conseil}
                </div>
            )}
            {/* centre : on ne propose « le lieu est au centre de la carte » que si l'on est assez près (rue, quartier) */}
            <FenetreSuggestion ouverte={suggestionOuverte}
                               centre={limites && zoom >= 15 ? limites.getCenter() : null}
                               onFermer={() => setSuggestionOuverte(false)}
                               onEnvoye={(texte) => { setSuggestionOuverte(false); setMessage(texte); }} />
            <FenetreLieu point={nouveauLieu} onFermer={() => setNouveauLieu(null)}
                         onEnregistre={(texte) => { setNouveauLieu(null); setMessage(texte); recharger(); }} />
        </main>
    );
};

/* ---- Contenu du tiroir : fiche d'un lieu (+ modification pour les admins) ---- */
const DetailLieu = ({ lieu, km, modifiable, gerable, onFermer, onModifie, onAvis, onPhoto, onSupprime }) => {
    const [edition, setEdition] = useState(null);   // null = lecture ; objet = formulaire ouvert
    const [statut, setStatut] = useState('');
    const [confirmation, setConfirmation] = useState(false);   // fenêtre « Supprimer ce lieu ? »

    /* Admin : nouvelle photo (fichier choisi sur l'appareil) */
    const changerPhoto = async (event) => {
        const fichier = event.target.files[0];
        event.target.value = '';   // permet de rechoisir le même fichier
        if (!fichier) return;
        try {
            onPhoto(await envoyerPhotoPoint(lieu.idNum, fichier));
            setStatut('');
        } catch (e) {
            setStatut(e.message);
        }
    };
    const retirerPhoto = async () => {
        try {
            onPhoto(await retirerPhotoPoint(lieu.idNum));
            setStatut('');
        } catch (e) {
            setStatut(e.message);
        }
    };
    const supprimer = async () => {
        setConfirmation(false);
        try {
            await deletePoint(lieu.idNum);
            onSupprime(lieu);
        } catch (e) {
            setStatut(e.message);
        }
    };

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
                <Photo src={lieu.imageUrl} alt="" cle={lieu.categorie} paresseuse={false} attente />
                <h2 id="tiroir-titre">{lieu.nom}</h2>
                <div className="detail-lieu__infos">
                    {lieu.lieu && <span className="badge-distance"><Icone nom="epingle" />{lieu.lieu}</span>}
                    {km != null && <span className="badge-distance"><Icone nom="autour" />{formaterDistance(km)}</span>}
                </div>
                {lieu.description && <p className="texte-doux" style={{ margin: 0 }}>{lieu.description}</p>}
                {/* Licence ODbL : un lieu venu d'OpenStreetMap doit le dire */}
                {lieu.osm && (
                    <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>
                        Données © <a href={`https://www.openstreetmap.org/${lieu.osm}`} target="_blank" rel="noreferrer">les contributeurs OpenStreetMap</a>
                    </p>
                )}

                <div className="ligne-actions">
                    {/* nom, coordonnées et catégorie dans l'adresse : un restaurant ou un bar (chargé par zone)
                        n'est pas dans la liste que la page de création recharge */}
                    <Link className="bouton bouton--principal" to={`/sorties/creation?${new URLSearchParams({
                        lieu: lieu.id, nom: lieu.nom, lat: lieu.latitude, lng: lieu.longitude, cat: lieu.categorie,
                    })}`}>
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

                {/* Réservé aux admins : la photo et la suppression du lieu */}
                {gerable && (
                    <div className="ligne-actions">
                        <label className="bouton bouton--fantome">
                            <Icone nom="appareil-photo" />{lieu.imageUrl ? 'Changer la photo' : 'Ajouter une photo'}
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="visuellement-cache" onChange={changerPhoto} />
                        </label>
                        {lieu.imageUrl && <Bouton variante="fantome" icone="image" onClick={retirerPhoto}>Retirer la photo</Bouton>}
                        <Bouton variante="danger" icone="supprimer" onClick={() => setConfirmation(true)}>Supprimer ce lieu</Bouton>
                    </div>
                )}
                {gerable && statut && !edition && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{statut}</p>}
                <FenetreConfirmation ouverte={confirmation} titre="Supprimer ce lieu ?" texteConfirmer="Oui, supprimer"
                                     onConfirmer={supprimer} onAnnuler={() => setConfirmation(false)}>
                    « {lieu.nom} » disparaîtra de la carte et des listes.
                </FenetreConfirmation>

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
