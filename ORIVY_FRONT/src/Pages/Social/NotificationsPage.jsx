import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bouton from '../../Composants/Bouton.jsx';
import Icone from '../../Composants/Icone.jsx';
import { EtatVide, Chargement } from '../../Composants/Etats.jsx';
import { getNotifications, markNotificationAsRead } from '../../Services/Notification/NotificationService.js';
import { ilYa } from '../../Utils/dates.js';


const ICONE_DU_TYPE = { inscription: 'utilisateurs', commentaire: 'commentaire', 'sortie-modifiee': 'calendrier' };

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(null);   // null = chargement

    useEffect(() => {
        getNotifications().then(setNotifications).catch(() => setNotifications([]));
    }, []);

    const ouvrir = async (n) => {
        if (!n.lue) await markNotificationAsRead(n.id).catch(() => {});
        navigate(n.lien);
    };

    const toutMarquerLu = async () => {
        const nonLues = notifications.filter((n) => !n.lue);
        await Promise.all(nonLues.map((n) => markNotificationAsRead(n.id)));
        setNotifications(notifications.map((n) => ({ ...n, lue: true })));
    };

    if (notifications === null) return <main className="conteneur page-notifications"><Chargement /></main>;

    return (
        <main className="conteneur page-notifications">
            <div className="section-titre" style={{ marginTop: 'var(--espace-5)' }}>
                <h1 style={{ margin: 0 }}>Notifications</h1>
                {notifications.some((n) => !n.lue) && (
                    <Bouton variante="fantome" icone="valider" onClick={toutMarquerLu}>Tout marquer comme lu</Bouton>
                )}
            </div>

            {notifications.length === 0 ? (
                <EtatVide icone="cloche" titre="Tout est calme"
                          action={<Bouton variante="secondaire" icone="calendrier" vers="/sorties">Voir les sorties</Bouton>}>
                    Tu seras prévenu·e ici quand quelqu'un rejoindra tes sorties ou les commentera.
                </EtatVide>
            ) : (
                <section className="notifs-groupe">
                    <ul className="notifs">
                        {notifications.map((n) => (
                            <li key={n.id} className={`notif${n.lue ? '' : ' notif--non-lue'}`}>
                                <span className="notif__type">
                                    <span className="etat__icone" style={{ width: 'var(--cible-min)', height: 'var(--cible-min)' }} aria-hidden="true">
                                        <Icone nom={ICONE_DU_TYPE[n.type] || 'cloche'} />
                                    </span>
                                </span>
                                <div>
                                    <p className="notif__texte">
                                        <button type="button" className="lien-bouton" onClick={() => ouvrir(n)}>{n.texte}</button>
                                    </p>
                                    <span className="notif__heure">{ilYa(n.dateCreation)}</span>
                                </div>
                                {n.lue ? <span /> : <span className="notif__point"><span className="visuellement-cache">Non lue</span></span>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
};

export default NotificationsPage;
