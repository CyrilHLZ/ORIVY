import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSortieById } from '../Services/Sortie/SortieService.js';
import { categorie } from '../Constants/categories.js';
import { dateLisible } from '../Utils/dates.js';
import Photo from './Photo.jsx';

/*
 * <CartePartagee texte={m.contenu} />
 * Si un message contient un lien vers une sortie (« …/sorties/12 »), on affiche sa petite carte
 * sous la bulle (maquette design/maquettes/messages.html). Marche aussi pour un lien collé à la main.
 */
export const idSortieDans = (texte) => texte?.match(/\/sorties\/(\d+)/)?.[1] ?? null;

const CartePartagee = ({ texte }) => {
    const id = idSortieDans(texte);
    const [sortie, setSortie] = useState(null);

    useEffect(() => {
        if (!id) return;
        getSortieById(id).then(setSortie).catch(() => setSortie(null));   // sortie supprimée : pas de carte
    }, [id]);

    if (!sortie) return null;
    const cat = categorie(sortie.categorie);
    return (
        <Link className={`carte-partagee cat-${cat.cle}`} to={`/sorties/${sortie.id}`}>
            <Photo src={sortie.imageUrl || cat.image} alt="" cle={cat.cle} />
            <span><strong>{sortie.nom}</strong><br /><small>{dateLisible(sortie.dateDebut)}</small></span>
        </Link>
    );
};

export default CartePartagee;
