require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

// ✅ Blockchain
const { initBlockchain } = require("./blockchain/log");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/green-subsidy";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // ✅ Initialize Blockchain after DB connects
    initBlockchain();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
