const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ==================== UPLOAD IMAGE TO CLOUDINARY ====================

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "haircutpro/barbers",
      resource_type: "image",
    });

    // Delete local file after successful upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error.message
    );

    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};

module.exports = uploadImage;