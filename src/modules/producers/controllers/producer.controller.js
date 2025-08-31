// src/modules/producers/controllers/producer.controller.js
const path = require("path");
const fs = require("fs");
const Project = require("../../producers/models/project.models");
const Program = require("../../subsidies/models/program.model");
const blockchain = require("../services/blockchain.service");

// multer setup for file uploads (evidence)
const multer = require("multer");
const uploadsDir = path.join(process.cwd(), "uploads", "evidence");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

// ===================== Controllers =====================

// GET /producer/dashboard
const dashboard = async (req, res) => {
  try {
    // list producer projects (if req.user exists)
    const projects = req.user ? await Project.find({ producer: req.user._id }).populate("program").sort({ createdAt: -1 }) : [];
    res.render("producers/producer", { user: req.user || { name: "Producer" }, projects, message: null });
  } catch (err) {
    console.error("Producer dashboard error:", err);
    res.status(500).send("Server error");
  }
};

// GET /producer/programs
const listPrograms = async (req, res) => {
  try {
    const programs = await Program.find({}).sort({ createdAt: -1 });
    res.render("producer/programs", { user: req.user || { name: "Producer" }, programs });
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).send("Server error");
  }
};

// POST /producer/projects  (apply for program)
const applyForProgram = async (req, res) => {
  try {
    const { programId, description, accountName, accountNumber, ifsc } = req.body;
    if (!programId || !description) return res.status(400).send("programId and description required");
    if (!req.user) return res.status(401).send("Login required");

    const program = await Program.findById(programId);
    if (!program) return res.status(404).send("Program not found");

    const project = await Project.create({
      name: program.name,
      description,
      milestone: program.milestone,
      metrics: "",
      program: program._id,
      producer: req.user._id,
      status: "Pending Approval",
      bankDetails: { accountName, accountNumber, ifsc },
    });

    // Optionally register project on-chain (async)
    try {
      const chainRes = await blockchain.registerProjectOnChain(project);
      console.log("Registered on chain:", chainRes);
    } catch (e) {
      console.warn("On-chain register failed (non-blocking):", e.message || e);
    }

    res.redirect("/producer/dashboard");
  } catch (err) {
    console.error("applyForProgram error:", err);
    res.status(500).send("Server error");
  }
};

// GET /producer/projects
const listProjects = async (req, res) => {
  try {
    if (!req.user) return res.status(401).send("Login required");
    const projects = await Project.find({ producer: req.user._id }).populate("program").sort({ createdAt: -1 });
    res.render("producers/projects", { user: req.user, projects });
  } catch (err) {
    console.error("listProjects error:", err);
    res.status(500).send("Server error");
  }
};

// GET /producer/projects/:id
const showProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("program producer");
    if (!project) return res.status(404).send("Project not found");
    // ensure the logged-in user owns it (or admin)
    if (!req.user || project.producer._id.toString() !== req.user._id.toString()) {
      return res.status(403).send("Forbidden");
    }
    res.render("producers/showProject", { user: req.user, project });
  } catch (err) {
    console.error("showProject error:", err);
    res.status(500).send("Server error");
  }
};

// POST /producer/projects/:id/metrics  (submit metrics + evidence optional)
const submitMetrics = [
  // middleware to handle file upload under the field "evidence"
  upload.single("evidence"),
  async (req, res) => {
    try {
      const projectId = req.params.id || req.body.projectId;
      const { metrics } = req.body;
      if (!projectId || !metrics) return res.status(400).send("projectId and metrics required");
      if (!req.user) return res.status(401).send("Login required");

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).send("Project not found");
      if (project.producer.toString() !== req.user._id.toString()) return res.status(403).send("Forbidden");

      // evidence handling
      let evidenceUrl = "";
      let evidenceHash = "";
      if (req.file) {
        evidenceUrl = `/uploads/evidence/${req.file.filename}`; // serve static dir in app.js
        // OPTIONAL: compute a hash (sha256) to put on-chain later
        const crypto = require("crypto");
        const fileBuffer = fs.readFileSync(req.file.path);
        evidenceHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      }

      // push new payout request (milestone)
      project.payouts.push({
        milestone: project.milestone,
        metrics,
        evidenceUrl,
        evidenceHash,
        approved: false,
        paid: false,
        date: new Date()
      });

      project.metrics = metrics;
      project.status = "Pending Verification";
      await project.save();

      // submit evidence hash on-chain (non-blocking)
      try {
        const payoutIndex = project.payouts.length - 1;
        const chainRes = await blockchain.submitMilestoneOnChain(project._id.toString(), payoutIndex, evidenceHash || "0x0");
        console.log("submitMilestoneOnChain:", chainRes);
      } catch (e) {
        console.warn("submitMilestoneOnChain failed (non-blocking):", e.message || e);
      }

      res.redirect(`/producer/projects/${project._id}`);
    } catch (err) {
      console.error("submitMetrics error:", err);
      res.status(500).send("Server error");
    }
  }
];

module.exports = {
  dashboard,
  listPrograms,
  applyForProgram,
  listProjects,
  showProject,
  submitMetrics,
  upload, // export if you want to mount other multer endpoints
};
