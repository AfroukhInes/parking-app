const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const parkingRoutes = require("./routes/parking");
const reservationRoutes = require("./routes/reservations");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.send("Parking API running 🚗");
});

const PORT = process.env.PORT || 5000;
require("./cron/reservations.cron"); 
const cron = require("node-cron");
const pool = require("./db");

// tâche toutes les minutes
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ checking expiring reservations...");

    // sélection : réservations qui expirent dans 15 min
    const result = await pool.query(
      `
      SELECT * FROM reservations
      WHERE end_time - NOW() <= INTERVAL '15 minutes'
      AND end_time > NOW()
      AND status = 'PENDING'
      AND reminder_sent = false
      `
    );

    for (const r of result.rows) {
      console.log("⚠️ reminder for reservation:", r.id);

      // ici normalement → envoyer email / notif
      // pour l’instant on log seulement

      // marquer rappel envoyé
      await pool.query(
        "UPDATE reservations SET reminder_sent=true WHERE id=$1",
        [r.id]
      );
    }
  } catch (err) {
    console.error("CRON ERROR", err);
  }
});


// annulation automatique si expirée
// 🕒 annulation + libération places
cron.schedule("* * * * *", async () => {
  try {
    // récupérer réservations expirées
    const expired = await pool.query(
      `
      SELECT id, spot_id FROM reservations
      WHERE end_time < NOW()
      AND status != 'CONFIRMED'
      AND status != 'CANCELLED'
      `
    );

    for (const r of expired.rows) {
      // annuler réservation
      await pool.query(
        "UPDATE reservations SET status='CANCELLED' WHERE id=$1",
        [r.id]
      );

      // libérer place
      await pool.query(
        "UPDATE parking_spots SET is_active=true WHERE id=$1",
        [r.spot_id]
      );

      console.log("🚮 cancelled & freed spot", r.spot_id);
    }
  } catch (err) {
    console.error(err);
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
