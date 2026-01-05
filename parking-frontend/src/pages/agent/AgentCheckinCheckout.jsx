import { useState } from "react";
import api from "../../api/axios";

export default function AgentCheckinCheckout() {

  const [code, setCode] = useState("");
  const [finalPrice, setFinalPrice] = useState(null);
  const [hours, setHours] = useState(null);

  const checkin = async () => {
    try {
      const res = await api.post("/api/reservations/agent/checkin", { code });
      alert(res.data.message);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Check-in failed";
      alert(message);
    }
  };

  const checkout = async () => {
    try {
      const res = await api.post("/api/reservations/agent/checkout", { code });

      setFinalPrice(res.data.final_price);
      setHours(res.data.hours);

    } catch (err) {
      const message =
        err?.response?.data?.message || "Checkout failed";
      alert(message);
      setFinalPrice(null);
      setHours(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200">

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-7">

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Agent Panel 🛂
        </h2>

        <p className="text-center text-gray-500 mt-1 mb-6">
          Verify and manage vehicle entry & exit
        </p>

        <label className="text-sm font-semibold text-gray-700">
          Reservation Code
        </label>

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setFinalPrice(null);
            setHours(null);
          }}
          placeholder="Enter reservation code"
          className="w-full mt-2 mb-4 px-4 py-2.5 rounded-xl border"
        />

        <div className="grid grid-cols-2 gap-4 mt-3">
          <button
            onClick={checkin}
            className="py-2.5 rounded-xl font-semibold bg-green-600 text-white"
          >
            CHECK-IN
          </button>

          <button
            onClick={checkout}
            className="py-2.5 rounded-xl font-semibold bg-red-600 text-white"
          >
            CHECK-OUT
          </button>
        </div>

        {finalPrice !== null && (
          <div className="mt-8 w-full max-w-lg mx-auto bg-green-50 border border-green-300 rounded-2xl shadow-xl p-6 text-center">

            <div className="text-3xl font-extrabold text-green-700">
              🎉 Checkout completed
            </div>

            <div className="mt-3 text-gray-700 text-lg">
              ⏱ Duration: <span className="font-bold">{hours}</span> hour(s)
            </div>

            <div className="mt-4 text-4xl font-black text-green-800 animate-pulse">
              💰 {finalPrice} DA
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
