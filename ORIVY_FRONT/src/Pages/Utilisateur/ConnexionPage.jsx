import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import '../../Styles/Utilisateur/Pages.css';

const ConnexionPage = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', motDePasse: '' });
    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(formData);
            window.alert('Connexion réussie !');
        } catch (error) {
            window.alert('Une erreur est survenue lors de la connexion.');
        }
    };

    return (
        <main className="page-shell form-page">
            <header className="form-intro"><p className="eyebrow">Votre carnet personnel</p><h1>Ravi de vous revoir.</h1><p>Retrouvez vos lieux favoris et les idées que vous avez envie de garder près de vous.</p></header>
            <section className="form-card"><h2>Connexion</h2><form className="form-grid" onSubmit={handleSubmit}>
                <div className="form-field full"><label htmlFor="email">Adresse email</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="motDePasse">Mot de passe</label><input id="motDePasse" name="motDePasse" type="password" value={formData.motDePasse} onChange={handleChange} required /></div>
                <div className="form-field full"><button className="form-submit" type="submit">Se connecter</button></div>
            </form><p className="form-footnote">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p></section>
        </main>
    );
};

export default ConnexionPage;
