/* ==========================================================================
   ORIVY — Sélecteur flottant pour les maquettes (outil de design, pas pour l'app)
   --------------------------------------------------------------------------
   À charger en fin de <body>, après themes.js et saisons.js :
       <script src="../outils/selecteur-apercu.js"></script>
   Ajoute un panneau repliable en bas à droite pour forcer l'heure,
   la saison, et couper les décorations.
   ========================================================================== */
(function () {
  "use strict";

  var GROUPES = [
    {
      nom: "Heure",
      choix: [[null, "Auto"], ["aube", "Aube"], ["jour", "Jour"], ["crepuscule", "Crépuscule"], ["nuit", "Nuit"]],
      appliquer: function (v) { window.orivyTheme && window.orivyTheme.apercu(v); }
    },
    {
      nom: "Saison",
      choix: [[null, "Auto"], ["printemps", "Printemps"], ["ete", "Été"], ["automne", "Automne"], ["hiver", "Hiver"], ["halloween", "Halloween"], ["noel", "Noël"]],
      appliquer: function (v) { window.orivySaison && window.orivySaison.apercu(v); }
    },
    {
      nom: "Décorations",
      choix: [[true, "Oui"], [false, "Non"]],
      appliquer: function (v) { window.orivySaison && window.orivySaison.activerDecorations(v); }
    }
  ];

  /* Styles du panneau : uniquement des variables du design system */
  var style = document.createElement("style");
  style.textContent = [
    ".apercu-panneau{position:fixed;right:var(--espace-3);bottom:var(--espace-3);z-index:calc(var(--plan-notification) + 1);",
    "display:flex;flex-direction:column;align-items:flex-end;gap:var(--espace-2);max-width:calc(100vw - 2 * var(--espace-3));font-size:var(--taille-s)}",
    ".apercu-panneau__contenu{display:flex;flex-direction:column;gap:var(--espace-3);padding:var(--espace-3);",
    "background:var(--couleur-surface);color:var(--couleur-texte);border:1px solid var(--couleur-bordure);",
    "border-radius:var(--rayon-carte);box-shadow:var(--ombre-3);max-height:70vh;overflow:auto}",
    ".apercu-panneau__contenu[hidden]{display:none}",
    ".apercu-panneau fieldset{border:0;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--espace-1)}",
    ".apercu-panneau legend{font-weight:var(--graisse-forte);margin-bottom:var(--espace-1)}",
    ".apercu-panneau button{min-height:var(--cible-min);min-width:var(--cible-min);padding:0 var(--espace-3);",
    "border-radius:var(--rayon-pilule);border:1.5px solid var(--couleur-bordure-forte);",
    "background:var(--couleur-surface);color:var(--couleur-texte);font-weight:var(--graisse-moyenne);cursor:pointer}",
    ".apercu-panneau button[aria-pressed='true']{background:var(--couleur-principale);",
    "border-color:var(--couleur-principale);color:var(--couleur-sur-principale)}",
    ".apercu-panneau__bascule{box-shadow:var(--ombre-2)}"
  ].join("");
  document.head.appendChild(style);

  var panneau = document.createElement("div");
  panneau.className = "apercu-panneau";
  panneau.setAttribute("role", "region");
  panneau.setAttribute("aria-label", "Aperçu des thèmes et saisons (outil de maquette)");

  var contenu = document.createElement("div");
  contenu.className = "apercu-panneau__contenu";
  contenu.id = "apercu-contenu";
  contenu.hidden = true; // replié par défaut : un clic sur « Aperçu » l'ouvre

  GROUPES.forEach(function (g) {
    var groupe = document.createElement("fieldset");
    var legende = document.createElement("legend");
    legende.textContent = g.nom;
    groupe.appendChild(legende);
    var boutons = g.choix.map(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = c[1];
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        g.appliquer(c[0]);
        boutons.forEach(function (autre) { autre.setAttribute("aria-pressed", String(autre === b)); });
      });
      groupe.appendChild(b);
      return b;
    });
    contenu.appendChild(groupe);
  });

  var bascule = document.createElement("button");
  bascule.type = "button";
  bascule.className = "apercu-panneau__bascule";
  bascule.setAttribute("aria-controls", "apercu-contenu");
  function majBascule() {
    bascule.setAttribute("aria-expanded", String(!contenu.hidden));
    bascule.textContent = contenu.hidden ? "Aperçu" : "Fermer";
  }
  bascule.addEventListener("click", function () { contenu.hidden = !contenu.hidden; majBascule(); });
  majBascule();

  panneau.appendChild(contenu);
  panneau.appendChild(bascule);
  document.body.appendChild(panneau);
})();
