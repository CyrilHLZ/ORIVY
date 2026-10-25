import Icone from './Icone.jsx';

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
        {(icone || cle) && <Icone nom={icone || `cat-${cle}`} />}
        {children}
    </button>
);

/*
 * <Puces label="Catégories">…</Puces>
 * Rangée de puces qui défile horizontalement au pouce.
 */
export const Puces = ({ label, children }) => (
    <div className="puces" role="group" aria-label={label}>{children}</div>
);

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
