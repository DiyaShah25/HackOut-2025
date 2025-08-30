// src/modules/core/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,   // always store in lowercase
      trim: true         // remove accidental spaces
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["GOVERNMENT", "PRODUCER", "AUDITOR", "BANK"], // enforce allowed roles
      required: true,
    },

    status: { 
      type: String, 
      enum: ["ACTIVE", "SUSPENDED"], 
      default: "ACTIVE" 
    },
  },
  { timestamps: true }
);

// Hide password when returning user objects
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Index on role for faster queries
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
