const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");

const {
  createBooking,
  getMyBookings,
  getAvailableSlots,
  getBookingById,
  cancelBooking,
} = require("../Controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==================================================
// CREATE BOOKING
// ==================================================

router.post(
  "/",
  protect,
  createBooking
);

// ==================================================
// GET MY BOOKINGS
// ==================================================

router.get(
  "/my",
  protect,
  getMyBookings
);

// ==================================================
// GET AVAILABLE SLOTS
// ==================================================

router.get(
  "/available-slots",
  protect,
  getAvailableSlots
);

// ==================================================
// GET SINGLE BOOKING
// IMPORTANT: protect middleware required
// ==================================================

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getBookingById
);

// ==================================================
// CANCEL BOOKING
// ==================================================

router.put(
  "/:id/cancel",
  protect,
  validateObjectId("id"),
  cancelBooking
);

module.exports = router;