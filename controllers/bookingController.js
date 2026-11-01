const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Vehicle = require('../models/Vehicle');

// ======================
// VEHICLE ENTRY
// ======================
router.post('/entry', async (req, res) => {
    try {
        const { vehicleId } = req.body;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: "Vehicle ID is required"
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const availableSlot = await Slot.findOne({
            slotType: vehicle.vehicleType,
            status: 'AVAILABLE'
        });

        if (!availableSlot) {
            return res.status(400).json({
                success: false,
                message: `No available slots for ${vehicle.vehicleType}`
            });
        }

        const booking = await Booking.create({
            vehicleId,
            slotId: availableSlot._id,
            entryTime: new Date(),
            status: 'ACTIVE'
        });

        availableSlot.status = 'OCCUPIED';
        await availableSlot.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('vehicleId')
            .populate('slotId');

        return res.status(201).json({
            success: true,
            message: 'Vehicle parked successfully',
            data: populatedBooking
        });

    } catch (error) {
        console.error("ENTRY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// VEHICLE EXIT (ONLY BILL GENERATION)
// ======================
router.post('/exit/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate('vehicleId')
            .populate('slotId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const entryTime = new Date(booking.entryTime);
        const exitTime = new Date();
        let totalHours = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));
        totalHours = Math.max(1, totalHours);

        let amount = 50;
        if (totalHours > 2) {
            amount += (totalHours - 2) * 20;
        }

        const day = entryTime.getDay();
        if (day === 0 || day === 6) {
            amount += 30;
        }

        const bill = {
            bookingId: booking._id,
            vehicleNumber: booking.vehicleId.vehicleNumber,
            totalHours: totalHours,
            amount: amount
        };

        return res.status(200).json({
            success: true,
            message: 'Bill generated successfully',
            bill: bill,
            amount: amount
        });

    } catch (error) {
        console.error("EXIT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// AFTER PAYMENT → CLOSE BOOKING + FREE SLOT
// ======================
router.post('/confirm-exit', async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'COMPLETED';
        booking.exitTime = new Date();
        await booking.save();

        const slot = await Slot.findById(booking.slotId);
        if (slot) {
            slot.status = 'AVAILABLE';
            await slot.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Payment confirmed and vehicle exited successfully'
        });

    } catch (error) {
        console.error("CONFIRM EXIT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// ACTIVE BOOKINGS
// ======================
router.get('/active', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'ACTIVE' })
            .populate('vehicleId')
            .populate('slotId')
            .sort({ entryTime: -1 });

        return res.status(200).json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error("ACTIVE BOOKINGS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;