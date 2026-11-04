import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { categorie } from '../../../Constants/categories.js';
import Photo from '../../../Composants/Photo.jsx';
import Bouton from '../../../Composants/Bouton.jsx';
import { BadgeCategorie } from '../../../Composants/Badges.jsx';

/*
 * Panneau qui se déroule sous une ligne du tableau Admin :
 * l'image du lieu à gauche, son emplacement sur une petite carte au milieu, sa catégorie à droite.
 * La petite carte est figée (pas de glisser ni de zoom) : on la regarde, on ne s'y promène pas.
 */
const DetailPoint = ({ point, onModifier }) => {
    const cat = categorie(point.type);
    const aDesCoordonnees = point.latitude != null && point.longitude != null;

    return (
        <div className={`detail-point cat-${cat.cle}`}>
            <div className="detail-point__image">
                <Photo src={point.imageUrl} alt={point.imageUrl ? `Photo de ${point.nom}` : ''} cle={cat.cle} attente />
            </div>

            <div className="detail-point__carte">
                {aDesCoordonnees ? (
                    <MapContainer center={[point.latitude, point.longitude]} zoom={13} zoomControl={false} dragging={false}
                                  scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
                        {/* Même fond Google Maps que la carte principale */}
                        <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                   subdomains={['mt0', 'mt1', 'mt2', 'mt3']} attribution="&copy; Google Maps" />
                        <CircleMarker center={[point.latitude, point.longitude]} radius={9}
                                      pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: '#A34E2C', fillOpacity: 1 }} />
                    </MapContainer>
                ) : (
                    <p className="texte-doux">Pas de coordonnées.</p>
                )}
                {aDesCoordonnees && (
                    <p className="texte-doux detail-point__coord">{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</p>
                )}
            </div>

            <div className="detail-point__infos">
                <BadgeCategorie cle={point.type} />
                <h3>{point.nom}</h3>
                {point.adresse && <p className="texte-doux">{point.adresse}</p>}
                {point.description && <p>{point.description}</p>}
                <Bouton variante="secondaire" icone="modifier" onClick={onModifier}>Modifier</Bouton>
            </div>
        </div>
    );
};

export default DetailPoint;
