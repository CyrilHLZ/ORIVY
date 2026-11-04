-- V8 : les châteaux visitables viennent d'OpenStreetMap (source citée, licence ODbL « © OpenStreetMap »),
-- pas de la carte curée. On retire les châteaux curés (osm_id NULL) pour éviter les doublons ;
-- OpenStreetMapService les réimporte depuis OSM (déclencher via POST /admin/import-osm, sinon le 1er du mois).
DELETE FROM point_interet WHERE type = 'chateau' AND osm_id IS NULL;
