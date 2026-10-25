/*
 * <Confettis actif={vrai} /> (75)
 * Une gerbe de petits papiers colorés, jouée une fois quand « actif » passe à vrai
 * (ex. : on vient de s'inscrire à une sortie). Purement décoratif.
 * La clé change à chaque déclenchement : React recrée les éléments, l'animation rejoue.
 */
const COULEURS = ['var(--couleur-principale)', 'var(--couleur-accent)', '#F4C542', '#E8607A', '#5468C9'];

const Confettis = ({ actif, cle = 0 }) => {
    if (!actif) return null;
    return (
        <div className="confettis" aria-hidden="true" key={cle}>
            {Array.from({ length: 28 }, (_, i) => (
                <i key={i} style={{
                    '--x': `${(Math.sin(i * 7.3) * 0.5 + 0.5) * 100}vw`,
                    '--dx': `${Math.cos(i * 3.1) * 120}px`,
                    '--tour': `${(i % 2 ? 1 : -1) * (360 + i * 25)}deg`,
                    '--delai': `${(i % 7) * 0.05}s`,
                    background: COULEURS[i % COULEURS.length],
                }} />
            ))}
        </div>
    );
};

export default Confettis;
