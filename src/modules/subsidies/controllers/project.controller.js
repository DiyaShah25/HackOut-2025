const Project = require("../../../../producer_productSchema");
const Program = require("../../subsidies/models/program.model");

// 1. List all projects of a producer
const list = async (req, res) => {
  try {
    const projects = await Project.find({ producer: req.user._id }).populate("program");
    res.render("dashboards/producer", { projects, user: req.user, message: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching projects");
  }
};

// 2. Show subsidy schemes for applying
const showPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    console.log(programs);
    res.render("subsidies/producer/programs", { programs, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching subsidy programs");
  }
};

// 3. Apply for a program (create project)
const applyProgram = async (req, res) => {
  try {
    const { programId, description } = req.body;
    if (!programId || !description) {
      return res.send("Program ID and Description are required");
    }

    const program = await Program.findById(programId);
    if (!program) return res.send("Program not found");

    await Project.create({
      name: program.name,
      milestone: program.milestone,
      metrics: description,
      producer: req.user._id,
      program: program._id,
      status: "Pending Approval",
      payouts: [],
    });

    res.redirect("subsidies/producer/programs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error applying for program");
  }
};

// 4. Submit metrics/milestone for project
const submitMetrics = async (req, res) => {
  try {
    const { projectId, metrics } = req.body;
    if (!projectId || !metrics) return res.send("Project ID and Metrics are required");

    const project = await Project.findById(projectId);
    if (!project) return res.send("Project not found");

    project.payouts.push({ milestone: project.milestone, metrics, approved: false });
    await project.save();

    res.redirect("subsidies/producer/projects");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting metrics");
  }
};

module.exports = { list, showPrograms, applyProgram, submitMetrics };
