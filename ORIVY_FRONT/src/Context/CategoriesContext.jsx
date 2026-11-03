import { createContext, useContext, useEffect, useState } from 'react';
import { getCategories } from '../Services/Categorie/CategorieService.js';
import { definirCategories, LISTE_CATEGORIES } from '../Constants/categories.js';

/*
 * Charge les catégories depuis l'API UNE fois au démarrage, avant d'afficher l'app : ainsi
 * categorie(cle) a toujours ses données. La couleur de chaque catégorie est injectée en CSS
 * (règle .cat-<cle> { --cat: … }) pour que même les catégories créées par l'admin soient colorées.
 * recharger() permet à l'écran admin de rafraîchir la liste après un ajout / une modification.
 */
const CategoriesContext = createContext({ categories: [], recharger: () => {} });

const injecterCouleurs = (liste) => {
    const css = liste.map((c) => `.cat-${c.cle}{--cat:${c.couleur};--cat-texte:${c.couleur};}`).join('');
    let style = document.getElementById('orivy-couleurs-categories');
    if (!style) {
        style = document.createElement('style');
        style.id = 'orivy-couleurs-categories';
        document.head.appendChild(style);   // après les feuilles liées → l'emporte sur design-system.css
    }
    style.textContent = css;
};

export const CategoriesProvider = ({ children }) => {
    const [categories, setCategories] = useState(null);   // null = pas encore chargé

    const charger = () => getCategories().then((liste) => {
        definirCategories(liste);
        injecterCouleurs(LISTE_CATEGORIES);
        setCategories(LISTE_CATEGORIES);
    });

    useEffect(() => {
        // Si l'API ne répond pas (back éteint), on affiche quand même l'app avec le repli « Autre »
        charger().catch(() => setCategories(LISTE_CATEGORIES));
    }, []);

    if (categories === null) return null;   // bref instant de chargement (requête même origine, rapide)

    return (
        <CategoriesContext.Provider value={{ categories, recharger: charger }}>
            {children}
        </CategoriesContext.Provider>
    );
};

export const useCategories = () => useContext(CategoriesContext).categories;
export const useRechargerCategories = () => useContext(CategoriesContext).recharger;
