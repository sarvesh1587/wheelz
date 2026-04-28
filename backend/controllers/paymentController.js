const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking } = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { sendEmail } = require("../services/emailService"); // ✅ Add this

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a REAL Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const options = {
      amount: Math.round(booking.finalAmount * 100),
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment after successful transaction - WITH EMAIL
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        paidAt: new Date(),
        status: "confirmed",
      },
      { new: true },
    ).populate("vehicle user");

    // ✅ Get user and vehicle details
    const user = await User.findById(booking.user);
    const vehicle = await Vehicle.findById(booking.vehicle);

    // ✅ Send Payment Success Email to Customer
    try {
      await sendEmail({
        to: user.email,
        subject: `✅ Payment Successful - Booking Confirmed | Wheelz`,
        template: "paymentSuccess", // You'll create this template
        data: {
          name: user.name,
          bookingRef: booking.bookingRef,
          vehicleName: vehicle.name,
          vehicleBrand: vehicle.brand,
          vehicleImage: vehicle.images?.[0] || "",
          startDate: new Date(booking.startDate).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          endDate: new Date(booking.endDate).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          totalDays: booking.totalDays,
          pricePerDay: booking.pricePerDay,
          totalAmount: booking.finalAmount,
          pickupLocation: booking.pickupLocation,
          paymentDate: new Date().toLocaleDateString("en-IN"),
          paymentTime: new Date().toLocaleTimeString("en-IN"),
          transactionId: razorpayPaymentId,
          orderId: razorpayOrderId,
        },
      });
      console.log(`✅ Payment success email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails
    }

    // ✅ Also send email to vendor
    if (vehicle.vendor) {
      const vendor = await User.findById(vehicle.vendor);
      if (vendor && vendor.email) {
        try {
          await sendEmail({
            to: vendor.email,
            subject: `💰 New Booking Payment Received - ${booking.bookingRef} | Wheelz`,
            template: "vendorPaymentReceived",
            data: {
              name: vendor.name,
              businessName: vendor.vendorDetails?.businessName || vendor.name,
              bookingRef: booking.bookingRef,
              vehicleName: vehicle.name,
              customerName: user.name,
              customerEmail: user.email,
              customerPhone: user.phone,
              startDate: new Date(booking.startDate).toLocaleDateString(
                "en-IN",
              ),
              endDate: new Date(booking.endDate).toLocaleDateString("en-IN"),
              totalDays: booking.totalDays,
              totalAmount: booking.finalAmount,
              transactionId: razorpayPaymentId,
            },
          });
          console.log(`✅ Vendor payment notification sent to ${vendor.email}`);
        } catch (vendorEmailError) {
          console.error("Vendor email failed:", vendorEmailError);
        }
      }
    }

    res.json({
      success: true,
      message: "Payment verified! Email sent to customer.",
      booking,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
