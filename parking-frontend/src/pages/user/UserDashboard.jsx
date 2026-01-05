import { useState } from "react";
import UserReservationForm from "../UserReservationForm";
import UserHistory from "../UserHistory";
import UserNotifications from "../UserNotifications";

export default function UserDashboard() {

  const [tab, setTab] = useState("reserve");

  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 flex items-start justify-center pt-16">

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

    {/* Main Card */}
    <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl shadow-2xl border border-indigo-50 rounded-3xl p-8">

      <h2 className="text-4xl font-extrabold text-center text-gray-800">
        User Dashboard 🚗
      </h2>

      <p className="text-center text-gray-500 mt-2 mb-6">
        Manage your reservations, history, and notifications
      </p>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">

        <button
          onClick={() => setTab("reserve")}
          className={`px-5 py-2.5 rounded-2xl font-semibold shadow-sm border transition
          ${tab === "reserve"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          ➕ Reserve
        </button>

        <button
          onClick={() => setTab("history")}
          className={`px-5 py-2.5 rounded-2xl font-semibold shadow-sm border transition
          ${tab === "history"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          🕓 History
        </button>

        <button
          onClick={() => setTab("notifications")}
          className={`px-5 py-2.5 rounded-2xl font-semibold shadow-sm border transition
          ${tab === "notifications"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          🔔 Notifications
        </button>

      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border shadow p-6">
        {tab === "reserve" && <UserReservationForm />}
        {tab === "history" && <UserHistory />}
        {tab === "notifications" && <UserNotifications />}
      </div>

    </div>
  </div>
);

}
