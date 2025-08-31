// src/modules/producers/routes/producer.routes.js
const express = require("express");
const router = express.Router();
const project = require("./producer_productSchema");
const Program = require("./src/modules/subsidies/models/program.model");
const nodemailer = require("nodemailer");

// Fake Razorpay simulation
const fakeRazorpay = async (amount, productId) => {
  return {
    id: `fake_order_${productId}`,
    amount,
    currency: "INR",
    status: "created",
  };
};

// Manual POST parser (no middleware)
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      const data = {};
      body.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        data[key] = decodeURIComponent(value.replace(/\+/g, " "));
      });
      resolve(data);
    });
    req.on("error", (err) => reject(err));
  });
}

// Show new project form
router.get("/projects/new", async (req, res) => {
  res.render("subsidies/producer/newproject", { message: null });
});
// Save project
router.post("/Projects-save", async (req, res) => {
  try {
    const { name, metrics, milestone, programId, email } = req.body;

    // Fetch program
    const programData = await Program.findById(programId);
    if (!programData) return res.send("Program not found");

    // Create project instance (don't shadow model name)
    const Project = new project({
      name,
      metrics,
      milestone,
      producerEmail: email, // make sure field matches schema
      program: programId,
      status: "Pending Approval",
    });
    await Project.save();

    // If milestone reached, fake payout + email
    if (parseInt(milestone) >= parseInt(programData.milestone)) {
      const order = await fakeRazorpay(
        programData.subsidyAmount * 100,
        Project._id
      );

      // Nodemailer setup
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Subsidy Released 🎉",
        html: `
          <h2>Congrats!</h2>
          <p>Your project <b>${project.name}</b> reached the milestone.</p>
          <p>Subsidy ₹${programData.subsidyAmount} released (Fake Order ID: ${order.id})</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      Project.status = "Subsidy Released";
      await Project.save();
    }

    res.render("subsidies/producer/newProject", {
      message: "project submitted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.render("subsidies/producer/newProject", {
      message: "Error saving project: " + err.message,
    });
  }
});


module.exports = router;
