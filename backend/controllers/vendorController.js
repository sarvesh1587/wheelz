const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const { sendEmail } = require("../services/emailService");
const { createNotification } = require("../utils/notificationHelper");

// Vendor Registration
exports.registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      gstNumber,
      businessAddress,
      panNumber,
      bankAccountNumber,
      ifscCode,
      accountHolderName,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create vendor user
    const vendor = await User.create({
      name,
      email,
      password,
      phone,
      role: "vendor",
      isVendorApproved: false, // Need admin approval
      vendorDetails: {
        businessName,
        gstNumber,
        businessAddress,
        panNumber,
        phoneNumber: phone,
        bankAccountNumber,
        ifscCode,
        accountHolderName,
      },
      vendorSince: new Date(),
    });

    // Send notification to admin
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "New Vendor Registration - Pending Approval",
        html: `
          <h2>New Vendor Registration</h2>
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>GST Number:</strong> ${gstNumber}</p>
          <p><strong>PAN Number:</strong> ${panNumber}</p>
          <a href="${process.env.FRONTEND_URL}/admin/vendors/${vendor._id}/approve">Click here to approve</a>
        `,
      });
    }

    res.status(201).json({
      success: true,
      message: "Vendor registration submitted for approval",
      vendor,
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve Vendor
exports.approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isVendorApproved: true },
      { new: true },
    );

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    // Send approval email to vendor
    await sendEmail({
      to: vendor.email,
      subject: "Your Wheelz Vendor Account is Approved!",
      html: `
        <h2>Congratulations! Your vendor account is approved.</h2>
        <p>You can now start adding your vehicles to our platform.</p>
        <a href="${process.env.FRONTEND_URL}/vendor/dashboard">Go to Vendor Dashboard</a>
      `,
    });

    res.json({ success: true, message: "Vendor approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor: Add Vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const vendor = await User.findById(vendorId);

    if (!vendor.isVendorApproved) {
      return res.status(403).json({
        success: false,
        message: "Your vendor account is not approved yet",
      });
    }

    const vehicleData = {
      ...req.body,
      vendor: vendorId,
      addedBy: vendorId,
      isApproved: false, // Admin needs to approve vehicle
    };

    const vehicle = await Vehicle.create(vehicleData);

    // Update vendor's vehicle count
    await User.findByIdAndUpdate(vendorId, {
      $inc: { totalVehicles: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Vehicle submitted for admin approval",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor: Get My Vehicles
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendor: req.user._id });
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor: Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      vendor: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or not yours",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      req.body,
      { new: true },
    );

    res.json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Pending Vehicles
exports.getPendingVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isApproved: false }).populate(
      "vendor",
      "name email vendorDetails.businessName",
    );
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve Vehicle
exports.approveVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { isApproved: true, isAvailable: true },
      { new: true },
    );

    res.json({ success: true, message: "Vehicle approved", vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor Dashboard Stats
exports.getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const vehicles = await Vehicle.find({ vendor: vendorId });
    const totalVehicles = vehicles.length;
    const approvedVehicles = vehicles.filter((v) => v.isApproved).length;
    const pendingVehicles = vehicles.filter((v) => !v.isApproved).length;

    const bookings = await require("../models/Booking").Booking.find({
      vehicle: { $in: vehicles.map((v) => v._id) },
    });

    const totalBookings = bookings.length;
    const totalEarnings = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.finalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalVehicles,
        approvedVehicles,
        pendingVehicles,
        totalBookings,
        totalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
await createNotification(
  adminId,
  "New Vendor Registration",
  `${businessName} has registered as a vendor`,
  "vendor",
  "/admin/vendors",
);
