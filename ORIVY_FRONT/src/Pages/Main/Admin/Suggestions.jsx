import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuggestions, traiterSuggestion } from '../../../Services/Suggestion/SuggestionService.js';
import { categorie } from '../../../Constants/categories.js';
import { ilYa } from '../../../Utils/dates.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import FenetreLieu from '../../../Composants/FenetreLieu.jsx';

/*
 * Page Admin : suggestions des membres (bouton « Suggérer » de la carte), de la plus récente à la plus ancienne.
 *   - lieu à ajouter : « Ajouter ce lieu » ouvre la fenêtre d'ajout pré-remplie ; une fois enregistré,
 *     la suggestion est marquée traitée ;
 *   - idée : simplement « Traitée ».
 * Rien à traiter : la section ne s'affiche pas du tout.
 */
const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [erreur, setErreur] = useState(null);
    const [aAjouter, setAAjouter] = useState(null);   // { suggestion, point } : fenêtre d'ajout ouverte

    useEffect(() => {
        getSuggestions().then(setSuggestions).catch(() => setErreur('Impossible de charger les suggestions.'));
    }, []);

    const traiter = async (id) => {
        try {
            await traiterSuggestion(id);
            setSuggestions((liste) => liste.filter((s) => s.id !== id));
        } catch (e) {
            setErreur(e.message);
        }
    };

    const ajouter = (s) => setAAjouter({
        suggestion: s,
        point: { nom: s.nomLieu ?? '', type: s.categorie || 'autre', adresse: s.adresse ?? '', description: s.message ?? '',
            latitude: s.latitude ?? '', longitude: s.longitude ?? '' },
    });

    if (!erreur && suggestions.length === 0) return null;

    return (
        <section className="encart" aria-labelledby="t-suggestions" style={{ marginBottom: 'var(--espace-6)' }}>
            <h2 id="t-suggestions" style={{ fontSize: 'var(--taille-xl)', display: 'flex', alignItems: 'center', gap: 'var(--espace-2)' }}>
                <Icone nom="commentaire" />Suggestions à traiter ({suggestions.length})
            </h2>
            {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}
            <ul className="liste-signalements">
                {suggestions.map((s) => (
                    <li key={s.id}>
                        <div>
                            <p style={{ margin: 0 }}>
                                {s.type === 'lieu'
                                    ? <><strong>Lieu à ajouter : {s.nomLieu}</strong>
                                        {s.categorie && <> · {categorie(s.categorie).emoji} {categorie(s.categorie).nom}</>}</>
                                    : <strong>Idée</strong>}
                            </p>
                            {s.adresse && (
                                <p style={{ margin: 0 }}>
                                    {s.adresse}
                                    {s.latitude != null && (
                                        <> · <Link to={`/carte?${new URLSearchParams({ lat: s.latitude, lng: s.longitude, nom: s.nomLieu ?? '' })}`}>voir le point</Link></>
                                    )}
                                </p>
                            )}
                            {s.message && <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{s.message}</p>}
                            <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>
                                Par {s.auteur?.prenom ?? 'un ancien membre'} · {ilYa(s.dateCreation)}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espace-2)' }}>
                            {s.type === 'lieu' && <Bouton icone="plus" onClick={() => ajouter(s)}>Ajouter ce lieu</Bouton>}
                            <Bouton variante="secondaire" icone="valider" onClick={() => traiter(s.id)}>Traitée</Bouton>
                        </div>
                    </li>
                ))}
            </ul>
            <FenetreLieu point={aAjouter?.point ?? null} onFermer={() => setAAjouter(null)}
                         onEnregistre={() => { const id = aAjouter.suggestion.id; setAAjouter(null); traiter(id); }} />
        </section>
    );
};

export default Suggestions;
