const ModifierActivitePage = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await getActivities();
                const foundActivity = data.find((act) => act.id === parseInt(id, 10));
                setActivity(foundActivity);
            } catch (error) {
                console.error('Erreur lors de la récupération de l’activité :', error);
            }
        };
        fetchActivity();
    }, [id]);

    const handleChange = (event) => {
        setActivity({ ...activity, [event.target.name]: event.target.value });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await updateActivity(id, activity);
            window.alert('Activité modifiée avec succès !');
        } catch (error) {
            window.alert('Une erreur est survenue lors de la modification de l’activité.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
            try { 
                await deleteActivity(id);
                window.alert('Activité supprimée avec succès !');
            } catch (error) {
                window.alert('Une erreur est survenue lors de la suppression de l’activité.');
            }
        }
    }

    const updateActivity = async (id, updatedActivity) => {
        try {
            await apiRequest(`/activites/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedActivity),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l’activité :', error);
            throw error;
        }  

    };

    const deleteActivity = async (id) => {
        try {
            await apiRequest(`/activites/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Erreur lors de la suppression de l’activité :', error);
            throw error;
        }
    };

    if (!activity) {
        return <p>Chargement de l’activité...</p>;
    }

    return (
        <main className="page-shell form-page">
            <header className="form-intro"><p className="eyebrow">Modifier l’activité</p><h1>Apportez vos modifications.</h1><p>Vous pouvez modifier les informations de l’activité ou la supprimer.</p></header>
            <section className="form-card"><h2>Modifier l’activité</h2><form className="form-grid" onSubmit={handleSubmit}>
                <div className="form-field full"><label htmlFor="nom">Nom de l'activité</label><input id="nom" name="nom" value={activity.nom} onChange={handleChange} required /></div>
                <div className="form-field"><label htmlFor="categorie">Catégorie</label><select id="categorie" name="categorie" value={activity.categorie} onChange={handleChange} required><option value="">Choisir</option><option value="restaurant
                ">Restaurant</option><option value="bar">Bar</option><option value="cinema">Cinéma</option><option value="monument">Monument</option><option value="village">Village</option></select></div>
                <div className="form-field"><label htmlFor="dateDebut">Date</label><input id="dateDebut" name="dateDebut" type="date" value={activity.dateDebut.split('T')[0]} onChange={handleChange} required /></div>
                <div className="form-field full"><label htmlFor="description">Description</label><textarea id="description" name="description" value={activity.description} onChange={handleChange} required /></div>
                <div className="form-field full"><button className="form-submit" type="submit">Enregistrer les modifications</button></div>
                <div className="form-field full"><button className="form-delete" type="button" onClick={handleDelete}>Supprimer l’activité</button></div>
            </form></section>
        </main>
    );
}


export default ModifierActivitePage;