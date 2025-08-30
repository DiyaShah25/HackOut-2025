const express = require("express");
const router = express.Router();
const Project = require("./models/project.model");
const Program = require("./models/program.model");

// View all verified programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await Program.find({ status: "Verified" });
    res.render("producer/programs", { programs });
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
    res.render("producer/newProject", { program });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading form");
  }
});

// Handle project creation
router.post("/programs/:programId/new", async (req, res) => {
  try {
    const { name, milestone, metrics } = req.body;
    await Project.create({
      name,
      milestone,
      metrics: metrics || "",
      producer: req.user._id, // make sure you have auth middleware
      status: "Pending Approval",
      payouts: [],
    });
    res.redirect("/producer/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating project");
  }
});

// List all projects of producer
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({ producer: req.user._id }).populate("program");
    res.render("producer/projects", { projects });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching projects");
  }
});

// Show project details + milestones
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("program");
    res.render("producer/showProject", { project });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching project details");
  }
});

// Add milestone to project
router.post("/projects/:id/milestones", async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;
    const project = await Project.findById(req.params.id);
    project.payouts.push({ milestone: title, approved: false });
    await project.save();
    res.redirect(`/producer/projects/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding milestone");
  }
});

module.exports = router;
