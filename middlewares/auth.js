// middlewares/auth.js

module.exports = (req, res, next) => {
  // Assuming req.user is set after login
  if (!req.user) {
    return res.status(401).send("Unauthorized. Please login first.");
  }
  next();
};
