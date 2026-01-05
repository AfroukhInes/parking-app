import { useState } from "react";
import api from "../api/axios";

export default function Register() {

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
  try {
    await api.post("api/auth/signup", form);
    alert("Compte créé avec succès");
    window.location.href = "/login";
  } catch (err) {
    alert("Erreur lors de l'inscription");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Créer un compte
        </h2>

        <div className="flex flex-col gap-4">

          <input
            name="full_name"
            placeholder="Nom complet"
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={register}
            className="bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition"
          >
            S'inscrire
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Vous avez déjà un compte ?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </a>
        </p>

      </div>
    </div>
  );
}
