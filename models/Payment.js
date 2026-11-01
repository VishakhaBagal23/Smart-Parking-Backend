const mongoose = require('mongoose');

const paymentsSchema = new mongoose.Schema({

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },

    amount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ['CASH', 'UPI', 'CARD'],
        default: 'UPI'
    },

    paymentDate: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

paymentsSchema.index({
    paymentDate: -1
});

// ✅ SAFE EXPORT (prevents overwrite)
module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentsSchema);