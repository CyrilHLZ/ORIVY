import Bouton from '../../Composants/Bouton.jsx';
import { EtatVide } from '../../Composants/Etats.jsx';

/*
 * Messages (maquette design/maquettes/messages.html).
 * Le back n'a pas encore de messagerie : on affiche un état vide honnête.
 * Quand l'API existera (ex. GET /api/conversations), reprendre la maquette :
 * liste des conversations + fil de bulles (classes .conversations, .bulle, .saisie-message).
 */
const MessagesPage = () => (
    <main className="conteneur">
        <h1 className="page-titre">Messages</h1>
        <EtatVide icone="messages" titre="La messagerie arrive bientôt"
                  action={<Bouton variante="secondaire" icone="calendrier" vers="/sorties">Voir les sorties</Bouton>}>
            Tu pourras bientôt écrire aux membres et aux organisateurs de sorties.
            En attendant, laisse un commentaire sur la page d'une sortie.
        </EtatVide>
    </main>
);

export default MessagesPage;
