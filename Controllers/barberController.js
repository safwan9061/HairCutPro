const Barber = require("../models/Barber");
const Salon = require("../models/Salon");
const uploadImage = require("./uploadController");

// ==================== CREATE BARBER ====================

const createBarber = async (req, res) => {
  try {
    const {
      salon,
      name,
      phone,
      email,
      experience,
      specialization,
      workingDays,
      openingTime,
      closingTime,
    } = req.body;

    if (!salon || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Salon, name and phone are required",
      });
    }

    // Check salon exists
    const existingSalon = await Salon.findById(salon);

    if (!existingSalon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // ==================== CLOUDINARY IMAGE ====================

    let image = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.path);

      image = uploadedImage.url;
      imagePublicId = uploadedImage.publicId;
    }

    // ==================== CREATE BARBER ====================

    const barber = await Barber.create({
      salon,
      name,
      phone,
      email,
      experience,
      specialization,
      image,
      imagePublicId,
      workingDays,
      openingTime,
      closingTime,
    });

    res.status(201).json({
      success: true,
      message: "Barber created successfully",
      barber,
    });
  } catch (error) {
    console.error("Create barber error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== GET ALL BARBERS ====================
// SEARCH + FILTER + PAGINATION

const getAllBarbers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";
    const experience = req.query.experience;
    const specialization = req.query.specialization;
    const isActive = req.query.isActive;
    const salon = req.query.salon;

    const skip = (page - 1) * limit;

    // ==================== SEARCH ====================

    const searchQuery = search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              specialization: {
                $regex: search,
                $options: "i",
              },
            },
            {
              phone: {
                $regex: search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    // ==================== FILTER ====================

    const filterQuery = {};

    if (experience !== undefined) {
      filterQuery.experience = Number(experience);
    }

    if (specialization) {
      filterQuery.specialization = {
        $regex: specialization,
        $options: "i",
      };
    }

    if (isActive !== undefined) {
      filterQuery.isActive = isActive === "true";
    }

    if (salon) {
      filterQuery.salon = salon;
    }

    // ==================== COMBINE ====================

    const finalQuery = {
      ...searchQuery,
      ...filterQuery,
    };

    const total = await Barber.countDocuments(finalQuery);

    const barbers = await Barber.find(finalQuery)
      .populate("salon", "name city")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: barbers.length,
      total,
      page,
      limit,
      totalPages,
      search,
      filters: {
        experience,
        specialization,
        isActive,
        salon,
      },
      barbers,
    });
  } catch (error) {
    console.error("Get barbers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== GET SINGLE BARBER ====================

const getBarberById = async (req, res) => {
  try {
    const barber = await Barber.findById(
      req.params.id
    ).populate("salon", "name city");

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    res.status(200).json({
      success: true,
      barber,
    });
  } catch (error) {
    console.error("Get barber error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== UPDATE BARBER ====================

const updateBarber = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // ==================== NEW CLOUDINARY IMAGE ====================

    if (req.file) {
      const uploadedImage = await uploadImage(req.file.path);

      updateData.image = uploadedImage.url;
      updateData.imagePublicId = uploadedImage.publicId;
    }

    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Barber updated successfully",
      barber,
    });
  } catch (error) {
    console.error("Update barber error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== DELETE BARBER ====================

const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndDelete(
      req.params.id
    );

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Barber deleted successfully",
    });
  } catch (error) {
    console.error("Delete barber error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  createBarber,
  getAllBarbers,
  getBarberById,
  updateBarber,
  deleteBarber,
};