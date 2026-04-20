const Notification = require("../models/Notification");

const createNotification = async (userId, title, message, type, link) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = { createNotification };
