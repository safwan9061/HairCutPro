
const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");

const {
  createSalon,
  getAllSalons,
  getSalonById,
  updateSalon,
  deleteSalon,
} = require("../Controllers/salonController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get all salons
router.get("/", getAllSalons);

// Get single salon
router.get(
  "/:id",
  validateObjectId("id"),
  getSalonById
);

// ============================================================
// ADMIN ROUTES
// ============================================================

// Create salon
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSalon
);

// Update salon
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateSalon
);

// Delete salon
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteSalon
);

module.exports = router;
