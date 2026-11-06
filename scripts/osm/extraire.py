"""Écrit une ligne JSON par lieu, sous la même forme qu'une réponse Overpass « out center tags » :
   nœud → lat/lon ; chemin ou relation → center (milieu du rectangle qui l'entoure).

   python3 extraire.py <lieux nommés .pbf> <lieux + géométrie .pbf> <sortie .jsonl>
"""
import json
import sys

import osmium

lieux_pbf, geometries_pbf, sortie = sys.argv[1:4]


class Lieux(osmium.SimpleHandler):
    """1er passage : quels lieux garder, et de quels points / chemins dépendent les relations."""

    def __init__(self):
        super().__init__()
        self.tags = {}            # ("n"|"w"|"r", id) → balises
        self.membres = {}         # id de relation → [("n"|"w", id)]
        self.noeuds = set()       # nœuds dont il faut la position
        self.chemins = set()      # chemins dont il faut le rectangle

    def node(self, n):
        self.tags[("n", n.id)] = dict((t.k, t.v) for t in n.tags)
        self.noeuds.add(n.id)

    def way(self, w):
        self.tags[("w", w.id)] = dict((t.k, t.v) for t in w.tags)
        self.chemins.add(w.id)

    def relation(self, r):
        self.tags[("r", r.id)] = dict((t.k, t.v) for t in r.tags)
        membres = [(m.type, m.ref) for m in r.members if m.type in ("n", "w")]
        self.membres[r.id] = membres
        for genre, ref in membres:
            (self.noeuds if genre == "n" else self.chemins).add(ref)


class Geometries(osmium.SimpleHandler):
    """2e passage (avec la position des points) : rectangle de chaque nœud / chemin utile."""

    def __init__(self, lieux):
        super().__init__()
        self.lieux = lieux
        self.cadres = {}          # ("n"|"w", id) → [sud, ouest, nord, est]

    def node(self, n):
        if n.id in self.lieux.noeuds and n.location.valid():
            self.cadres[("n", n.id)] = [n.location.lat, n.location.lon, n.location.lat, n.location.lon]

    def way(self, w):
        if w.id not in self.lieux.chemins:
            return
        cadre = None
        for point in w.nodes:
            if not point.location.valid():
                continue
            lat, lon = point.location.lat, point.location.lon
            cadre = [lat, lon, lat, lon] if cadre is None else unir(cadre, [lat, lon, lat, lon])
        if cadre:
            self.cadres[("w", w.id)] = cadre


def unir(a, b):
    return [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]


lieux = Lieux()
lieux.apply_file(lieux_pbf)
geometries = Geometries(lieux)
geometries.apply_file(geometries_pbf, locations=True, idx="flex_mem")

GENRES = {"n": "node", "w": "way", "r": "relation"}
ecrits = 0
with open(sortie, "w", encoding="utf-8") as fichier:
    for (genre, ident), tags in lieux.tags.items():
        if genre == "r":
            cadre = None
            for membre in lieux.membres.get(ident, []):
                morceau = geometries.cadres.get(membre)
                if morceau:
                    cadre = morceau if cadre is None else unir(cadre, morceau)
        else:
            cadre = geometries.cadres.get((genre, ident))
        if not cadre:
            continue
        element = {"type": GENRES[genre], "id": ident, "tags": tags}
        position = {"lat": round((cadre[0] + cadre[2]) / 2, 7), "lon": round((cadre[1] + cadre[3]) / 2, 7)}
        if genre == "n":
            element.update(position)
        else:
            element["center"] = position
        fichier.write(json.dumps(element, ensure_ascii=False) + "\n")
        ecrits += 1

print(f"{ecrits} lieux écrits")
