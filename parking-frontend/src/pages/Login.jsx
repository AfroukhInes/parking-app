import { useState } from "react";
import api from "../api/axios";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setError("");

      const res = await api.post("api/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if(res.data.role === "USER") window.location.href="/user";
      if(res.data.role === "ADMIN") window.location.href="/admin/dashboard";
      if(res.data.role === "AGENT") window.location.href="/agent/check";
      
    } catch (e) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-center mb-6">
          Connexion 🚗
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">

          <input
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            type="email"
            onChange={e=>setEmail(e.target.value)}
          />

          <input
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mot de passe"
            type="password"
            onChange={e=>setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
          Vous avez pas un compte ?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            S'inscrire
          </a>
        </p>
        </div>

      </div>
    </div>
  );
}
