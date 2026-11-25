const mongoose = require('mongoose');

// Immutable audit trail — every approve/reject/deactivate action is recorded.
const listingApprovalSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetListing',
        required: true,
    },
    action: {
        type: String,
        enum: ['approved', 'rejected', 'change_requested', 'deactivated', 'resubmitted', 'featured', 'unfeatured'],
        required: true,
    },
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    reason: { type: String }, // required when action is rejected or change_requested
    createdAt: { type: Date, default: Date.now },
});

listingApprovalSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model('ListingApproval', listingApprovalSchema);
