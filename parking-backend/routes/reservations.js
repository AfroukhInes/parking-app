const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// regex matricule algerien
const algerianPlate = /^[0-9]{1,5}-[0-9]{3}-[0-9]{2}$/;

// regex plaque étrangère simple
const foreignPlate = /^[A-Za-z0-9\-]{4,12}$/;
const auth = require("../middleware/auth");

/*
  ==========================
  CREATE RESERVATION  (POST)
  ==========================
*/
router.post("/", auth, async (req, res) => {

  try {
    const { spot_id, car_plate } = req.body;

    const user_id = req.user.id;


    // 1) vérifier si la place est déjà marquée occupée
    const spotCheck = await pool.query(
      "SELECT is_active FROM parking_spots WHERE id=$1",
      [spot_id]
    );

    if (spotCheck.rows.length === 0) {
      return res.status(404).json({ error: "Spot not found" });
    }

    if (spotCheck.rows[0].is_active === false) {
      return res.status(400).json({ error: "Spot already reserved" });
    }

    // 2) sécurité supplémentaire : vérifier réservations actives
    const alreadyReserved = await pool.query(
  `SELECT 1 FROM reservations
   WHERE spot_id = $1
   AND end_time > NOW()
   AND status IN ('PENDING','CONFIRMED')`,
  [spot_id]
);


    if (alreadyReserved.rows.length > 0) {
      return res.status(400).json({ error: "Spot already reserved" });
    }

    // 3) créer la réservation
    const reservation = await pool.query(
      `INSERT INTO reservations 
        (user_id, spot_id, car_plate, start_time, end_time, status, unique_code)
       VALUES 
        ($1,$2,$3,NOW(), NOW() + INTERVAL '1 hour','PENDING', md5(random()::text))
       RETURNING *`,
      [user_id, spot_id, car_plate]
    );

    // 4) marquer la place occupée
    await pool.query(
      "UPDATE parking_spots SET is_active=false WHERE id=$1",
      [spot_id]
    );

    res.json({
      message: "Reservation created for 1 hour",
      unique_code: reservation.rows[0].unique_code,
      reservation_id: reservation.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reservation failed" });
  }
});



/*
  ==================================
  GET ALL RESERVATIONS  (ADMIN VIEW)
  ==================================
*/

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    r.id,
    u.full_name,
    u.email,
    u.role,

    r.car_plate,
    r.spot_id,

    p.floor,
    p.section,
    p.spot_number,

    r.status,
    r.final_price,

    ps.check_in,
    ps.check_out

  FROM reservations r

  JOIN users u 
    ON r.user_id = u.id

  LEFT JOIN parking_spots p
    ON p.id = r.spot_id

  LEFT JOIN parking_sessions ps
    ON ps.reservation_id = r.id

  ORDER BY r.id DESC
`);


    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot fetch reservations" });
  }
});




/*
  ==========================================
  GET RESERVATION BY USER (HISTORY PAGE)
  ==========================================
*/

// 🟢 GET reservations of the connected user
router.get("/me", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT 
          r.id,
          r.car_plate,
          r.start_time,
          r.end_time,
          r.status,
          r.final_price,

          p.floor,
          p.section,
          p.spot_number,

          s.check_in,
          s.check_out

       FROM reservations r
       JOIN parking_spots p 
         ON r.spot_id = p.id

       LEFT JOIN parking_sessions s
         ON s.reservation_id = r.id

       WHERE r.user_id = $1
       ORDER BY r.start_time DESC`,
      [user_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot fetch your reservations" });
  }
});


// confirm → extend reservation 15 minutes
router.post("/notifications/:id/confirm", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // get reservation_id from notification
    const notif = await pool.query(
      `SELECT reservation_id 
       FROM notifications 
       WHERE id = $1`,
      [id]
    );

    if (notif.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const reservation_id = notif.rows[0].reservation_id;

    // update reservation & RETURN new end_time
    const updated = await pool.query(
      `UPDATE reservations
       SET status='CONFIRMED',
           end_time = end_time + INTERVAL '15 minutes'
       WHERE id=$1
       RETURNING end_time`,
      [reservation_id]
    );

    // mark notification as read
    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1`,
      [id]
    );

    res.json({
      message: "Reservation confirmed and extended 15 minutes",
      extended: true,
      new_end_time: updated.rows[0].end_time
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot confirm reservation" });
  }
});


// cancel arrivée 

router.post("/notifications/:id/cancel", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await pool.query(
      `SELECT id FROM notifications WHERE id=$1`,
      [id]
    );

    const reservation_id = notif.rows[0].id;

    await pool.query(`
        UPDATE reservations
        SET status='CANCELLED'
        WHERE id=$1
    `, [reservation_id]);

    await pool.query(`
        UPDATE notifications
        SET is_read=true
        WHERE id=$1
    `, [id]);

    res.json({ message: "Reservation cancelled" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot cancel reservation" });
  }
});



router.get("/expiring", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id AS reservation_id, user_id, end_time
      FROM reservations
      WHERE end_time - NOW() <= INTERVAL '15 minutes'
      AND end_time > NOW()
      AND status = 'PENDING'
    `);

    const expiring = result.rows;

    for (const r of expiring) {

      // avoid duplicates for the same reservation
      const exists = await pool.query(
        `SELECT 1 FROM notifications 
         WHERE reservation_id = $1
         AND type = 'EXPIRING'
        `,
        [r.reservation_id]
      );

      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, reservation_id, type, message)
           VALUES ($1,$2,'EXPIRING',$3)
          `,
          [
            r.user_id,
            r.reservation_id,
            "Your reservation will expire soon ⏰"
          ]
        );
      }
    }

    res.json(expiring);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching expiring reservations" });
  }
});

router.get("/notifications/me", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT 
          n.id AS notification_id,
          n.message,
          n.is_read,
          n.created_at,

          r.id AS reservation_id,
          r.car_plate,
          r.start_time,
          r.end_time,
          r.status,

          p.id AS spot_id,
          p.floor,
          p.section,
          p.spot_number

       FROM notifications n
       LEFT JOIN reservations r 
            ON n.reservation_id = r.id
       LEFT JOIN parking_spots p
            ON r.spot_id = p.id

       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot load notifications" });
  }
});


router.post("/notifications/:id/read", auth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read=true WHERE id=$1`,
      [req.params.id]
    );

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot mark notification" });
  }
});



