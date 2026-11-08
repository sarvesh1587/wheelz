// Watches for rides that started but were not returned on time and escalates:
// 1 hour late -> renter and owner, 6 hours late -> admins too (possible theft).
// Each level is sent once; the level is claimed atomically so two server
// instances never send the same alert.
const { Booking } = require("../models/Booking");
const notify = require("../services/notify");

const HOUR = 3600 * 1000;
const LEVELS = [
  { level: 1, afterHours: 1 },
  { level: 2, afterHours: 6 },
];

async function checkOverdue(now = Date.now()) {
  let sent = 0;
  for (const { level, afterHours } of LEVELS) {
    const due = await Booking.find({
      status: "active",
      endDate: { $lt: new Date(now - afterHours * HOUR) },
      overdueLevel: { $lt: level },
    })
      .select("_id")
      .lean();
    for (const { _id } of due) {
      const booking = await Booking.findOneAndUpdate({ _id, status: "active", overdueLevel: { $lt: level } }, { overdueLevel: level }, { new: true });
      if (!booking) continue;
      notify.overdue(booking, level);
      sent++;
    }
  }
  if (sent) console.log(`⏰ Overdue alerts sent: ${sent}`);
  return sent;
}

// Render's free plan sleeps when idle, so checks also run when it wakes up.
function startOverdueWatcher({ everyMinutes = 15 } = {}) {
  const run = () => checkOverdue().catch((err) => console.error("❌ Overdue check failed:", err.message));
  setTimeout(run, 30 * 1000);
  return setInterval(run, everyMinutes * 60 * 1000);
}

module.exports = { checkOverdue, startOverdueWatcher };
