/* ==========================================================================
   ORIVY — Proximité et rendu des cartes (partagé par Carte et Activités)
   --------------------------------------------------------------------------
   - distanceKm() : distance « à vol d'oiseau » (formule de Haversine), côté front.
   - formaterDistance() : « à 800 m » sous 1 km, « à 2,3 km » au-dessus.
   - demanderPosition() : géolocalisation, UNIQUEMENT au clic sur « Autour de moi ».
   - carteLieuHTML() / carteSortieHTML() : le HTML des composants (futurs composants React).
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ORIVY_DONNEES;
  var RAYON_TERRE_KM = 6371;

  /* Formule de Haversine : distance entre deux points GPS sur une sphère */
  function distanceKm(lat1, lng1, lat2, lng2) {
    var rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad;
    var dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(a));
  }

  /* 0,8 → « à 800 m » · 2,345 → « à 2,3 km » · 47,6 → « à 48 km » */
  function formaterDistance(km) {
    if (km < 1) return "à " + Math.max(50, Math.round(km * 1000 / 50) * 50) + " m";
    if (km < 10) return "à " + km.toFixed(1).replace(".", ",") + " km";
    return "à " + Math.round(km) + " km";
  }

  /* Demande la position. Renvoie une promesse : { lat, lng } ou une erreur lisible. */
  function demanderPosition() {
    return new Promise(function (resoudre, rejeter) {
      if (!("geolocation" in navigator)) {
        rejeter(new Error("Ton navigateur ne sait pas te localiser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (p) { resoudre({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        function (e) {
          rejeter(new Error(e.code === 1
            ? "Tu as refusé la localisation. Tape plutôt le nom de ta ville."
            : "On n'arrive pas à te localiser. Tape plutôt le nom de ta ville."));
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  /* Cherche une ville connue (sans accents ni majuscules) */
  function trouverVille(texte) {
    var cle = (texte || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
    var c = D.VILLES[cle];
    return c ? { lat: c[0], lng: c[1], nom: texte.trim() } : null;
  }

  function icone(nom, classe) {
    return '<svg class="icone' + (classe ? " " + classe : "") + '" aria-hidden="true"><use href="#i-' + nom + '"/></svg>';
  }
  function badgeCat(cat) {
    return '<span class="badge-cat cat-' + cat + '">' + icone("cat-" + cat) + D.CATEGORIES[cat].nom + "</span>";
  }
  function note(n) { return n.toFixed(1).replace(".", ","); }

  /* Carte de lieu (composant CarteLieu) */
  function carteLieuHTML(lieu, km, lien) {
    var distance = km == null ? "" :
      '<span class="badge-distance">' + icone("autour") + formaterDistance(km) + "</span>";
    return '<article class="carte-lieu cat-' + lieu.cat + '">' +
      '<div class="photo">' + icone("cat-" + lieu.cat) +
        '<img src="' + D.photo(lieu.cat) + '" alt="' + lieu.alt + '" loading="lazy" onerror="this.remove()"></div>' +
      '<div class="carte-lieu__haut">' + badgeCat(lieu.cat) + distance + "</div>" +
      '<h3 class="carte-lieu__nom"><a href="' + (lien || "carte.html?lieu=" + lieu.id) + '">' + lieu.nom + "</a></h3>" +
      '<p class="carte-lieu__meta"><span>' + lieu.ville + "</span>" +
        "<span>" + icone("etoile") + '<span class="visuellement-cache">Note : </span>' + note(lieu.note) + "</span>" +
        (lieu.sorties ? "<span>" + icone("calendrier") + lieu.sorties + " sortie" + (lieu.sorties > 1 ? "s" : "") + " prévue" + (lieu.sorties > 1 ? "s" : "") + "</span>" : "") +
      "</p></article>";
  }

  var JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  /* 1 → « 1er », comme en français */
  function jourDuMois(d) { return d.getDate() === 1 ? "1er" : String(d.getDate()); }

  function dateLisible(iso) {
    var d = new Date(iso);
    var h = d.getHours() + "h" + (d.getMinutes() ? String(d.getMinutes()).padStart(2, "0") : "");
    var jour = JOURS[d.getDay()];
    return jour.charAt(0).toUpperCase() + jour.slice(1) + " " + jourDuMois(d) + " " + MOIS[d.getMonth()] + " · " + h;
  }

  function avatar(cle, taille) {
    var u = D.UTILISATEURS[cle];
    return '<span class="avatar avatar--' + (taille || "s") + " avatar--" + u.couleur + '" aria-hidden="true">' + u.initiales + "</span>";
  }

  /* Carte de sortie (composant CarteSortie) */
  function carteSortieHTML(sortie, km) {
    var lieu = D.lieu(sortie.lieu);
    var d = new Date(sortie.date);
    var n = sortie.inscrits.length;
    return '<article class="carte-sortie">' +
      '<div class="carte-sortie__date" aria-hidden="true"><span class="carte-sortie__jour">' + jourDuMois(d) + '</span><span class="carte-sortie__mois">' + MOIS[d.getMonth()] + "</span></div>" +
      '<div class="carte-sortie__corps">' +
        '<span style="align-self:flex-start">' + badgeCat(lieu.cat) + "</span>" +
        '<h3 class="carte-sortie__titre"><a href="sortie.html?id=' + sortie.id + '">' + sortie.titre + "</a></h3>" +
        '<p class="carte-sortie__meta"><span>' + icone("horloge") + dateLisible(sortie.date) + "</span>" +
          "<span>" + icone("epingle") + lieu.ville + (km == null ? "" : " · " + formaterDistance(km)) + "</span></p>" +
      "</div>" +
      '<div class="carte-sortie__pied">' +
        '<div class="pile-avatars" aria-label="' + n + ' inscrits">' + sortie.inscrits.slice(0, 3).map(function (c) { return avatar(c); }).join("") +
          (n > 3 ? '<span class="pile-avatars__reste" aria-hidden="true">+' + (n - 3) + "</span>" : "") + "</div>" +
        '<button class="bouton bouton--principal" type="button">Rejoins</button>' +
      "</div></article>";
  }

  window.ORIVY_PROXIMITE = {
    distanceKm: distanceKm,
    formaterDistance: formaterDistance,
    demanderPosition: demanderPosition,
    trouverVille: trouverVille,
    carteLieuHTML: carteLieuHTML,
    carteSortieHTML: carteSortieHTML,
    dateLisible: dateLisible,
    avatar: avatar,
    badgeCat: badgeCat,
    icone: icone,
    note: note
  };
})();
