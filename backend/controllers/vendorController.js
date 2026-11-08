const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const notify = require("../services/notify");
const Payout = require("../models/Payout");
const { DEFAULT_RATE, vendorBookings, summarise } = require("../utils/earnings");
const { createNotification } = require("../utils/notificationHelper");

// Vendor registration from /vendor/register. Creates a vendor account that
// waits for admin approval, then emails the applicant and the admins.
// An existing customer can turn their own account into a vendor account,
// either signed in (req.user via optionalAuth) or by giving its password.
exports.registerVendor = async (req, res) => {
  try {
    const { vendorType, name, email, password, phone, individualDetails = {}, businessDetails = {}, bankDetails = {} } = req.body;

    if (!["individual", "business"].includes(vendorType))
      return res.status(400).json({ success: false, message: "Choose individual or business" });
    const signedIn = req.user && req.user.email === String(email || "").toLowerCase().trim();
    if (!name || !email || !phone || (!signedIn && !password))
      return res.status(400).json({ success: false, message: "Name, email, phone and password are required" });
    if (vendorType === "business" && !businessDetails.businessName)
      return res.status(400).json({ success: false, message: "Business name is required" });
    if (!bankDetails.accountNumber || !bankDetails.ifscCode)
      return res.status(400).json({ success: false, message: "Bank account and IFSC are required" });

    const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, String(obj[k] || "").trim()]));
    const vendorFields = {
      role: "vendor",
      vendorType,
      // What the sign-up page promises: 15% for individuals, 10% for businesses.
      commissionRate: vendorType === "business" ? 10 : 15,
      isVendorApproved: false,
      vendorSince: new Date(),
      individualDetails: vendorType === "individual" ? pick(individualDetails, ["aadharNumber", "panNumber", "address"]) : undefined,
      businessDetails:
        vendorType === "business"
          ? pick(businessDetails, ["businessName", "gstNumber", "panNumber", "businessAddress", "website"])
          : undefined,
      bankDetails: {
        ...pick(bankDetails, ["accountHolderName", "accountNumber", "bankName"]),
        ifscCode: String(bankDetails.ifscCode).toUpperCase().trim(),
      },
    };

    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    let vendor;
    let upgraded = false;
    if (existingUser) {
      if (existingUser.role === "vendor")
        return res.status(409).json({
          success: false,
          code: "ALREADY_VENDOR",
          message: "This email already has a vendor account. Log in to see its status.",
        });
      if (existingUser.role !== "customer")
        return res.status(409).json({ success: false, message: "This account can't be registered as a vendor." });

      // Only the owner can convert the account: signed in as it, or knows its password.
      const owns = (req.user && req.user._id.equals(existingUser._id)) || (password && (await existingUser.matchPassword(password)));
      if (!owns)
        return res.status(409).json({
          success: false,
          code: "ACCOUNT_EXISTS",
          message:
            "This email already has a Wheelz customer account. Log in to it (or enter that account's password here) to turn it into a vendor account.",
        });

      existingUser.set(vendorFields);
      if (!existingUser.phone) existingUser.phone = phone;
      vendor = await existingUser.save();
      upgraded = true;
    } else {
      if (String(password).length < 6)
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      vendor = await User.create({ name, email, password, phone, ...vendorFields });
    }

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

    res.status(upgraded ? 200 : 201).json({
      success: true,
      upgraded,
      message: upgraded
        ? "Your account is now a vendor account, pending approval. We'll email you once you're approved."
        : "Registration submitted. We'll email you once you're approved.",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        avatar: vendor.avatar,
        role: vendor.role,
        isVendorApproved: false,
      },
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

// Vendor: earnings, commission and payouts for the signed-in vendor.
exports.getEarnings = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    const rate = vendor.commissionRate ?? DEFAULT_RATE;
    const bookings = await vendorBookings(vendor._id, rate);
    const payouts = await Payout.find({ vendor: vendor._id }).sort({ paidAt: -1 }).lean();

    // Net earnings per month (by rental start) for the last six months.
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const inMonth = bookings.filter((b) => {
        const t = new Date(b.startDate);
        return ["upcoming", "ready", "paid_out"].includes(b.earningStage) && t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
      });
      return {
        month: d.toLocaleString("en-IN", { month: "short" }),
        earning: Math.round(inMonth.reduce((t, b) => t + (b.vendorEarning || 0), 0)),
      };
    });

    const account = vendor.getDecryptedPII().accountNumber || "";
    res.json({
      success: true,
      commissionRate: rate,
      summary: summarise(bookings),
      monthly,
      bookings: bookings.map((b) => ({
        _id: b._id,
        bookingRef: b.bookingRef,
        vehicle: b.vehicle,
        customerName: b.customerDetails?.name,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        paymentStatus: b.paymentStatus,
        finalAmount: b.finalAmount,
        commissionRate: b.commissionRate,
        commissionAmount: b.commissionAmount,
        vendorEarning: b.vendorEarning,
        earningStage: b.earningStage,
        payout: b.payout,
      })),
      payouts,
      bank: {
        accountHolderName: vendor.bankDetails?.accountHolderName || "",
        bankName: vendor.bankDetails?.bankName || "",
        ifscCode: vendor.bankDetails?.ifscCode || "",
        accountLast4: account ? account.slice(-4) : "",
      },
    });
  } catch (error) {
    console.error("Vendor earnings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
