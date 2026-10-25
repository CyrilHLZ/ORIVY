import { useId, useState } from 'react';
import Icone from './Icone.jsx';

/*
 * <Champ label="Titre de la sortie" value={titre} onChange={…} erreur={erreurs.titre} aide="…" />
 *
 * Relie tout seul le label, le texte d'aide et le message d'erreur au champ
 * (htmlFor, aria-describedby, aria-invalid) : c'est ce qui permet aux lecteurs
 * d'écran de lire « Titre de la sortie, champ invalide, Donne un titre ».
 *
 * multiligne : <textarea> au lieu d'<input>
 * icone      : icône à gauche dans le champ (recherche, ville…)
 * apres      : élément posé à droite dans le champ (ex. bouton « afficher le mot de passe »)
 * Les autres props (type, value, onChange, placeholder, required…) vont sur le champ.
 */
export const Champ = ({ label, aide, erreur, icone, apres, multiligne, id, cacherLabel, ...autres }) => {
    const idAuto = useId();               // identifiant unique, généré par React
    const idChamp = id || idAuto;
    const idAide = `${idChamp}-aide`;
    const idErreur = `${idChamp}-erreur`;
    const decrit = [aide && idAide, erreur && idErreur].filter(Boolean).join(' ') || undefined;

    const Balise = multiligne ? 'textarea' : 'input';
    const saisie = (
        <Balise
            className="champ__saisie"
            id={idChamp}
            aria-describedby={decrit}
            aria-invalid={erreur ? true : undefined}
            {...autres}
        />
    );

    return (
        <div className={`champ${erreur ? ' champ--erreur' : ''}`}>
            <label className={cacherLabel ? 'visuellement-cache' : 'champ__label'} htmlFor={idChamp}>{label}</label>
            {icone || apres
                ? <div className="champ__ligne">{icone && <Icone nom={icone} />}{saisie}{apres}</div>
                : saisie}
            {aide && <p className="champ__aide" id={idAide}>{aide}</p>}
            {erreur && (
                <p className="champ__erreur" id={idErreur}>
                    <Icone nom="alerte" />{erreur}
                </p>
            )}
        </div>
    );
};

/*
 * <Interrupteur label="Décorations saisonnières" detail="Citrouilles, flocons…" checked={…} onChange={…} />
 * Une vraie case à cocher avec role="switch" : annoncée « activé / désactivé ».
 */
export const Interrupteur = ({ label, detail, ...autres }) => (
    <label className="interrupteur">
        <span className="interrupteur__texte">
            {label}
            {detail && <small>{detail}</small>}
        </span>
        <input type="checkbox" role="switch" {...autres} />
    </label>
);

/*
 * <ChampMotDePasse label="Mot de passe" value={…} onChange={…} autoComplete="current-password" />
 * Champ mot de passe avec un bouton « œil » pour l'afficher ou le masquer.
 * aria-pressed + un libellé qui change : le lecteur d'écran sait dans quel état on est.
 */
export const ChampMotDePasse = (props) => {
    const [visible, setVisible] = useState(false);
    const bouton = (
        <button
            type="button"
            className="bouton bouton--icone"
            aria-pressed={visible}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onClick={() => setVisible(!visible)}
        >
            <Icone nom={visible ? 'oeil-barre' : 'oeil'} />
        </button>
    );
    return <Champ icone="cadenas" apres={bouton} type={visible ? 'text' : 'password'} {...props} />;
};
