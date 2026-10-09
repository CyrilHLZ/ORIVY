import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import HomePage from '../Pages/HomePage.jsx';
import ActivitePage from '../Pages/Main/ActivitePage.jsx';
import CartePage from '../Pages/Main/CartePage.jsx';
import CreateActivitePage from '../Pages/Main/CreateActivitePage.jsx';
import ConnexionPage from '../Pages/Utilisateur/ConnexionPage.jsx';
import InscriptionPage from '../Pages/Utilisateur/InscriptionPage.jsx';
import AdminPage from '../Pages/Main/AdminPage.jsx';

const NotFoundPage = () => (
	<main className="page-shell">
		<header className="page-heading">
			<p className="eyebrow">Erreur 404</p>
			<h1>Cette page n'existe pas</h1>
			<p className="page-intro">Retournez aux activités pour continuer votre découverte.</p>
		</header>
	</main>
);

const RequireAdmin = ({ children }) => {
	const { isAdmin } = useAuth();
	return isAdmin ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => (
	<Routes>
		<Route path="/" element={<HomePage />} />
		<Route path="/activites" element={<ActivitePage />} />
		<Route path="/activites/creation" element={<RequireAdmin><CreateActivitePage /></RequireAdmin>} />
		<Route path="/carte" element={<CartePage />} />
		<Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
		<Route path="/connexion" element={<ConnexionPage />} />
		<Route path="/inscription" element={<InscriptionPage />} />
		<Route path="*" element={<NotFoundPage />} />
	</Routes>
);

export default AppRoutes;
