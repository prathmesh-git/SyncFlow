import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="/" className="navbar-logo-link">
      <img src="./src/assets/syncflow_icon.svg" alt="Synflow Logo" width="32" height="32" />
        <span className="navbar-logo">Syncflow</span>
      </a>

      </div>
      <div className="navbar-right">
        <span className="navbar-user">Hi, {user?.username}</span>
        <button onClick={onLogout} className="navbar-logout">Logout</button>
      </div>
    </nav>
  );
}
