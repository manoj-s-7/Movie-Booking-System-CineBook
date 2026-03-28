const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("../config/db");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET || "cinebook_fallback_secret_2024";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    const token = jwt.sign({ id: result.insertId, email, name }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: result.insertId, name, email } });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "No account found with this email" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Incorrect password" });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getMe };
