import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../../Services/api.js';
import '../../Styles/Utilisateur/Pages.css';

const InscriptionPage = () => {
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', motDePasse: '' });
    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await register(formData);
            window.alert('Inscription réussie !');
        } catch (error) {
            window.alert('Une erreur est survenue lors de l’inscription.');
        }
    };

    return (
        <main className="page-shell form-page">
            <header className="form-intro"><p className="eyebrow">Bienvenue dans la communauté</p><h1>Gardez les bons endroits.</h1><p>Créez votre carnet, partagez vos découvertes et composez votre propre carte des envies.</p></header>
            <section className="form-card"><h2>Inscription</h2><form className="form-grid" onSubmit={handleSubmit}>
                <div className="form-field"><label htmlFor="nom">Nom</label><input id="nom" name="nom" value={formData.nom} onChange={handleChange} required /></div>
                <div className="form-field"><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="email">Adresse email</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="motDePasse">Mot de passe</label><input id="motDePasse" name="motDePasse" type="password" value={formData.motDePasse} onChange={handleChange} required /></div>
                <div className="form-field full"><button className="form-submit" type="submit">Rejoindre ORIVY</button></div>
            </form><p className="form-footnote">Déjà membre ? <Link to="/connexion">Se connecter</Link></p></section>
        </main>
    );
};

export default InscriptionPage;
