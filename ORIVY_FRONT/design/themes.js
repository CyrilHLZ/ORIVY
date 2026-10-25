/* ==========================================================================
   ORIVY — Choix du thème horaire
   --------------------------------------------------------------------------
   À charger dans le <head> de index.html, AVANT les feuilles de style et
   SANS defer ni type="module" :
       <script src="/themes.js"></script>
   (ou en copiant ce code dans une balise <script> en ligne).
   Ainsi le thème est posé sur <html> avant le premier affichage : pas de flash
   du thème jour au chargement de nuit.

   Tranches horaires (heure locale du téléphone ou de l'ordinateur) :
     aube        6h → 9h
     jour        9h → 18h
     crepuscule 18h → 21h
     nuit       21h → 6h

   Réglage de l'utilisateur (localStorage, clé "orivy-theme") :
     "auto" (par défaut) : selon l'heure, revérifié toutes les minutes
     "jour"              : toujours jour
     "nuit"              : toujours nuit

   Utilisation depuis React (page Réglages) :
     window.orivyTheme.preference()        → "auto" | "jour" | "nuit"
     window.orivyTheme.choisir("nuit")     → enregistre et applique
     window.addEventListener("orivy:theme", e => console.log(e.detail.theme))
   ========================================================================== */
(function () {
  "use strict";

  var CLE = "orivy-theme";
  var PREFERENCES = ["auto", "jour", "nuit"];
  var THEMES = ["aube", "jour", "crepuscule", "nuit"];
  var racine = document.documentElement;
  var themeForce = null; // utilisé uniquement par le sélecteur des maquettes

  /* Le thème qui correspond à une heure donnée */
  function themeSelonHeure(date) {
    var h = date.getHours();
    if (h >= 6 && h < 9) return "aube";
    if (h >= 9 && h < 18) return "jour";
    if (h >= 18 && h < 21) return "crepuscule";
    return "nuit";
  }

  /* localStorage peut être indisponible (navigation privée, stockage bloqué) :
     on se rabat alors sur "auto" sans planter. */
  function lirePreference() {
    try {
      var valeur = localStorage.getItem(CLE);
      return PREFERENCES.indexOf(valeur) !== -1 ? valeur : "auto";
    } catch (e) {
      return "auto";
    }
  }

  function enregistrerPreference(valeur) {
    try {
      localStorage.setItem(CLE, valeur);
    } catch (e) {
      /* tant pis : le choix vaudra pour cette visite seulement */
    }
  }

  function themeAttendu() {
    if (themeForce) return themeForce;
    var preference = lirePreference();
    return preference === "auto" ? themeSelonHeure(new Date()) : preference;
  }

  /* Met à jour la couleur de la barre du navigateur mobile */
  function majCouleurNavigateur() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var couleur = getComputedStyle(racine).getPropertyValue("--couleur-meta-navigateur").trim();
    if (couleur) meta.setAttribute("content", couleur);
  }

  function mouvementReduit() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Applique un thème. avecFondu = false au chargement (aucune animation). */
  function appliquer(theme, avecFondu) {
    if (racine.getAttribute("data-theme") === theme) return;

    function changer() {
      racine.setAttribute("data-theme", theme);
      majCouleurNavigateur();
    }

    var fonduPossible = avecFondu
      && typeof document.startViewTransition === "function"
      && document.visibilityState === "visible"
      && !mouvementReduit();

    if (fonduPossible) {
      /* La classe vt-theme distingue ce fondu (lent, 1,2 s) de celui des changements
         de page (rapide) dans themes.css ; vt-vague s'y ajoute si on a cliqué (98). */
      racine.classList.add("vt-theme");
      var transition = document.startViewTransition(changer);
      transition.finished.then(function () {
        racine.classList.remove("vt-theme", "vt-vague");
      });
    } else {
      changer();
    }

    window.dispatchEvent(new CustomEvent("orivy:theme", { detail: { theme: theme } }));
  }

  /* 1. Tout de suite, avant l'affichage : sans fondu */
  appliquer(themeAttendu(), false);

  /* 2. Toutes les minutes : on revérifie (passage de 17h59 à 18h00, par exemple) */
  setInterval(function () {
    appliquer(themeAttendu(), true);
  }, 60 * 1000);

  /* 3. Au retour sur l'onglet (téléphone sorti de veille), on revérifie aussitôt */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") appliquer(themeAttendu(), false);
  });

  /* 4. La balise meta n'existe peut-être pas encore (script dans le <head>) */
  document.addEventListener("DOMContentLoaded", majCouleurNavigateur);

  /* API publique */
  window.orivyTheme = {
    preference: lirePreference,
    theme: function () { return racine.getAttribute("data-theme"); },
    choisir: function (preference) {
      if (PREFERENCES.indexOf(preference) === -1) return;
      enregistrerPreference(preference);
      appliquer(themeAttendu(), true);
    },
    /* Pour les maquettes uniquement : forcer aube ou crépuscule.
       apercu(null) rend la main au mode normal. */
    apercu: function (theme) {
      themeForce = THEMES.indexOf(theme) !== -1 ? theme : null;
      appliquer(themeAttendu(), true);
    }
  };
})();
