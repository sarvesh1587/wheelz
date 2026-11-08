// A transfer from Wheelz to a vendor covering one or more finished bookings.
const mongoose = require("mongoose");

const PayoutSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    method: { type: String, enum: ["bank_transfer", "upi", "cash", "other"], default: "bank_transfer" },
    reference: { type: String, trim: true, default: "" }, // UTR / transaction id
    note: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payout", PayoutSchema);
