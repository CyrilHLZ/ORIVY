/*
 * <PhotoAnimee src alt ratio effets className />
 *
 * Une photo plein cadre (comme object-fit: cover) avec des animations posées
 * PRÉCISÉMENT sur des points de l'image : la flamme sur la lanterne, les ondes
 * autour des barques, la lueur sur le réverbère…
 *
 * Le problème : avec object-fit: cover, la photo est recadrée différemment selon
 * la taille de l'écran ; un effet placé « à 43 % » de l'écran tomberait à côté.
 * La solution : .photo-cadre reproduit le recadrage à la main (unités cqw/cqh du
 * conteneur, voir animations.css). La photo ET les effets sont dedans : les
 * coordonnées des effets sont donc en % DE L'IMAGE, et restent justes partout.
 *
 * ratio  : largeur / hauteur de l'image (ex. 1376 / 768)
 * effets : liste d'objets { type, x, y, l, h, ... } en % de l'image (voir EcransAccueil.js)
 * Tout est décoratif (aria-hidden) et coupé sous « mouvement réduit ».
 */

/* Petit générateur pseudo-aléatoire déterministe : les mêmes positions à chaque rendu */
const hasard = (n) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};

/* Zone rectangulaire de l'image (x, y = coin haut gauche ; l, h = taille), en % */
const zone = ({ x, y, l, h }) => ({ left: `${x}%`, top: `${y}%`, width: `${l}%`, height: `${h}%` });
/* Point de l'image, en % */
const point = ({ x, y }) => ({ left: `${x}%`, top: `${y}%` });

/* N éléments répartis dans une zone, chacun avec sa position, son délai et sa durée */
const Semis = ({ n, graine, classe, enfant = null }) => Array.from({ length: n }, (_, i) => (
    <i key={i} className={classe} style={{
        left: `${hasard(graine + i) * 100}%`,
        top: `${hasard(graine + i + 50) * 100}%`,
        '--delai': `${-hasard(graine + i + 100) * 10}s`,
        '--duree': `${3 + hasard(graine + i + 150) * 5}s`,
        '--dx': `${(hasard(graine + i + 200) - 0.5) * 6}em`,
    }}>{enfant}</i>
));

