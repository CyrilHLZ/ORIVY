import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../Services/Utilisateur/UtilisateurService.js';
import CadreAuth from './CadreAuth.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { Champ, ChampMotDePasse } from '../../Composants/Formulaire.jsx';

const REGLES = [
    { texte: '8 caractères minimum', test: (mdp) => mdp.length >= 8 },
    { texte: 'Une majuscule', test: (mdp) => /[A-ZÀ-Ý]/.test(mdp) },
    { texte: 'Une minuscule', test: (mdp) => /[a-zà-ÿ]/.test(mdp) },
    { texte: 'Un chiffre', test: (mdp) => /\d/.test(mdp) },
];

const InscriptionPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ prenom: '', nom: '', ville: '', email: '', motDePasse: '' });
    const [accepte, setAccepte] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);

    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

    // Calculé à chaque rendu : pas besoin d'un état en plus, c'est déduit du mot de passe
    const reglesOk = REGLES.map((regle) => regle.test(formData.motDePasse));
    const motDePasseValide = reglesOk.every(Boolean);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!motDePasseValide) { setErreur('Ton mot de passe ne respecte pas encore toutes les règles.'); return; }
        if (!accepte) { setErreur("Accepte les conditions d'utilisation pour créer ton compte."); return; }

        setErreur(null);
        setEnCours(true);
        try {
            await register(formData);
            // On passe un message à la page de connexion grâce au « state » de la navigation
            navigate('/connexion', { state: { message: 'Ton compte est créé ! Connecte-toi pour commencer.' } });
        } catch (error) {
            setErreur(error.message);
        } finally {
            setEnCours(false);
        }
    };

    return (
        <CadreAuth>
            <h1>Rejoins la bande</h1>
            <p className="texte-doux">Deux minutes pour créer ton compte, et c'est parti pour ta première sortie.</p>

            <form className="formulaire" onSubmit={handleSubmit}>
                <div className="deux-champs">
                    <Champ label="Prénom" name="prenom" autoComplete="given-name" value={formData.prenom} onChange={handleChange} required />
                    <Champ label="Nom" name="nom" autoComplete="family-name" value={formData.nom} onChange={handleChange} required />
                </div>
                <Champ label="Ville" name="ville" autoComplete="address-level2" placeholder="Lyon"
                       aide="Facultatif : pour te proposer des sorties près de chez toi."
                       value={formData.ville} onChange={handleChange} />
                <Champ label="Adresse e-mail" name="email" type="email" autoComplete="email" placeholder="toi@exemple.fr"
                       value={formData.email} onChange={handleChange} required />

                <div className="champ">
                    <ChampMotDePasse label="Mot de passe" name="motDePasse" autoComplete="new-password"
                                     aria-describedby="exigences" value={formData.motDePasse} onChange={handleChange} required />
                    {/* aria-live : le lecteur d'écran annonce quand une règle passe au vert */}
                    <ul className="exigences" id="exigences" aria-live="polite">
                        {REGLES.map((regle, i) => (
                            <li key={regle.texte} data-ok={reglesOk[i]}>
                                <Icone nom={reglesOk[i] ? 'valider' : 'cat-autre'} />
                                {regle.texte}
                                <span className="visuellement-cache">{reglesOk[i] ? ' : respecté' : ' : pas encore'}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <label className="case">
                    <input type="checkbox" checked={accepte} onChange={(e) => setAccepte(e.target.checked)} />
                    <span>J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a>.</span>
                </label>

                {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}

                <Bouton type="submit" bloc disabled={enCours} aria-busy={enCours}>
                    {enCours ? 'Création…' : 'Crée mon compte'}
                </Bouton>
            </form>

            <p className="auth__bas">
                Déjà inscrit·e ? <Link to="/connexion">Connecte-toi</Link>
            </p>
        </CadreAuth>
    );
};

export default InscriptionPage;
