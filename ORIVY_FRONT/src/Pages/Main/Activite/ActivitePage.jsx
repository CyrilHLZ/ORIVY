import { useEffect, useState } from 'react';
import { getMapData } from '../../../Services/api.js';
import '../../Styles/Main/Pages.css';

const activityCategories = [
    { id: 'all', label: 'Toutes les idées' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'bar', label: 'Bars' },
    { id: 'cinema', label: 'Cinémas' },
    { id: 'monument', label: 'Monuments' },
    { id: 'village', label: 'Meilleurs villages' },
    { id: 'promenade', label: 'Promenades' },
    { id: 'parc', label: 'Parcs et jardins' },
    { id: 'sport', label: 'Activités sportives' },
    { id: 'evenement', label: 'Événements' },
    { id: 'culture', label: 'Culture' },
    { id: 'observatoire', label: 'Observatoires' },
    { id: 'autre', label: 'Autres' },
].sort((first, second) => first.label.localeCompare(second.label, 'fr'));

const categoryImages = {
    autre: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
    culture: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=80',
    monument: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80',
    observatoire: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    parc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    promenade: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
    restaurant: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    village: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
};

const activitePage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getMapData()
            .then(({ pointsInteret, activites }) => setActivities([
                ...pointsInteret.map((point) => ({
                    id: `point-${point.id}`,
                    nom: point.nom,
                    description: point.description,
                    categorie: point.type,
                    lieu: point.adresse,
                    latitude: point.latitude,
                    longitude: point.longitude,
                    imageUrl: point.imageUrl || categoryImages[point.type] || categoryImages.autre,
                })),
                ...activites.map((activity) => ({
                    ...activity,
                    categorie: activity.categorie,
                    imageUrl: activity.imageUrl || categoryImages[activity.categorie] || categoryImages.autre,
                })),
            ]))
            .catch(() => setError('Les activités sont momentanément indisponibles.'))
            .finally(() => setLoading(false));
    }, []);

    const visibleActivities = selectedCategory === 'all' ? activities : activities.filter(({ categorie }) => categorie === selectedCategory);

    return (
        <main className="page-shell activities-page">
            <header className="page-heading activities-heading">
                <p className="eyebrow">Le carnet ORIVY</p>
                <h1>Des idées pour sortir</h1>
                <p className="page-intro">Trouvez une nouvelle adresse, une sortie ou un lieu à explorer.</p>
            </header>
            <section className="category-browser" aria-labelledby="category-browser-title">
                <div className="category-browser-heading">
                    <p className="eyebrow">Explorer par envie</p>
                    <h2 id="category-browser-title">Que voulez-vous découvrir ?</h2>
                    <p>Choisissez une catégorie pour affiner votre sélection.</p>
                </div>
                <nav className="category-grid" aria-label="Catégories d’activités">
                    {activityCategories.map((category) => (
                        <button className={`category-card ${selectedCategory === category.id ? 'is-active' : ''}`} key={category.id} onClick={() => setSelectedCategory(category.id)} type="button">
                            <span>{category.label}</span>
                        </button>
                    ))}
                </nav>
            </section>
            <section className="activity-section" aria-live="polite">
                <div className="section-heading">
                    <div><p className="eyebrow">Sélection locale</p><h2>À découvrir maintenant</h2></div>
                    <span className="result-count">{visibleActivities.length} activités</span>
                </div>
                <div className="activity-category-rows">
                    {loading && <p>Chargement des activités...</p>}
                    {error && <p role="alert">{error}</p>}
                    {!loading && !error && activityCategories.filter(({ id }) => id !== 'all').map((category) => {
                        const categoryActivities = visibleActivities.filter(({ categorie }) => categorie === category.id);
                        if (selectedCategory !== 'all' && selectedCategory !== category.id) return null;
                        return <section className="activity-category-row" key={category.id}>
                            <div className="category-row-heading"><h3>{category.label}</h3><span>{categoryActivities.length} lieux</span></div>
                            <div className="activity-grid">
                                {categoryActivities.map((activity) => (
                                    <article className="activity-card" key={activity.id}>
                                        <div className={`activity-card-art art-${activity.categorie}`}><img src={activity.imageUrl} alt={activity.nom} loading="lazy" /><span>{activity.categorie.toUpperCase()}</span></div>
                                        <div className="activity-card-content">
                                            <span className="card-meta">{activity.lieu || activity.categorie}</span>
                                            <h3>{activity.nom}</h3>
                                            <p>{activity.description || 'Une activité à découvrir dans votre région.'}</p>
                                            {activity.latitude && activity.longitude && <div className="card-map-links">
                                                <a className="card-link" href={`https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`} rel="noreferrer" target="_blank">Google Maps <span aria-hidden="true">↗</span></a>
                                                <a className="card-link" href={`https://waze.com/ul?ll=${activity.latitude}%2C${activity.longitude}&navigate=yes`} rel="noreferrer" target="_blank">Waze <span aria-hidden="true">↗</span></a>
                                            </div>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>;
                    })}
                    {!loading && !error && visibleActivities.length === 0 && <p>Aucune activité ne correspond à ce filtre.</p>}
                </div>
            </section>
        </main>
    );
};

export default activitePage;
