#!/usr/bin/env bash
# =====================================================================
# Prépare osm/lieux-osm.jsonl à partir des extraits Geofabrik (© OpenStreetMap, ODbL) :
# France métropolitaine + Corse, et les 5 départements d'outre-mer (fichiers séparés
# chez Geofabrik). Le back importe ensuite les lieux depuis ce fichier, SANS Overpass.
#
# Depuis la racine du projet (Docker suffit, rien à installer) :
#   docker run --rm -v "$PWD/osm:/osm" -v "$PWD/scripts/osm:/scripts:ro" debian:bookworm-slim bash /scripts/preparer.sh
# Puis : bouton d'import de l'admin (ou redémarrage du back si une catégorie est vide).
#
# Ajouter -e TELECHARGER=1 pour récupérer d'abord la dernière version des extraits (~5 Go).
# =====================================================================
set -euo pipefail
cd /osm

apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq osmium-tool python3-pyosmium curl ca-certificates > /dev/null

GEOFABRIK=https://download.geofabrik.de/europe
EXTRAITS="france guadeloupe martinique guyane reunion mayotte"

telecharger() {   # $1 = nom de l'extrait, $2 = adresse
    if [ "${TELECHARGER:-0}" = "1" ] || [ ! -f "$1-latest.osm.pbf" ]; then
        echo "Téléchargement de $1…"
        curl -L -sS -o "$1-latest.osm.pbf.part" "$2"
        mv "$1-latest.osm.pbf.part" "$1-latest.osm.pbf"
    fi
}

: > lieux-osm.jsonl.part
for extrait in $EXTRAITS; do
    if [ "$extrait" = "france" ]; then telecharger france "$GEOFABRIK/france-latest.osm.pbf"
    else telecharger "$extrait" "$GEOFABRIK/france/$extrait-latest.osm.pbf"; fi
    source="$extrait-latest.osm.pbf"

    echo "[$extrait] 1/4 Tri par catégorie…"
    osmium tags-filter --overwrite -R -e /scripts/filtres.txt "$source" -o 1-lieux.osm.pbf
    echo "[$extrait] 2/4 Seulement les lieux qui ont un nom…"
    osmium tags-filter --overwrite -R 1-lieux.osm.pbf nwr/name -o 2-nommes.osm.pbf
    echo "[$extrait] 3/4 Géométrie (points des chemins et des zones)…"
    # Code 1 = quelques objets introuvables (relations qui débordent de l'extrait) : normal
    # (jusqu'à 5 Go de mémoire pour la France : si Docker en manque, osmium s'arrête sans fichier)
    rm -f 3-geometries.osm.pbf
    osmium getid --overwrite -r -I 2-nommes.osm.pbf "$source" -o 3-geometries.osm.pbf || true
    if [ ! -s 3-geometries.osm.pbf ]; then
        echo "Erreur : osmium getid n'a rien produit pour $extrait (mémoire Docker insuffisante ?)" >&2
        exit 1
    fi
    echo "[$extrait] 4/4 Centre de chaque lieu…"
    python3 /scripts/extraire.py 2-nommes.osm.pbf 3-geometries.osm.pbf "$extrait.jsonl"
    cat "$extrait.jsonl" >> lieux-osm.jsonl.part
    rm -f "$extrait.jsonl" 1-lieux.osm.pbf 2-nommes.osm.pbf 3-geometries.osm.pbf
done

mv lieux-osm.jsonl.part lieux-osm.jsonl
echo "Terminé : $(wc -l < lieux-osm.jsonl) lieux dans osm/lieux-osm.jsonl"
