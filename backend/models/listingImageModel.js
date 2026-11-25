const mongoose = require('mongoose');

const listingImageSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetListing',
        required: true,
    },
    url:       { type: String, required: true },
    filename:  { type: String },
    order:     { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

listingImageSchema.index({ listing: 1, order: 1 });

module.exports = mongoose.model('ListingImage', listingImageSchema);
