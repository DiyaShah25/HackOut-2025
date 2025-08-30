const ProducerProject = require('../models/project.model');
const Program = require('../models/program.model'); // Government programs

// View all programs (for producer to choose)
exports.viewPrograms = async (req, res) => {
  const programs = await Program.find({ status: "Verified" });
  res.render('producer/programs', { programs });
};

// Show form to create project under a program
exports.showCreateProjectForm = async (req, res) => {
  const program = await Program.findById(req.params.programId);
  if (!program) return res.redirect('/producer/programs');
  res.render('producer/newProject', { program });
};

// Create new project
exports.createProject = async (req, res) => {
  const { name, description, company, location, capacity, programId } = req.body;
  await ProducerProject.create({
    name, description, company, location, capacity,
    program: programId
  });
  res.redirect('/producer/projects');
};

// List all projects of producer
exports.listProjects = async (req, res) => {
  const projects = await ProducerProject.find().populate('program');
  res.render('producer/projects', { projects });
};

// Show project details + milestones
exports.showProject = async (req, res) => {
  const project = await ProducerProject.findById(req.params.id).populate('program');
  res.render('producer/showProject', { project });
};

// Update project details
exports.updateProject = async (req, res) => {
  await ProducerProject.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/producer/projects/${req.params.id}`);
};

// Delete project
exports.deleteProject = async (req, res) => {
  await ProducerProject.findByIdAndDelete(req.params.id);
  res.redirect('/producer/projects');
};

// Add milestone
exports.addMilestone = async (req, res) => {
  const { title, description, targetDate } = req.body;
  const project = await ProducerProject.findById(req.params.id);
  project.milestones.push({ title, description, targetDate });
  await project.save();
  res.redirect(`/producer/projects/${req.params.id}`);
};
