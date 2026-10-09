import { useEffect, useState } from 'react';
import { createPoint, deletePoint, getMapData, updatePoint } from '../../Services/api.js';
import '../../Styles/Main/Pages.css';
import '../../Styles/Main/Admin.css';

const emptyPoint = { nom: '', type: 'autre', description: '', adresse: '', latitude: '', longitude: '', imageUrl: '', couleur: '#6B7280' };
const categories = ['autre', 'culture', 'monument', 'observatoire', 'parc', 'promenade', 'restaurant', 'village'];

const AdminPage = () => {
    const [points, setPoints] = useState([]);
    const [form, setForm] = useState(emptyPoint);
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    const loadPoints = () => getMapData().then(({ pointsInteret }) => setPoints(pointsInteret));
    useEffect(() => { loadPoints().catch(() => setStatus('Impossible de charger les repères.')); }, []);

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('');
        const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
        try {
            if (editingId) await updatePoint(editingId, payload);
            else await createPoint(payload);
            setForm(emptyPoint);
            setEditingId(null);
            setStatus(editingId ? 'Repère modifié.' : 'Repère ajouté.');
            await loadPoints();
        } catch { setStatus('Vérifie les champs obligatoires et les coordonnées.'); }
    };
    const editPoint = (point) => { setEditingId(point.id); setForm({ ...point, latitude: String(point.latitude), longitude: String(point.longitude), imageUrl: point.imageUrl || '', couleur: point.couleur || '#6B7280' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const removePoint = async (id) => { if (!window.confirm('Supprimer ce repère ?')) return; await deletePoint(id); setPoints(points.filter((point) => point.id !== id)); setStatus('Repère supprimé.'); };
    const visiblePoints = points.filter(({ nom, type }) => `${nom} ${type}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    return <main className="page-shell admin-page">
        <header className="page-heading"><p className="eyebrow">Espace gestion</p><h1>Gérer la carte.</h1><p className="page-intro">Ajoutez, modifiez ou retirez les repères visibles sur la carte ORIVY.</p></header>
        <section className="admin-layout">
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-heading"><h2>{editingId ? 'Modifier le repère' : 'Nouveau repère'}</h2>{editingId && <button className="admin-cancel" onClick={() => { setEditingId(null); setForm(emptyPoint); }} type="button">Annuler</button>}</div>
                <label>Nom<input name="nom" value={form.nom} onChange={handleChange} required /></label>
                <label>Catégorie<select name="type" value={form.type} onChange={handleChange}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                <label>Description<textarea name="description" value={form.description} onChange={handleChange} /></label>
                <label>Lieu / adresse<input name="adresse" value={form.adresse} onChange={handleChange} /></label>
                <div className="admin-coordinates"><label>Latitude<input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required /></label><label>Longitude<input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required /></label></div>
                <label>URL image publique<input name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} placeholder="https://..." /></label>
                <label className="admin-color">Couleur du ping<input name="couleur" type="color" value={form.couleur} onChange={handleChange} /></label>
                <button className="form-submit" type="submit">{editingId ? 'Enregistrer' : 'Ajouter le repère'}</button>
                {status && <p className="admin-status" role="status">{status}</p>}
            </form>
            <section className="admin-list"><div className="admin-list-heading"><div><p className="eyebrow">{points.length} repères</p><h2>Les lieux de la carte</h2></div><input aria-label="Rechercher un repère" placeholder="Rechercher" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="admin-items">{visiblePoints.map((point) => <article className="admin-item" key={point.id}><span className="admin-swatch" style={{ background: point.couleur || '#6B7280' }} /><div><strong>{point.nom}</strong><span>{point.type} · {point.latitude}, {point.longitude}</span></div><div className="admin-actions"><button onClick={() => editPoint(point)} type="button">Modifier</button><button onClick={() => removePoint(point.id)} type="button">Supprimer</button></div></article>)}</div></section>
        </section>
    </main>;
};

export default AdminPage;
