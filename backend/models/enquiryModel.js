const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetListing',
        required: true,
    },
    // The enquirer may or may not be a registered user
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    name:    { type: String, required: [true, 'Name is required'], trim: true },
    email:   { type: String, required: [true, 'Email is required'], trim: true },
    phone:   { type: String, trim: true },
    message: { type: String, required: [true, 'Message is required'] },
    status: {
        type: String,
        enum: ['new', 'read'],
        default: 'new',
    },
}, { timestamps: true });

enquirySchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
