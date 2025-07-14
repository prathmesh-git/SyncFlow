import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-logo">🗂️ SyncFlow</h1>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">Hi, {user?.username}</span>
        <button onClick={onLogout} className="navbar-logout">Logout</button>
      </div>
    </nav>
  );
}
