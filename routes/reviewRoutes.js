const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");

const {
  createReview,
  getAllReviews,
  getBarberReviews,
  getSalonReviews,
  getBarberRating,
  getSalonRating,
  deleteReview,
} = require("../Controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// Get All Reviews
// =========================

router.get(
  "/",
  getAllReviews
);

// =========================
// Create Review
// =========================

router.post(
  "/",
  protect,
  createReview
);

// =========================
// Get Barber Reviews
// =========================

router.get(
  "/barber/:barberId",
  getBarberReviews
);

// =========================
// Get Barber Rating
// =========================

router.get(
  "/barber/:barberId/rating",
  getBarberRating
);

// =========================
// Get Salon Reviews
// =========================

router.get(
  "/salon/:salonId",
  getSalonReviews
);

// =========================
// Get Salon Rating
// =========================

router.get(
  "/salon/:salonId/rating",
  getSalonRating
);

// =========================
// Delete Review
// =========================

router.delete(
  "/:id",
  validateObjectId("id"),
  deleteReview
);

module.exports = router;