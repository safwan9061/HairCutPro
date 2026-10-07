
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Barber = require("../models/Barber");

// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async (req, res) => {
  try {
    const {
      salon,
      service,
      barber,
      bookingDate,
      startTime,
    } = req.body;

    // ==================== REQUIRED FIELDS ====================

    if (
      !salon ||
      !service ||
      !barber ||
      !bookingDate ||
      !startTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Salon, service, barber, booking date and start time are required",
      });
    }

    // ==================== CHECK SERVICE ====================

    const selectedService =
      await Service.findById(service);

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ==================== CHECK BARBER ====================

    const selectedBarber =
      await Barber.findById(barber);

    if (!selectedBarber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    // ==================== CHECK BARBER ACTIVE ====================

    if (!selectedBarber.isActive) {
      return res.status(400).json({
        success: false,
        message: "Barber is not available",
      });
    }

    // ==================== CHECK BARBER BELONGS TO SALON ====================

    if (
      selectedBarber.salon.toString() !==
      salon.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected barber does not belong to this salon",
      });
    }

    // ==================== CHECK SERVICE BELONGS TO SALON ====================

    if (
      selectedService.salon.toString() !==
      salon.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected service does not belong to this salon",
      });
    }

    // ==================== SERVICE DURATION ====================

    const duration =
      selectedService.duration;

    // Convert start time to minutes
    const [hours, minutes] =
      startTime
        .split(":")
        .map(Number);

    const startMinutes =
      hours * 60 + minutes;

    // Calculate end time
    const endMinutes =
      startMinutes + duration;

    const endHours =
      Math.floor(
        endMinutes / 60
      );

    const endMins =
      endMinutes % 60;

    const endTime =
      String(endHours).padStart(
        2,
        "0"
      ) +
      ":" +
      String(endMins).padStart(
        2,
        "0"
      );

    // ==================== CHECK OVERLAPPING BOOKING ====================

    const existingBookings =
      await Booking.find({
        barber,
        bookingDate:
          new Date(bookingDate),
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      }).select(
        "startTime endTime"
      );

    const hasOverlap =
      existingBookings.some(
        (booking) => {
          const [
            existingStartHour,
            existingStartMinute,
          ] =
            booking.startTime
              .split(":")
              .map(Number);

          const [
            existingEndHour,
            existingEndMinute,
          ] =
            booking.endTime
              .split(":")
              .map(Number);

          const existingStart =
            existingStartHour *
              60 +
            existingStartMinute;

          const existingEnd =
            existingEndHour *
              60 +
            existingEndMinute;

          return (
            startMinutes <
              existingEnd &&
            endMinutes >
              existingStart
          );
        }
      );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message:
          "This time slot overlaps with an existing booking",
      });
    }

    // ==================== CREATE BOOKING ====================

    const booking =
      await Booking.create({
        user: req.user.id,
        salon,
        service,
        barber,
        bookingDate:
          new Date(bookingDate),
        startTime,
        endTime,
        price:
          selectedService.price,
      });

    // ==================== SOCKET.IO ====================

    const io =
      req.app.get("io");

    if (io) {
      io.to("adminRoom").emit(
        "newBooking",
        {
          message:
            "New booking received",

          bookingId:
            booking._id,

          userId:
            req.user.id,

          salonId:
            booking.salon,

          serviceId:
            booking.service,

          barberId:
            booking.barber,

          bookingDate:
            booking.bookingDate,

          startTime:
            booking.startTime,

          endTime:
            booking.endTime,

          price:
            booking.price,
        }
      );
    }

    // ==================== RESPONSE ====================

    res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking,
    });

  } catch (error) {
    console.error(
      "Create booking error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// GET MY BOOKINGS
// ======================================================

const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        user: req.user.id,
      })
        .populate(
          "salon",
          "name city"
        )
        .populate(
          "service",
          "name price duration"
        )
        .populate(
          "barber",
          "name specialization image"
        )
        .sort({
          bookingDate: -1,
        });

    res.status(200).json({
      success: true,
      count:
        bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(
      "Get my bookings error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// GET AVAILABLE SLOTS
// ======================================================

const getAvailableSlots = async (
  req,
  res
) => {
  try {
    const {
      barber,
      bookingDate,
    } = req.query;

    // ==================== REQUIRED ====================

    if (
      !barber ||
      !bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Barber and booking date are required",
      });
    }

    // ==================== GET BOOKINGS ====================

    const bookings =
      await Booking.find({
        barber,
        bookingDate:
          new Date(bookingDate),
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      }).select(
        "startTime endTime"
      );

    // ==================== ALL SLOTS ====================

    const slots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];

    // ==================== REMOVE BOOKED SLOTS ====================

    const availableSlots =
      slots.filter(
        (slot) => {
          return !bookings.some(
            (booking) =>
              booking.startTime ===
              slot
          );
        }
      );

    // ==================== RESPONSE ====================

    res.status(200).json({
      success: true,
      barber,
      bookingDate,
      availableSlots,
      bookedSlots:
        bookings.map(
          (booking) =>
            booking.startTime
        ),
    });

  } catch (error) {
    console.error(
      "Get available slots error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE BOOKING
// ======================================================

const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "salon",
          "name city address"
        )
        .populate(
          "service",
          "name price duration"
        )
        .populate(
          "barber",
          "name specialization image"
        );

    // ==================== BOOKING NOT FOUND ====================

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    // ==================== LOGGED USER ====================

    const loggedInUserId =
      req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information is missing",
      });
    }

    // ==================== BOOKING USER ====================

    const bookingUserId =
      booking.user?._id?.toString();

    if (!bookingUserId) {
      return res.status(404).json({
        success: false,
        message:
          "Booking user not found",
      });
    }

    // ==================== ACCESS CHECK ====================

    if (
      req.user.role !==
        "admin" &&
      bookingUserId !==
        loggedInUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // ==================== RESPONSE ====================

    res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "Get booking error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// CANCEL BOOKING
// ======================================================

const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    // ==================== OWNER / ADMIN CHECK ====================

    if (
      booking.user.toString() !==
        req.user.id.toString() &&
      req.user.role !==
        "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // ==================== COMPLETED CHECK ====================

    if (
      booking.status ===
      "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed booking cannot be cancelled",
      });
    }

    // ==================== CANCEL ====================

    booking.status =
      "cancelled";

    await booking.save();

    // ==================== RESPONSE ====================

    res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking,
    });

  } catch (error) {
    console.error(
      "Cancel booking error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBooking,
  getMyBookings,
  getAvailableSlots,
  getBookingById,
  cancelBooking,
};
