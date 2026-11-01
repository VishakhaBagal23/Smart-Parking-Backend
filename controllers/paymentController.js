const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

// ======================
// CREATE PAYMENT (AFTER EXIT)
// ======================
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "bookingId and amount required"
      });
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      paymentMethod: "UPI",
      status: "PENDING"
    });

    return res.status(201).json({
      success: true,
      message: "Payment initiated",
      data: payment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// PAYMENT SUCCESS (SIMULATED / UPI SUCCESS CALLBACK)
// ======================
exports.completePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    payment.status = "SUCCESS";
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);

    if (booking) {
      booking.status = "COMPLETED";
      booking.exitTime = new Date();
      booking.totalHours = booking.totalHours || 1;
      booking.amount = payment.amount;
      await booking.save();

      const slot = await Slot.findById(booking.slotId);
      if (slot) {
        slot.status = "AVAILABLE";
        await slot.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment successful, booking closed",
      data: payment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// GET PAYMENT BY BOOKING
// ======================
exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ bookingId });

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================
// GET ALL PAYMENTS (FOR PAYMENTS PAGE)
// ======================
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "SUCCESS" })
      .sort({ createdAt: -1 });

    const paymentData = await Promise.all(payments.map(async (payment) => {
      const booking = await Booking.findById(payment.bookingId)
        .populate('vehicleId')
        .populate('slotId');
      
      return {
        _id: payment._id,
        vehicleNumber: booking?.vehicleId?.vehicleNumber || 'N/A',
        ownerName: booking?.vehicleId?.ownerName || 'N/A',
        slotNumber: booking?.slotId?.slotNumber || 'N/A',
        totalHours: booking?.totalHours || 0,
        amount: payment.amount,
        paymentDate: payment.createdAt,
        paymentMethod: payment.paymentMethod,
        transactionId: payment._id,
        status: payment.status
      };
    }));

    return res.status(200).json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error("GET ALL PAYMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};