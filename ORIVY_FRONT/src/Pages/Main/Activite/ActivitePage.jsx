import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLieux } from '../../../Hooks/useLieux.js';
import { LISTE_CATEGORIES } from '../../../Constants/categories.js';
import { demanderPosition, distanceKm, trouverVille } from '../../../Utils/proximite.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import CarteLieu from '../../../Composants/CarteLieu.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import { ChoixSegmente, OPTIONS_RAYON, Puce, Puces } from '../../../Composants/Filtres.jsx';
import { Chargement, EtatErreur, EtatVide } from '../../../Composants/Etats.jsx';

/*
 * Page Activités / lieux (maquette design/maquettes/activites.html).
 * Sans position : tous les lieux, triés du plus récent au plus ancien.
 * Avec position (GPS ou ville tapée) : distance sur chaque carte, filtre de
 * rayon actif, tri « plus proche » par défaut.
 */
const ActivitePage = () => {
    const { lieux, chargement, erreur, recharger } = useLieux();

    // La catégorie est dans l'adresse (?cat=parc) : on peut partager un lien filtré,
    // et les boutons de l'accueil « Vois les parcs » arrivent directement filtrés
    const [parametres, setParametres] = useSearchParams();
    const cat = parametres.get('cat');
    const choisirCategorie = (cle) => setParametres(cle ? { cat: cle } : {});

    const [position, setPosition] = useState(null);   // { lat, lng, nom }
    const [rayon, setRayon] = useState(25);
    const [tri, setTri] = useState('recent');
    const [localisation, setLocalisation] = useState(false);   // demande GPS en cours
    const [alerte, setAlerte] = useState(null);
    const [ville, setVille] = useState('');
    const champVille = useRef(null);

    // Affichage par paquets : 765 cartes d'un coup ralentiraient la page (surtout sur mobile)
    const PAQUET = 24;
    const [affiches, setAffiches] = useState(PAQUET);
    // Quand un filtre change, on repart du premier paquet
    useEffect(() => { setAffiches(PAQUET); }, [cat, position, rayon, tri]);

    const definirPosition = (pos, nom) => {
        setPosition({ ...pos, nom });
        setAlerte(null);
        setTri('proche');
    };

    /* « Autour de moi » : la position n'est demandée QUE sur ce clic */
    const autourDeMoi = async () => {
        setLocalisation(true);
        try {
            definirPosition(await demanderPosition(), 'de toi');
        } catch (e) {
            setAlerte(e.message);
            champVille.current?.focus();
        } finally {
            setLocalisation(false);
        }
    };

    const chercherVille = async (event) => {
        event.preventDefault();
        try {
            const trouvee = await trouverVille(ville);
            if (trouvee) definirPosition(trouvee, `de ${trouvee.nom}`);
            else setAlerte(`Aucune commune ne s'appelle « ${ville} ». Vérifie l'orthographe.`);
        } catch (e) {
            setAlerte(e.message);
        }
    };

    /*
     * La liste affichée est CALCULÉE à partir des lieux et des filtres.
     * useMemo : on ne refait le calcul que si l'un d'eux change (pas à chaque frappe ailleurs).
     */
    const resultats = useMemo(() => {
        const liste = lieux
            .filter((l) => !cat || l.categorie === cat)
            .map((l) => ({
                lieu: l,
                km: position && l.latitude != null ? distanceKm(position.lat, position.lng, l.latitude, l.longitude) : null,
            }))
            .filter((x) => !position || (x.km != null && x.km <= rayon));

        return liste.sort((a, b) => {
            if (tri === 'proche' && position) return a.km - b.km;
            if (tri === 'note') return (b.lieu.note ?? 0) - (a.lieu.note ?? 0);
            return b.lieu.idNum - a.lieu.idNum;   // plus récent : identifiant le plus grand
        });
    }, [lieux, cat, position, rayon, tri]);

    // « Mieux noté » n'est proposé que si le back envoie des notes
    const notesDisponibles = lieux.some((l) => l.note != null);
    const n = resultats.length;
    const compte = position
        ? `${n} lieu${n > 1 ? 'x' : ''} à moins de ${rayon} km ${position.nom}`
        : `${n} lieu${n > 1 ? 'x' : ''} partout en France`;

    return (
        <main className="conteneur page-activites">
            <h1 className="page-titre">Lieux à découvrir</h1>
            <p className="page-intro">Monuments, parcs, randonnées, bonnes tables : trouve ta prochaine sortie près de chez toi.</p>

            {/* Système de proximité */}
            <section className="proximite" aria-label="Où chercher">
                <div className="proximite__position">
                    <Bouton variante="secondaire" pilule icone={localisation ? undefined : 'autour'}
                            onClick={autourDeMoi} disabled={localisation} aria-busy={localisation}>
                        {localisation && <span className="radar" aria-hidden="true"><i /></span>}
                        {localisation ? 'Localisation…' : 'Autour de moi'}
                    </Bouton>
                    <form role="search" onSubmit={chercherVille} style={{ flex: '1 1 calc(var(--espace-9) * 2)' }}>
                        <Champ ref={champVille} label="Ou tape une ville" cacherLabel icone="epingle" type="search"
                               placeholder="Ou tape une ville : Lyon, Lille…" autoComplete="address-level2"
                               value={ville} onChange={(e) => setVille(e.target.value)} />
                    </form>
                </div>
                <div className="proximite__reglages">
                    <ChoixSegmente nom="rayon" legende="Rayon de recherche" valeur={rayon} onChange={setRayon}
                                   options={OPTIONS_RAYON} desactive={!position} />
                    <label className="tri">
                        Trier par
                        <select className="champ__saisie" value={tri} onChange={(e) => setTri(e.target.value)}>
                            {position && <option value="proche">Plus proche</option>}
                            {notesDisponibles && <option value="note">Mieux noté</option>}
                            <option value="recent">Plus récent</option>
                        </select>
                    </label>
                </div>
            </section>

            {/* Position refusée ou ville inconnue */}
            {alerte && (
                <p className="alerte-position" role="alert"><Icone nom="info" />{alerte}</p>
            )}

            <Puces label="Catégories">
                <Puce actif={!cat} onClick={() => choisirCategorie(null)}>Tout</Puce>
                {LISTE_CATEGORIES.filter((c) => c.cle !== 'autre').map((c) => (
                    <Puce key={c.cle} cle={c.cle} actif={cat === c.cle} onClick={() => choisirCategorie(c.cle)}>
                        {c.pluriel}
                    </Puce>
                ))}
            </Puces>

            <div className="resultats-tete">
                {/* aria-live : le nouveau nombre est annoncé quand un filtre change */}
                <p aria-live="polite">{!chargement && !erreur && compte}</p>
                <Bouton variante="fantome" icone="carte" vers="/carte">Vois sur la carte</Bouton>
            </div>

            {chargement && <Chargement nombre={6} label="Chargement des lieux" />}
            {erreur && <EtatErreur message={erreur} onReessayer={recharger} />}

            {!chargement && !erreur && n > 0 && (
                <div className="grille-lieux">
                    {resultats.slice(0, affiches).map(({ lieu, km }) => <CarteLieu key={lieu.id} lieu={lieu} km={km} />)}
                </div>
            )}

            {!chargement && !erreur && n > affiches && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--espace-6)' }}>
                    <Bouton variante="secondaire" onClick={() => setAffiches(affiches + PAQUET)}>
                        Voir plus de lieux ({n - affiches} restants)
                    </Bouton>
                </div>
            )}

            {!chargement && !erreur && n === 0 && (
                position && rayon < 50 ? (
                    <EtatVide icone="epingle" titre="Rien dans ce rayon"
                              action={<Bouton variante="secondaire" onClick={() => setRayon(50)}>Passer à 50 km</Bouton>}>
                        Aucun lieu à moins de {rayon} km. Élargis le rayon, ou change de catégorie.
                    </EtatVide>
                ) : (
                    <EtatVide icone="epingle" titre="Aucun lieu ici pour l'instant"
                              action={<Bouton variante="secondaire" onClick={() => choisirCategorie(null)}>Voir toutes les catégories</Bouton>}>
                        Cette catégorie n'a pas encore de lieu. Reviens bientôt !
                    </EtatVide>
                )
            )}
        </main>
    );
};

export default ActivitePage;
