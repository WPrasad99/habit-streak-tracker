// src/components/Navbar.jsx

import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" id="nav-brand">
        <span>🔥</span>
        HabitStreak
      </div>
      <div className="navbar-actions">
        {user && (
          <>
            <span className="timezone-badge">🌍 {user.timezone}</span>
            <button
              id="btn-logout"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
