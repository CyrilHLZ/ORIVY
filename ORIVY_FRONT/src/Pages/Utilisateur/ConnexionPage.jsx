import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import CadreAuth from './CadreAuth.jsx';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { Champ, ChampMotDePasse } from '../../Composants/Formulaire.jsx';

const EMAIL_VALIDE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ConnexionPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();           // message éventuel envoyé par l'inscription
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', motDePasse: '' });
    const [erreurEmail, setErreurEmail] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const champEmail = useRef(null);

    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErreur(null);

        // Vérification côté front : on évite un aller-retour au back pour une faute de frappe
        if (!EMAIL_VALIDE.test(formData.email)) {
            setErreurEmail('Vérifie ton adresse e-mail (ex. : toi@exemple.fr).');
            champEmail.current.focus();
            return;
        }
        setErreurEmail(null);

        setEnCours(true);
        try {
            await login(formData);
            navigate('/');   // l'accueil est « / » (avant : « /accueil », qui n'existait pas)
        } catch (error) {
            setErreur(error.message || 'E-mail ou mot de passe incorrect.');
        } finally {
            setEnCours(false);   // finally : exécuté que ça réussisse ou non
        }
    };

    return (
        <CadreAuth>
            <h1>Content de te revoir !</h1>
            <p className="texte-doux">Connecte-toi pour retrouver tes sorties et ta bande.</p>

            {state?.message && (
                <p className="alerte-position" role="status"><Icone nom="valider" />{state.message}</p>
            )}

            <form className="formulaire" onSubmit={handleSubmit} noValidate>
                <Champ
                    ref={champEmail}
                    label="Adresse e-mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="toi@exemple.fr"
                    value={formData.email}
                    onChange={handleChange}
                    erreur={erreurEmail}
                    required
                />
                <ChampMotDePasse
                    label="Mot de passe"
                    name="motDePasse"
                    autoComplete="current-password"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    required
                />

                {/* role="alert" : le message est lu dès qu'il apparaît */}
                {erreur && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreur}</p>}

                <Bouton type="submit" bloc disabled={enCours} aria-busy={enCours}>
                    {enCours ? 'Connexion…' : 'Connecte-toi'}
                </Bouton>
            </form>

            <p className="auth__bas" style={{ marginTop: 'var(--espace-5)' }}>
                Pas encore de compte ? <Link to="/inscription">Inscris-toi, c'est gratuit</Link>
            </p>
        </CadreAuth>
    );
};

export default ConnexionPage;
