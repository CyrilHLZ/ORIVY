/* ==========================================================================
   ORIVY — Icônes (style Lucide : grille 24, trait 2px, bouts et angles arrondis)
   --------------------------------------------------------------------------
   Un seul fichier source. Deux usages :

   1. Maquettes HTML : charger ce script en fin de <body>. Il insère un
      « sprite » invisible (une balise <svg> pleine de <symbol>) et chaque icône
      s'utilise ainsi :
        <svg class="icone" aria-hidden="true"><use href="#i-carte"/></svg>
      Les attributs de trait sont dans composants.css (.icone) : l'icône prend
      la couleur du texte (currentColor).

   2. React : outils/generer-icones.cjs écrit un fichier .svg par icône dans
      icones/svg/. Copie le contenu d'un fichier dans un composant, ou crée un
      composant <Icone nom="carte" /> qui lit cet objet.

   Accessibilité : une icône seule dans un bouton => aria-label sur le bouton.
   Une icône à côté d'un texte => aria-hidden="true" sur l'icône.
   ========================================================================== */
(function (racine) {
  "use strict";

  var ICONES = {
    /* --- Navigation --- */
    "accueil": '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    "carte": '<path d="M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    "calendrier": '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    "messages": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    "utilisateur": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "loupe": '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    "cloche": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    "menu": '<path d="M4 6h16M4 12h16M4 18h16"/>',

    /* --- Actions --- */
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "fermer": '<path d="M18 6 6 18M6 6l12 12"/>',
    "retour": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    "chevron-gauche": '<path d="m15 18-6-6 6-6"/>',
    "chevron-droit": '<path d="m9 18 6-6-6-6"/>',
    "chevron-bas": '<path d="m6 9 6 6 6-6"/>',
    "chevron-haut": '<path d="m18 15-6-6-6 6"/>',
    "filtres": '<path d="M21 6h-7M10 6H3M21 12h-9M8 12H3M21 18h-5M12 18H3"/><path d="M14 4v4M8 10v4M16 16v4"/>',
    "localiser": '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    "autour": '<path d="M3 11 22 2l-9 19-2-8z"/>',
    "epingle": '<path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "coeur": '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    "commentaire": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "partager": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    "image": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "appareil-photo": '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    "envoyer": '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    "modifier": '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
    "supprimer": '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
    "televerser": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    "rafraichir": '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    "plus-options": '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    "deconnexion": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    "suivre": '<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',
    "abonne": '<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 14 0"/><path d="m16 11 2 2 4-4"/>',
    "drapeau": '<path d="M5 22V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/>',

    /* --- États et informations --- */
    "valider": '<path d="M20 6 9 17l-5-5"/>',
    "alerte": '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    "info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    "horloge": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "utilisateurs": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.3a3.5 3.5 0 0 1 0 7.2M18.5 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    "etoile": '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    "liste": '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    "grille": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    "reglages": '<path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    "soleil": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    "lune": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    "oeil": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    "oeil-barre": '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.4 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.6 8 10 8a9.7 9.7 0 0 0 5.4-1.6M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/>',
    "cadenas": '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "bouclier": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    "boussole": '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',

    /* --- Catégories (mêmes clés que les variables --cat-…) --- */
    "cat-monument": '<path d="M4 21V9l2-1V5h2v2h2V5h4v2h2V5h2v3l2 1v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    "cat-culture": '<path d="M3 22h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z"/>',
    "cat-parc": '<path d="M12 22v-5"/><path d="M12 17c4 0 7-2.5 7-6 0-2.5-1.5-4-3-4.6C15.5 3.8 14 2 12 2s-3.5 1.8-4 4.4C6.5 7 5 8.5 5 11c0 3.5 3 6 7 6z"/>',
    "cat-promenade": '<path d="m8 3 4 8 5-5 5 15H2z"/>',
    "cat-village": '<path d="M12 2v4M10 4h4"/><path d="M18 22V11l-6-5-6 5v11"/><path d="M2 22h20M10 22v-4a2 2 0 0 1 4 0v4"/>',
    "cat-observatoire": '<path d="M12 2v4M4.9 8.9l1.4 1.4M2 16h2M20 16h2M17.7 10.3l1.4-1.4M22 20H2M16 16a4 4 0 0 0-8 0"/>',
    "cat-sport": '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    "cat-restaurant": '<path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
    "cat-bar": '<path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/><path d="M7.3 9h9.4"/>',
    "cat-cinema": '<path d="M20.2 6 3 11l-.9-2.4a2 2 0 0 1 1.3-2.5l13.5-4a2 2 0 0 1 2.5 1.3z"/><path d="m6.2 5.3 3.1 3.9M12.4 3.4l3.1 4M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    "cat-evenement": '<path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="m22 2-2.2.8a3 3 0 0 0-2 3.3c.2 1-.6 1.9-1.6 1.9h-.4a2 2 0 0 0-2 1.5L13.5 11"/><path d="M11 13c1.9 1.9 2.8 4.1 2 4.9s-3-.1-4.9-2-2.8-4.1-2-4.9 3 .1 4.9 2z"/>',
    "cat-autre": '<circle cx="12" cy="12" r="10"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'
  };

  /* Dans Node (générateur de fichiers) : on exporte simplement l'objet */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ICONES;
    return;
  }

  /* Dans le navigateur : on insère le sprite au début du <body> */
  function inserer() {
    var symboles = Object.keys(ICONES).map(function (nom) {
      return '<symbol id="i-' + nom + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
             'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONES[nom] + "</symbol>";
    }).join("");
    var conteneur = document.createElement("div");
    conteneur.hidden = true;
    conteneur.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + symboles + "</svg>";
    document.body.insertBefore(conteneur, document.body.firstChild);
  }
  racine.ORIVY_ICONES = ICONES;
  if (document.body) inserer();
  else document.addEventListener("DOMContentLoaded", inserer);
})(typeof window !== "undefined" ? window : this);