const Effet = ({ effet, index, src }) => {
    const g = index * 17 + 3;   // graine différente pour chaque effet
    switch (effet.type) {
        case 'reflets':     // (1, 21) scintillements sur l'eau
            return <div className="effet effet--reflets" style={zone(effet)}><Semis n={effet.n ?? 12} graine={g} /></div>;
        case 'brume':       // (2) brume au pied de la cascade
            return <div className="effet effet--brume" style={zone(effet)}><i /><i /><i /></div>;
        case 'nuages':      // (3, 28) nuages qui dérivent
            return <div className="effet effet--nuages" style={zone(effet)}><i /><i /><i /></div>;
        case 'lucioles':    // (4) lucioles au crépuscule et la nuit
            return <div className="effet effet--lucioles" style={zone(effet)}><Semis n={10} graine={g} /></div>;
        case 'flamme':      // (5, 11) lanterne, bougie
            return <div className="effet effet--flamme" style={point(effet)}><i /></div>;
        case 'jet':         // (6) jet de la fontaine
        case 'cascade':     // (22) eau de la cascade
            return <div className={`effet effet--ruissellement effet--${effet.type}`} style={zone(effet)}><Semis n={7} graine={g} /></div>;
        case 'gouttes':     // (7) gouttes qui brillent
            return <div className="effet effet--gouttes" style={zone(effet)}><Semis n={12} graine={g} /></div>;
        case 'lampes':      // (8, 19, 24) réverbères qui s'allument l'un après l'autre
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--lampe" style={{ ...point(p), '--ordre': i, '--taille': `${p.t ?? 4}em` }}><i /></div>
            ));
        case 'statues':     // lueur dorée sur les statues, qui s'allument l'une après l'autre
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--statue" style={{ ...point(p), '--ordre': i, '--taille': `${p.t ?? 3}em` }}><i /></div>
            ));
        case 'pollen':      // grains dorés qui montent des massifs de fleurs, éclairés par le soleil
            return <div className="effet effet--pollen" style={zone(effet)}><Semis n={effet.n ?? 10} graine={g} /></div>;
        case 'miroir':      // le ciel doré se reflète dans le bassin et ondule
            return <div className="effet effet--miroir" style={zone(effet)}><i /><i /></div>;
        case 'fenetres':    // (51) fenêtres qui s'allument la nuit
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--fenetre" style={{ ...point(p), '--ordre': i }}><i /></div>
            ));
        case 'petales':     // (9, 23) pétales qui s'envolent
            return <div className="effet effet--petales" style={{ ...zone(effet), '--couleur-petale': effet.couleur ?? '#F2A7B5' }}><Semis n={8} graine={g} /></div>;
        case 'vapeur':      // (12) vapeur qui monte
            return <div className="effet effet--vapeur" style={point(effet)}><i /><i /><i /></div>;
        case 'reflet':      // (13) un reflet de lumière glisse sur l'auvent
            return <div className="effet effet--reflet" style={zone(effet)}><i /></div>;
        case 'neon':        // (14) l'enseigne s'allume comme un néon doux
            return <div className="effet effet--neon" style={zone(effet)}><i /></div>;
        case 'feuilles-sol': // (15) feuilles qui roulent sur les pavés
            return <div className="effet effet--feuilles-sol" style={zone(effet)}><i /><i /><i /></div>;
        case 'ondes':       // (16, 17, 21) ondes autour des barques ou des voiliers
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--ondes" style={{ ...point(p), '--delai': `${-i * 1.3}s` }}><i /><i /><i /></div>
            ));
        case 'drapeaux':    // (18) drapeaux au sommet des tours
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--drapeau" style={{ ...point(p), '--delai': `${-i * 0.4}s` }}><i /></div>
            ));
        case 'hirondelles': // (20) hirondelles qui tournent autour des tours
            return (
                <div className="effet effet--hirondelles" style={{ ...point(effet), '--echelle': effet.echelle ?? 1 }}>
                    {[0, 1, 2].map((i) => <span key={i} style={{ '--rayon': `${6 + i * 3}em`, '--duree': `${9 + i * 3}s`, '--delai': `${-i * 2}s` }}><i><b /></i></span>)}
                </div>
            );
        case 'herbes':      // (25) herbes hautes qui ondulent
            return (
                <div className="effet effet--herbes" style={zone(effet)}>
                    {Array.from({ length: 14 }, (_, i) => (
                        <i key={i} style={{ left: `${(i / 13) * 100}%`, '--hauteur': `${5 + hasard(g + i) * 5}em`, '--delai': `${-hasard(g + i + 9) * 4}s` }} />
                    ))}
                </div>
            );
        case 'fleurs':      // (26) fleurs sauvages qui se balancent
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--fleur" style={{ ...point(p), '--delai': `${-i * 0.7}s` }}><i /></div>
            ));
        case 'papillons':   // (27) papillons qui volettent
            return <div className="effet effet--papillons" style={zone(effet)}><Semis n={3} graine={g} enfant={<b />} /></div>;
        case 'aigle':       // (29) un aigle plane en larges cercles
            return <div className="effet effet--aigle" style={point(effet)}><span><i /></span></div>;
        case 'panneau':     // (30) le panneau de rando oscille au vent (une copie découpée de la photo)
            return (
                <div className="effet effet--panneau" style={{ '--pivot': `${effet.px}% ${effet.py}%` }}>
                    <img src={src} alt="" style={{ clipPath: `inset(${effet.y}% ${100 - effet.x - effet.l}% ${100 - effet.y - effet.h}% ${effet.x}%)` }} />
                </div>
            );
        case 'lune':        // la pleine lune : un halo pâle qui respire doucement
            return <div className="effet effet--lune" style={{ ...point(effet), '--taille': `${effet.t ?? 8}em` }}><i /></div>;
        case 'soleil':      // le soleil couchant respire, ses rayons tournent lentement
            // descend : le halo glisse doucement vers l'horizon, comme un vrai coucher de soleil
            return <div className={`effet effet--soleil${effet.descend ? ' effet--descend' : ''}`} style={{ ...point(effet), '--taille': `${effet.t ?? 14}em` }}><i /><b /></div>;
        case 'rougeoie':    // le ciel rougit lentement, puis pâlit
            return <div className="effet effet--rougeoie" style={zone(effet)} />;
        case 'voilier':     // un petit voilier traverse l'horizon, de droite à gauche
            return <div className="effet effet--voilier" style={zone(effet)}><i><b /></i></div>;
        case 'phare':       // la nuit, le faisceau d'un phare balaie l'horizon
            return <div className="effet effet--phare" style={point(effet)}><i /><b /></div>;
        case 'guirlande':   // ampoules d'une guirlande qui scintillent chacune à son rythme
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--ampoule" style={{ ...point(p), '--delai': `${-hasard(g + i) * 4}s`, '--duree': `${2 + hasard(g + i + 30) * 2.5}s` }}><i /></div>
            ));
        case 'chenillard':  // ampoules de marquise de cinéma qui s'allument en vague
            return effet.points.map((p, i) => (
                <div key={i} className="effet effet--chenillard" style={{ ...point(p), '--ordre': i % 6 }}><i /></div>
            ));
        case 'confettis':   // confettis colorés qui tombent sur la fête
            return <div className="effet effet--confettis" style={zone(effet)}><Semis n={effet.n ?? 16} graine={g} /></div>;
        case 'notes':       // notes de musique qui s'envolent de la scène
            return <div className="effet effet--notes" style={zone(effet)}><Semis n={6} graine={g} /></div>;
        default:
            return null;
    }
};

