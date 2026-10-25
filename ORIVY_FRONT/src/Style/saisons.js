/* ==========================================================================
   ORIVY — Choix de la saison et des décorations
   --------------------------------------------------------------------------
   À charger dans le <head> juste après themes.js, sans defer :
       <script src="/themes.js"></script>
       <script src="/saisons.js"></script>
   Pose sur <html> : data-saison="…" et data-decorations="on | off".

   Calendrier (dates incluses) :
     printemps  20 mars  → 20 juin
     ete        21 juin  → 22 septembre
     automne    23 sept. → 20 décembre
     hiver      21 déc.  → 19 mars
   Événements, prioritaires sur la saison :
     halloween  20 → 31 octobre
     noel        1 → 26 décembre

   Réglage (localStorage, clé "orivy-decorations") : "on" (défaut) | "off".

   Utilisation depuis React :
     window.orivySaison.saison()               → "automne", "halloween"…
     window.orivySaison.decorations()          → true | false
     window.orivySaison.activerDecorations(false)
     window.orivySaison.ordreCategories()      → ordre des écrans de l'accueil
     window.addEventListener("orivy:saison", e => …)
   ========================================================================== */
(function () {
  "use strict";

  var CLE = "orivy-decorations";
  var SAISONS = ["printemps", "ete", "automne", "hiver", "halloween", "noel"];
  var racine = document.documentElement;
  var saisonForcee = null; // sélecteur des maquettes uniquement

  /* Ordre des catégories sur l'accueil selon la saison (brief 6.2).
     Clés = celles des variables --cat-… de design-system.css. */
  var ORDRES = {
    defaut:    ["culture", "parc", "promenade", "village", "observatoire", "restaurant", "bar", "cinema", "evenement", "monument"],
    printemps: ["parc", "promenade", "village", "observatoire", "restaurant", "culture", "monument", "bar", "evenement", "cinema"],
    ete:       ["observatoire", "bar", "promenade", "parc", "village", "restaurant", "evenement", "monument", "culture", "cinema"],
    automne:   ["promenade", "village", "parc", "culture", "monument", "restaurant", "cinema", "bar", "observatoire", "evenement"],
    hiver:     ["culture", "evenement", "cinema", "monument", "restaurant", "bar", "village", "observatoire", "promenade", "parc"],
    halloween: ["cinema", "evenement", "promenade", "village", "culture", "monument", "bar", "restaurant", "parc", "observatoire"],
    noel:      ["evenement", "village", "culture", "monument", "restaurant", "cinema", "bar", "observatoire", "promenade", "parc"]
  };

  /* Compare des dates sous forme MMJJ : 20 mars = 320, 1er décembre = 1201 */
  function saisonSelonDate(date) {
    var mmjj = (date.getMonth() + 1) * 100 + date.getDate();
    if (mmjj >= 1020 && mmjj <= 1031) return "halloween";
    if (mmjj >= 1201 && mmjj <= 1226) return "noel";
    if (mmjj >= 320 && mmjj <= 620) return "printemps";
    if (mmjj >= 621 && mmjj <= 922) return "ete";
    if (mmjj >= 923 && mmjj <= 1220) return "automne";
    return "hiver";
  }

  function lireDecorations() {
    try {
      return localStorage.getItem(CLE) !== "off";
    } catch (e) {
      return true;
    }
  }

  function appliquer() {
    var saison = saisonForcee || saisonSelonDate(new Date());
    var deco = lireDecorations() ? "on" : "off";
    var change = racine.getAttribute("data-saison") !== saison;
    racine.setAttribute("data-saison", saison);
    racine.setAttribute("data-decorations", deco);
    if (change) {
      window.dispatchEvent(new CustomEvent("orivy:saison", { detail: { saison: saison } }));
    }
  }

  /* Avant l'affichage */
  appliquer();

  /* Une fois par heure suffit : la saison change à minuit au plus tôt */
  setInterval(appliquer, 60 * 60 * 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") appliquer();
  });

  window.orivySaison = {
    saison: function () { return racine.getAttribute("data-saison"); },
    decorations: lireDecorations,
    activerDecorations: function (actif) {
      try { localStorage.setItem(CLE, actif ? "on" : "off"); } catch (e) { /* visite seulement */ }
      racine.setAttribute("data-decorations", actif ? "on" : "off");
    },
    ordreCategories: function () {
      return (ORDRES[racine.getAttribute("data-saison")] || ORDRES.defaut).slice();
    },
    /* Maquettes uniquement : apercu("noel"), apercu(null) pour revenir à la date réelle */
    apercu: function (saison) {
      saisonForcee = SAISONS.indexOf(saison) !== -1 ? saison : null;
      appliquer();
    }
  };
})();
