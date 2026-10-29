import { useEffect, useId, useRef, useState } from 'react';
import Icone from './Icone.jsx';

/*
 * <MenuOptions label="Plus d'options pour Inès" options={[{ texte: 'Signaler', icone: 'drapeau', onClick }]} />
 * Bouton « ⋯ » qui déplie une petite liste d'actions (même motif que MenuProfil :
 * aria-expanded, Échap ou clic ailleurs referme, le focus revient sur le bouton).
 * danger: true → texte rouge (Bloquer).
 */
const MenuOptions = ({ label, options }) => {
    const [ouvert, setOuvert] = useState(false);
    const zone = useRef(null);
    const bouton = useRef(null);
    const idListe = useId();

    useEffect(() => {
        if (!ouvert) return undefined;
        const clicDehors = (e) => { if (!zone.current.contains(e.target)) setOuvert(false); };
        const echap = (e) => {
            if (e.key === 'Escape') { setOuvert(false); bouton.current.focus(); }
        };
        document.addEventListener('mousedown', clicDehors);
        document.addEventListener('keydown', echap);
        return () => {
            document.removeEventListener('mousedown', clicDehors);
            document.removeEventListener('keydown', echap);
        };
    }, [ouvert]);

    const choisir = (option) => {
        setOuvert(false);
        option.onClick();
    };

    return (
        <div className="menu-options" ref={zone}>
            <button ref={bouton} type="button" className="bouton bouton--icone bouton--secondaire"
                    aria-expanded={ouvert} aria-controls={idListe} aria-label={label} onClick={() => setOuvert(!ouvert)}>
                <Icone nom="plus-options" />
            </button>
            {ouvert && (
                <ul className="menu-profil__liste" id={idListe}>
                    {options.map((o) => (
                        <li key={o.texte}>
                            <button type="button" className={`bouton bouton--fantome${o.danger ? ' menu-options__danger' : ''}`}
                                    onClick={() => choisir(o)}>
                                <Icone nom={o.icone} />{o.texte}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MenuOptions;
