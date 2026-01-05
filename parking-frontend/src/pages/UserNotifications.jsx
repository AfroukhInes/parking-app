import { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserNotifications() {

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/api/reservations/notifications/me");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load notifications");
    }
  };

  // ----------- LOAD USER NOTIFICATIONS -----------
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ----------- SILENTLY TRIGGER /expiring -----------
  useEffect(() => {
    const checkExpiring = () => {
      fetch("http://localhost:5000/api/reservations/expiring")
        .then(() => {})
        .catch(() => {});
    };

    // run once immediately
    checkExpiring();

    // run every 60s
    const interval = setInterval(checkExpiring, 60000);

    return () => clearInterval(interval);
  }, []);

  // ----------- ACTIONS -----------

  const confirm = async (notification_id, reservation_id) => {
    const res = await api.post(
      `/api/reservations/notifications/${notification_id}/confirm`,
      { reservation_id }
    );

    const newEndTime = res.data.new_end_time;

    setNotifications(prev =>
      prev.map(n =>
        n.notification_id === notification_id
          ? {
              ...n,
              is_read: true,
              status: "CONFIRMED",
              message: "",
              end_time: newEndTime
            }
          : n
      )
    );
  };

  const cancel = async (notification_id, reservation_id) => {
    await api.post(
      `/api/reservations/notifications/${notification_id}/cancel`,
      { reservation_id }
    );

    setNotifications(prev =>
      prev.map(n =>
        n.notification_id === notification_id
          ? {
              ...n,
              is_read: true,
              status: "CANCELLED",
              message: ""
            }
          : n
      )
    );
  };

  // ----------- UI -----------

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-3xl font-bold text-center mb-8">
          Expiration Notifications
        </h2>

        {notifications.length === 0 && (
          <div className="text-center text-gray-500 bg-white shadow rounded-xl p-6">
            No notifications yet.
          </div>
        )}

        <div className="space-y-4">

          {notifications.map(n => (
            <div
              key={n.notification_id}
              className="bg-white shadow rounded-xl p-6 border-l-4 border-yellow-400"
            >

              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  Reservation #{n.reservation_id || "-"}
                </h3>

                {!n.is_read ? (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    New
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Read
                  </span>
                )}
              </div>

              {!n.is_read && <p className="mt-1">{n.message}</p>}

              {n.status === "CONFIRMED" && (
                <p className="text-green-700 font-semibold mt-2">
                  ✅ Reservation extended by 15 minutes
                </p>
              )}

              {n.status === "CANCELLED" && (
                <p className="text-red-700 font-semibold mt-2">
                  ❌ Reservation cancelled
                </p>
              )}

              <div className="text-sm text-gray-700 mt-2 space-y-1">
                <p>🚗 Car: {n.car_plate}</p>
                <p>🅿 Floor {n.floor} — Section {n.section} — Nº {n.spot_number}</p>

                {n.end_time && (
                  <p>
                    ⏳ Ends: {new Date(n.end_time).toLocaleString()}
                  </p>
                )}
              </div>

              {!n.is_read && (
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() =>
                      confirm(n.notification_id, n.reservation_id)
                    }
                    className="px-3 py-2 rounded-lg bg-green-600 text-white"
                  >
                    ✅ Confirm
                  </button>

                  <button
                    onClick={() =>
                      cancel(n.notification_id, n.reservation_id)
                    }
                    className="px-3 py-2 rounded-lg bg-red-600 text-white"
                  >
                    ❌ Cancel
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
