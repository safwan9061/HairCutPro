const mongoose = require("mongoose");

const barberSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    specialization: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },
    imagePublicId: {
  type: String,
},

    workingDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],

    openingTime: {
      type: String,
    },

    closingTime: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Barber", barberSchema);