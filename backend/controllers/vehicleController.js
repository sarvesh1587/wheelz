/**
 * Vehicle Controller
 * CRUD + smart search + availability + dynamic pricing
 */

const Vehicle = require("../models/Vehicle");

exports.getVehicles = async (req, res, next) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      search,
      sort,
      page = 1,
      limit = 12,
      available,
      lat,
      lng,
      radius = 50,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (city) query.city = new RegExp(city, "i");
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (available === "true") query.isAvailable = true;

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { locationName: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
      ];
    }

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    let sortObj = {};
    switch (sort) {
      case "price_asc":
        sortObj = { basePrice: 1 };
        break;
      case "price_desc":
        sortObj = { basePrice: -1 };
        break;
      case "rating":
        sortObj = { averageRating: -1 };
        break;
      case "popular":
        sortObj = { popularityScore: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate("addedBy", "name"),
      Vehicle.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: vehicles.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      vehicles,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "addedBy",
      "name email",
    );
    if (!vehicle || !vehicle.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    vehicle.calculateDynamicPrice();
    await vehicle.save();
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    req.body.addedBy = req.user._id;
    req.body.currentPrice = req.body.basePrice;
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    vehicle.isActive = false;
    await vehicle.save();
    res.json({ success: true, message: "Vehicle removed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });

    const available = vehicle.isAvailableForDates(startDate, endDate);
    const dynamicPrice = vehicle.calculateDynamicPrice();

    res.json({
      success: true,
      isAvailable: available,
      pricePerDay: dynamicPrice,
      priceMultiplier: vehicle.priceMultiplier,
      basePrice: vehicle.basePrice,
      isPeakPricing: vehicle.priceMultiplier > 1.1,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Vehicle.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$basePrice" },
        },
      },
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};
