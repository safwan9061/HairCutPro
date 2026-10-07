const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");
const crypto = require("crypto");

// ==================== CREATE PAYMENT ORDER ====================

const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking ownership
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check payment status
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    // Amount in paise
    const amount = Math.round(booking.price * 100);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create payment order error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
      error: error.message,
    });
  }
};
// ==================== VERIFY PAYMENT ====================

const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    booking.paymentStatus = "paid";
booking.status = "confirmed";

await booking.save();

// ==================== SOCKET.IO PAYMENT NOTIFICATION ====================

const io = req.app.get("io");

if (io) {
  io.to("adminRoom").emit("paymentSuccess", {
    message: "Payment successful",
    bookingId: booking._id,
    userId: booking.user,
    amount: booking.price,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.status,
  });
}

// ==================== RESPONSE ====================

res.status(200).json({
  success: true,
  message: "Payment verified successfully",
  booking,
});
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
    verifyPayment,
};