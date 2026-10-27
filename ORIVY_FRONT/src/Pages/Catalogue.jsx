import { useState } from 'react';
import Bouton, { BoutonIcone } from '../Composants/Bouton.jsx';
import { BadgeCategorie, BadgeDistance } from '../Composants/Badges.jsx';
import Avatar, { PileAvatars } from '../Composants/Avatar.jsx';
import CarteLieu from '../Composants/CarteLieu.jsx';
import CarteSortie from '../Composants/CarteSortie.jsx';
import { ChoixSegmente, OPTIONS_RAYON, Puce, Puces } from '../Composants/Filtres.jsx';
import { Champ, Interrupteur } from '../Composants/Formulaire.jsx';
import { Chargement, EtatErreur, EtatVide } from '../Composants/Etats.jsx';
import FenetreConfirmation from '../Composants/Fenetre.jsx';
import { LISTE_CATEGORIES } from '../Constants/categories.js';

/*
 * Page /composants : catalogue des composants React, avec des données de démonstration
 * qui ont la MÊME forme que celles du back (nom, categorie, lieu, dateDebut…).
 * Outil de développement : à garder pour tester, ou à retirer avant la mise en ligne.
 */
const LIEUX = [
    { id: 1, nom: "Parc de la Tête d'Or", categorie: 'parc', lieu: 'Lyon 6e', note: 4.7, nombreSorties: 3, alt: 'Allée ombragée sous de grands arbres' },
    { id: 2, nom: 'Vieille ville d\'Annecy', categorie: 'village', lieu: 'Annecy', note: 4.8 },
    { id: 3, nom: 'Le Grand Rex', categorie: 'cinema', lieu: 'Paris 2e', imageUrl: 'https://exemple.invalide/image-cassee.jpg' },
];
const PERSONNES = [
    { prenom: 'Inès', nom: 'Nakamura' }, { prenom: 'Théo', nom: 'Martin' }, { prenom: 'Yanis', nom: 'Benali' },
];
const SORTIE = { id: 1, nom: 'Lever de soleil au puy de Dôme', categorie: 'promenade', dateDebut: '2026-10-25T07:00:00', lieu: 'Orcines', participants: PERSONNES };

const Section = ({ titre, children }) => (
    <section style={{ marginTop: 'var(--espace-8)' }}>
        <h2>{titre}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--espace-3)', alignItems: 'center' }}>{children}</div>
    </section>
);

const Catalogue = () => {
    const [cat, setCat] = useState(null);
    const [rayon, setRayon] = useState(25);
    const [deco, setDeco] = useState(true);
    const [titre, setTitre] = useState('');
    const [inscrit, setInscrit] = useState(false);
    const [fenetre, setFenetre] = useState(false);

    return (
        <main className="conteneur" style={{ paddingBlock: 'var(--espace-6) var(--espace-9)' }}>
            <h1>Composants</h1>
            <p className="texte-doux">Les briques React d'ORIVY (dossier src/Composants), avec des données de démonstration.</p>

            <Section titre="Boutons">
                <Bouton icone="plus">Crée une sortie</Bouton>
                <Bouton variante="secondaire" icone="carte">Vois sur la carte</Bouton>
                <Bouton variante="danger" icone="supprimer" onClick={() => setFenetre(true)}>Supprimer la sortie</Bouton>
                <Bouton variante="fantome">Annuler</Bouton>
                <Bouton variante="secondaire" pilule icone="autour">Autour de moi</Bouton>
                <BoutonIcone icone="partager" label="Partager" />
                <BoutonIcone icone="localiser" label="Me localiser" flottant />
            </Section>

            <Section titre="Badges et avatars">
                {LISTE_CATEGORIES.map((c) => <BadgeCategorie key={c.cle} cle={c.cle} />)}
                <BadgeDistance km={0.8} />
                <BadgeDistance km={2.34} />
                <Avatar personne={PERSONNES[0]} taille="s" />
                <Avatar personne={PERSONNES[1]} />
                <Avatar personne={PERSONNES[2]} taille="l" />
                <PileAvatars personnes={PERSONNES} total={8} />
            </Section>

            <Section titre="Filtres">
                <Puces label="Catégories">
                    <Puce actif={!cat} onClick={() => setCat(null)}>Tout</Puce>
                    {LISTE_CATEGORIES.slice(0, 6).map((c) => (
                        <Puce key={c.cle} cle={c.cle} actif={cat === c.cle} onClick={() => setCat(c.cle)}>{c.pluriel}</Puce>
                    ))}
                </Puces>
                <ChoixSegmente nom="rayon" legende="Rayon de recherche" valeur={rayon} onChange={setRayon} options={OPTIONS_RAYON} />
            </Section>

            <section style={{ marginTop: 'var(--espace-8)' }}>
                <h2>Cartes de lieu</h2>
                <p className="texte-doux">La 3ᵉ a une image cassée : on voit le repli (couleur + icône de la catégorie).</p>
                <div className="grille-lieux">
                    {LIEUX.map((lieu, i) => <CarteLieu key={lieu.id} lieu={lieu} km={[2.3, 34, 0.8][i]} />)}
                </div>
            </section>

            <section style={{ marginTop: 'var(--espace-8)', maxWidth: 'calc(var(--espace-9) * 6)' }}>
                <h2>Carte de sortie</h2>
                <CarteSortie sortie={SORTIE} km={12} inscrit={inscrit} onRejoindre={() => setInscrit(!inscrit)} />
            </section>

            <section style={{ marginTop: 'var(--espace-8)', maxWidth: 'calc(var(--espace-9) * 5)' }} className="formulaire">
                <h2>Formulaire</h2>
                <Champ label="Titre de la sortie" value={titre} onChange={(e) => setTitre(e.target.value)}
                       aide="Court et parlant." erreur={titre ? undefined : 'Donne un titre à ta sortie.'} />
                <Champ label="Ta ville" icone="loupe" type="search" placeholder="Nantes, Lille…" />
                <Champ label="Description" multiligne placeholder="Le programme…" />
                <Interrupteur label="Décorations saisonnières" detail="Citrouilles, flocons…" checked={deco} onChange={(e) => setDeco(e.target.checked)} />
            </section>

            <section style={{ marginTop: 'var(--espace-8)' }}>
                <h2>États</h2>
                <div style={{ display: 'grid', gap: 'var(--espace-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <EtatVide icone="calendrier" titre="Aucune sortie par ici"
                              action={<Bouton icone="plus">Crée une sortie</Bouton>}>
                        Et si tu lançais la première ?
                    </EtatVide>
                    <EtatErreur onReessayer={() => {}} />
                </div>
                <Chargement />
            </section>

            <FenetreConfirmation ouverte={fenetre} titre="Supprimer cette sortie ?" texteConfirmer="Oui, supprimer"
                                 onConfirmer={() => setFenetre(false)} onAnnuler={() => setFenetre(false)}>
                Les 8 inscrits seront prévenus. Cette action est définitive.
            </FenetreConfirmation>
        </main>
    );
};

export default Catalogue;
