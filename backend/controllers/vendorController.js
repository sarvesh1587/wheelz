const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const notify = require("../services/notify");
const { createNotification } = require("../utils/notificationHelper");

// Vendor registration from /vendor/register. Creates a vendor account that
// waits for admin approval, then emails the applicant and the admins.
exports.registerVendor = async (req, res) => {
  try {
    const { vendorType, name, email, password, phone, individualDetails = {}, businessDetails = {}, bankDetails = {} } = req.body;

    if (!["individual", "business"].includes(vendorType))
      return res.status(400).json({ success: false, message: "Choose individual or business" });
    if (!name || !email || !password || !phone)
      return res.status(400).json({ success: false, message: "Name, email, phone and password are required" });
    if (String(password).length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (vendorType === "business" && !businessDetails.businessName)
      return res.status(400).json({ success: false, message: "Business name is required" });
    if (!bankDetails.accountNumber || !bankDetails.ifscCode)
      return res.status(400).json({ success: false, message: "Bank account and IFSC are required" });

    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, String(obj[k] || "").trim()]));
    const vendor = await User.create({
      name,
      email,
      password,
      phone,
      role: "vendor",
      vendorType,
      isVendorApproved: false,
      individualDetails: vendorType === "individual" ? pick(individualDetails, ["aadharNumber", "panNumber", "address"]) : undefined,
      businessDetails:
        vendorType === "business"
          ? pick(businessDetails, ["businessName", "gstNumber", "panNumber", "businessAddress", "website"])
          : undefined,
      bankDetails: {
        ...pick(bankDetails, ["accountHolderName", "accountNumber", "bankName"]),
        ifscCode: String(bankDetails.ifscCode).toUpperCase().trim(),
      },
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(
      admins.map((a) =>
        createNotification(
          a._id,
          "New vendor request",
          `${vendor.businessDetails?.businessName || vendor.name} wants to list vehicles`,
          "vendor",
          "/admin/vendors",
        ),
      ),
    );
    notify.vendorApplied(vendor);

    res.status(201).json({
      success: true,
      message: "Registration submitted. We'll email you once you're approved.",
      vendor: { _id: vendor._id, name: vendor.name, email: vendor.email, isVendorApproved: false },
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
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

    notify.vendorStatusChanged(vendor, true);

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
