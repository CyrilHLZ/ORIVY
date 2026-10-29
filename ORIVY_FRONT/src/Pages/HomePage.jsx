import { useEffect, useMemo, useRef, useState } from 'react';
import { getSorties } from '../Services/Sortie/SortieService.js';
import { lireDate } from '../Utils/dates.js';
import fondAccueil from '../Style/fonds/accueil-lac.jpg';
import Bouton from '../Composants/Bouton.jsx';
import CarteSortie from '../Composants/CarteSortie.jsx';
import { BadgeCategorie } from '../Composants/Badges.jsx';
import { EtatVide } from '../Composants/Etats.jsx';
import { ECRANS, EFFETS_LAC, FRAGMENT_ARBRE, ecranDuMoment } from './EcransAccueil.js';
import PhotoAnimee from './Accueil/PhotoAnimee.jsx';
import Icone from '../Composants/Icone.jsx';
import Compteur from '../Composants/Compteur.jsx';
import { useLieux } from '../Hooks/useLieux.js';

/* (31) Le titre apparaît mot par mot : chaque mot est un <span> avec son rang --i */
const MOTS_TITRE = [['Découvre'], ['la'], ['France,'], ['vis', true], ["l'instant", true], [','], ['profite'], ['à'], ['plusieurs.']];

/*
 * Accueil (maquette design/maquettes/accueil.html).
 *
 * Mobile et tablette : défilement vertical classique, un fondu à l'apparition de chaque bloc.
 * Ordinateur (≥ 1024px + souris) : l'effet SCAN. Tout est dans accueil.css :
 *   - chaque écran fait la hauteur de la fenêtre et s'aimante (scroll-snap) ;
 *   - l'écran qui part recule à peine et s'estompe ;
 *   - le suivant monte doucement, balayé par une fine ligne lumineuse.
 * Cette page ne fait donc QUE : l'ordre saisonnier, l'arbre du parc, l'indicateur
 * de progression et le repli pour les navigateurs sans « scroll-driven animations ».
 * Sans JavaScript, tout reste lisible et cliquable.
 */

/* Saison courante, et mise à jour si elle change (aperçu, passage à minuit…) */
const useSaison = () => {
    const [saison, setSaison] = useState(() => document.documentElement.getAttribute('data-saison'));
    useEffect(() => {
        const ecouter = (e) => setSaison(e.detail.saison);
        window.addEventListener('orivy:saison', ecouter);
        return () => window.removeEventListener('orivy:saison', ecouter);
    }, []);
    return saison;
};

/* Thème horaire courant (aube, jour, crepuscule, nuit), mis à jour à chaque changement (themes.js) */
const useTheme = () => {
    const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme'));
    useEffect(() => {
        const ecouter = (e) => setTheme(e.detail.theme);
        window.addEventListener('orivy:theme', ecouter);
        return () => window.removeEventListener('orivy:theme', ecouter);
    }, []);
    return theme;
};

/*
 * Ambiance animée posée sur les photos (purement décorative, aria-hidden).
 * type :
 *   "lumiere"  → halo doré qui respire (sans grains de lumière, retirés le 2026-10-24)
 *   "grains"   → le même halo, avec des petits grains dorés qui montent (le parc)
 *   "feuilles" → feuilles d'érable orange qui tombent des arbres
 *   "oiseaux"  → une volée d'oiseaux qui traverse le ciel en battant des ailes
 *   "aucune"   → rien (la photo seule, ex. le parc)
 * Aucun zoom : la photo reste à sa taille, donc aussi nette que possible.
 */
const Ambiance = ({ type = 'lumiere' }) => (
    <div className={`ambiance ambiance--${type}`} aria-hidden="true">
        {(type === 'lumiere' || type === 'grains') && <span className="ambiance__halo" />}
        {/* Pour les oiseaux, <i> traverse le ciel et <b> bat des ailes : deux rythmes différents */}
        {type !== 'lumiere' && Array.from({ length: { oiseaux: 7, grains: 20 }[type] ?? 10 }, (_, i) => (
            <i key={i}>{type === 'oiseaux' && <b />}</i>
        ))}
    </div>
);

