import { useId } from 'react';

/*
 * <Logo /> : le logotype ORIVY, en ligne (pas en <img>) pour qu'il suive le thème :
 *   - l'épingle (le O) prend la couleur principale de la saison,
 *   - les lettres et le sentier prennent la couleur du texte (currentColor).
 * Source : design/logo/orivy-logotype.svg. Largeur mini : 140px (sinon, monogramme).
 *
 * Animations au chargement (animations.css) :
 *   (36) l'épingle tombe et rebondit une fois ;
 *   (37) le sentier en pointillés se dessine point par point : un masque (rectangle
 *        blanc) s'agrandit de gauche à droite et découvre les points un à un.
 */
const Logo = ({ className = '' }) => {
    // Identifiant unique (plusieurs logos peuvent cohabiter). useId contient des « : » ou « « » »,
    // que url(#…) n'accepte pas : on ne garde que lettres et chiffres.
    const idMasque = `masque-logo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    return (
        <svg className={`logo ${className}`} viewBox="0 0 260 112" role="img" aria-label="ORIVY">
            <defs>
                <mask id={idMasque} maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="112">
                    <rect className="logo__masque" x="48" y="90" width="156" height="20" fill="#FFFFFF" />
                </mask>
            </defs>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* L'épingle de carte qui fait le O */}
                <path className="logo__epingle" stroke="var(--couleur-principale)" strokeWidth="10" d="M40 100 L19.1 62.8 A24 24 0 1 1 60.9 62.8 Z" />
                {/* Le sentier en pointillés */}
                <path stroke="currentColor" strokeWidth="6" strokeDasharray="0 12" d="M54 100 H198" mask={`url(#${idMasque})`} />
                {/* R I V */}
                <path stroke="currentColor" strokeWidth="10" d="M84 78 V24 H100 A15 15 0 0 1 100 54 H84 M100 54 L116 78 M136 24 V78 M154 24 L174 78 L194 24" />
                {/* Le Y, dont le pied rejoint le sentier */}
                <path stroke="currentColor" strokeWidth="10" d="M214 24 L232 51 L250 24 M232 51 V86 Q232 100 212 100" />
            </g>
        </svg>
    );
};

export default Logo;
