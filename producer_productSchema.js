const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    milestone: String,
    amount: Number,
    approved: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    auditLog: { type: String, default: "" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    producerName: { type: String, required: false },
    producerEmail: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} }, // can store object/JSON
    milestone: { type: String },
    status: {
      type: String,
      enum: ["Applied", "Pending Approval", "Approved", "Subsidy Released"],
      default: "Applied",
    },
    producer: { type: mongoose.Schema.Types.ObjectId, ref: "Producer", required: false },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    payouts: { type: [payoutSchema], default: [] }, // <-- fixed
    amount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);