const HomePage = () => {
    const saison = useSaison();
    const theme = useTheme();
    const [sorties, setSorties] = useState(null);   // null = en cours de chargement
    const [courant, setCourant] = useState('ecran-intro');
    const zone = useRef(null);
    const { lieux } = useLieux();   // pour le compteur de lieux (40)

    /* Les 3 prochaines sorties (rien de grave si le back ne répond pas : on montre l'état vide) */
    useEffect(() => {
        getSorties()
            .then((liste) => {
                const auj = new Date();
                auj.setHours(0, 0, 0, 0);
                setSorties(liste
                    .filter((s) => s.dateDebut && lireDate(s.dateDebut) >= auj)
                    .sort((a, b) => lireDate(a.dateDebut) - lireDate(b.dateDebut))
                    .slice(0, 3));
            })
            .catch(() => setSorties([]));
    }, []);

    /* Ordre des écrans selon la saison (automne : promenades d'abord ; hiver : musées…),
       et la photo du moment : la nuit, le château et le parc s'illuminent (sous la neige en hiver) */
    const ecrans = useMemo(() => {
        const ordre = window.orivySaison?.ordreCategories() ?? [];
        return [...ECRANS].sort((a, b) => {
            const ia = ordre.indexOf(a.cle);
            const ib = ordre.indexOf(b.cle);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }).map((e) => ecranDuMoment(e, theme, saison));
    }, [saison, theme]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Liste de tous les écrans, pour l'indicateur de progression */
    const tousLesEcrans = useMemo(() => [
        { id: 'ecran-intro', nom: 'Découvre la France' },
        ...ecrans.map((e) => ({ id: `ecran-${e.cle}`, nom: e.titre })),
        { id: 'ecran-sorties', nom: 'Les prochaines sorties' },
    ], [ecrans]);
    const rangCourant = Math.max(0, tousLesEcrans.findIndex((e) => e.id === courant));

    /*
     * Repli des animations si le navigateur ne connaît pas animation-timeline :
     * on pose .js-repli sur <html> et .est-visible sur les écrans qui apparaissent
     * (IntersectionObserver). On touche ici directement les classes du DOM (sans
     * état React) : pas besoin de redessiner toute la page pour un effet visuel.
     */
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        const racine = document.documentElement;
        const scrollDriven = window.CSS?.supports?.('animation-timeline: view()');
        const ordinateur = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
        if (!scrollDriven) racine.classList.add('js-repli');

        const observateur = new IntersectionObserver((entrees) => {
            entrees.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add('est-visible');
                else if (ordinateur.matches) e.target.classList.remove('est-visible');   // le scan se rejoue
            });
        }, { threshold: 0.35 });

        if (!scrollDriven) zone.current.querySelectorAll('.ecran').forEach((ecran) => observateur.observe(ecran));
        return () => {
            observateur.disconnect();
            racine.classList.remove('js-repli');   // on quitte l'accueil : on rend <html> propre
        };
    }, [ecrans, sorties]);   // les écrans changent d'ordre ou apparaissent : on ré-observe


    /*
     * (10) En-tête transparent : la classe page-accueil le pose sur la photo,
     * et entete-transparente reste tant qu'on n'a pas commencé à descendre.
     */
    useEffect(() => {
        const corps = document.body;
        corps.classList.add('page-accueil');
        const mesurer = () => corps.classList.toggle('entete-transparente', window.scrollY < 40);
        mesurer();
        window.addEventListener('scroll', mesurer, { passive: true });
        return () => {
            window.removeEventListener('scroll', mesurer);
            corps.classList.remove('page-accueil', 'entete-transparente');
        };
    }, []);

    /*
     * Écran courant pour l'indicateur : celui qui contient le milieu de la fenêtre.
     * Le navigateur envoie déjà « scroll » au plus une fois par image affichée :
     * pas besoin de limiter nous-mêmes. passive: true promet qu'on n'empêchera
     * pas le défilement, ce qui le garde fluide.
     */
    useEffect(() => {
        const mesurer = () => {
            const milieu = window.innerHeight / 2;
            const ecran = [...zone.current.querySelectorAll('.ecran')].find((el) => {
                const r = el.getBoundingClientRect();
                return r.top <= milieu && r.bottom > milieu;
            });
            if (ecran) setCourant(ecran.id);   // React ne redessine pas si l'id n'a pas changé
        };
        mesurer();
        window.addEventListener('scroll', mesurer, { passive: true });
        return () => window.removeEventListener('scroll', mesurer);
    }, [ecrans, sorties]);

    return (
        <main className="accueil" ref={zone}>

            {/* ÉCRAN 1 : le paysage, l'accroche, deux boutons */}
            <section className="ecran ecran--intro" id="ecran-intro" aria-labelledby="titre-intro">
                <div className="ecran__scene">
                    {/* Pas de lazy loading : c'est la première chose qu'on voit */}
                    <PhotoAnimee className="intro__paysage intro__paysage--photo" src={fondAccueil} ratio={1536 / 1024}
                                 effets={EFFETS_LAC} chargement="eager" fetchPriority="high" />
                    <Ambiance type="feuilles" />
                    <div className="intro__carte">
                        {/* aria-label : le lecteur d'écran lit la phrase entière, pas mot par mot */}
                        <h1 id="titre-intro" className="titre-mots" aria-label="Découvre la France, vis l'instant, profite à plusieurs.">
                            <span aria-hidden="true">
                                {MOTS_TITRE.slice(0, 3).map(([mot], i) => <span key={i} className="mot" style={{ '--i': i }}>{mot}</span>)}
                                {/* « vis l'instant, » ne se coupe jamais : la virgule reste collée (classe insecable) */}
                                <span className="insecable">
                                    <em>{MOTS_TITRE.slice(3, 5).map(([mot], i) => <span key={i} className="mot" style={{ '--i': i + 3 }}>{mot}</span>)}</em>
                                    <span className="mot mot--colle" style={{ '--i': 5 }}>,</span>
                                </span>{' '}
                                {MOTS_TITRE.slice(6).map(([mot], i) => <span key={i} className="mot" style={{ '--i': i + 6 }}>{mot}</span>)}
                            </span>
                        </h1>
                        <p className="intro__signature">
                            {lieux.length > 0 ? <><strong><Compteur valeur={lieux.length} /></strong> lieux à explorer et des sorties à partager, partout en France.</> : 'Des lieux à explorer et des sorties à partager, partout en France.'}
                        </p>
                        <div className="intro__boutons">
                            <Bouton icone="carte" vers="/carte">Explore la carte</Bouton>
                            <Bouton variante="secondaire" icone="calendrier" vers="/sorties">Vois les sorties</Bouton>
                        </div>
                    </div>
                    {/* (35) Flèche « descends » qui rebondit en bas du premier écran */}
                    <a className="descends" href={`#ecran-${ecrans[0]?.cle}`}>
                        <span className="visuellement-cache">Descends vers la suite</span>
                        <Icone nom="chevron-bas" />
                    </a>
                </div>
            </section>

            {/* ÉCRANS DE CATÉGORIE : l'alternance gauche / droite est faite en CSS (:nth-child) */}
            <div className="ecrans-categories">
                {ecrans.map((e) => (
                    <section key={e.cle} className={`ecran ecran--cat cat-${e.cle}${e.fond ? ` ecran--fond carte-${e.carte ?? 'bas-gauche'}` : ''}`} id={`ecran-${e.cle}`} aria-labelledby={`t-${e.cle}`}>
                        <div className="ecran__scene">
                            <div className="ecran__illu">
                                {e.fond ? (
                                    // Photo plein écran (sur ordinateur) : elle décrit une vraie scène, d'où un texte alternatif
                                    <PhotoAnimee src={e.fond} alt={e.alt} ratio={e.ratio} cadrage={e.cadrage} effets={e.effets}
                                                 className={[e.etoiles && 'photo-animee--etoiles', e.etoilesSeules && 'photo-animee--etoiles-seules',
                                                             e.floconsSeuls && 'photo-animee--flocons-seuls'].filter(Boolean).join(' ')} />
                                ) : (
                                    <img src={e.saisonnier ? `${e.illu}${FRAGMENT_ARBRE[saison] ?? ''}` : e.illu}
                                         alt="" width="800" height="600" loading="lazy" />
                                )}
                                {e.fond && e.ambiance !== 'aucune' && <Ambiance type={e.ambiance} />}
                            </div>
                            <div className="ecran__texte">
                                <BadgeCategorie cle={e.cle} />
                                <h2 id={`t-${e.cle}`}>{e.titre}</h2>
                                <p>{e.texte}</p>
                                <Bouton vers={`/carte?cat=${e.cle}`}>{e.bouton}</Bouton>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* DERNIER ÉCRAN : les 3 prochaines sorties */}
            <section className="ecran ecran--sorties" id="ecran-sorties" aria-labelledby="t-sorties">
                <div className="ecran__scene conteneur">
                    <h2 id="t-sorties">Les prochaines sorties</h2>
                    <p className="sous-titre">Rejoins une bande, ou lance ta propre sortie.</p>
                    {sorties === null && <p aria-busy="true">Chargement des sorties…</p>}
                    {sorties?.length > 0 && (
                        <div className="carrousel">
                            {sorties.map((s) => <CarteSortie key={s.id} sortie={s} />)}
                        </div>
                    )}
                    {sorties?.length === 0 && (
                        <EtatVide icone="calendrier" titre="Aucune sortie prévue pour l'instant">
                            Sois la première personne à en lancer une !
                        </EtatVide>
                    )}
                    <div className="sorties__action">
                        <Bouton variante={sorties?.length ? 'secondaire' : 'principal'} icone="plus" vers="/sorties/creation">Crée une sortie</Bouton>
                    </div>
                </div>
            </section>

            {/* Indicateur de progression (ordinateur seulement, CSS).
                Chaque point est une icône de la saison (citrouille, cadeau, flocon…) ;
                (38) celles déjà passées sont « remplies » (pleine opacité) ;
                (100) une épingle ORIVY glisse le long du sentier jusqu'à l'écran courant. */}
            <nav className="progression" aria-label="Écrans de l'accueil" style={{ '--rang': rangCourant }}>
                <span className="progression__epingle" aria-hidden="true" />
                {tousLesEcrans.map((e, i) => (
                    <a key={e.id} href={`#${e.id}`} className={i < rangCourant ? 'passe' : undefined}
                       aria-current={courant === e.id ? 'step' : undefined}>
                        <span className="visuellement-cache">{e.nom}</span>
                    </a>
                ))}
            </nav>
        </main>
    );
};

export default HomePage;
