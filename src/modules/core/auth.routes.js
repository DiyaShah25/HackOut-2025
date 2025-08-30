// src/routes/auth.routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("./user.model"); // Adjust path
const { logOnChain } = require("../../blockchain/log"); // Blockchain logger

const router = express.Router();

// Show signup form
router.get("/signup", (req, res) => {
  res.render("auth/signup", { error: null });
});

// Show login form
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/signup", { error: "⚠️ Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    // Save in session
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    // ✅ Blockchain log (optional)
    try {
      const txHash = await logOnChain("USER_SIGNUP", user._id.toString());
      if (txHash) console.log("📝 Signup logged on-chain:", txHash);
    } catch (bcErr) {
      console.warn("⚠️ Blockchain log skipped (signup):", bcErr.message);
    }

    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("auth/signup", { error: "❌ Error signing up. Try again." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("auth/login", { error: "❌ User not found" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("auth/login", { error: "❌ Invalid password" });
    }

    // Save in session
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    // ✅ Blockchain log (optional)
    try {
      const txHash = await logOnChain("USER_LOGIN", user._id.toString());
      if (txHash) console.log("📝 Login logged on-chain:", txHash);
    } catch (bcErr) {
      console.warn("⚠️ Blockchain log skipped (login):", bcErr.message);
    }

    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "❌ Error logging in. Try again." });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
