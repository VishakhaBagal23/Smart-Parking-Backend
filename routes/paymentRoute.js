const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');

// ======================
// PAYMENT ROUTES
// ======================

// CREATE PAYMENT
router.post('/create', paymentController.createPayment);

// PAYMENT SUCCESS CALLBACK
router.post('/success/:paymentId', paymentController.completePayment);

// GET PAYMENT BY BOOKING ID
router.get('/booking/:bookingId', paymentController.getPaymentByBooking);

// GET ALL PAYMENTS (FOR PAYMENTS PAGE)
router.get('/all', paymentController.getAllPayments);

module.exports = router;