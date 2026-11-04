import { useRef, useState, useEffect, useCallback } from 'react';
import Icone from './Icone.jsx';
import EmojiCategorie from './EmojiCategorie.jsx';

/*
 * <Puce actif={…} cle="parc" onClick={…}>Parcs</Puce>
 * Bouton-filtre en forme de pilule. aria-pressed dit s'il est enfoncé :
 * c'est lu par les lecteurs d'écran ET utilisé par le CSS pour le colorer.
 * cle : facultative ; si c'est une catégorie, l'icône et la couleur suivent.
 */
export const Puce = ({ actif = false, cle, icone, children, ...autres }) => (
    <button
        type="button"
        className={`puce${cle ? ` cat-${cle}` : ''}`}
        aria-pressed={actif}
        {...autres}
    >
        {icone ? <Icone nom={icone} /> : cle ? <EmojiCategorie cle={cle} /> : null}
        {children}
    </button>
);

/*
 * <Puces label="Catégories">…</Puces>
 * Rangée de puces qui défile horizontalement. Avec beaucoup de catégories
 * elle déborde : on ajoute une vraie barre défilante (flèches + dégradés sur
 * les bords) qui n'apparaît QUE s'il y a de quoi faire défiler.
 */
export const Puces = ({ label, children }) => {
    const rangee = useRef(null);
    const [gauche, setGauche] = useState(false); // peut défiler vers la gauche ?
    const [droite, setDroite] = useState(false); // peut défiler vers la droite ?

    // Recalcule, à partir du scroll, s'il reste du contenu caché de chaque côté
    const majFleches = useCallback(() => {
        const el = rangee.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setGauche(el.scrollLeft > 1);
        setDroite(el.scrollLeft < max - 1);
    }, []);

    useEffect(() => {
        majFleches();
        const el = rangee.current;
        if (!el) return;
        el.addEventListener('scroll', majFleches, { passive: true });
        window.addEventListener('resize', majFleches);
        return () => {
            el.removeEventListener('scroll', majFleches);
            window.removeEventListener('resize', majFleches);
        };
    }, [majFleches, children]);

    const glisser = (sens) => {
        const el = rangee.current;
        if (el) el.scrollBy({ left: sens * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <div className={`puces-barre${gauche ? ' puces-barre--gauche' : ''}${droite ? ' puces-barre--droite' : ''}`}>
            <button type="button" className="puces-fleche puces-fleche--g" aria-label="Voir les catégories précédentes"
                    onClick={() => glisser(-1)}>
                <Icone nom="chevron-gauche" />
            </button>
            <div className="puces" role="group" aria-label={label} ref={rangee}>{children}</div>
            <button type="button" className="puces-fleche puces-fleche--d" aria-label="Voir les catégories suivantes"
                    onClick={() => glisser(1)}>
                <Icone nom="chevron-droit" />
            </button>
        </div>
    );
};

/*
 * <ChoixSegmente nom="rayon" legende="Rayon de recherche" valeur={25} onChange={setRayon}
 *                options={[{ valeur: 1, texte: '1 km' }, …]} />
 * Groupe de VRAIS boutons radio (flèches du clavier incluses), stylés en pilule.
 * Sert pour le filtre de rayon (1/5/10/25/50 km) et le choix du thème.
 */
export const ChoixSegmente = ({ nom, legende, valeur, onChange, options, desactive = false }) => (
    <fieldset className="rayon" disabled={desactive}>
        <legend>{legende}</legend>
        {options.map((option) => (
            <label key={option.valeur}>
                <input
                    type="radio"
                    name={nom}
                    value={option.valeur}
                    checked={option.valeur === valeur}
                    onChange={() => onChange(option.valeur)}
                />
                <span>{option.texte}</span>
            </label>
        ))}
    </fieldset>
);

/* Les rayons du brief, prêts à l'emploi */
export const OPTIONS_RAYON = [1, 5, 10, 25, 50].map((km) => ({ valeur: km, texte: `${km} km` }));
