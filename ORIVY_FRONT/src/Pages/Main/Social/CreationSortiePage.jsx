import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSortie, envoyerMediaSortie } from '../../../Services/Sortie/SortieService';
import { useLieux } from '../../../Hooks/useLieux.js';
import { categorie } from '../../../Constants/categories.js';
import Bouton from '../../../Composants/Bouton.jsx';
import FormulaireSortie from './FormulaireSortie.jsx';

/*
 * Créer une sortie. Si on arrive depuis la carte (« Crée une sortie ici »),
 * l'adresse contient ?lieu=point-12 : le lieu est déjà rempli.
 */
const CreationSortiePage = () => {
    const navigate = useNavigate();
    const [parametres] = useSearchParams();
    const idLieu = parametres.get('lieu');
    const { lieux, chargement } = useLieux();

    // On attend les lieux avant d'afficher le formulaire, pour pouvoir le préremplir
    if (idLieu && chargement) return <main className="conteneur" aria-busy="true"><p style={{ paddingTop: 'var(--espace-6)' }}>Chargement…</p></main>;

    const lieu = idLieu ? lieux.find((l) => l.id === idLieu) : null;
    const initial = {
        nom: '',
        categorie: lieu ? categorie(lieu.categorie).cle : 'promenade',
        dateDebut: '',
        description: '',
        lieu: lieu?.nom ?? '',
        latitude: lieu?.latitude ?? null,
        longitude: lieu?.longitude ?? null,
    };

    const creer = async (payload, fichier) => {
        const creee = await createSortie(payload);
        if (fichier) await envoyerMediaSortie(creee.id, fichier);
        navigate(`/sorties/${creee.id}`);
    };


    return (
        <main className="conteneur page-formulaire">
            <Bouton variante="fantome" icone="retour" onClick={() => navigate(-1)} style={{ marginTop: 'var(--espace-3)' }}>Retour</Bouton>
            <h1 className="page-titre">Crée une sortie</h1>
            <p className="page-intro">Choisis un lieu, une date, et donne envie aux autres de te rejoindre.</p>
            <FormulaireSortie initial={initial} texteValider="Publie la sortie" onValider={creer} onAnnuler={() => navigate(-1)} />
        </main>
    );
};

export default CreationSortiePage;
