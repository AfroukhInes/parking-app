const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/spots", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM parking_spots WHERE is_active=true"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot load spots" });
  }
});

module.exports = router;
