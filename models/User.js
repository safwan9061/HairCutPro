const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // NAME
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // EMAIL
    // ==========================================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // PASSWORD
    // ==========================================
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ==========================================
    // PHONE
    // ==========================================
    phone: {
      type: String,
      trim: true,
    },

    // ==========================================
    // ROLE
    // ==========================================
    role: {
      type: String,
      enum: ["user", "admin", "barber"],
      default: "user",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// HASH PASSWORD BEFORE SAVE
// ==========================================

userSchema.pre("save", async function () {
  // Password unchanged
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// ==========================================
// COMPARE PASSWORD
// ==========================================

userSchema.methods.comparePassword =
  async function (candidatePassword) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

module.exports = mongoose.model(
  "User",
  userSchema
);