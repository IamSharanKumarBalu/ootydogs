const mongoose = require('mongoose');

const petServiceSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['veterinary', 'grooming', 'boarding', 'training', 'transportation', 'photography', 'care', 'supplies', 'other'],
        required: [true, 'Service category is required'],
    },
    description: { type: String },
    address:  { type: String },
    state:    { type: String },
    city:     { type: String },
    phone:    { type: String },
    whatsapp: { type: String },
    website:  { type: String },
    timings:  { type: String }, // e.g. "Mon–Sat 9am–7pm"
    socialLinks: {
        instagram: String,
        facebook:  String,
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft',
    },
    rejectionReason: { type: String },
    featuredService: { type: Boolean, default: false },
    slug: { type: String, unique: true, lowercase: true },
}, { timestamps: true });

petServiceSchema.index({ status: 1 });
petServiceSchema.index({ city: 1, category: 1 });

module.exports = mongoose.model('PetService', petServiceSchema);
