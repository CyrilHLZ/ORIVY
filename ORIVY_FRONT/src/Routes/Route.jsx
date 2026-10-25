import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import HomePage from '../Pages/HomePage.jsx';
import ActivitePage from '../Pages/Main/Activite/ActivitePage.jsx';
import CartePage from '../Pages/Main/Activite/CartePage.jsx';
import CreateActivitePage from '../Pages/Main/Activite/CreationActivitePage.jsx';
import ModifierActivitePage from '../Pages/Main/Activite/ModifierActivitePage.jsx';
import CreationSortiePage from '../Pages/Main/Social/CreationSortiePage.jsx';
import ModificationSortiePage from '../Pages/Main/Social/ModificationSortiePage.jsx';
import SortiePage from '../Pages/Main/Social/SortiePage.jsx';
import SocialPage from '../Pages/Main/Social/SocialPage.jsx';
import ConnexionPage from '../Pages/Utilisateur/ConnexionPage.jsx';
import InscriptionPage from '../Pages/Utilisateur/InscriptionPage.jsx';
import AdminPage from '../Pages/Main/Admin/AdminPage.jsx';
import Catalogue from '../Pages/Catalogue.jsx';
import PageIntrouvable from '../Pages/PageIntrouvable.jsx';
import ProfilPage from '../Pages/Utilisateur/ProfilPage.jsx';
import CommunautePage from '../Pages/Social/CommunautePage.jsx';
import MessagesPage from '../Pages/Social/MessagesPage.jsx';
import NotificationsPage from '../Pages/Social/NotificationsPage.jsx';

const RequireAdmin = ({ children }) => {
	const { isAdmin } = useAuth();
	return isAdmin ? children : <Navigate to="/" replace />;
};

const RequireAuth = ({ children }) => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? children : <Navigate to="/connexion" replace />;
};

const AppRoutes = () => (
	<Routes>
		<Route path="/" element={<HomePage />} />
		<Route path="/activites" element={<ActivitePage />} />
		<Route path="/activites/creation" element={<RequireAdmin><CreateActivitePage /></RequireAdmin>} />
		<Route path="/activites/modification/:id" element={<RequireAdmin><ModifierActivitePage /></RequireAdmin>} />
		<Route path="/carte" element={<CartePage />} />
		<Route path="/sorties" element={<SocialPage />} />
		<Route path="/sorties/creation" element={<RequireAuth><CreationSortiePage /></RequireAuth>} />
		<Route path="/sorties/modification/:id" element={<RequireAuth><ModificationSortiePage /></RequireAuth>} />
		<Route path="/sorties/:id" element={<SortiePage />} />
		<Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
		<Route path="/profil" element={<RequireAuth><ProfilPage /></RequireAuth>} />
		<Route path="/profil/:id" element={<RequireAuth><ProfilPage /></RequireAuth>} />
		<Route path="/communaute" element={<RequireAuth><CommunautePage /></RequireAuth>} />
		<Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
		<Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
		<Route path="/connexion" element={<ConnexionPage />} />
		<Route path="/inscription" element={<InscriptionPage />} />
		{/* Catalogue des composants (outil de développement) */}
		<Route path="/composants" element={<Catalogue />} />
		<Route path="*" element={<PageIntrouvable />} />
	</Routes>
);

export default AppRoutes;
