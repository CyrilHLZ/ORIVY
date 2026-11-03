import { useEffect, useId, useMemo, useState } from 'react';
import Icone from '../../../Composants/Icone.jsx';
import EmojiCategorie from '../../../Composants/EmojiCategorie.jsx';
import { categorie } from '../../../Constants/categories.js';
import { normaliserPoint } from '../../../Hooks/useLieux.js';
import { rechercherLieux } from '../../../Services/Carte/CarteService.js';

/* Les <input> renvoient du texte : le back attend des nombres (ou null si vide) */
const versNombre = (valeur) => (valeur === '' || valeur === null || valeur === undefined ? null : Number(valeur));

export const versPayload = (sortie) => ({
    ...sortie,
    latitude: versNombre(sortie.latitude),
    longitude: versNombre(sortie.longitude),
});

/* Comparaison sans accents ni majuscules : « chateau » trouve « Château » */
const simplifier = (texte) => (texte || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/*
 * <ChampsLieu valeur={sortie.lieu} lieux={lieux} onChoisir={…} onSaisir={…} erreur={…} />
 *
 * Champ de recherche avec liste de suggestions (motif ARIA « combobox ») :
 *   - on tape, les lieux de la carte qui correspondent s'affichent ;
 *   - flèches haut/bas pour se déplacer, Entrée pour choisir, Échap pour fermer ;
 *   - choisir un lieu remplit aussi les coordonnées (pour « Voir sur la carte »).
 * Dès 3 lettres, les lieux importés qui correspondent s'ajoutent (demandés au back).
 * On peut aussi garder un texte libre (lieu absent de la carte) : pas de coordonnées alors.
 */
const ChampsLieu = ({ valeur, lieux, onChoisir, onSaisir, erreur }) => {
    const id = useId();
    const [ouvert, setOuvert] = useState(false);
    const [actif, setActif] = useState(-1);   // index de la suggestion surlignée

    /* Lieux importés : demandés quand on arrête de taper (300 ms) */
    const [distants, setDistants] = useState([]);
    useEffect(() => {
        const texte = valeur.trim();
        if (!ouvert || texte.length < 3) { setDistants([]); return undefined; }
        let annule = false;
        const minuteur = setTimeout(() => {
            rechercherLieux(texte)
                .then((points) => { if (!annule) setDistants(points.map(normaliserPoint)); })
                .catch(() => {});
        }, 300);
        return () => { annule = true; clearTimeout(minuteur); };
    }, [valeur, ouvert]);

    const suggestions = useMemo(() => {
        const q = simplifier(valeur);
        if (q.length < 2) return [];
        const locaux = lieux.filter((l) => simplifier(`${l.nom} ${l.lieu ?? ''}`).includes(q)).slice(0, 6);
        return [...locaux, ...distants.filter((d) => !locaux.some((l) => l.id === d.id))].slice(0, 8);
    }, [valeur, lieux, distants]);

    const visible = ouvert && suggestions.length > 0;

    const choisir = (lieu) => {
        onChoisir(lieu);
        setOuvert(false);
        setActif(-1);
    };

    const clavier = (e) => {
        if (!visible) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActif((i) => Math.min(i + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((i) => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter' && actif > -1) { e.preventDefault(); choisir(suggestions[actif]); }
        else if (e.key === 'Escape') setOuvert(false);
    };

    return (
        <div className={`champ${erreur ? ' champ--erreur' : ''}`}>
            <label className="champ__label" htmlFor={id}>Lieu</label>
            <div className="champ__ligne">
                <Icone nom="epingle" />
                <input
                    id={id}
                    className="champ__saisie"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={visible}
                    aria-controls={`${id}-liste`}
                    aria-activedescendant={actif > -1 ? `${id}-option-${actif}` : undefined}
                    aria-invalid={erreur ? true : undefined}
                    aria-describedby={`${id}-aide${erreur ? ` ${id}-erreur` : ''}`}
                    autoComplete="off"
                    placeholder="Cherche un lieu : parc, musée, ville…"
                    value={valeur}
                    onChange={(e) => { onSaisir(e.target.value); setOuvert(true); setActif(-1); }}
                    onKeyDown={clavier}
                    // Petit délai : laisse le temps au clic sur une suggestion d'être pris en compte
                    onBlur={() => setTimeout(() => setOuvert(false), 150)}
                />
            </div>
            {visible && (
                <ul className="suggestions" id={`${id}-liste`} role="listbox" aria-label="Lieux proposés">
                    {suggestions.map((l, i) => (
                        <li
                            key={l.id}
                            id={`${id}-option-${i}`}
                            role="option"
                            aria-selected={i === actif}
                            className={`cat-${categorie(l.categorie).cle}`}
                            // onMouseDown plutôt que onClick : se déclenche AVANT que le champ perde le focus
                            onMouseDown={(e) => { e.preventDefault(); choisir(l); }}
                        >
                            <EmojiCategorie cle={categorie(l.categorie).cle} />
                            <span>{l.nom}<br /><small>{[l.lieu, categorie(l.categorie).nom].filter(Boolean).join(' · ')}</small></span>
                        </li>
                    ))}
                </ul>
            )}
            <p className="champ__aide" id={`${id}-aide`}>Choisis un lieu de la carte, ou écris librement une adresse.</p>
            {erreur && <p className="champ__erreur" id={`${id}-erreur`}><Icone nom="alerte" />{erreur}</p>}
        </div>
    );
};

export default ChampsLieu;
