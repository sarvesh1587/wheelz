const express = require("express");
const usersRouter = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

usersRouter.get("/profile/:id", protect, async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -fraudScore -fraudReasons",
  );
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

module.exports = usersRouter;
