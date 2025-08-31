const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const path = require("path");
require('dotenv').config(); // load .env variables

// Routes
const authRoutes = require("./modules/core/auth.routes");
const subsidyRoutes = require("./modules/subsidies/routes");

// ✅ Blockchain integration
const { initBlockchain } = require("./blockchain/log");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/green-subsidy",
    }),
  })
);

// ✅ Initialize blockchain connection once on server start
initBlockchain();

// Routes
app.use("/auth", authRoutes);
app.use("/subsidy", subsidyRoutes);


app.get("/", (req, res) => {
  res.render("home"); // loads views/home.ejs
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const role = req.session.user.role;

  if (role === "GOVERNMENT") return res.render("dashboards/government", { user: req.session.user });
  if (role === "PRODUCER") return res.render("dashboards/producer", { user: req.session.user });
  if (role === "AUDITOR") return res.render("dashboards/auditor", { user: req.session.user });
  if (role === "BANK") return res.render("dashboards/bank", { user: req.session.user });

  res.send("Unknown role");
});

// ✅ Routes
const projectRoutes = require("./modules/subsidies/routes");
app.use("/producer", projectRoutes);

const producerRoutes = require('../producer_routes');
app.use("/producer", producerRoutes);

module.exports = app;
