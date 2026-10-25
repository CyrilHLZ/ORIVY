import { useState } from 'react';
import { createActivity } from '../../../Services/Activite/ActiviteService.js';

const CreateActivitePage = () => {
    const [formData, setFormData] = useState({ nom: '', description: '', dateDebut: '', categorie: '' });
    const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createActivity({ ...formData, dateDebut: `${formData.dateDebut}T12:00:00` });
            setFormData({ nom: '', description: '', dateDebut: '', categorie: '' });
            window.alert('Activité ajoutée avec succès !');
        } catch (error) {
            window.alert('Une erreur est survenue lors de l’ajout de l’activité.');
        }
    };

    return (
        <main className="page-shell form-page">
            <header className="form-intro"><p className="eyebrow">Faire vivre le carnet</p><h1>Partagez votre trouvaille.</h1><p>Une adresse, un événement ou un lieu qui mérite d'être connu ? Ajoutez-le à la collection ORIVY.</p></header>
            <section className="form-card"><h2>Nouvelle activité</h2><form className="form-grid" onSubmit={handleSubmit}>
                <div className="form-field full"><label htmlFor="nom">Nom de l'activité</label><input id="nom" name="nom" value={formData.nom} onChange={handleChange} required /></div>
                <div className="form-field"><label htmlFor="categorie">Catégorie</label><select id="categorie" name="categorie" value={formData.categorie} onChange={handleChange} required><option value="">Choisir</option><option value="restaurant">Restaurant</option><option value="bar">Bar</option><option value="cinema">Cinéma</option><option value="monument">Monument</option><option value="village">Village</option></select></div>
                <div className="form-field"><label htmlFor="dateDebut">Date</label><input id="dateDebut" name="dateDebut" type="date" value={formData.dateDebut} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} required /></div>
                <div className="form-field full"><button className="form-submit" type="submit">Ajouter au carnet</button></div>
            </form></section>
        </main>
    );
};

export default CreateActivitePage;
