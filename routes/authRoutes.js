const express = require("express");

const {
  registerUser,
  loginUser,
  resetPassword,
} = require("../Controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// ==================== TEST ROUTE ====================

router.get("/test", (req, res) => {
  console.log("AUTH ROUTE HIT");

  res.json({
    success: true,
    message: "Auth route is working",
  });
});

// ==================== REGISTER TEST ====================

router.post("/register-test", (req, res) => {
  console.log("REGISTER TEST HIT");
  console.log("BODY:", req.body);

  res.json({
    success: true,
    message: "Register request reached authRoutes",
    body: req.body,
  });
});

// ==================== REGISTER ====================

router.post("/register", registerUser);

// ==================== LOGIN ====================

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  loginUser
);

// ==================== RESET PASSWORD ====================

router.post(
  "/reset-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  resetPassword
);

// ==================== PROFILE ====================

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You can access this protected route",
    user: req.user,
  });
});

// ==================== ADMIN TEST ====================

router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

module.exports = router;