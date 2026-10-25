// ==========================================================================
// ORIVY — Génère un fichier .svg par icône dans icones/svg/
// Lancer depuis ORIVY_FRONT/design :   node outils/generer-icones.cjs
// (.cjs car le package.json du front est en "type": "module")
// Source unique : icones/icones.js
// ==========================================================================
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// icones.js est un script navigateur : on l'exécute dans un bac à sable
// en lui fournissant un faux « module » pour récupérer l'objet des icônes.
const bac = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "icones", "icones.js"), "utf8"), bac);
const ICONES = bac.module.exports;

const dossier = path.join(__dirname, "..", "icones", "svg");
fs.mkdirSync(dossier, { recursive: true });

for (const [nom, contenu] of Object.entries(ICONES)) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    contenu + "</svg>\n";
  fs.writeFileSync(path.join(dossier, nom + ".svg"), svg);
}
console.log(Object.keys(ICONES).length + " icônes écrites dans icones/svg/");
