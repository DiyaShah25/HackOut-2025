const Project=require("../../producers/models/project.models");

// List all projects of a producer
const list = async (req, res) => {
  try {
    const projects = await Project.find({ producer: req.user._id }).sort({ createdAt: -1 });
    res.render("dashboards/producer", { projects, user: req.user, message: null });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Error fetching projects");
  }
};

// Show form to create a project
const createForm = async (req, res) => {
  res.render("dashboards/producer", { projects: [], user: req.user, message: null });
};

// Handle project creation
const create = async (req, res) => {
  try {
    const { name, milestone, metrics } = req.body;
    if (!name || !milestone) {
      return res.render("dashboards/producer", { projects: [], user: req.user, message: "All fields are required" });
    }
    await Project.create({
      name,
      milestone,
      metrics,
      producer: req.user._id,
      status: "Pending Approval",
      payouts: [],
    });
    res.redirect("/producer/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating project");
  }
};

module.exports = { list, createForm, create };
