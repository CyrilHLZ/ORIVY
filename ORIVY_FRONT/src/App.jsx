import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/Route.jsx';
import Entete from './Pages/Navigation/Entete.jsx';
import BarreOnglets from './Pages/Navigation/BarreOnglets.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import { FavorisProvider } from './Context/FavorisContext.jsx';
import RetourHaut from './Composants/RetourHaut.jsx';

const App = () => {
    return (
        <AuthProvider>
            <FavorisProvider>
            <BrowserRouter>
                {/* En haut : logo, onglets (ordinateur), recherche, notifications, compte */}
                <Entete />
                <AppRoutes />
                {/* En bas (mobile et tablette) : les 5 onglets au pouce */}
                <BarreOnglets />
                {/* Bouton « retour en haut » et barre de lecture (96, 97) */}
                <RetourHaut />
            </BrowserRouter>
            </FavorisProvider>
        </AuthProvider>
    );
};

export default App;
