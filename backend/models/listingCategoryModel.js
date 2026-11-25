const mongoose = require('mongoose');

const listingCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    // Extra fields to collect for this category (shown conditionally in the form)
    extraFields: [
        {
            key:      String, // e.g. 'lastSeenLocation'
            label:    String, // e.g. 'Last seen location'
            type:     { type: String, enum: ['text', 'date', 'textarea', 'select'] },
            required: { type: Boolean, default: false },
            options:  [String], // for select type
        },
    ],
    image: { url: { type: String }, publicId: { type: String } },
    active: { type: Boolean, default: true },
    order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ListingCategory', listingCategorySchema);
