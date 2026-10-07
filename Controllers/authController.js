const User = require("../models/User");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");

// ======================================================
// REGISTER
// ======================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    // Clean email
    const cleanEmail = email
      .trim()
      .toLowerCase();

    // Check existing user
    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone,
    });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // Clean email
    const cleanEmail = email
      .trim()
      .toLowerCase();

    console.log(
      "LOGIN REQUEST:",
      cleanEmail
    );

    // Find user
    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      console.log(
        "LOGIN USER NOT FOUND ❌"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    console.log(
      "LOGIN USER FOUND:",
      user.email
    );

    // Clean role
    const cleanRole =
      String(user.role || "")
        .trim()
        .toLowerCase();

    console.log(
      "LOGIN USER ROLE:",
      cleanRole
    );

    // Compare password
    const isPasswordMatch =
      await user.comparePassword(
        password
      );

    if (!isPasswordMatch) {
      console.log(
        "LOGIN PASSWORD INCORRECT ❌"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: cleanRole,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log(
      "LOGIN SUCCESSFUL ✅"
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: cleanRole,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      newPassword,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email and new password are required",
      });
    }

    if (typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "New password must be a string",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // ==================================================
    // CLEAN EMAIL
    // ==================================================

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    console.log(
      "RESET PASSWORD REQUEST FOR:",
      cleanEmail
    );

    // ==================================================
    // FIND VERIFIED OTP
    // ==================================================

    const verifiedOTP =
      await OTP.findOne({
        email: cleanEmail,
        verified: true,
      }).sort({
        createdAt: -1,
      });

    if (!verifiedOTP) {
      console.log(
        "NO VERIFIED OTP FOUND ❌"
      );

      return res.status(400).json({
        success: false,
        message:
          "Please verify OTP first",
      });
    }

    console.log(
      "VERIFIED OTP FOUND:",
      verifiedOTP._id
    );

    // ==================================================
    // CHECK OTP EXPIRY
    // ==================================================

    if (
      !verifiedOTP.expiresAt ||
      verifiedOTP.expiresAt < new Date()
    ) {
      console.log(
        "OTP VERIFICATION EXPIRED ❌"
      );

      await OTP.deleteOne({
        _id: verifiedOTP._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP verification expired",
      });
    }

    // ==================================================
    // FIND USER
    // ==================================================

    console.log(
      "SEARCHING USER WITH EMAIL:",
      cleanEmail
    );

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    console.log(
      "RESET USER FOUND:",
      user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null
    );

    if (!user) {
      console.log(
        "RESET USER NOT FOUND ❌"
      );

      return res.status(404).json({
        success: false,
        message:
          `User not found for email: ${cleanEmail}`,
      });
    }

    // ==================================================
    // UPDATE PASSWORD
    // ==================================================

    user.password = newPassword;

    await user.save();

    console.log(
      "PASSWORD UPDATED SUCCESSFULLY ✅"
    );

    // ==================================================
    // DELETE VERIFIED OTP
    // ==================================================

    await OTP.deleteOne({
      _id: verifiedOTP._id,
    });

    console.log(
      "VERIFIED OTP DELETED ✅"
    );

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
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
  registerUser,
  loginUser,
  resetPassword,
};