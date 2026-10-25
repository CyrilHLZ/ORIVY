import { useEffect, useState } from 'react';
import Icone from './Icone.jsx';

/*
 * <RetourHaut /> (96)
 * Bouton rond qui apparaît après avoir descendu 600 px, et remonte en haut de la page.
 * + (97) une fine barre de lecture sous l'en-tête, qui se remplit avec le défilement
 *   (entièrement en CSS : animation liée au défilement de la page, scroll(root)).
 */
const RetourHaut = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const mesurer = () => setVisible(window.scrollY > 600);
        mesurer();
        window.addEventListener('scroll', mesurer, { passive: true });
        return () => window.removeEventListener('scroll', mesurer);
    }, []);

    const remonter = () => {
        const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
    };

    return (
        <>
            <div className="barre-lecture" aria-hidden="true" />
            <button type="button" className={`retour-haut${visible ? ' retour-haut--visible' : ''}`}
                    onClick={remonter} aria-label="Remonter en haut de la page" tabIndex={visible ? 0 : -1}>
                <Icone nom="chevron-haut" />
            </button>
        </>
    );
};

export default RetourHaut;
