import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/api/reservations/users")
      .then(res => setUsers(res.data))
      .catch(() => alert("Cannot load users"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-16 flex justify-center">
       

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8">
        <button
         onClick={() => (window.location.href = "/admin/dashboard")}
         className="mb-4 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-900 active:scale-95 transition">
          ← Back to Dashboard
       </button> 
       
        <h2 className="text-3xl font-bold text-center mb-6">
          👥 Users Management
        </h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 font-semibold">{u.role}</td>
                <td className="p-3">{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}
