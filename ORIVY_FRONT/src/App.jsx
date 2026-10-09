import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/Route.jsx';
import Navbar from './Pages/Navigation/Navbar.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import './Styles/App.css';
import './Styles/DesignSystem.css';
import './Styles/PageLayout.css';
import './Styles/OrivyTechTheme.css';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
