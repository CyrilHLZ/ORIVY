import { useCallback, useEffect, useState } from 'react';
import { getMapData } from '../Services/Carte/CarteService.js';
import { getNotes } from '../Services/Commentaire/CommentaireService.js';

/*
 * Transforme la réponse de /api/carte en une seule liste de lieux, au même format :
 *   { id, idNum, source, nom, description, categorie, lieu, latitude, longitude, imageUrl, note? }
 * Les points d'intérêt et les activités n'ont pas les mêmes noms de champs dans le back
 * (type / categorie, adresse / lieu) : on les harmonise ici, une fois pour toutes.
 */
export const normaliserLieux = ({ pointsInteret = [], activites = [] }) => [
    ...pointsInteret.map((point) => ({
        id: `point-${point.id}`,
        idNum: point.id,
        source: 'point',
        nom: point.nom,
        description: point.description,
        categorie: point.type,
        lieu: point.adresse,
        latitude: point.latitude,
        longitude: point.longitude,
        imageUrl: point.imageUrl,
    })),
    ...activites.map((activite) => ({
        ...activite,
        id: `activite-${activite.id}`,
        idNum: activite.id,
        source: 'activite',
    })),
];

/*
 * Hook : charge les lieux depuis le back.
 *   const { lieux, chargement, erreur, recharger } = useLieux();
 * Un hook personnalisé, c'est une fonction qui commence par « use » et qui
 * regroupe des useState / useEffect pour les réutiliser dans plusieurs pages
 * (ici : Activités ET Carte).
 */
export const useLieux = () => {
    const [lieux, setLieux] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    // useCallback : la fonction garde la même identité d'un rendu à l'autre,
    // on peut donc la mettre dans les dépendances de useEffect sans boucle infinie
    const recharger = useCallback(() => {
        setChargement(true);
        setErreur(null);
        // Les deux requêtes partent EN MÊME TEMPS ; si les notes échouent, on affiche quand même les lieux
        Promise.all([getMapData(), getNotes().catch(() => [])])
            .then(([donnees, notes]) => {
                // « point-12 » → { moyenne, nombre }
                const parLieu = Object.fromEntries(notes.map((n) => [`${n.cibleType}-${n.cibleId}`, n]));
                setLieux(normaliserLieux(donnees).map((l) => ({
                    ...l, note: parLieu[l.id]?.moyenne ?? null, nombreAvis: parLieu[l.id]?.nombre ?? 0,
                })));
            })
            .catch(() => setErreur('Les lieux sont momentanément indisponibles.'))
            .finally(() => setChargement(false));
    }, []);


    useEffect(() => { recharger(); }, [recharger]);

    return { lieux, chargement, erreur, recharger };
};
