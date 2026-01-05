const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // 1️⃣ vérifier si email existe déjà
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé. Veuillez en choisir un autre."
      });
    }

    // 2️⃣ hasher le mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // 3️⃣ insérer dans la base
    await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4)",
      [full_name, email, hashed, role || "USER"]
    );

    return res.json({ message: "Compte créé avec succès" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de l'inscription " });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Utilisateur introuvable" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      role: user.role,
      name: user.full_name
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

module.exports = router;
