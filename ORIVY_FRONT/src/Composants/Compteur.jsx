import { useEffect, useState } from 'react';

/*
 * <Compteur valeur={765} duree={1200} format={(n) => …} />
 * Fait défiler un nombre de 0 jusqu'à sa valeur, en ralentissant à la fin (40, 68).
 * requestAnimationFrame : on recalcule à chaque image affichée par l'écran.
 * Sous « mouvement réduit », le nombre s'affiche directement.
 * Pour les lecteurs d'écran, la valeur finale est donnée tout de suite (aria-label).
 */
const Compteur = ({ valeur, duree = 1200, format = (n) => Math.round(n).toLocaleString('fr-FR') }) => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [affiche, setAffiche] = useState(reduit ? valeur : 0);

    useEffect(() => {
        if (reduit || !Number.isFinite(valeur)) { setAffiche(valeur); return undefined; }
        let image;
        const debut = performance.now();
        const avancer = (maintenant) => {
            const t = Math.min(1, (maintenant - debut) / duree);
            const adouci = 1 - (1 - t) ** 3;   // démarre vite, se pose en douceur
            setAffiche(valeur * adouci);
            if (t < 1) image = requestAnimationFrame(avancer);
        };
        image = requestAnimationFrame(avancer);
        return () => cancelAnimationFrame(image);   // on arrête si le composant disparaît
    }, [valeur, duree, reduit]);

    return <span aria-label={format(valeur)}><span aria-hidden="true">{format(affiche)}</span></span>;
};

export default Compteur;
