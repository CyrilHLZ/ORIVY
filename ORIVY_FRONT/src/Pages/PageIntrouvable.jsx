import Bouton from '../Composants/Bouton.jsx';

/*
 * Page 404 (maquette design/maquettes/404.html).
 * L'illustration est en ligne : elle prend les couleurs du thème et de la saison.
 */
const PageIntrouvable = () => (
    <main className="page-404">
        <span className="deco-vide" aria-hidden="true" />
        <svg className="illu-404" viewBox="0 0 400 220" aria-hidden="true">
            {/* Le sentier en pointillés… */}
            <path d="M20 200 C80 200 90 150 150 150 C210 150 200 110 250 105" fill="none"
                  stroke="var(--couleur-texte)" strokeWidth="6" strokeLinecap="round" strokeDasharray="0 18" />
            {/* …qui s'arrête net : un point d'interrogation flotte au bout */}
            <text x="300" y="70" fontFamily="Fraunces, Georgia, serif" fontSize="56" fontWeight="600"
                  fill="var(--couleur-accent-texte)">?</text>
            <g id="epingle-perdue">
                <path d="M262 102 L242 68 A24 24 0 1 1 282 68 Z" fill="var(--couleur-surface)"
                      stroke="var(--couleur-principale)" strokeWidth="9" strokeLinejoin="round" />
            </g>
        </svg>
        <h1>Oups, ce sentier ne mène nulle part</h1>
        <p>La page que tu cherches a peut-être déménagé, ou n'a jamais existé. Pas de panique : il reste plein d'endroits à découvrir.</p>
        <div className="ligne-actions">
            <Bouton vers="/" icone="accueil">Retourne à l'accueil</Bouton>
            <Bouton vers="/carte" variante="secondaire" icone="carte">Explore la carte</Bouton>
        </div>
    </main>
);

export default PageIntrouvable;
