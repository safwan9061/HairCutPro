const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../Controllers/serviceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all services
router.get("/", getAllServices);

// Get single service
router.get("/:id", validateObjectId("id"), getServiceById);

// ==================== ADMIN ROUTES ====================

// Create service
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createService
);

// Update service
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateService
);

// Delete service
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteService
);

module.exports = router;