import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { getUtilisateurs } from '../../Services/Utilisateur/UtilisateurService.js';
import { followUser, getFollowing, unfollowUser } from '../../Services/Social/SocialService.js';
import Avatar from '../../Composants/Avatar.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import { Champ } from '../../Composants/Formulaire.jsx';
import { EtatErreur, EtatVide } from '../../Composants/Etats.jsx';

/*
 * Communauté (maquette design/maquettes/communaute.html) : trouver des membres.
 * Données : GET /api/utilisateurs. On n'affiche QUE prénom, nom et ville
 * (le back renvoie aussi des données privées, qu'on ne montre jamais).
 * Bouton « Suivre » sur chaque membre (le nom mène à son profil).
 */
const simplifier = (texte) => (texte || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const CommunautePage = () => {
    const { user } = useAuth();
    const [membres, setMembres] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [recherche, setRecherche] = useState('');

    const charger = () => {
        setChargement(true);
        setErreur(null);
        getUtilisateurs()
            // On ne garde dans l'état que les champs publics : les autres ne circulent plus dans la page
            .then((liste) => setMembres(liste.map(({ id, prenom, nom, ville }) => ({ id, prenom, nom, ville }))))
            .catch(() => setErreur('Impossible de charger les membres.'))
            .finally(() => setChargement(false));
    };
    useEffect(charger, []);

    // Les ids des membres que JE suis : un Set répond vite à « je suis Inès ? »
    const [suivis, setSuivis] = useState(new Set());
    useEffect(() => {
        if (!user?.id) return;
        getFollowing(user.id).then((liste) => setSuivis(new Set(liste.map((m) => m.id)))).catch(() => {});
    }, [user?.id]);

    const basculer = async (id) => {
        const deja = suivis.has(id);
        try {
            if (deja) await unfollowUser(id);
            else await followUser(id);
            setSuivis((avant) => {
                const apres = new Set(avant);   // nouveau Set : React ne voit pas un .add() sur l'ancien
                if (deja) apres.delete(id); else apres.add(id);
                return apres;
            });
        } catch {
            setErreur("L'abonnement n'a pas pu être enregistré.");
        }
    };

    const visibles = useMemo(() => {
        const q = simplifier(recherche.trim());
        return membres
            .filter((m) => m.id !== user?.id)   // pas soi-même dans la liste
            .filter((m) => !q || simplifier(`${m.prenom} ${m.nom} ${m.ville}`).includes(q))
            .sort((a, b) => (a.prenom || '').localeCompare(b.prenom || '', 'fr'));
    }, [membres, recherche, user]);

    // Les membres de la même ville d'abord, quand on la connaît
    const maVille = simplifier(user?.ville);
    const proches = maVille ? visibles.filter((m) => simplifier(m.ville) === maVille) : [];
    const autres = maVille ? visibles.filter((m) => simplifier(m.ville) !== maVille) : visibles;

    const carte = (m) => (
        <div className="carte-utilisateur" key={m.id}>
            <Avatar personne={m} />
            <div>
                <p className="carte-utilisateur__nom"><Link to={`/profil/${m.id}`}>{[m.prenom, m.nom].filter(Boolean).join(' ')}</Link></p>
                {m.ville && <p className="carte-utilisateur__info">{m.ville}</p>}
            </div>
            <Bouton variante={suivis.has(m.id) ? 'secondaire' : 'principal'} pilule icone={suivis.has(m.id) ? 'abonne' : 'suivre'}
                    aria-pressed={suivis.has(m.id)} aria-label={`${suivis.has(m.id) ? 'Ne plus suivre' : 'Suivre'} ${m.prenom}`}
                    onClick={() => basculer(m.id)}>
                {suivis.has(m.id) ? 'Abonné' : 'Suivre'}
            </Bouton>
        </div>
    );

    return (
        <main className="conteneur page-communaute">
            <h1 className="page-titre">Communauté</h1>
            <p className="page-intro">Trouve des gens qui aiment les mêmes sorties que toi.</p>

            <form role="search" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 'var(--espace-6)' }}>
                <Champ label="Cherche un membre" cacherLabel icone="loupe" type="search" placeholder="Cherche un prénom, une ville…"
                       value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </form>

            {chargement && <p aria-busy="true">Chargement des membres…</p>}
            {erreur && <EtatErreur message={erreur} onReessayer={charger} />}

            {!chargement && !erreur && visibles.length === 0 && (
                <EtatVide icone="utilisateurs" titre={recherche ? 'Personne ne correspond' : 'La bande est encore petite'}
                          action={<Bouton icone="plus" vers="/sorties/creation">Crée une sortie</Bouton>}>
                    {recherche
                        ? 'Essaie un autre prénom ou une autre ville.'
                        : "Tu fais partie des premiers membres ! Lance une sortie : c'est le meilleur moyen de rencontrer du monde."}
                </EtatVide>
            )}

            {proches.length > 0 && (
                <section aria-labelledby="t-proches" style={{ marginBottom: 'var(--espace-7)' }}>
                    <h2 id="t-proches" style={{ fontSize: 'var(--taille-xl)' }}>Près de toi, à {user.ville}</h2>
                    <div className="liste-profils">{proches.map(carte)}</div>
                </section>
            )}
            {autres.length > 0 && (
                <section aria-labelledby="t-membres">
                    <h2 id="t-membres" style={{ fontSize: 'var(--taille-xl)' }}>{proches.length > 0 ? 'Partout en France' : 'Les membres'}</h2>
                    <div className="liste-profils">{autres.map(carte)}</div>
                </section>
            )}
        </main>
    );
};

export default CommunautePage;
