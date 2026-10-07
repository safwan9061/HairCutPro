
const Salon = require("../models/Salon");

// ============================================================
// CREATE SALON
// ============================================================

const createSalon = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      phone,
      image,
      openingTime,
      closingTime,
    } = req.body;

    // Required fields
    if (
      !name ||
      !address ||
      !city ||
      !phone ||
      !openingTime ||
      !closingTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Create salon
    const salon = await Salon.create({
      name: name.trim(),
      description: description?.trim() || "",
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      image: image || "",
      openingTime,
      closingTime,
    });

    return res.status(201).json({
      success: true,
      message: "Salon created successfully",
      salon,
    });
  } catch (error) {
    console.error("Create salon error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL SALONS
// ============================================================

const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  } catch (error) {
    console.error("Get salons error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE SALON
// ============================================================

const getSalonById = async (req, res) => {
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
    console.error("Get salon error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE SALON
// ============================================================

const updateSalon = async (req, res) => {
  try {
    const salon = await Salon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salon updated successfully",
      salon,
    });
  } catch (error) {
    console.error("Update salon error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE SALON
// ============================================================

const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findByIdAndDelete(
      req.params.id
    );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salon deleted successfully",
    });
  } catch (error) {
    console.error("Delete salon error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createSalon,
  getAllSalons,
  getSalonById,
  updateSalon,
  deleteSalon,
};
