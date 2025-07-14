import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; 
import API from "../api/axios";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post("/api/auth/login", form); // use API instead of axios
    login({ username: res.data.username, userId: res.data.userId }, res.data.token);
    toast.success("Login successful!");
    navigate("/dashboard");
  } catch (err) {
    toast.error("Login failed: " + (err.response?.data?.error || err.message));
  }
};

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
