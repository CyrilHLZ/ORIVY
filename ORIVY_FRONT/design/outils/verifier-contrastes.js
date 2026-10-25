// ==========================================================================
// ORIVY — Vérification des contrastes WCAG AA
// Lancer depuis ORIVY_FRONT/design :   node outils/verifier-contrastes.js
// Vérifie chaque thème horaire (aube, jour, crépuscule, nuit) sans saison,
// puis chaque combinaison thème × saison (4 × 6 = 24).
// Les valeurs recopient themes.css et saisons.css : les tenir à jour ensemble.
// ==========================================================================

// Luminance relative et rapport de contraste (formules WCAG 2)
const L = h => {
  const c = h.match(/\w\w/g).map(x => { x = parseInt(x, 16) / 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; });
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
};
const r = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return +((x + .05) / (y + .05)).toFixed(2); };

// Rôles « clairs » communs à aube, jour, crépuscule (themes.css / design-system.css)
const clair = { P: '#A34E2C', PS: '#873F22', sP: '#FFFBF6', A: '#6E8F5F', AT: '#4E6B42', sA: '#FFFBF6', D: '#A8173A', DS: '#8E1230', sD: '#FFFFFF' };
const THEMES = {
  aube:       { ...clair, fond: '#F8E9E3', surface: '#FFF8F5', creux: '#F5E5DE', texte: '#33241F', doux: '#6E5A52', forte: '#907A70' },
  jour:       { ...clair, fond: '#F6EFE6', surface: '#FFFBF6', creux: '#EFE5D8', texte: '#2E2622', doux: '#6B5D52', forte: '#8E7D6F' },
  crepuscule: { ...clair, fond: '#F6EAD8', surface: '#FFF8EC', creux: '#F2E4D0', texte: '#2E2418', doux: '#6A5844', forte: '#8C7A62' },
  nuit: { P: '#E58E6A', PS: '#EFA585', sP: '#16211C', A: '#A9C49A', AT: '#A9C49A', sA: '#16211C', D: '#FF8FA8', DS: '#FFA8BC', sD: '#16211C',
          fond: '#16211C', surface: '#21302A', creux: '#1A2722', texte: '#EDE6DA', doux: '#B4AA9C', forte: '#6F8579' }
};

// saisons.css : [principale, survol, accent, accent-texte] en clair, puis la nuit
const SAISONS = {
  printemps: { clair: ['#A9463F', '#933D36', '#63924B', '#4B6F39'], nuit: ['#D08680', '#DDA6A2', '#6BA94C', '#6BA94C'] },
  ete:       { clair: ['#975523', '#824A1F', '#3F8CC2', '#2F6993'], nuit: ['#D48649', '#E0A77B', '#56A0D5', '#56A0D5'] },
  automne:   { clair: ['#A04D2C', '#8C4326', '#808C42', '#606A32'], nuit: ['#D58565', '#E0A68F', '#91A145', '#91A145'] },
  hiver:     { clair: ['#A34E2C', '#873F22', '#4B8EAF', '#396B84'], nuit: ['#E58E6A', '#EFA585', '#57A1C7', '#57A1C7'] },
  halloween: { clair: ['#A24C1A', '#8F4317', '#9778BA', '#7954A3'], nuit: ['#E17F47', '#E9A279', '#AC8BD3', '#AC8BD3'] },
  noel:      { clair: ['#C12C15', '#A82613', '#42946B', '#337152'], nuit: ['#EE7563', '#F39C8F', '#51A97D', '#51A97D'] }
};

// Catégories : [couleur, texte posé dessus]
const E = '#1F1915', Pap = '#FFFBF6';
const catJour = { monument: ['#ef6f61', E], culture: ['#b5527a', Pap], parc: ['#4f9d69', E], promenade: ['#3c5960', Pap], village: ['#c98a3c', E], observatoire: ['#5468c9', Pap], sport: ['#2a9d8f', E], restaurant: ['#f4a259', E], bar: ['#8d5b4c', Pap], cinema: ['#6d597a', Pap], evenement: ['#e76f51', E], autre: ['#6b7280', Pap] };
const catNuit = { ...catJour, culture: ['#C06B8D', E], promenade: ['#5F8D98', E], observatoire: ['#6F80D2', E], bar: ['#AE7868', E], cinema: ['#937EA1', E], autre: ['#7D8492', E] };

let total = 0, echecs = 0;
const verifier = (nom, a, b, mini) => {
  total++;
  const v = r(a, b);
  if (v < mini) { echecs++; console.log(`ÉCHEC  ${nom} : ${v} (mini ${mini})`); }
};

// Couples qui dépendent de la principale et de l'accent
function couplesCouleur(nom, c) {
  for (const bg of ['fond', 'surface', 'creux']) {
    verifier(`${nom} principale texte / ${bg}`, c.P, c[bg], 4.5);
    verifier(`${nom} focus / ${bg}`, c.P, c[bg], 3);
    verifier(`${nom} accent texte / ${bg}`, c.AT, c[bg], 4.5);
    if (bg !== 'creux') verifier(`${nom} accent (interface) / ${bg}`, c.A, c[bg], 3);
  }
  verifier(`${nom} texte du bouton principal`, c.sP, c.P, 4.5);
  verifier(`${nom} texte du bouton principal survolé`, c.sP, c.PS, 4.5);
  verifier(`${nom} texte sur accent`, c.sA, c.AT, 4.5);
}

for (const [nom, c] of Object.entries(THEMES)) {
  for (const bg of ['fond', 'surface', 'creux']) {
    verifier(`${nom} texte / ${bg}`, c.texte, c[bg], 4.5);
    verifier(`${nom} texte doux / ${bg}`, c.doux, c[bg], 4.5);
    verifier(`${nom} danger / ${bg}`, c.D, c[bg], 4.5);
    verifier(`${nom} bordure forte / ${bg}`, c.forte, c[bg], 3);
  }
  verifier(`${nom} texte sur danger`, c.sD, c.D, 4.5);
  verifier(`${nom} texte sur danger survolé`, c.sD, c.DS, 4.5);
  couplesCouleur(nom, c);
  const cats = nom === 'nuit' ? catNuit : catJour;
  for (const [k, [f, tx]] of Object.entries(cats)) {
    verifier(`${nom} badge ${k}`, tx, f, 4.5);
    if (nom === 'nuit') verifier(`${nom} icône ${k} / surface`, f, c.surface, 3);
  }
  // Chaque saison sur ce thème
  for (const [saison, s] of Object.entries(SAISONS)) {
    const [P, PS, A, AT] = nom === 'nuit' ? s.nuit : s.clair;
    couplesCouleur(`${nom} × ${saison}`, { ...c, P, PS, A, AT });
  }
}

console.log(`${total} couples vérifiés, ${echecs} échec(s).`);
process.exitCode = echecs ? 1 : 0;
