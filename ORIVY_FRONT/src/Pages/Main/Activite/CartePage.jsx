import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapData, updatePoint } from '../../../Services/api.js';
import '../../Styles/Main/Pages.css';

const mapCategories = [
    { id: 'all', label: 'Tout afficher' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'bar', label: 'Bars' },
    { id: 'cinema', label: 'Cinémas' },
    { id: 'monument', label: 'Monuments' },
    { id: 'village', label: 'Meilleurs villages' },
    { id: 'parc', label: 'Parcs et jardins' },
    { id: 'promenade', label: 'Promenades' },
    { id: 'sport', label: 'Sports' },
    { id: 'evenement', label: 'Événements' },
    { id: 'culture', label: 'Culture' },
    { id: 'observatoire', label: 'Observatoires' },
    { id: 'autre', label: 'Autres' },
].sort((first, second) => first.label.localeCompare(second.label, 'fr'));

const InfoRow = ({ label, value }) => value ? <p className="map-popup-row"><strong>{label}</strong><span>{value}</span></p> : null;

const MarkerDetails = ({ marker, onEdit }) => (
    <div className="map-popup-details">
        {marker.imageUrl && <img className="map-popup-image" src={marker.imageUrl} alt={marker.nom} />}
        <h3>{marker.nom}</h3>
        <InfoRow label="Type" value={marker.type || marker.categorie} />
        <InfoRow label="Description" value={marker.description} />
        <InfoRow label="Adresse" value={marker.adresse || marker.lieu} />
        <InfoRow label="Coordonnées" value={`${marker.latitude}, ${marker.longitude}`} />
        <InfoRow label="Date" value={marker.dateDebut ? new Date(marker.dateDebut).toLocaleString('fr-FR') : null} />
        <InfoRow label="Source" value={marker.imageSource || marker.source} />
        <InfoRow label="Licence" value={marker.imageLicence} />
        {marker.source === 'Point d’intérêt' && <button className="map-popup-edit" onClick={() => onEdit(marker)} type="button">Modifier ce point</button>}
    </div>
);

const cartePage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [mapData, setMapData] = useState({ pointsInteret: [], promenades: [], activites: [] });
    const [editingPoint, setEditingPoint] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const activeLabel = mapCategories.find(({ id }) => id === selectedCategory)?.label;

    const loadMapData = () => getMapData().then(setMapData);
    useEffect(() => { loadMapData().catch(() => {}); }, []);

    const startEditing = (point) => {
        setEditingPoint(point);
        setEditForm({
            nom: point.nom || '',
            adresse: point.adresse || '',
            imageUrl: point.imageUrl || '',
        });
        setEditStatus('');
    };

    const cancelEditing = () => {
        setEditingPoint(null);
        setEditForm(null);
        setEditStatus('');
    };

    const handleEditChange = (event) => {
        setEditForm({ ...editForm, [event.target.name]: event.target.value });
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setEditStatus('');
        try {
            await updatePoint(editingPoint.id, { ...editingPoint, ...editForm });
            await loadMapData();
            cancelEditing();
        } catch {
            setEditStatus('Impossible d’enregistrer les modifications.');
        }
    };

    const points = mapData.pointsInteret
        .filter(({ type }) => selectedCategory === 'all' || type === selectedCategory)
        .map((point) => ({ ...point, category: point.type, source: 'Point d’intérêt' }));
    const activities = mapData.activites
        .filter(({ categorie }) => selectedCategory === 'all' || categorie === selectedCategory)
        .filter(({ latitude, longitude }) => latitude && longitude)
        .map((activity) => ({ ...activity, category: activity.categorie, nom: activity.nom, source: 'Activité' }));
    const markers = [...points, ...activities];
    const markerColor = (category) => category === 'restaurant' || category === 'parc'
        ? '#f4c95d'
        : category === 'bar' || category === 'promenade' ? '#3c5960' : '#ef6f61';

    return (
        <main className="page-shell map-page">
            <header className="page-heading">
                <p className="eyebrow">Explorer la région</p>
                <h1>La carte des bonnes adresses</h1>
                <p className="page-intro">Retrouvez les lieux de loisirs, les parcs et les musées sélectionnés pour vous.</p>
            </header>
            <section className="filter-bar" aria-label="Filtrer la carte">
                <span className="filter-label">Afficher</span>
                <div className="filter-options" role="group" aria-label="Catégorie de lieux">
                    {mapCategories.map((category) => (
                        <button className={`filter-button ${selectedCategory === category.id ? 'is-active' : ''}`} key={category.id} onClick={() => setSelectedCategory(category.id)} type="button">
                            {category.label}
                        </button>
                    ))}
                </div>
            </section>
            <section className="map-layout">
                <div className="map-frame-wrap" aria-label="Carte des lieux ORIVY">
                    <MapContainer className="map-frame" center={[45.194, 5.74]} zoom={12} scrollWheelZoom>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {markers.map((marker) => (
                            <CircleMarker
                                center={[marker.latitude, marker.longitude]}
                                color={marker.couleur || markerColor(marker.category)}
                                fillColor={marker.couleur || markerColor(marker.category)}
                                fillOpacity={0.9}
                                key={`${marker.source}-${marker.id}`}
                                radius={9}
                                weight={3}
                            >
                                <Popup minWidth={230} maxWidth={300}>
                                    <MarkerDetails marker={marker} onEdit={startEditing} />
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                    {markers.length === 0 && <p className="map-empty">Aucun lieu dans cette catégorie.</p>}
                </div>
                <aside className="map-info-panel">
                    <span className="panel-kicker">Filtre sélectionné</span>
                    <h2>{activeLabel}</h2>
                    <p>{markers.length} lieu{markers.length > 1 ? 'x' : ''} affiché{markers.length > 1 ? 's' : ''} sur la carte.</p>
                    <ul className="map-results">
                        {markers.slice(0, 5).map((marker) => <li key={`${marker.source}-result-${marker.id}`}><div><strong>{marker.nom}</strong><span>{marker.source}</span></div>{marker.source === 'Point d’intérêt' && <button className="map-edit-button" onClick={() => startEditing(marker)} type="button">Modifier</button>}</li>)}
                    </ul>
                    <p className="map-total">{mapData.promenades.length} promenades disponibles</p>
                </aside>
            </section>
            {editingPoint && editForm && <section className="map-edit-panel" aria-labelledby="map-edit-title">
                <div className="map-edit-heading"><div><span className="panel-kicker">Modification du point</span><h2 id="map-edit-title">{editingPoint.nom}</h2></div><button className="map-edit-cancel" onClick={cancelEditing} type="button">Annuler</button></div>
                <form className="map-edit-form" onSubmit={handleEditSubmit}>
                    <label>Nom<input name="nom" value={editForm.nom} onChange={handleEditChange} required /></label>
                    <label>Adresse<input name="adresse" value={editForm.adresse} onChange={handleEditChange} /></label>
                    <label>URL de l’image<input name="imageUrl" type="url" value={editForm.imageUrl} onChange={handleEditChange} placeholder="https://..." /></label>
                    <div className="map-edit-actions"><button className="map-edit-save" type="submit">Enregistrer</button>{editStatus && <p role="status">{editStatus}</p>}</div>
                </form>
                {editForm.imageUrl && <img className="map-edit-preview" src={editForm.imageUrl} alt="Aperçu du point" />}
            </section>}
        </main>
    );
};

export default cartePage;