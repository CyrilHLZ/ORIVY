/* ==========================================================================
   ORIVY — Activités / lieux : filtres, proximité, tri
   --------------------------------------------------------------------------
   Sans position : tous les lieux, tri « plus récent » ou « mieux noté ».
   Avec position (GPS ou ville tapée) : distance sur chaque carte, filtre de
   rayon actif, tri « plus proche » par défaut.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ORIVY_DONNEES, P = window.ORIVY_PROXIMITE;
  var etat = { cat: null, position: null, nomPosition: "", rayon: 25, tri: "proche" };

  var resultats = document.getElementById("resultats");
  var compte = document.getElementById("compte");
  var vide = document.getElementById("vide");
  var rayon = document.getElementById("rayon");
  var tri = document.getElementById("tri");
  var alerte = document.getElementById("alerte");

  /* Filtres de catégorie (un seul choix, comme des onglets) */
  var filtres = document.getElementById("filtres");
  var cats = ["parc", "culture", "promenade", "village", "observatoire", "monument", "restaurant", "bar", "cinema", "evenement", "sport"];
  filtres.innerHTML = '<button class="puce" type="button" data-cat="" aria-pressed="true">Tout</button>' +
    cats.map(function (c) {
      return '<button class="puce cat-' + c + '" type="button" data-cat="' + c + '" aria-pressed="false">' + P.icone("cat-" + c) + D.CATEGORIES[c].pluriel + "</button>";
    }).join("");
  filtres.addEventListener("click", function (e) {
    var b = e.target.closest(".puce");
    if (!b) return;
    etat.cat = b.getAttribute("data-cat") || null;
    filtres.querySelectorAll(".puce").forEach(function (p) { p.setAttribute("aria-pressed", String(p === b)); });
    afficher();
  });

  function afficher() {
    var liste = D.LIEUX
      .filter(function (l) { return !etat.cat || l.cat === etat.cat; })
      .map(function (l) {
        return { lieu: l, km: etat.position ? P.distanceKm(etat.position.lat, etat.position.lng, l.lat, l.lng) : null };
      })
      .filter(function (x) { return x.km == null || x.km <= etat.rayon; });

    liste.sort(function (a, b) {
      if (etat.tri === "proche" && a.km != null) return a.km - b.km;
      if (etat.tri === "note") return b.lieu.note - a.lieu.note;
      return b.lieu.ajout.localeCompare(a.lieu.ajout);
    });

    resultats.innerHTML = liste.map(function (x) { return P.carteLieuHTML(x.lieu, x.km); }).join("");
    vide.hidden = liste.length > 0;
    document.getElementById("vide-rayon").textContent = etat.rayon + " km";

    var n = liste.length, s = n > 1 ? "x" : "";
    compte.textContent = etat.position
      ? n + " lieu" + s + " à moins de " + etat.rayon + " km " + etat.nomPosition
      : n + " lieu" + s + " partout en France";
  }

  function definirPosition(pos, nom) {
    etat.position = pos;
    etat.nomPosition = nom;
    rayon.disabled = false;
    alerte.hidden = true;
    tri.value = etat.tri = "proche";
    afficher();
  }

  /* « Autour de moi » : la demande de position part d'un clic, jamais du chargement */
  var autour = document.getElementById("autour");
  autour.addEventListener("click", function () {
    autour.setAttribute("aria-busy", "true");
    autour.innerHTML = '<span class="tourne" aria-hidden="true"></span>Localisation…';
    P.demanderPosition()
      .then(function (pos) { definirPosition(pos, "de toi"); })
      .catch(function (err) {
        document.getElementById("alerte-texte").textContent = err.message;
        alerte.hidden = false;
        document.getElementById("ville").focus();
      })
      .then(function () {
        autour.removeAttribute("aria-busy");
        autour.innerHTML = P.icone("autour") + "Autour de moi";
      });
  });

  /* Position refusée (ou par choix) : on tape une ville */
  document.getElementById("form-ville").addEventListener("submit", function (e) {
    e.preventDefault();
    var saisie = document.getElementById("ville").value;
    var ville = P.trouverVille(saisie);
    if (ville) definirPosition(ville, "de " + ville.nom);
    else {
      document.getElementById("alerte-texte").textContent = "On ne connaît pas encore « " + saisie + " ». Essaie une grande ville voisine.";
      alerte.hidden = false;
    }
  });

  rayon.addEventListener("change", function (e) { etat.rayon = +e.target.value; afficher(); });
  tri.addEventListener("change", function () { etat.tri = tri.value; afficher(); });
  document.getElementById("elargir").addEventListener("click", function () {
    rayon.querySelector('input[value="50"]').checked = true;
    etat.rayon = 50;
    afficher();
  });

  /* Sans position, « plus proche » n'a pas de sens : on part sur « plus récent » */
  tri.value = etat.tri = "recent";
  afficher();
})();
