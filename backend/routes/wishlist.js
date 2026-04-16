const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name brand images basePrice currentPrice category city averageRating isAvailable",
    );
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:vehicleId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const vehicleId = req.params.vehicleId;
    const idx = user.wishlist.findIndex((id) => id.toString() === vehicleId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(vehicleId);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
