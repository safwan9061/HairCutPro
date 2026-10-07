const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const {
  // ==================== USER MANAGEMENT ====================
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,

  // ==================== BOOKING MANAGEMENT ====================
  getAllBookings,
  getAdminBookingById,
  updateBookingStatus,

  // ==================== SALON MANAGEMENT ====================
  getAllSalons,
  getAdminSalonById,
  createSalon,
  updateSalon,
  deleteSalon,
  

  // ==================== SERVICE MANAGEMENT ====================
  getAllServices,
  getAdminServiceById,
  createService,
  updateService,
  deleteService,

  // ==================== BARBER MANAGEMENT ====================
  getAllBarbers,
  getAdminBarberById,
  createBarber,
  updateBarber,
  deleteBarber,

  // ==================== REVIEW MANAGEMENT ====================
  getAllReviews,
  deleteAdminReview,

  // ==================== DASHBOARD ====================
  getDashboardStats,
} = require("../Controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

router.use(protect);
router.use(authorizeRoles("admin"));

// ============================================================
// USER MANAGEMENT
// ============================================================

router.get("/users", getAllUsers);

router.get(
  "/users/:id",
  validateObjectId("id"),
  getUserById
);

router.put(
  "/users/:id",
  validateObjectId("id"),
  updateUser
);

router.delete(
  "/users/:id",
  validateObjectId("id"),
  deleteUser
);

// ============================================================
// BOOKING MANAGEMENT
// ============================================================

router.get("/bookings", getAllBookings);


router.get(
  "/bookings/:id",
  validateObjectId("id"),
  getAdminBookingById
);

router.put(
  "/bookings/:id/status",
  validateObjectId("id"),
  updateBookingStatus
);

// ============================================================
// SALON MANAGEMENT
// ============================================================

router.get("/salons", getAllSalons);

router.get(
  "/salons/:id",
  validateObjectId("id"),
  getAdminSalonById
);

router.post("/salons", createSalon);

router.put(
  "/salons/:id",
  validateObjectId("id"),
  updateSalon
);

router.delete(
  "/salons/:id",
  validateObjectId("id"),
  deleteSalon
);

// ============================================================
// SERVICE MANAGEMENT
// ============================================================
router.get("/services", getAllServices);

router.get(
  "/services/:id",
  validateObjectId("id"),
  getAdminServiceById
);

router.post("/services", createService);

router.put(
  "/services/:id",
  validateObjectId("id"),
  updateService
);

router.delete(
  "/services/:id",
  validateObjectId("id"),
  deleteService
);

// ============================================================
// BARBER MANAGEMENT
// ============================================================

router.get("/barbers", getAllBarbers);

router.get(
  "/barbers/:id",
  validateObjectId("id"),
  getAdminBarberById
);

router.post("/barbers", createBarber);

router.put(
  "/barbers/:id",
  validateObjectId("id"),
  updateBarber
);

router.delete(
  "/barbers/:id",
  validateObjectId("id"),
  deleteBarber
);

// ============================================================
// REVIEW MANAGEMENT
// ============================================================

router.get("/reviews", getAllReviews);

router.delete(
  "/reviews/:id",
  validateObjectId("id"),
  deleteAdminReview
);

// ============================================================
// ADMIN DASHBOARD
// ============================================================

router.get("/dashboard", getDashboardStats);

// ============================================================

module.exports = router;