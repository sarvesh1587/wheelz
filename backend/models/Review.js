const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Index for faster queries
ReviewSchema.index({ vehicle: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, vehicle: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
