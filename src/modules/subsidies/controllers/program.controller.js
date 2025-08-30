// src/modules/subsidies/controllers/program.controller.js
const Program = require("../models/program.model");

// Show all programs in the government dashboard
const list = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render("dashboards/government", {
      programs,
      user: req.user || { name: "Admin" },
      message: null,
    });
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).send("Error fetching programs");
  }
};

// Optional: separate create form (renders same dashboard)
const createForm = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render("dashboards/government", {
      programs,
      user: req.user || { name: "Admin" },
      message: null,
    });
  } catch (err) {
    console.error("Error rendering form:", err);
    res.status(500).send("Error rendering form");
  }
};

// Handle form submission and render updated dashboard
const create = async (req, res) => {
  try {
    const { name, milestone, amount } = req.body;

    // Basic validation
    if (!name || !milestone || !amount) {
      const programs = await Program.find().sort({ createdAt: -1 });
      return res.render("dashboards/government", {
        programs,
        user: req.user || { name: "Admin" },
        message: "❌ All fields are required",
      });
    }

    const subsidyAmount = parseFloat(amount);
    if (isNaN(subsidyAmount) || subsidyAmount < 0) {
      const programs = await Program.find().sort({ createdAt: -1 });
      return res.render("dashboards/government", {
        programs,
        user: req.user || { name: "Admin" },
        message: "❌ Invalid subsidy amount",
      });
    }

    // Create and save the program
    const program = new Program({ name, milestone, subsidyAmount });
    await program.save();

    // Render dashboard with updated programs
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render("dashboards/government", {
      programs,
      user: req.user || { name: "Admin" },
      message: "✅ Program created successfully",
    });
  } catch (err) {
    console.error("Error creating program:", err);
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render("dashboards/government", {
      programs,
      user: req.user || { name: "Admin" },
      message: "❌ Error creating program",
    });
  }
};

module.exports = { list, createForm, create };
