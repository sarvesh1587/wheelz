// A disagreement about a rental (damage, fuel, late return...) raised by the
// vehicle owner or the customer and decided by an admin.
const mongoose = require("mongoose");

const DisputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    raisedByRole: { type: String, enum: ["vendor", "customer", "admin"], required: true },
    type: {
      type: String,
      enum: ["damage", "fuel", "late_return", "extra_km", "cleanliness", "not_as_described", "theft", "other"],
      default: "other",
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    amountClaimed: { type: Number, default: 0, min: 0 },
    photos: [{ url: String, label: String }],
    // The other side's answer.
    response: { note: String, photos: [{ url: String, label: String }], at: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: "User" } },
    status: { type: String, enum: ["open", "resolved", "rejected"], default: "open", index: true },
    resolution: {
      amountAwarded: Number,
      note: String,
      at: Date,
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Dispute", DisputeSchema);
