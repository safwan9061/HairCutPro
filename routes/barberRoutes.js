const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const {
  createBarber,
  getAllBarbers,
  getBarberById,
  updateBarber,
  deleteBarber,
} = require("../Controllers/barberController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

router.get("/", getAllBarbers);

router.get("/:id", validateObjectId("id"), getBarberById);
// ==================== ADMIN ROUTES ====================

// CREATE BARBER + IMAGE UPLOAD

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  createBarber
);

// UPDATE BARBER + OPTIONAL IMAGE

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  updateBarber
);

// DELETE BARBER

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteBarber
);

module.exports = router;