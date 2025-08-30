// src/modules/producer/project.model.js
const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  targetDate: Date,
  achieved: { type: Boolean, default: false },
});

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    company: { type: String, required: true },
    location: String,
    capacity: Number, // Hydrogen tons/year
    program: { // Linked government program
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'subsidy-released'],
      default: 'pending',
    },
    milestones: [MilestoneSchema],
    subsidyReceived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProducerProject', ProjectSchema);
