import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/*
 * Pages légales : mentions légales, conditions d'utilisation (CGU), politique de confidentialité.
 * ⚠️ BROUILLON rédigé à partir de ce que fait vraiment le site (2026-11-01) : à faire relire
 * par une personne compétente avant la mise en ligne, et à compléter là où il y a [À COMPLÉTER].
 * Le texte vit ici, en JSX : une page = un tableau de sections { titre, contenu }.
 */

const MISE_A_JOUR = '1er novembre 2026';

/* Liens entre les trois pages, en bas de chacune */
const AUTRES = [
    { lien: '/mentions-legales', nom: 'Mentions légales' },
    { lien: '/cgu', nom: "Conditions d'utilisation" },
    { lien: '/confidentialite', nom: 'Confidentialité' },
];

const PageLegale = ({ titre, intro, sections, chemin }) => {
    useEffect(() => { document.title = `${titre} · ORIVY`; }, [titre]);
    return (
        <main className="conteneur page-legale">
            <h1 className="page-titre">{titre}</h1>
            <p className="page-intro">{intro} Dernière mise à jour : {MISE_A_JOUR}.</p>
            {/* Sommaire : utile sur les longues pages, et pour les lecteurs d'écran */}
            <nav className="encart page-legale__sommaire" aria-label="Sommaire">
                <ol>
                    {sections.map((s, i) => <li key={s.titre}><a href={`#section-${i + 1}`}>{s.titre}</a></li>)}
                </ol>
            </nav>
            {sections.map((s, i) => (
                <section key={s.titre} id={`section-${i + 1}`} aria-labelledby={`t-section-${i + 1}`}>
                    <h2 id={`t-section-${i + 1}`}>{i + 1}. {s.titre}</h2>
                    {s.contenu}
                </section>
            ))}
            <nav className="page-legale__autres" aria-label="Autres informations légales">
                {AUTRES.filter((a) => a.lien !== chemin).map((a) => <Link key={a.lien} to={a.lien}>{a.nom}</Link>)}
            </nav>
        </main>
    );
};

