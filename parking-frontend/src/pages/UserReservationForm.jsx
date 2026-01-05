import { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserReservationForm() {

  const [spots, setSpots] = useState([]);
  const [spot_id, setSpot] = useState("");
  const [car_plate, setPlate] = useState("");

  // Charger les places disponibles
  useEffect(() => {
    const loadSpots = async () => {
      try {
        const res = await api.get("/api/parking/spots");
        setSpots(res.data);
      } catch (err) {
        alert("Erreur lors du chargement des places");
      }
    };

    loadSpots();
  }, []);

  const reserve = async () => {

    if (!spot_id) {
      alert("Choisissez une place");
      return;
    }

    if (!car_plate) {
      alert("Entrez la matricule de la voiture");
      return;
    }

    try {
      // user_id vient du token côté backend (pas besoin ici)
      const res = await api.post("/api/reservations", {
        spot_id,
        car_plate
      });

      alert("Réservation créée ✔️ Code : " + res.data.unique_code);
    } catch (err) {
      alert("Erreur réservation");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">

      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8">

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center">
          🚗 Réserver une place de parking
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Choisissez une place et entrez la matricule de votre véhicule
        </p>

        {/* Warning message */}
        <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-2xl p-4 text-yellow-900">

          <p className="font-bold text-lg flex items-center gap-2">
            ⏰ Votre réservation est valable 1 heure
          </p>

          <p className="mt-1">
            Si vous ne validez pas l’entrée dans ce délai, la réservation sera automatiquement annulée.
          </p>

          <p className="mt-1">
            🔔 Un rappel vous sera envoyé 15 minutes avant l’annulation.
          </p>

          
        </div>

        {/* Select */}
        <label className="text-sm font-medium text-gray-700">
          Place disponible
        </label>

        <select
          value={spot_id}
          onChange={e => setSpot(e.target.value)}
          className="w-full mt-1 border rounded-2xl px-3 py-2 bg-gray-50 hover:bg-white focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Sélectionner une place --</option>

          {spots.map(s => (
            <option key={s.id} value={s.id}>
              Étage {s.floor} — Section {s.section} — Place {s.spot_number}
            </option>
          ))}
        </select>

        {/* Input */}
        <label className="text-sm font-medium text-gray-700 mt-4 block">
          Matricule voiture
        </label>

        <input
          placeholder="ex: 123 456 07"
          value={car_plate}
          onChange={e => setPlate(e.target.value)}
          className="w-full mt-1 border rounded-2xl px-3 py-2 bg-gray-50 hover:bg-white focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}
        <button
          onClick={reserve}
          className="w-full mt-6 py-3 rounded-2xl font-semibold tracking-wide
          bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
        >
          ✔️ Confirmer la réservation
        </button>
      </div>
    </div>
  );
}
