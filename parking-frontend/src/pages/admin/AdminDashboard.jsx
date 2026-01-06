import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminDashboard() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/api/reservations")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 pt-16 flex justify-center">

    {/* Logout */}
    <button
      onClick={() => {
        localStorage.clear();
        window.location.href = "/login";
      }}
      className="absolute top-5 right-5 px-4 py-2 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 active:scale-95 transition"
    >
      Logout
    </button>
    
    {/* Main container */}
    <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">

      <h2 className="text-4xl font-extrabold text-center text-gray-800">
        Admin Dashboard 🛠️
      </h2>

      <p className="text-center text-gray-500 mt-1 mb-6">
        View and manage all reservations and users
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {data.map(r => (
          <div
            key={r.id}
            className="bg-white shadow-md rounded-2xl border hover:shadow-xl transition p-6"
          >

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-lg font-bold text-gray-800">
                Reservation #{r.id}
              </p>

              <span className={
                "px-3 py-1.5 rounded-full text-xs font-bold tracking-wide " +
                (r.status === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : r.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700")
              }>
                {r.status || "UNKNOWN"}
              </span>
            </div>

            {/* Details list */}
            <div className="text-sm text-gray-700 space-y-1.5">

              <p>
                👤 <span className="font-semibold">{r.full_name}</span> — {r.email}
              </p>

              <p>
                🧑‍💼 Role: <span className="font-semibold">{r.role}</span>
              </p>

              <p>
                🚗 Plate: <span className="font-semibold">{r.car_plate || "—"}</span>
              </p>

              <p>
                🅿️ Spot: floor {r.floor}, section {r.section}, n° {r.spot_number}
              </p>

              <p>
                💰 Final price: <span className="font-semibold">{r.final_price ?? "—"}</span>
              </p>

              <p>
                ⏱️ Check-in: {r.check_in || "—"}
              </p>

              <p>
                🕒 Check-out: {r.check_out || "—"}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  </div>
);

}
