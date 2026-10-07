const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");

// ==================== CREATE REVIEW ====================

const createReview = async (req, res) => {
  try {
    const {
      booking,
      salon,
      barber,
      rating,
      comment,
    } = req.body;

    // Check required fields
    if (
      !booking ||
      !salon ||
      !barber ||
      !rating ||
      !comment
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking, salon, barber, rating and comment are required",
      });
    }

    // Check rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find booking
    const selectedBooking =
      await Booking.findById(booking);

    if (!selectedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking belongs to user
    if (
      selectedBooking.user.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can review only your booking",
      });
    }

    // Check booking completed
    if (
      selectedBooking.status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You can review only after booking is completed",
      });
    }

    // Check already reviewed
    const existingReview =
      await Review.findOne({
        booking,
      });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this booking",
      });
    }

    // Create review
    const review =
      await Review.create({
        user: req.user.id,
        booking,
        salon,
        barber,
        rating,
        comment,
      });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });

  } catch (error) {
    console.error(
      "Create review error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== GET ALL REVIEWS ====================

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name")
      .populate("barber", "name specialization")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get all reviews error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load reviews",
      error: error.message,
    });
  }
};
// ==================== GET BARBER REVIEWS ====================

const getBarberReviews = async (req, res) => {
  try {
    const { barberId } = req.params;

    const reviews =
      await Review.find({
        barber: barberId,
      })
        .populate(
          "user",
          "name"
        )
        .populate(
          "barber",
          "name specialization"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error(
      "Get barber reviews error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ==================== GET BARBER RATING ====================

const getBarberRating = async (req, res) => {
  try {
    const { barberId } = req.params;
const result = await Review.aggregate([
  {
    $match: {
      barber: new mongoose.Types.ObjectId(barberId),
    },
  },
  {
    $group: {
      _id: "$barber",
      averageRating: {
        $avg: "$rating",
      },
      totalReviews: {
        $sum: 1,
      },
    },
  },
]);
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    return res.status(200).json({
      success: true,
      averageRating:
        Math.round(
          result[0].averageRating * 10
        ) / 10,
      totalReviews:
        result[0].totalReviews,
    });

  } catch (error) {
    console.error(
      "Get barber rating error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ==================== GET SALON RATING ====================

const getSalonRating = async (req, res) => {
  try {
    const { salonId } = req.params;

    const result = await Review.aggregate([
      {
        $match: {
          salon: new mongoose.Types.ObjectId(salonId),
        },
      },
      {
        $group: {
          _id: "$salon",
          averageRating: {
            $avg: "$rating",
          },
          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    return res.status(200).json({
      success: true,
      averageRating:
        Math.round(
          result[0].averageRating * 10
        ) / 10,
      totalReviews:
        result[0].totalReviews,
    });

  } catch (error) {
    console.error(
      "Get salon rating error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== GET SALON REVIEWS ====================

const getSalonReviews = async (req, res) => {
  try {
    const { salonId } = req.params;

    const reviews =
      await Review.find({
        salon: salonId,
      })
        .populate(
          "user",
          "name"
        )
        .populate(
          "barber",
          "name specialization"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error(
      "Get salon reviews error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== DELETE REVIEW ====================

const deleteReview = async (req, res) => {
  try {
    const review =
      await Review.findById(
        req.params.id
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // User can delete own review
    // Admin can delete any review
    if (
      review.user.toString() !==
        req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete review error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getBarberReviews,
  getSalonReviews,
  getBarberRating,
  getSalonRating,
  deleteReview,
};