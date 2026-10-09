import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import '../../Styles/Navigation/Navbar.css';

const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();

    return (
        <nav className="app-nav" aria-label="Navigation principale">
            <NavLink className="brand" to="/">ORIVY</NavLink>
            <div className="nav-links">
                <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} end to="/">Accueil</NavLink>
                <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/activites">Activités</NavLink>
                {isAdmin && <>
                    <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/admin">Admin</NavLink>
                    <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/activites/creation">Créer une activité</NavLink>
                </>}
                <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/carte">Carte</NavLink>
                {user ? <button type="button" onClick={logout}>Déconnexion</button> : <>
                    <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/connexion">Connexion</NavLink>
                    <NavLink className={({ isActive }) => isActive ? 'is-current' : ''} to="/inscription">Inscription</NavLink>
                </>}
            </div>
        </nav>
    );
}

export default Navbar;