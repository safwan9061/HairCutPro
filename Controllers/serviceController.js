const Service = require("../models/Service");
const Salon = require("../models/Salon");

// ==================== CREATE SERVICE ====================

const createService = async (req, res) => {
  try {
    const {
      salon,
      name,
      description,
      price,
      duration,
      image,
    } = req.body;

    // Check required fields
    if (!salon || !name || price === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: "Salon, name, price and duration are required",
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

    // Create service
    const service = await Service.create({
      salon,
      name,
      description,
      price,
      duration,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET ALL SERVICES ====================

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("salon", "name city");

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET SINGLE SERVICE ====================

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(
      req.params.id
    ).populate("salon", "name city");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE SERVICE ====================

const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== DELETE SERVICE ====================

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(
      req.params.id
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};