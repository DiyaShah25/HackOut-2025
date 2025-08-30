// src/modules/subsidies/models/program.model.js
const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    milestone: { type: String, required: true },
    subsidyAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Subsidy Released"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", programSchema);
