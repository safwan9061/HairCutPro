const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
} = require("../Controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Razorpay Order
router.post(
  "/create-order",
  protect,
  createPaymentOrder
);

// Verify Razorpay Payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

module.exports = router;