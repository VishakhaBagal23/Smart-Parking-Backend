console.log("🔥 INDEX FILE RUNNING");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// ROOT ROUTE
// ======================
app.get('/', (req, res) => {
    res.send('✅ Smart Parking Backend Running');
});

// ======================
// MONGODB CONNECTION
// ======================
mongoose.connect('mongodb://127.0.0.1:27017/parking_system')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// ======================
// SCHEMAS
// ======================

// VEHICLE SCHEMA
const vehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['BIKE', 'CAR', 'TRUCK'],
        default: 'CAR'
    }
});

// SLOT SCHEMA
const slotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    slotType: {
        type: String,
        enum: ['BIKE', 'CAR', 'TRUCK'],
        default: 'CAR'
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED'],
        default: 'AVAILABLE'
    }
});

// BOOKING SCHEMA (UPDATED with paymentMethod)
const bookingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot'
    },
    entryTime: {
        type: Date,
        default: Date.now
    },
    exitTime: Date,
    totalHours: Number,
    amount: Number,
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash', 'Card'],
        default: 'UPI'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED'],
        default: 'ACTIVE'
    }
});

// PAYMENT SCHEMA
const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash', 'Card'],
        default: 'UPI'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

// ======================
// MODELS
// ======================

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
const Slot = mongoose.models.Slot || mongoose.model('Slot', slotSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// ======================
// TEST ROUTES
// ======================

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working!'
    });
});

// ======================
// VEHICLE ROUTES
// ======================

// GET ALL VEHICLES
app.get('/api/vehicle/all', async (req, res) => {
    try {
        console.log("✅ VEHICLE ROUTE HIT");
        const vehicles = await Vehicle.find();
        res.status(200).json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ADD VEHICLE
app.post('/api/vehicle/add', async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE VEHICLE
app.delete('/api/vehicle/delete/:vehicleId', async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.vehicleId);
        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// SLOT ROUTES
// ======================

// GET ALL SLOTS
app.get('/api/slot/all', async (req, res) => {
    try {
        console.log("✅ SLOT ROUTE HIT");
        const slots = await Slot.find();
        res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ADD SLOT
app.post('/api/slot/add', async (req, res) => {
    try {
        const slot = await Slot.create(req.body);
        res.status(201).json({
            success: true,
            data: slot
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE SLOT
app.delete('/api/slot/delete/:slotId', async (req, res) => {
    try {
        await Slot.findByIdAndDelete(req.params.slotId);
        res.status(200).json({
            success: true,
            message: 'Slot deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// BOOKING ROUTES
// ======================

// ACTIVE BOOKINGS
app.get('/api/booking/active', async (req, res) => {
    console.log('✅ ACTIVE BOOKINGS ROUTE HIT');
    try {
        const bookings = await Booking.find({ status: 'ACTIVE' })
            .populate('vehicleId')
            .populate('slotId')
            .sort({ entryTime: -1 });
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// COMPLETED BOOKINGS (ADDED)
app.get('/api/booking/completed', async (req, res) => {
    console.log('✅ COMPLETED BOOKINGS ROUTE HIT');
    try {
        const bookings = await Booking.find({ status: 'COMPLETED' })
            .populate('vehicleId')
            .populate('slotId')
            .sort({ exitTime: -1 });
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// VEHICLE ENTRY
app.post('/api/booking/entry', async (req, res) => {
    try {
        const { vehicleId } = req.body;
        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID required'
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
                message: 'No slot available'
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
        res.status(201).json({
            success: true,
            message: 'Vehicle parked successfully',
            data: populatedBooking
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// VEHICLE EXIT (BILL GENERATION)
app.post('/api/booking/exit/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
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
        booking.status = 'COMPLETED';
        booking.exitTime = exitTime;
        booking.totalHours = totalHours;
        booking.amount = amount;
        await booking.save();
        await Slot.findByIdAndUpdate(booking.slotId._id, { status: 'AVAILABLE' });
        res.status(200).json({
            success: true,
            bill: {
                bookingId: booking._id,
                vehicleNumber: booking.vehicleId?.vehicleNumber,
                totalHours,
                amount
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// PAYMENT ROUTES
// ======================

// GET ALL PAYMENTS (For Payments Page)
app.get('/api/payment/all', async (req, res) => {
    try {
        console.log("✅ GET ALL PAYMENTS ROUTE HIT");
        const payments = await Payment.find({ status: 'SUCCESS' })
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
                status: payment.status
            };
        }));
        res.status(200).json({
            success: true,
            data: paymentData
        });
    } catch (error) {
        console.error("GET ALL PAYMENTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// CREATE PAYMENT (After exit)
app.post('/api/payment/create', async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;
        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: "bookingId and amount required"
            });
        }
        const payment = await Payment.create({
            bookingId,
            amount,
            paymentMethod: paymentMethod || 'UPI',
            status: 'PENDING'
        });
        res.status(201).json({
            success: true,
            message: "Payment initiated",
            data: payment
        });
    } catch (error) {
        console.error("CREATE PAYMENT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// CONFIRM PAYMENT (Mark as SUCCESS)
app.post('/api/payment/confirm/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }
        payment.status = 'SUCCESS';
        await payment.save();
        // Update booking to COMPLETED
        const booking = await Booking.findById(payment.bookingId);
        if (booking && booking.status === 'ACTIVE') {
            booking.status = 'COMPLETED';
            booking.exitTime = new Date();
            booking.amount = payment.amount;
            await booking.save();
            // Free the slot
            if (booking.slotId) {
                await Slot.findByIdAndUpdate(booking.slotId, { status: 'AVAILABLE' });
            }
        }
        res.status(200).json({
            success: true,
            message: "Payment confirmed successfully",
            data: payment
        });
    } catch (error) {
        console.error("CONFIRM PAYMENT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// MAIN PAYMENT ROUTE - FIXED (Saves payment to database)
// ======================
app.post('/api/payment/pay', async (req, res) => {
    try {
        const { bookingId, amount, method } = req.body;
        
        console.log("✅ PAYMENT ROUTE HIT", { bookingId, amount, method });
        
        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and amount required"
            });
        }
        
        // Get the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        
        // ✅ SAVE PAYMENT TO DATABASE
        const payment = await Payment.create({
            bookingId: bookingId,
            amount: amount,
            paymentMethod: method || 'UPI',
            status: 'SUCCESS'
        });
        
        // ✅ UPDATE BOOKING (if not already completed)
        if (booking.status !== 'COMPLETED') {
            booking.status = 'COMPLETED';
            booking.exitTime = new Date();
            booking.amount = amount;
            booking.paymentMethod = method || 'UPI';
            await booking.save();
            
            // ✅ FREE THE SLOT
            if (booking.slotId) {
                await Slot.findByIdAndUpdate(booking.slotId, { status: 'AVAILABLE' });
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Payment successful',
            transactionId: payment._id
        });
        
    } catch (error) {
        console.error("PAYMENT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// ======================
// SERVER
// ======================
const PORT = 5000;

app.listen(PORT, () => {
    console.log("🔥 INDEX FILE RUNNING");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Test Route: http://localhost:${PORT}/api/test`);
    console.log(`✅ Booking Route: http://localhost:${PORT}/api/booking/active`);
    console.log(`✅ Completed Booking Route: http://localhost:${PORT}/api/booking/completed`);
    console.log(`✅ Payment Route: http://localhost:${PORT}/api/payment/all`);
});