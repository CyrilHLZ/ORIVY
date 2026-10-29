import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteSortie, envoyerMediaSortie, getSortieById, updateSortie } from '../../../Services/Sortie/SortieService';
import Bouton from '../../../Composants/Bouton.jsx';
import FenetreConfirmation from '../../../Composants/Fenetre.jsx';
import { EtatErreur } from '../../../Composants/Etats.jsx';
import FormulaireSortie from './FormulaireSortie.jsx';

/* Modifier une sortie : même formulaire que la création, prérempli, + zone de suppression */
const ModificationSortiePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initial, setInitial] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [confirmation, setConfirmation] = useState(false);

    useEffect(() => {
        getSortieById(id)
            .then((data) => setInitial({
                nom: data.nom ?? '',
                categorie: data.categorie ?? 'autre',
                dateDebut: data.dateDebut?.slice(0, 16) ?? '',   // <input type="datetime-local"> attend AAAA-MM-JJTHH:MM
                description: data.description ?? '',
                lieu: data.lieu ?? '',
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                nombreMax: data.nombreMax ?? '',
                imageUrl: data.imageUrl ?? null,
            }))
            .catch(() => setErreur('Impossible de charger cette sortie.'));
    }, [id]);

    const enregistrer = async (payload, fichier) => {
        await updateSortie(id, { ...payload, id: Number(id) });
        if (fichier) await envoyerMediaSortie(id, fichier);
        navigate(`/sorties/${id}`);
    };

    const supprimer = async () => {
        try {
            await deleteSortie(id);
            navigate('/sorties');
        } catch (e) {
            setConfirmation(false);
            setErreur(e.message || 'La suppression a échoué.');
        }
    };

    if (erreur && !initial) return <main className="conteneur"><EtatErreur titre="Sortie introuvable" message={erreur} /></main>;
    if (!initial) return <main className="conteneur" aria-busy="true"><p style={{ paddingTop: 'var(--espace-6)' }}>Chargement de la sortie…</p></main>;

    return (
        <main className="conteneur page-formulaire">
            <Bouton variante="fantome" icone="retour" vers={`/sorties/${id}`} style={{ marginTop: 'var(--espace-3)' }}>Retour à la sortie</Bouton>
            <h1 className="page-titre">Modifie ta sortie</h1>
            <p className="page-intro">Les inscrits verront les changements de date ou de lieu.</p>

            <FormulaireSortie
                initial={initial}
                texteValider="Enregistre les modifications"
                onValider={enregistrer}
                onAnnuler={() => navigate(`/sorties/${id}`)}
                enPlus={(
                    <section className="zone-danger" aria-labelledby="t-danger">
                        <h2 id="t-danger">Supprimer la sortie</h2>
                        <p className="texte-doux" style={{ fontSize: 'var(--taille-s)' }}>Cette action est définitive.</p>
                        <Bouton variante="danger" icone="supprimer" onClick={() => setConfirmation(true)}>Supprimer la sortie</Bouton>
                        {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
                    </section>
                )}
            />

            <FenetreConfirmation ouverte={confirmation} titre="Supprimer cette sortie ?" texteConfirmer="Oui, supprimer"
                                 texteAnnuler="Garder la sortie" onConfirmer={supprimer} onAnnuler={() => setConfirmation(false)}>
                Cette action est définitive.
            </FenetreConfirmation>
        </main>
    );
};

export default ModificationSortiePage;
