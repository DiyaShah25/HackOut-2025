const express = require("express");
const router = express.Router();
// const Project = require("./models/project.model");
const Program = require("./models/program.model");
const methodOverride = require("method-override");
const Project = require("../../../producer_productSchema"); 
// View all verified programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await Program.find();
    res.render("subsidies/producer/programs", { programs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching programs");
  }
});

// Show form to create a project under a program
router.get("/programs/:programId/new", async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);
    if (!program) return res.redirect("/producer/programs");
    res.render("subsidies/producer/newProject", { program });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading form");
  }
});

const {
  list,
  showPrograms,
  applyProgram,
  submitMetrics
} = require("./controllers/project.controller");
const authMiddleware = require("../../../middlewares/auth"); // your JWT/session auth

// 1. View all projects
router.get("/projects", authMiddleware, list);

// 2. View all subsidy schemes
router.get("/programs", authMiddleware, showPrograms);

// 3. Apply for a subsidy scheme
router.post("/projects", authMiddleware, applyProgram);

// 4. Submit progress/metrics
router.post("/projects/metrics", authMiddleware, submitMetrics);

router.get("/government/programs-list",async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render("subsidies/programs/list", { programs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching subsidy programs");
  }});

// Enable method override for DELETE in forms
router.use(methodOverride('_method'));

// ---------------------------
// SHOW all Projects (EJS page)
// ---------------------------
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.render("projects", { projects });
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});

router.post("/subsidies/projects",async (req, res) => {
  try {
    const { programId, name } = req.body;
    if (!programId || !name) {
      return res.send("Program ID and Project Name are required");
    } 
    const program = await Program.findById(programId);
    if (!program) return res.send("Program not found");
    return res.render("subsidies/producer/newProject", { program });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error applying for program");
  }
});

router.post('/subsidy/programs', async (req, res) => {
  try {
    const { name,  amount, milestone } = req.body; 
    if (!name || !amount || !milestone) {
      return res.send("All fields are required");
    }
    const newProgram = new Program({ name, subsidyAmount:amount, milestone });
    await newProgram.save();
    const programs = await Program.find().sort({ createdAt: -1 });
    res.render('subsidies/programs/list', { programs, message: "Program created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating program");
  }
});



// ---------------------------
// CREATE new Project
// ---------------------------
router.post("/projects", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.redirect("/projects");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// ---------------------------
// DELETE Project
// ---------------------------
router.delete("/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.redirect("/projects");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

router.get("/viewProjects", async (req, res) => {
  try { 
    const projects = await Project.find().sort({ createdAt: -1 });
    res.render("viewProjects", { projects, user: req.user || { name: "Producer" }, message: null });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Error fetching projects");
  }
});

module.exports = router;


