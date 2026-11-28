const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['pet-food', 'accessories', 'cages-kennels', 'grooming-tools', 'toys', 'clothing', 'health-medicine', 'aquarium', 'other'],
        required: [true, 'Category is required'],
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair'],
        default: 'new',
    },
    askingPrice: { type: Number },
    negotiable:  { type: Boolean, default: false },

    description: { type: String },

    state: { type: String, trim: true },
    city:  { type: String, trim: true },

    contactPhone:    { type: String },
    whatsappNumber:  { type: String },
    showContactInfo: { type: Boolean, default: true },

    // Inline images [{url, publicId}] — first is primary
    images: [{ url: String, publicId: String }],

    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft',
    },
    rejectionReason: { type: String },

    featuredProduct: { type: Boolean, default: false },

    slug: { type: String, unique: true, lowercase: true },

    subscription: { type: mongoose.Schema.ObjectId, ref: 'Subscription' },
    expiresAt:    { type: Date },
    isArchived:   { type: Boolean, default: false },
}, { timestamps: true });

productSchema.index({ status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ state: 1, city: 1 });
productSchema.index({ owner: 1 });

module.exports = mongoose.model('Product', productSchema);
