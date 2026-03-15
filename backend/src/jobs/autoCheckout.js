const cron = require('node-cron');
const Attendance = require('../models/Attendance');

const AUTO_CHECKOUT_HOURS = 12;

/**
 * Auto-checkout job: checks out employees who have been
 * checked in for more than 12 hours without checking out.
 * Runs every 30 minutes.
 */
const runAutoCheckout = async () => {
  try {
    const cutoff = new Date(Date.now() - AUTO_CHECKOUT_HOURS * 60 * 60 * 1000);

    const staleRecords = await Attendance.find({
      check_in: { $lte: cutoff },
      check_out: null
    });

    if (staleRecords.length === 0) return;

    for (const record of staleRecords) {
      record.check_out = new Date(record.check_in.getTime() + AUTO_CHECKOUT_HOURS * 60 * 60 * 1000);
      record.status = 'present';
      await record.save(); // pre-save hook calculates working_hours
    }

    console.log(`[Auto-Checkout] ${staleRecords.length} record(s) auto-checked-out at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[Auto-Checkout] Error:', error.message);
  }
};

const startAutoCheckoutJob = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', runAutoCheckout);
  console.log('[Auto-Checkout] Job scheduled — checks every 30 min, auto-checkout after 12 hours');
};

module.exports = { startAutoCheckoutJob };
