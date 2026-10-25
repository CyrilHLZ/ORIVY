import Bouton from '../../Composants/Bouton.jsx';
import { EtatVide } from '../../Composants/Etats.jsx';

/*
 * Notifications (maquette design/maquettes/notifications.html).
 * Le back n'a pas encore de modèle Notification : état vide en attendant.
 * Le service Services/Notification/NotificationService.js est déjà prêt
 * (getNotifications, markNotificationAsRead…) ; reprendre la maquette
 * (classes .notifs-groupe, .notif, .notif--non-lue) quand l'API répondra.
 */
const NotificationsPage = () => (
    <main className="conteneur page-notifications">
        <h1 className="page-titre">Notifications</h1>
        <EtatVide icone="cloche" titre="Tout est calme"
                  action={<Bouton variante="secondaire" icone="calendrier" vers="/sorties">Voir les sorties</Bouton>}>
            Tu seras prévenu·e ici quand quelqu'un rejoindra tes sorties ou les commentera.
        </EtatVide>
    </main>
);

export default NotificationsPage;
