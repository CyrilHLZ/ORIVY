/* ==========================================================================
   ORIVY — Carte (Leaflet)
   --------------------------------------------------------------------------
   - Centrée sur la France entière au départ.
   - Épingles colorées par catégorie, accessibles au clavier.
   - Filtres de catégorie, recherche de ville.
   - « Me localiser » : demande la position AU CLIC seulement, point bleu,
     cercle du rayon choisi, épingles hors rayon estompées.
   - Clic sur une épingle : tiroir de détail (monte du bas sur mobile).
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ORIVY_DONNEES, P = window.ORIVY_PROXIMITE;
  var params = new URLSearchParams(location.search);
  var annonce = document.getElementById("annonce");
  var tiroir = document.getElementById("tiroir");

  /* --- 1. La carte, centrée sur la France --- */
  var FRANCE = [46.6, 2.4];
  var carte = L.map("carte", { zoomControl: true, attributionControl: true })
    .setView(FRANCE, window.innerWidth < 768 ? 5 : 6);
  carte.zoomControl.setPosition("bottomleft");

  /* Fond de carte : tuiles OpenStreetMap standard (gratuites, attribution obligatoire).
     La nuit, pages.css les inverse en CSS pour obtenir une carte sombre :
     aucune clé d'API ni second fournisseur. (Les fonds CARTO demandent désormais une clé.) */
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">les contributeurs OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(carte);

  /* --- 2. Les épingles --- */
  function htmlEpingle(cat) {
    return '<div class="epingle cat-' + cat + '">' +
      '<svg class="goutte" viewBox="0 0 48 60" aria-hidden="true"><path d="M24 58 C24 58 4 36 4 22 A20 20 0 0 1 44 22 C44 36 24 58 24 58 Z"/></svg>' +
      P.icone("cat-" + cat) + "</div>";
  }
  var marqueurs = D.LIEUX.map(function (lieu) {
    var m = L.marker([lieu.lat, lieu.lng], {
      icon: L.divIcon({ className: "", html: htmlEpingle(lieu.cat), iconSize: [48, 60], iconAnchor: [24, 58] }),
      title: lieu.nom + " (" + D.CATEGORIES[lieu.cat].nom + ")",
      alt: lieu.nom,
      keyboard: true,
      riseOnHover: true
    }).addTo(carte);
    m.lieu = lieu;
    m.on("click", function () { ouvrir(lieu, m); });
    return m;
  });

  /* --- 3. Filtres de catégorie (plusieurs choix possibles) --- */
  var filtres = document.getElementById("filtres");
  var actives = {};
  var depart = params.get("cat");
  if (depart) actives[depart] = true;
  var cats = ["parc", "culture", "promenade", "village", "observatoire", "monument", "restaurant", "bar", "cinema", "evenement", "sport"];
  filtres.innerHTML = '<button class="puce" type="button" data-cat="tout" aria-pressed="' + (!depart) + '">Tout</button>' +
    cats.map(function (c) {
      return '<button class="puce cat-' + c + '" type="button" data-cat="' + c + '" aria-pressed="' + (c === depart) + '">' +
        P.icone("cat-" + c) + D.CATEGORIES[c].pluriel + "</button>";
    }).join("");
  filtres.addEventListener("click", function (e) {
    var b = e.target.closest(".puce");
    if (!b) return;
    var c = b.getAttribute("data-cat");
    if (c === "tout") actives = {};
    else if (actives[c]) delete actives[c];
    else actives[c] = true;
    var aucun = Object.keys(actives).length === 0;
    filtres.querySelectorAll(".puce").forEach(function (p) {
      var pc = p.getAttribute("data-cat");
      p.setAttribute("aria-pressed", String(pc === "tout" ? aucun : !!actives[pc]));
    });
    appliquerFiltres();
  });

  /* --- 4. Position et rayon --- */
  var position = null, point = null, cercle = null;
  var panneauRayon = document.getElementById("panneau-rayon");
  function rayonKm() { return +document.querySelector('input[name="rayon"]:checked').value; }

  function appliquerFiltres() {
    var aucun = Object.keys(actives).length === 0, visibles = 0;
    marqueurs.forEach(function (m) {
      var ok = aucun || actives[m.lieu.cat];
      var loin = position && P.distanceKm(position.lat, position.lng, m.lieu.lat, m.lieu.lng) > rayonKm();
      if (ok) { if (!carte.hasLayer(m)) m.addTo(carte); visibles++; } else carte.removeLayer(m);
      if (m.getElement()) m.getElement().style.opacity = loin ? 0.45 : 1;
    });
    annonce.textContent = visibles + " lieu" + (visibles > 1 ? "x" : "") + " affiché" + (visibles > 1 ? "s" : "") + " sur la carte.";
  }

  function placerPosition(pos, estGps) {
    position = pos;
    if (point) carte.removeLayer(point);
    if (cercle) carte.removeLayer(cercle);
    if (estGps) {
      point = L.marker([pos.lat, pos.lng], {
        icon: L.divIcon({ className: "", html: '<div class="position-point"></div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
        keyboard: false, interactive: false, title: "Ta position"
      }).addTo(carte);
    }
    cercle = L.circle([pos.lat, pos.lng], { radius: rayonKm() * 1000, className: "cercle-rayon", interactive: false }).addTo(carte);
    carte.fitBounds(cercle.getBounds(), { padding: [24, 24] });
    panneauRayon.hidden = false;
    appliquerFiltres();
  }

  document.querySelectorAll('input[name="rayon"]').forEach(function (r) {
    r.addEventListener("change", function () {
      if (!position) return;
      cercle.setRadius(rayonKm() * 1000);
      carte.fitBounds(cercle.getBounds(), { padding: [24, 24] });
      appliquerFiltres();
    });
  });

  var bouton = document.getElementById("me-localiser");
  bouton.addEventListener("click", function () {
    bouton.setAttribute("aria-busy", "true");
    bouton.innerHTML = '<span class="tourne" aria-hidden="true"></span>';
    P.demanderPosition()
      .then(function (pos) { placerPosition(pos, true); annonce.textContent = "Te voilà sur la carte."; })
      .catch(function (err) {
        toast(err.message);
        document.getElementById("recherche-ville").focus();
      })
      .then(function () {
        bouton.removeAttribute("aria-busy");
        bouton.innerHTML = P.icone("localiser");
      });
  });

  /* Recherche d'une ville : recentre et sert de point de départ pour les distances */
  document.getElementById("recherche").addEventListener("submit", function (e) {
    e.preventDefault();
    var saisie = document.getElementById("recherche-ville").value;
    var ville = P.trouverVille(saisie);
    if (ville) { placerPosition(ville, false); annonce.textContent = "Carte centrée sur " + ville.nom + "."; }
    else toast("On ne connaît pas encore « " + saisie + " ». Essaie une grande ville voisine.");
  });

  /* --- 5. Tiroir de détail --- */
  var marqueurActif = null;
  function ouvrir(lieu, m) {
    if (marqueurActif && marqueurActif.getElement()) marqueurActif.getElement().querySelector(".epingle").classList.remove("epingle--active");
    marqueurActif = m;
    m.getElement().querySelector(".epingle").classList.add("epingle--active");

    var km = position ? P.distanceKm(position.lat, position.lng, lieu.lat, lieu.lng) : null;
    var sorties = D.SORTIES.filter(function (s) { return s.lieu === lieu.id; });
    tiroir.innerHTML =
      '<span class="tiroir__poignee" aria-hidden="true"></span>' +
      '<div class="detail-lieu cat-' + lieu.cat + '">' +
        '<div class="detail-lieu__tete">' + P.badgeCat(lieu.cat) +
          '<button class="bouton bouton--icone" type="button" id="fermer-tiroir" aria-label="Fermer la fiche du lieu">' + P.icone("fermer") + "</button></div>" +
        '<div class="photo">' + P.icone("cat-" + lieu.cat) + '<img src="' + D.photo(lieu.cat) + '" alt="' + lieu.alt + '" onerror="this.remove()"></div>' +
        '<h2 id="tiroir-titre">' + lieu.nom + "</h2>" +
        '<div class="detail-lieu__infos">' +
          '<span class="badge-distance">' + P.icone("epingle") + lieu.ville + "</span>" +
          '<span class="badge-distance">' + P.icone("etoile") + P.note(lieu.note) + "</span>" +
          (km != null ? '<span class="badge-distance">' + P.icone("autour") + P.formaterDistance(km) + "</span>" : "") +
        "</div>" +
        '<p class="texte-doux" style="margin:0">' + lieu.description + "</p>" +
        (sorties.length ? "<h3 style=\"font-size:var(--taille-l);margin:var(--espace-2) 0 0\">Prochaines sorties ici</h3>" + sorties.map(function (s) { return P.carteSortieHTML(s, km); }).join("") : "") +
        '<div class="ligne-actions">' +
          '<a class="bouton bouton--principal" href="sortie-formulaire.html?lieu=' + lieu.id + '">' + P.icone("plus") + "Crée une sortie ici</a>" +
          '<a class="bouton bouton--secondaire" href="https://www.openstreetmap.org/directions?to=' + lieu.lat + "%2C" + lieu.lng + '" target="_blank" rel="noopener">' + P.icone("autour") + "Itinéraire</a>" +
        "</div>" +
      "</div>";
    tiroir.hidden = false;
    tiroir.focus();
    document.getElementById("fermer-tiroir").addEventListener("click", fermer);
    carte.panTo([lieu.lat, lieu.lng]);
  }
  function fermer() {
    tiroir.hidden = true;
    if (marqueurActif) {
      var el = marqueurActif.getElement();
      el.querySelector(".epingle").classList.remove("epingle--active");
      el.focus();   // on rend le focus à l'épingle d'où l'on venait
    }
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !tiroir.hidden) fermer(); });
  carte.on("click", function () { if (!tiroir.hidden) fermer(); });

  /* --- 6. Message éphémère --- */
  var minuteur;
  function toast(texte) {
    var t = document.querySelector(".toast") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toast" }));
    t.setAttribute("role", "status");
    t.innerHTML = P.icone("info") + "<span>" + texte + "</span>";
    t.hidden = false;
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { t.hidden = true; }, 5000);
  }

  /* Arrivée depuis l'accueil (?cat=parc) ou une carte de lieu (?lieu=12) */
  appliquerFiltres();
  var lieuDemande = D.lieu(+params.get("lieu"));
  if (lieuDemande) {
    carte.setView([lieuDemande.lat, lieuDemande.lng], 12);
    var m = marqueurs.filter(function (x) { return x.lieu === lieuDemande; })[0];
    setTimeout(function () { ouvrir(lieuDemande, m); }, 300);
  }
})();
