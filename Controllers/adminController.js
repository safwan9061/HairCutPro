const User = require("../models/User");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Barber = require("../models/Barber");

// ==================== GET ALL USERS ====================

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Search filter
    let filter = {};

    if (search.trim()) {
      filter = {
        $or: [
          {
            name: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            email: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            phone: {
              $regex: search.trim(),
              $options: "i",
            },
          },
        ],
      };
    }

    // Total matching users
    const totalUsers = await User.countDocuments(filter);

    // Pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Get users
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(
      totalUsers / limitNumber
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET SINGLE USER ====================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE USER ====================

const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
    } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email =
        email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be user or admin",
        });
      }

      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update user error:",
      error.message
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ==================== ADMIN SERVICE MANAGEMENT ====================

// GET ALL SERVICES
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("salon", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get all services error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE SERVICE
const getAdminServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("salon", "name city");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CREATE SERVICE
const createService = async (req, res) => {
  try {
    const {
      salon,
      name,
      description,
      price,
      duration,
    } = req.body;

    if (!salon || !name || price === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: "Salon, name, price and duration are required",
      });
    }

    const service = await Service.create({
      salon,
      name,
      description,
      price,
      duration,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE SERVICE
const updateService = async (req, res) => {
  try {
    const {
      salon,
      name,
      description,
      price,
      duration,
    } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (salon !== undefined) service.salon = salon;
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE SERVICE
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== DELETE USER ====================

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting himself
    if (
      user._id.toString() ===
      req.user.id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete user error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ==================== GET ALL BOOKINGS ====================

const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    let filter = {};

    // Booking status filter
    if (status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    // Search
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select("_id");

      const userIds = matchingUsers.map(
        (user) => user._id
      );

      filter.$or = [
        { user: { $in: userIds } },
      ];
    }

    // Total bookings
    const totalBookings =
      await Booking.countDocuments(filter);

    // Pagination
    const skip =
      (pageNumber - 1) * limitNumber;

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate(
        "user",
        "name email phone"
      )
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
        "name specialization"
      )
      .sort({
        bookingDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(
      totalBookings / limitNumber
    );

    return res.status(200).json({
      success: true,
      count: bookings.length,
      totalBookings,
      totalPages,
      currentPage: pageNumber,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get all bookings error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET SINGLE BOOKING ====================

const getAdminBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    )
      .populate("user", "name email phone")
      .populate("salon", "name city address")
      .populate("service", "name price duration")
      .populate("barber", "name specialization");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Get admin booking error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE BOOKING STATUS ====================

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    await booking.save();

    // Socket.IO notification
    const io = req.app.get("io");

    if (io) {
      io.to("adminRoom").emit(
        "bookingStatusUpdated",
        {
          bookingId: booking._id,
          status: booking.status,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ==================== ADMIN SALON MANAGEMENT ====================

const Salon = require("../models/Salon");

// GET ALL SALONS
const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  } catch (error) {
    console.error("Get all salons error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE SALON
const getAdminSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    return res.status(200).json({
      success: true,
      salon,
    });
  } catch (error) {
    console.error("Get salon error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== CREATE SALON ====================

const createSalon = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
    } = req.body;

    if (!name || !address || !city || !openingTime || !closingTime) {
      return res.status(400).json({
        success: false,
        message:
          "Name, address, city, opening time and closing time are required",
      });
    }

    const salon = await Salon.create({
      name,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
    });

    return res.status(201).json({
      success: true,
      message: "Salon created successfully",
      salon,
    });
  } catch (error) {
    console.error("Create salon error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE SALON
const updateSalon = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      phone,
      description,
      openingTime,
      closingTime,
      isActive,
      image,
    } = req.body;

    const salon = await Salon.findById(
      req.params.id
    );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // Basic fields
    if (name !== undefined) {
      salon.name = name;
    }

    if (address !== undefined) {
      salon.address = address;
    }

    if (city !== undefined) {
      salon.city = city;
    }

    if (phone !== undefined) {
      salon.phone = phone;
    }

    if (description !== undefined) {
      salon.description = description;
    }

    // Working hours
    if (openingTime !== undefined) {
      salon.openingTime = openingTime;
    }

    if (closingTime !== undefined) {
      salon.closingTime = closingTime;
    }

    // Active status
    if (isActive !== undefined) {
      salon.isActive = isActive;
    }

    // Image
    if (image !== undefined) {
      salon.image = image;
    }

    await salon.save();

    return res.status(200).json({
      success: true,
      message: "Salon updated successfully",
      salon,
    });
  } catch (error) {
    console.error(
      "Update salon error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE SALON
const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    await salon.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Salon deleted successfully",
    });
  } catch (error) {
    console.error("Delete salon error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ==================== ADMIN BARBER MANAGEMENT ====================

// GET ALL BARBERS
const getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find()
      .populate("salon", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: barbers.length,
      barbers,
    });
  } catch (error) {
    console.error("Get all barbers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE BARBER
const getAdminBarberById = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .populate("salon", "name city");

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    return res.status(200).json({
      success: true,
      barber,
    });
  } catch (error) {
    console.error("Get barber error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CREATE BARBER
const createBarber = async (req, res) => {
  try {
    const {
      salon,
      name,
      phone,
      email,
      specialization,
      experience,
      openingTime,
      closingTime,
      isActive,
    } = req.body;

    if (
      !salon ||
      !name ||
      !phone ||
      !email ||
      experience === undefined ||
      !openingTime ||
      !closingTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Salon, name, phone, email, experience, opening time and closing time are required",
      });
    }

    const barber = await Barber.create({
      salon,
      name,
      phone,
      email,
      specialization,
      experience,
      openingTime,
      closingTime,
      isActive:
        isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Barber created successfully",
      barber,
    });
  } catch (error) {
    console.error("Create barber error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE BARBER
const updateBarber = async (req, res) => {
  try {
    const {
      salon,
      name,
      phone,
      email,
      specialization,
      experience,
      openingTime,
      closingTime,
      isActive,
    } = req.body;

    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    if (salon !== undefined) barber.salon = salon;
    if (name !== undefined) barber.name = name;
    if (phone !== undefined) barber.phone = phone;
    if (email !== undefined) barber.email = email;
    if (specialization !== undefined) {
      barber.specialization = specialization;
    }
    if (experience !== undefined) {
      barber.experience = experience;
    }
    if (openingTime !== undefined) {
      barber.openingTime = openingTime;
    }
    if (closingTime !== undefined) {
      barber.closingTime = closingTime;
    }
    if (isActive !== undefined) {
      barber.isActive = isActive;
    }

    await barber.save();

    return res.status(200).json({
      success: true,
      message: "Barber updated successfully",
      barber,
    });
  } catch (error) {
    console.error("Update barber error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE BARBER
const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    await barber.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Barber deleted successfully",
    });
  } catch (error) {
    console.error("Delete barber error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const Review = require("../models/Review");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("salon", "name city")
      .populate("barber", "name specialization")
      .populate("booking", "bookingDate startTime endTime")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const deleteAdminReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSalons,
      totalBarbers,
      totalServices,
      totalBookings,
      totalReviews,
      pendingBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Salon.countDocuments(),
      Barber.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]);

    const revenueResult = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSalons,
        totalBarbers,
        totalServices,
        totalBookings,
        totalReviews,
        totalRevenue,
        pendingBookings,
        completedBookings,
        cancelledBookings,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  getAllReviews,
  updateUser,
  deleteUser,
  getAllSalons,
getAdminSalonById,
createSalon,
updateSalon,
deleteSalon,
deleteAdminReview,

getAllServices,
getAdminServiceById,
createService,
updateService,
deleteService,

  getAllBookings,
  getAdminBookingById,
  updateBookingStatus,

  getAllBarbers,
getAdminBarberById,
createBarber,
updateBarber,
deleteBarber,
getDashboardStats,
};