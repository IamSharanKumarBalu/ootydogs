const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetListing',
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

// A user can favourite a listing only once
favouriteSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
