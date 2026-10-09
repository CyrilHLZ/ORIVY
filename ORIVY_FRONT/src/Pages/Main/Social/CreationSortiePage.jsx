const creationSortiePage = () => {
    const [sortie, setSortie] = useState({ nom: '', description: '', dateDebut: '', categorie: '' });
    const handleChange = (event) => setSortie({ ...sortie, [event.target.name]: event.target.value });  
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createSortie({ ...sortie, dateDebut: `${sortie.dateDebut}T12:00:00` });
            setSortie({ nom: '', description: '', dateDebut: '', categorie: '' });
            window.alert('Sortie ajoutée avec succès !');
        } catch (error) {
            window.alert('Une erreur est survenue lors de l’ajout de la sortie.');
        }
    };

    const createSortie = async (sortieData) => {
        try {
            const response = await fetch('/api/sorties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sortieData),
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la création de la sortie');
            }
        } catch (error) {
            console.error('Erreur lors de la création de la sortie :', error);
            throw error;
        }
    };

    const inscriptionSortie = async (sortieId) => {
        try {
            const response = await fetch(`/api/sorties/${sortieId}/inscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Erreur lors de l’inscription à la sortie');
            }
        } catch (error) {
            console.error('Erreur lors de l’inscription à la sortie :', error);
            throw error;
        }
    };

    const seDesinscrireSortie = async (sortieId) => {
        try {
            const response = await fetch(`/api/sorties/${sortieId}/desinscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la désinscription de la sortie');
            }
        } catch (error) {
            console.error('Erreur lors de la désinscription de la sortie :', error);
            throw error;
        }
    };

    const rechercheSorties = async (query) => {
        try {
            const response = await fetch(`/api/sorties/recherche?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la recherche de sorties');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la recherche de sorties :', error);
            throw error;
        }
    };

    const getSortieDetails = async (sortieId) => {
        try {
            const response = await fetch(`/api/sorties/${sortieId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des détails de la sortie');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de la sortie :', error);
            throw error;
        }
    };

    const selectionUneActivite = async (activiteId) => {
        try {
            const response = await fetch(`/api/activites/${activiteId}/selection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la sélection de l’activité');
            }
        } catch (error) {
            console.error('Erreur lors de la sélection de l’activité :', error);
            throw error;
        }
    };

    const deselectionUneActivite = async (activiteId) => {
        try {
            const response = await fetch(`/api/activites/${activiteId}/deselection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }); 
              if (!response.ok) {
                throw new Error('Erreur lors de la désélection de l’activité');
            }
        }
        catch (error) {
            console.error('Erreur lors de la désélection de l’activité :', error);
            throw error;
        }
    };

    const modifierSortie = async (sortieId, updatedSortie) => {
        try {
            const response = await fetch(`/api/sorties/${sortieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSortie),
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la modification de la sortie');
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la sortie :', error);
            throw error;
        }
    };

    const supprimerSortie = async (sortieId) => {
        try {
            const response = await fetch(`/api/sorties/${sortieId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }); 
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la sortie');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la sortie :', error);
            throw error;
        }
    };

    const dateFormat = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    const heureFormat = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('fr-FR', options);
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleString('fr-FR', options);
    }

    return (
        <main className="page-shell form-page">
            <header className="form-intro"><p className="eyebrow">Faire vivre le carnet</p><h1>Partagez votre trouvaille.</h1><p>Une adresse, un événement ou un lieu qui mérite d'être connu ? Ajoutez-le à la collection ORIVY.</p></header>
            <section className="form-card"><h2>Nouvelle sortie</h2><form className="form-grid" onSubmit={handleSubmit}>
                <div className="form-field full"><label htmlFor="nom">Nom de la sortie</label><input id="nom" name="nom" value={sortie.nom} onChange={handleChange} required /></div>
                <div className="form-field"><label htmlFor="categorie">Catégorie</label><select id="categorie" name="categorie" value={sortie.categorie} onChange={handleChange} required><option value="">Choisir</option><option value="restaurant">Restaurant</option><option value="bar">Bar</option><option value="cinema">Cinéma</option><option value="monument">Monument</option><option value="village">Village</option></select></div>
                <div className="form-field"><label htmlFor="dateDebut">Date</label><input id="dateDebut" name="dateDebut" type="date" value={sortie.dateDebut} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="description">Description</label><textarea id="description" name="description" value={sortie.description} onChange={handleChange} required /></div>
                <div className="form-field full"><button className="form-submit" type="submit">Ajouter au carnet</button></div>
            </form></section>
        </main>
    );
}