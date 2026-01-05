const cron = require("node-cron");
const pool = require("../db"); // ← IMPORTANT : on réutilise ta connexion existante

console.log("🚀 Cron scheduler loaded");

// 🔔 1) Rappel 15 minutes avant expiration
cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking reservations that expire in 15 minutes…");

  try {
    const res = await pool.query(
      `
      SELECT id, user_id, end_time
      FROM reservations
      WHERE end_time - NOW() <= INTERVAL '15 minutes'
      AND end_time > NOW()
      AND status = 'PENDING'
      AND (reminder_sent IS FALSE OR reminder_sent IS NULL)
      `
    );

    for (const r of res.rows) {
      console.log(
        `⚠️ Reminder → reservation ${r.id} for user ${r.user_id} expires at ${r.end_time}`
      );

      // 👉 ici plus tard: envoyer email / notification

      // on marque rappel envoyé
      await pool.query(
        "UPDATE reservations SET reminder_sent = TRUE WHERE id = $1",
        [r.id]
      );
    }
  } catch (err) {
    console.error("❌ Error in reminder cron:", err.message);
  }
});

// ❌ 2) Annulation automatique des réservations expirées
cron.schedule("* * * * *", async () => {
  console.log("🗑️ Cancelling expired reservations…");

  try {
    await pool.query(
      `
      UPDATE reservations
      SET status = 'CANCELLED'
      WHERE end_time < NOW()
      AND status = 'PENDING'
      `
    );

    console.log("✔️ Expired reservations cancelled");
  } catch (err) {
    console.error("❌ Error in cancel cron:", err.message);
  }
});