/* ===================================================================== MENTIONS LÉGALES */
export const MentionsLegales = () => (
    <PageLegale chemin="/mentions-legales" titre="Mentions légales"
                intro="Qui édite et qui héberge ORIVY (loi pour la confiance dans l'économie numérique, article 6)."
                sections={[
        { titre: 'Éditeur du site', contenu: <>
            <p>ORIVY est édité par <strong>[À COMPLÉTER : nom et prénom, ou raison sociale]</strong>,
               [À COMPLÉTER : adresse postale].</p>
            <p>Contact : <strong>[À COMPLÉTER : adresse e-mail de contact]</strong>.</p>
            <p>[Si c'est une entreprise : forme juridique, capital, numéro SIRET / RCS, numéro de TVA.]</p>
            <p>Directeur ou directrice de la publication : [À COMPLÉTER].</p>
        </> },
        { titre: 'Hébergement', contenu: <>
            <p>Le site et ses données sont hébergés par <strong>[À COMPLÉTER : nom de l'hébergeur]</strong>,
               [À COMPLÉTER : adresse et téléphone de l'hébergeur]. Les données sont stockées dans l'Union européenne
               [À VÉRIFIER selon l'hébergeur choisi].</p>
        </> },
        { titre: 'Propriété intellectuelle', contenu: <>
            <p>Le nom ORIVY, le logo, le design, les illustrations et les photos d'ambiance du site appartiennent à l'éditeur.
               Toute reproduction sans autorisation est interdite.</p>
            <p>Les photos, vidéos et textes publiés par les membres restent leur propriété (voir les conditions d'utilisation).</p>
        </> },
        { titre: 'Données et services tiers', contenu: <>
            <p>Cartes : © les contributeurs OpenStreetMap (licence ODbL). Recherche de communes et d'adresses :
               API Géo et API Adresse de l'État (data.gouv.fr). Météo : Open-Meteo. Certaines photos de lieux :
               Wikimedia Commons, sous la licence indiquée sur leur fiche.</p>
        </> },
        { titre: 'Signaler un contenu', contenu: <>
            <p>Un contenu te semble illégal ou choquant ? Utilise le bouton « Signaler » sur le profil du membre ou sur la sortie,
               ou écris à l'adresse de contact ci-dessus.</p>
        </> },
    ]} />
);

/* ===================================================================== CONDITIONS D'UTILISATION */
export const ConditionsUtilisation = () => (
    <PageLegale chemin="/cgu" titre="Conditions d'utilisation"
                intro="Les règles du jeu pour utiliser ORIVY. En créant un compte, tu les acceptes."
                sections={[
        { titre: 'Ce que propose ORIVY', contenu: <>
            <p>ORIVY aide à découvrir des lieux (parcs, musées, randonnées, restaurants…) et à organiser des sorties
               entre personnes qui ne se connaissent pas forcément : créer une sortie, s'y inscrire, discuter, partager des photos.
               Le service est gratuit.</p>
        </> },
        { titre: 'Ton compte', contenu: <>
            <ul>
                <li>Tu dois avoir <strong>au moins 15 ans</strong> pour créer un compte.</li>
                <li>Les informations que tu donnes doivent être exactes. Un compte = une personne.</li>
                <li>Ton mot de passe est personnel : garde-le pour toi. Tu es responsable de ce qui est fait avec ton compte.</li>
                <li>Tu peux <strong>supprimer ton compte</strong> à tout moment depuis ton profil (Compte → Supprimer mon compte).</li>
            </ul>
        </> },
        { titre: 'Les sorties', contenu: <>
            <ul>
                <li>ORIVY met des personnes en relation : <strong>chaque participant reste responsable de lui-même</strong> pendant
                    une sortie. ORIVY n'organise pas les sorties et n'y assiste pas.</li>
                <li>Conseils de prudence : rencontre-toi dans des lieux publics, préviens un proche, ne partage pas ton adresse.</li>
                <li>L'organisateur s'engage à décrire honnêtement la sortie (lieu, date, nombre de places) et à prévenir s'il l'annule.</li>
                <li>Les sorties payantes ou commerciales ne sont pas autorisées sans accord de l'éditeur.</li>
            </ul>
        </> },
        { titre: 'Ce que tu publies', contenu: <>
            <ul>
                <li>Tu restes propriétaire de tes photos, vidéos, avis et messages. En les publiant, tu autorises ORIVY à les
                    afficher sur le site (album de la sortie, fil, ton profil) tant qu'ils y sont.</li>
                <li>Tu ne publies que ce que tu as le droit de publier : pas de photo d'une personne reconnaissable sans son accord.</li>
                <li>Sont interdits : les propos haineux, le harcèlement, les menaces, la nudité, la violence, la publicité,
                    les arnaques, les fausses informations et tout contenu illégal.</li>
            </ul>
        </> },
        { titre: 'Signalement, blocage et modération', contenu: <>
            <p>Tu peux <strong>signaler</strong> un membre ou une sortie et <strong>bloquer</strong> un membre : vous ne pourrez plus
               vous écrire ni vous suivre. L'équipe examine les signalements et peut retirer un contenu, ou suspendre
               et supprimer un compte qui ne respecte pas ces règles.</p>
        </> },
        { titre: 'Disponibilité et responsabilité', contenu: <>
            <p>ORIVY fait de son mieux pour que le site fonctionne, mais ne peut pas garantir qu'il soit disponible à tout moment
               ni que les informations sur les lieux (horaires, accès, météo) soient toujours exactes : vérifie-les avant de partir.</p>
        </> },
        { titre: 'Évolution des conditions', contenu: <>
            <p>Ces conditions peuvent évoluer. En cas de changement important, tu en seras informé·e sur le site.
               Elles sont soumises au droit français.</p>
        </> },
    ]} />
);

/* ===================================================================== CONFIDENTIALITÉ */
export const Confidentialite = () => (
    <PageLegale chemin="/confidentialite" titre="Politique de confidentialité"
                intro="Quelles données ORIVY garde sur toi, pourquoi, et comment exercer tes droits (RGPD)."
                sections={[
        { titre: 'Responsable du traitement', contenu: <>
            <p>[À COMPLÉTER : nom de l'éditeur], joignable à <strong>[À COMPLÉTER : e-mail de contact]</strong>.</p>
        </> },
        { titre: 'Les données collectées', contenu: <>
            <ul>
                <li><strong>Ton compte</strong> : prénom, nom, adresse e-mail, mot de passe (jamais stocké en clair : seulement
                    une empreinte chiffrée), ville. Si tu les ajoutes : photo de profil, présentation (bio).</li>
                <li><strong>Ton activité</strong> : les sorties que tu crées ou rejoins, ta place en liste d'attente, tes messages,
                    commentaires et avis, les photos et vidéos que tu publies, tes favoris, tes abonnements, les membres que tu
                    bloques, tes signalements, tes notifications.</li>
                <li><strong>Ta position</strong> : seulement si tu cliques sur « Me localiser », et seulement le temps de calculer
                    les distances dans ton navigateur. Elle n'est pas envoyée ni enregistrée sur nos serveurs.</li>
            </ul>
        </> },
        { titre: 'Pourquoi', contenu: <>
            <ul>
                <li>Faire fonctionner le service : ton compte, tes sorties, la messagerie, le fil (exécution des conditions d'utilisation).</li>
                <li>Te prévenir : rappel la veille d'une sortie, nouvel abonné, nouveau message (exécution du service).</li>
                <li>La sécurité et la modération : traiter les signalements, empêcher les abus (intérêt légitime).</li>
            </ul>
            <p>ORIVY ne vend pas tes données, ne fait pas de publicité ciblée et n'utilise aucun outil de mesure d'audience.</p>
        </> },
        { titre: 'Qui les voit', contenu: <>
            <ul>
                <li><strong>Les autres membres</strong> voient ton prénom, ton nom, ta ville, ta photo, ta bio, tes sorties, tes photos
                    et vidéos publiées, tes avis et tes compteurs d'abonnés. Jamais ton e-mail ni ton mot de passe.</li>
                <li>Tes <strong>messages</strong> ne sont visibles que par la personne à qui tu écris.</li>
                <li>L'<strong>équipe d'administration</strong>, pour la modération et le support.</li>
                <li>L'<strong>hébergeur</strong>, qui stocke techniquement les données : [À COMPLÉTER].</li>
            </ul>
        </> },
        { titre: 'Services extérieurs', contenu: <>
            <p>Pour afficher certaines informations, ton navigateur contacte directement : OpenStreetMap (fonds de carte),
               l'API Géo et l'API Adresse de l'État (recherche de ville, adresse d'un lieu), Open-Meteo (météo d'une sortie)
               et Wikimedia Commons (photos de lieux). Ces services reçoivent ton adresse IP, comme pour toute page web,
               mais aucune donnée de ton compte.</p>
        </> },
        { titre: 'Combien de temps', contenu: <>
            <ul>
                <li>Tant que ton compte existe. Quand tu le supprimes, <strong>tout est effacé immédiatement</strong> : ton compte,
                    les sorties que tu organises, tes messages, photos, avis, favoris, abonnements et signalements.</li>
                <li>[À VÉRIFIER : sauvegardes de l'hébergeur, effacées sous X jours.]</li>
            </ul>
        </> },
        { titre: 'Stockage dans ton navigateur', contenu: <>
            <p>ORIVY n'utilise <strong>pas de cookies</strong> publicitaires ni de mesure d'audience. Le site garde seulement, dans
               le stockage local de ton navigateur : ta connexion (pour ne pas te redemander ton mot de passe à chaque visite),
               le thème choisi, les décorations saisonnières et les catégories de la carte. Ces éléments sont nécessaires au
               fonctionnement du site et ne demandent donc pas de consentement. Tu peux les effacer en te déconnectant ou
               depuis les réglages de ton navigateur.</p>
        </> },
        { titre: 'Sécurité', contenu: <>
            <p>Les mots de passe sont chiffrés (empreinte BCrypt), la connexion utilise un jeton signé qui expire au bout de
               24 heures, et le site est servi en HTTPS [À VÉRIFIER à la mise en ligne].</p>
        </> },
        { titre: 'Tes droits', contenu: <>
            <p>Tu peux accéder à tes données, les corriger (depuis ton profil), les supprimer (Supprimer mon compte), t'opposer à
               un traitement ou demander à les récupérer : écris à [À COMPLÉTER : e-mail]. Réponse sous un mois.</p>
            <p>Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (cnil.fr).</p>
        </> },
    ]} />
);
