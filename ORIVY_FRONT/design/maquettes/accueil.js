/* ==========================================================================
   ORIVY — Accueil : ordre saisonnier, arbre du parc, repli des animations,
   indicateur de progression.
   Tout est facultatif : sans ce script, la page reste lisible et cliquable.
   ========================================================================== */
(function () {
  "use strict";

  var racine = document.documentElement;
  var zone = document.getElementById("categories");

  /* 1. Ordre des catégories selon la saison (brief 6.2) */
  function ordonner() {
    if (!window.orivySaison) return;
    window.orivySaison.ordreCategories().forEach(function (cat) {
      var ecran = zone.querySelector('[data-cat="' + cat + '"]');
      if (ecran) zone.appendChild(ecran); // déplacer à la fin = trier
    });
  }

  /* 2. L'arbre du parc suit la saison : parc.svg#printemps | (été par défaut) | #automne | #hiver */
  var ARBRE = { printemps: "#printemps", ete: "", automne: "#automne", halloween: "#automne", hiver: "#hiver", noel: "#hiver" };
  function arbre() {
    var saison = racine.getAttribute("data-saison");
    document.querySelectorAll(".illu-saison").forEach(function (img) {
      img.src = img.getAttribute("src").split("#")[0] + (ARBRE[saison] || "");
    });
  }

  ordonner();
  arbre();
  window.addEventListener("orivy:saison", function () { ordonner(); arbre(); construireProgression(); });

  /* 3. Repli des animations liées au défilement (Firefox, Safari anciens) */
  var tousLesEcrans = Array.prototype.slice.call(document.querySelectorAll(".ecran"));
  var scrollDriven = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  if (!scrollDriven && "IntersectionObserver" in window) {
    racine.classList.add("js-repli");
    /* Sur ordinateur (tornade), l'effet se rejoue à chaque passage : on retire la classe
       quand l'écran sort. Sur mobile, le fondu ne se joue qu'une fois. */
    var ordinateur = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("est-visible");
        else if (ordinateur.matches) e.target.classList.remove("est-visible");
      });
    }, { threshold: 0.35 });
    tousLesEcrans.forEach(function (ecran) { observateur.observe(ecran); });
  }

  /* 4. Indicateur de progression (affiché sur ordinateur par le CSS) */
  var progression = document.getElementById("progression");
  function nomEcran(ecran) {
    var titre = ecran.querySelector("h1, h2");
    return titre ? titre.textContent.trim() : "";
  }
  function construireProgression() {
    var ecrans = Array.prototype.slice.call(document.querySelectorAll(".ecran"));
    progression.innerHTML = ecrans.map(function (ecran) {
      return '<a href="#' + ecran.id + '" data-cible="' + ecran.id + '"><span class="visuellement-cache">' + nomEcran(ecran) + "</span></a>";
    }).join("");
    marquerCourant(ecrans[0].id);
  }
  function marquerCourant(id) {
    progression.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("data-cible") === id) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
  }
  construireProgression();
  if ("IntersectionObserver" in window) {
    var suivi = new IntersectionObserver(function (entrees) {
      /* isIntersecting est vrai dès qu'un pixel dépasse : on exige plutôt 60 % visibles,
         sinon l'écran précédent (encore visible sous l'en-tête) serait marqué lui aussi */
      entrees.forEach(function (e) { if (e.intersectionRatio >= 0.6) marquerCourant(e.target.id); });
    }, { threshold: [0, 0.6, 1] });
    tousLesEcrans.forEach(function (ecran) { suivi.observe(ecran); });
  }
})();
