const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: [
            'user_verified',
            'user_rejected',
            'listing_submitted',
            'listing_approved',
            'listing_rejected',
            'listing_expiry',
            'new_enquiry',
            'account_suspended',
        ],
        required: true,
    },
    message: { type: String, required: true },
    link:    { type: String }, // e.g. '/dashboard/listings/abc123'
    read:    { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