/*
 * Couche « heure et saison » (46 à 60) : posée sur tout le cadre, elle montre
 * seulement les éléments qui correspondent à <html data-theme> et <html data-saison>
 * (le choix se fait en CSS, rien à recalculer en JavaScript).
 */
export const CoucheSaison = () => (
    <div className="couche-saison" aria-hidden="true">
        <div className="s-brume"><i /><i /></div>                                     {/* aube */}
        <div className="s-rayons"><i /><i /><i /></div>                               {/* jour */}
        <div className="s-rose" />                                                    {/* crépuscule */}
        <div className="s-etoiles"><Semis n={16} graine={7} /></div>                  {/* nuit */}
        <div className="s-chute s-petales"><Semis n={8} graine={31} /></div>          {/* printemps */}
        <div className="s-chaleur"><i /></div>                                        {/* été */}
        <div className="s-abeilles"><Semis n={4} graine={61} enfant={<b />} /></div>  {/* été */}
        <div className="s-chute s-feuilles"><Semis n={9} graine={83} /></div>         {/* automne */}
        <div className="s-citrouille" />                                              {/* Halloween */}
        <div className="s-chute s-flocons"><Semis n={14} graine={97} /></div>         {/* hiver, Noël */}
        <div className="s-guirlande">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${3 + i * 7}%`, '--delai': `${-i * 0.35}s` }} />)}</div> {/* Noël */}
        <div className="s-filante"><i /></div>                                        {/* Noël */}
    </div>
);

const PhotoAnimee = ({ src, alt = '', ratio, cadrage, effets = [], className = '', chargement = 'lazy', fetchPriority }) => {
    // « 72% 60% » → --px: 0.72 ; --py: 0.6 (position du recadrage, comme object-position).
    // Sans cadrage, ce sont les feuilles CSS qui le donnent (utile pour changer selon l'écran).
    const style = { '--r': ratio };
    if (cadrage) [style['--px'], style['--py']] = cadrage.split(' ').map((v) => parseFloat(v) / 100);
    return (
        <div className={`photo-animee ${className}`} style={style}>
            <div className="photo-cadre">
                <img src={src} alt={alt} loading={chargement} fetchPriority={fetchPriority} />
                <div className="photo-effets" aria-hidden="true">
                    {effets.map((effet, i) => <Effet key={i} effet={effet} index={i} src={src} />)}
                </div>
            </div>
            <CoucheSaison />
        </div>
    );
};

export default PhotoAnimee;