router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM reservations 
       WHERE user_id = $1 
       ORDER BY start_time DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot fetch user reservations" });
  }
});
/// ========= AGENT CHECK-IN =========
router.post("/agent/checkin", async (req, res) => {
  try {
    const { code } = req.body;

    // get reservation
    const r = await pool.query(
      `SELECT id, status 
       FROM reservations 
       WHERE unique_code = $1`,
      [code]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ message: "Invalid reservation code" });
    }

    const reservation = r.rows[0];

    // check if parking session already exists
    const existing = await pool.query(
      `SELECT check_in, check_out 
       FROM parking_sessions 
       WHERE reservation_id = $1`,
      [reservation.id]
    );

    // 🚫 already checked in
    if (existing.rows.length > 0 && existing.rows[0].check_in !== null) {
      return res.status(400).json({ message: "This reservation is already checked in" });
    }

    // create new session
    await pool.query(
      `INSERT INTO parking_sessions (reservation_id, check_in)
       VALUES ($1, NOW())`,
      [reservation.id]
    );

    // update reservation status
    await pool.query(
      `UPDATE reservations 
       SET status = 'CHECKED_IN'
       WHERE id = $1`,
      [reservation.id]
    );

    return res.json({ message: "Check-in completed successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Check-in failed" });
  }
});


// ========= AGENT CHECK-OUT =========
router.post("/agent/checkout", async (req, res) => {
  try {
    const { code } = req.body;

    const r = await pool.query(
      `SELECT id, spot_id 
       FROM reservations 
       WHERE unique_code = $1`,
      [code]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ message: "Invalid reservation code" });
    }

    const reservation = r.rows[0];

    // get session
    const sessionQuery = await pool.query(
      `SELECT check_in, check_out 
       FROM parking_sessions
       WHERE reservation_id = $1`,
      [reservation.id]
    );

    if (sessionQuery.rows.length === 0) {
      return res.status(400).json({ message: "This vehicle has not checked in yet" });
    }

    const session = sessionQuery.rows[0];

    // 🚫 already checked out
    if (session.check_out !== null) {
      return res.status(400).json({ message: "This reservation is already checked out" });
    }

    // calculate price
    const now = new Date();
    const durationHours = Math.max(
      1,
      Math.ceil((now - session.check_in) / (1000 * 60 * 60))
    );

    const pricePerHour = 200;
    const finalPrice = durationHours * pricePerHour;

    // update session
    await pool.query(
      `UPDATE parking_sessions
       SET check_out = NOW()
       WHERE reservation_id = $1`,
      [reservation.id]
    );

    // update reservation
    await pool.query(
      `UPDATE reservations
       SET status = 'FINISHED',
           final_price = $1
       WHERE id = $2`,
      [finalPrice, reservation.id]
    );

    // free parking spot
    await pool.query(
      `UPDATE parking_spots
       SET is_active = true
       WHERE id = $1`,
      [reservation.spot_id]
    );

    return res.json({
      message: "Checkout completed successfully",
      hours: durationHours,
      final_price: finalPrice
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Checkout failed" });
  }
});

// 🆕 LIBERER PLACE MANUELLEMENT
router.post("/:id/checkout", async (req, res) => {
  const { id } = req.params;

  try {
    // récupérer réservation
    const reservation = await pool.query(
      "SELECT spot_id, status FROM reservations WHERE id=$1",
      [id]
    );

    if (reservation.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const status = reservation.rows[0].status;
    const spot_id = reservation.rows[0].spot_id;

    // empêcher libération doublée
    if (status === "FINISHED" || status === "CANCELLED") {
      return res.status(400).json({ message: "Reservation already closed" });
    }

    // maj réservation
    await pool.query(
      "UPDATE reservations SET status='FINISHED' WHERE id=$1",
      [id]
    );

    // libérer place
    await pool.query(
      "UPDATE parking_spots SET is_active=true WHERE id=$1",
      [spot_id]
    );

    res.json({ message: "Spot released successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});
module.exports = router;
