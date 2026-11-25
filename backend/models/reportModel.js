const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetListing',
        required: true,
    },
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    reporterEmail: { type: String }, // captured if reporter is anonymous
    reason: {
        type: String,
        enum: ['animal_welfare', 'fraud', 'duplicate', 'inappropriate', 'other'],
        required: [true, 'Report reason is required'],
    },
    details: { type: String },
    status: {
        type: String,
        enum: ['open', 'reviewed', 'dismissed'],
        default: 'open',
    },
    adminNote: { type: String },
}, { timestamps: true });

reportSchema.index({ listing: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
