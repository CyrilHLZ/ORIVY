import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSignalements, traiterSignalement } from '../../../Services/Signalement/SignalementService.js';
import { ilYa } from '../../../Utils/dates.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';

/*
 * Page Admin : signalements envoyés par les membres, du plus récent au plus ancien.
 * « Traité » le retire de la liste (le back le garde, marqué traite = true).
 * Rien à traiter : la section ne s'affiche pas du tout.
 */
const NOM_DU_TYPE = { membre: 'Membre', sortie: 'Sortie', commentaire: 'Commentaire', photo: 'Photo' };

/* Lien vers le contenu signalé, quand il a sa propre page */
const lienDe = (s) => {
    if (s.cibleType === 'membre') return `/profil/${s.cibleId}`;
    if (s.cibleType === 'sortie') return `/sorties/${s.cibleId}`;
    return null;
};

const Signalements = () => {
    const [signalements, setSignalements] = useState([]);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        getSignalements().then(setSignalements).catch(() => setErreur('Impossible de charger les signalements.'));
    }, []);

    const traiter = async (id) => {
        try {
            await traiterSignalement(id);
            setSignalements((liste) => liste.filter((s) => s.id !== id));
        } catch (e) {
            setErreur(e.message);
        }
    };

    if (!erreur && signalements.length === 0) return null;

    return (
        <section className="encart" aria-labelledby="t-signalements" style={{ marginBottom: 'var(--espace-6)' }}>
            <h2 id="t-signalements" style={{ fontSize: 'var(--taille-xl)', display: 'flex', alignItems: 'center', gap: 'var(--espace-2)' }}>
                <Icone nom="drapeau" />Signalements à traiter ({signalements.length})
            </h2>
            {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}
            <ul className="liste-signalements">
                {signalements.map((s) => {
                    const lien = lienDe(s);
                    return (
                        <li key={s.id}>
                            <div>
                                <p style={{ margin: 0 }}>
                                    <strong>{NOM_DU_TYPE[s.cibleType] ?? s.cibleType} n°{s.cibleId}</strong>
                                    {lien && <> · <Link to={lien}>voir</Link></>}
                                </p>
                                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{s.motif}</p>
                                <p className="texte-doux" style={{ margin: 0, fontSize: 'var(--taille-s)' }}>
                                    Par {s.auteur?.prenom ?? 'un membre'} · {ilYa(s.dateCreation)}
                                </p>
                            </div>
                            <Bouton variante="secondaire" icone="valider" onClick={() => traiter(s.id)}>Traité</Bouton>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default Signalements;
