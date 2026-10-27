import { Link } from 'react-router-dom';
import Icone from './Icone.jsx';
import Bouton from './Bouton.jsx';
import { PileAvatars } from './Avatar.jsx';
import { BadgeCategorie } from './Badges.jsx';
import { formaterDistance } from '../Utils/proximite.js';
import { dateLisible, jourDuMois, lireDate, moisCourt } from '../Utils/dates.js';

/*
 * <CarteSortie sortie={sortie} km={12} onRejoindre={…} />
 *
 * sortie : objet du back { id, nom, categorie, dateDebut, lieu, participants? (liste de personnes) }
 * onRejoindre : si fourni, affiche le bouton « Rejoins » (sinon, rien : ex. sortie passée)
 * inscrit     : vrai si l'utilisateur est déjà inscrit (le bouton change)
 */
const CarteSortie = ({ sortie, km, onRejoindre, inscrit = false }) => {
    const date = lireDate(sortie.dateDebut);
    const personnes = sortie.participants || [];
    const total = personnes.length;

    return (
        <article className="carte-sortie">
            {/* Le grand chiffre est décoratif : la date complète est écrite dans les infos */}
            <div className="carte-sortie__date" aria-hidden="true">
                <span className="carte-sortie__jour">{jourDuMois(date)}</span>
                <span className="carte-sortie__mois">{moisCourt(date)}</span>
            </div>

            <div className="carte-sortie__corps">
                <span style={{ alignSelf: 'flex-start' }}><BadgeCategorie cle={sortie.categorie} /></span>
                <h3 className="carte-sortie__titre">
                    <Link to={`/sorties/${sortie.id}`}>{sortie.nom}</Link>
                </h3>
                <p className="carte-sortie__meta">
                    <span><Icone nom="horloge" />{dateLisible(sortie.dateDebut)}</span>
                    {sortie.lieu && (
                        <span><Icone nom="epingle" />{sortie.lieu}{km != null && ` · ${formaterDistance(km)}`}</span>
                    )}
                </p>
            </div>

            {(total > 0 || onRejoindre) && (
                <div className="carte-sortie__pied">
                    {total > 0 ? <PileAvatars personnes={personnes} total={total} /> : <span />}
                    {onRejoindre && (
                        <Bouton
                            variante={inscrit ? 'secondaire' : 'principal'}
                            aria-pressed={inscrit}
                            onClick={() => onRejoindre(sortie)}
                        >
                            {inscrit ? 'Inscrit·e ✓' : 'Rejoins'}
                        </Bouton>
                    )}
                </div>
            )}
        </article>
    );
};

export default CarteSortie;
