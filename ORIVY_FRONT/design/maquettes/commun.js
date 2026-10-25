/* ==========================================================================
   ORIVY — Navigation commune des maquettes (en-tête + barre d'onglets)
   --------------------------------------------------------------------------
   Dans React, ce seront les composants <Entete /> et <BarreOnglets />.
   Ici, pour ne pas recopier le même HTML dans chaque maquette, ce script
   l'insère d'après l'attribut data-page du <body> :
     <body data-page="carte">   (accueil | carte | sorties | messages | profil |
                                 communaute | notifications | aucune)
   À charger en fin de <body>, AVANT icones/icones.js.
   ========================================================================== */
(function () {
  "use strict";

  /* Dossier des maquettes, déduit de l'adresse de ce script */
  var base = document.currentScript.src.replace(/commun\.js.*$/, "");
  var page = document.body.getAttribute("data-page") || "aucune";

  var ONGLETS = [
    { id: "accueil", nom: "Accueil", icone: "accueil", lien: "accueil.html" },
    { id: "carte", nom: "Carte", icone: "carte", lien: "carte.html" },
    { id: "sorties", nom: "Sorties", icone: "calendrier", lien: "sorties.html" },
    { id: "messages", nom: "Messages", icone: "messages", lien: "messages.html" },
    { id: "profil", nom: "Profil", icone: "utilisateur", lien: "profil.html" }
  ];

  function icone(nom) {
    return '<svg class="icone" aria-hidden="true"><use href="#i-' + nom + '"/></svg>';
  }
  function courant(id) {
    return id === page ? ' aria-current="page"' : "";
  }

  /* Logo en ligne : l'épingle suit la couleur principale (saison), les lettres le texte */
  var LOGO =
    '<svg viewBox="0 0 260 112" role="img" aria-label="ORIVY, retour à l\'accueil">' +
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="var(--couleur-principale)" stroke-width="10" d="M40 100 L19.1 62.8 A24 24 0 1 1 60.9 62.8 Z"/>' +
    '<path stroke="currentColor" stroke-width="6" stroke-dasharray="0 12" d="M54 100 H198"/>' +
    '<path stroke="currentColor" stroke-width="10" d="M84 78 V24 H100 A15 15 0 0 1 100 54 H84 M100 54 L116 78 M136 24 V78 M154 24 L174 78 L194 24"/>' +
    '<path stroke="currentColor" stroke-width="10" d="M214 24 L232 51 L250 24 M232 51 V86 Q232 100 212 100"/>' +
    "</g></svg>";

  /* --- En-tête --- */
  var entete = document.createElement("header");
  entete.className = "entete";
  entete.innerHTML =
    '<div class="entete__interieur">' +
      '<span class="deco-coin" aria-hidden="true"></span>' +
      '<a class="entete__logo" href="' + base + 'accueil.html">' + LOGO +
        '<span class="deco-mini" aria-hidden="true"></span></a>' +
      '<nav class="entete__nav" aria-label="Navigation principale">' +
        ONGLETS.slice(0, 4).map(function (o) {
          return '<a href="' + base + o.lien + '"' + courant(o.id) + ">" + icone(o.icone) + o.nom + "</a>";
        }).join("") +
      "</nav>" +
      '<div class="entete__actions">' +
        '<a class="bouton bouton--icone" href="' + base + 'communaute.html" aria-label="Communauté : trouver des profils"' + courant("communaute") + ">" + icone("loupe") + "</a>" +
        '<a class="bouton bouton--icone" href="' + base + 'notifications.html" aria-label="Notifications, 3 non lues"' + courant("notifications") + ">" + icone("cloche") + '<span class="pastille" aria-hidden="true">3</span></a>' +
        '<a class="entete__profil" href="' + base + 'profil.html" aria-label="Ton profil"' + courant("profil") + '><span class="avatar avatar--s avatar--a">CL</span></a>' +
      "</div>" +
    "</div>";
  document.body.insertBefore(entete, document.body.firstChild);

  /* --- Barre d'onglets (mobile et tablette) --- */
  var onglets = document.createElement("nav");
  onglets.className = "onglets";
  onglets.setAttribute("aria-label", "Navigation principale");
  onglets.innerHTML = ONGLETS.map(function (o) {
    return '<a href="' + base + o.lien + '"' + courant(o.id) + ">" + icone(o.icone) + "<span>" + o.nom + "</span></a>";
  }).join("");
  document.body.appendChild(onglets);
  document.body.classList.add("avec-onglets");
})();
