import { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserHistory() {

  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/reservations/me")
      .then(r => setList(r.data))
      .catch(() => alert("Unable to load your reservation history"));
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "FINISHED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="py-6">

      <h2 className="text-2xl font-bold text-center mb-6">
        My reservations history
      </h2>

      {list.length === 0 && (
        <p className="text-center text-gray-500">
          No reservations yet.
        </p>
      )}

      <div className="space-y-3">
        {list.map(r => (
          <div key={r.id} className="bg-white shadow rounded-xl p-4">

            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                Reservation #{r.id}
              </span>

              <span className={`px-3 py-1 rounded-full text-sm ${statusColor(r.status)}`}>
                {r.status}
              </span>
            </div>

            <p>🚗 Car plate: <b>{r.car_plate}</b></p>

            <p>🅿️ Spot: floor {r.floor} — section {r.section} — Nº {r.spot_number}</p>

            <p>⏱️ Check-in: {r.check_in || "—"}</p>

            <p>🕒 Check-out: {r.check_out || "—"}</p>

            <p>💵 Price: {r.final_price || "—"}</p>


          </div>
        ))}
      </div>
    </div>
  );
}
